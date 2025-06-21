'use strict';

const { yup } = require('@strapi/utils');
const util = require('util');

// Validation schema
const UserFeedbackSchema = yup.object().shape({
  score: yup.number().required().min(1).max(5)
});

// Helper function to extract relation IDs from various formats
const extractRelationId = (relation) => {
  console.log('Lifecycle - Relation input:', JSON.stringify(relation));
  
  if (!relation) return null;
  
  // Direct string ID
  if (typeof relation === 'string' || typeof relation !== 'object' && typeof relation !== 'undefined') {
    console.log('Using direct value as ID:', relation);
    return relation;
  }
  
  // For GraphQL - relation might be the full entity with connect array
  if (relation.connect) {
    if (Array.isArray(relation.connect) && relation.connect.length > 0) {
      if (relation.connect[0].id) {
        console.log('Using connect[0].id:', relation.connect[0].id);
        return relation.connect[0].id;
      }
    } else if (typeof relation.connect === 'object') {
      if (relation.connect.id) {
        console.log('Using connect.id:', relation.connect.id);
        return relation.connect.id;
      }
    }
  }
  
  // Simple object with ID
  if (relation.id) {
    console.log('Using object.id:', relation.id);
    return relation.id;
  }
  
  // If no id but documentId is available
  if (relation.documentId) {
    console.log('Using object.documentId:', relation.documentId);
    return relation.documentId;
  }
  
  // GraphQL might pass the ID directly as a string property
  if (relation.set !== undefined) {
    if (Array.isArray(relation.set) && relation.set.length > 0) {
      console.log('Using GraphQL set array:', relation.set[0]);
      return relation.set[0];
    } else {
      console.log('Using GraphQL set property:', relation.set);
      return relation.set; 
    }
  }
  
  // If relation itself is an array
  if (Array.isArray(relation) && relation.length > 0) {
    if (typeof relation[0] === 'string' || typeof relation[0] === 'number') {
      console.log('Using first array element:', relation[0]);
      return relation[0];
    } else if (relation[0] && relation[0].id) {
      console.log('Using first array element id:', relation[0].id);
      return relation[0].id;
    }
  }
  
  console.log('Complex relation object type:', typeof relation, 
    Object.prototype.toString.call(relation), 
    Object.keys(relation));
  
  return null;
};

/**
 * Updates a recipe's rating statistics (average_rating and total_ratings)
 * when user feedback is created, updated or deleted
 */
async function updateRecipeRatingStats(strapi, recipeId) {
  try {
    // Make sure we have a valid recipe ID and it's not an object
    // console.log(`Recipe ID type: ${typeof recipeId}, value: ${util.inspect(recipeId)}`);
    
    // If recipeId is an object, try to extract the actual ID
    if (typeof recipeId === 'object' && recipeId !== null) {
      // Try to extract ID from object
      if (recipeId.id) {
        recipeId = recipeId.id;
      } else if (recipeId.documentId) {
        recipeId = recipeId.documentId;
      } else {
        console.log(`Cannot extract ID from object: ${util.inspect(recipeId)}`);
        return;
      }
    }
    
    if (!recipeId) {
      console.log('Cannot update recipe stats: no recipe ID provided');
      return;
    }
    
    // console.log(`Updating rating statistics for recipe: ${recipeId}`);
    
    // Query all feedback for this recipe
    const feedbackEntries = await strapi.db.query('api::user-feedback.user-feedback')
      .findMany({
        where: { recipe: recipeId },
        select: ['score']
      });
    
    // console.log(`Found ${feedbackEntries.length} feedback entries for recipe ${recipeId}`);
    
    // Calculate new statistics
    const totalRatings = feedbackEntries.length;
    
    // If there are no ratings, set average to null or 0
    let averageRating = 0;
    if (totalRatings > 0) {
      const sum = feedbackEntries.reduce((acc, entry) => acc + entry.score, 0);
      averageRating = sum / totalRatings;
      averageRating = Math.round(averageRating * 10) / 10; // Round to 1 decimal place
    }
    
    // console.log(`New stats for recipe ${recipeId}: average=${averageRating}, total=${totalRatings}`);
    
    // Update the recipe
    await strapi.entityService.update('api::recipe.recipe', recipeId, {
      data: {
        average_rating: averageRating,
        total_ratings: totalRatings
      }
    });
    
    // console.log(`Successfully updated recipe ${recipeId} ratings`);
  } catch (error) {
    console.error(`Error updating recipe rating stats for ${recipeId}:`, error);
  }
}

module.exports = {
  // Before create hook - enforces validation
  async beforeCreate(event) {
    const { data } = event.params;
    
    // Validate score using Yup schema
    try {
      await UserFeedbackSchema.validate({ score: data.score });
    } catch (error) {
      throw new Error(`Score validation error: ${error.message}`);
    }
    
    // Validate relations
    const userId = extractRelationId(data.user);
    if (!userId) {
      throw new Error('User is required');
    }
    
    const recipeId = extractRelationId(data.recipe);
    if (!recipeId) {
      throw new Error('Recipe is required');
    }
    
    // Duplicate checking was removed as requested
    const count = await strapi.db.query('api::user-feedback.user-feedback').count({
      where: { user: userId, recipe: recipeId },
    });

    if (count > 0) {
      throw new Error('Duplicate feedback not allowed');
    }
  },

  // Before update hook - enforces validation
  async beforeUpdate(event) {
    const { data, where } = event.params;
    const { id } = where;
    
    // If score is provided, validate it with Yup
    if (data.score !== undefined) {
      try {
        await UserFeedbackSchema.validate({ score: data.score });
      } catch (error) {
        throw new Error(`Score validation error: ${error.message}`);
      }
    }
    
    // Validate relations if they are being changed
    if (data.user) {
      const userId = extractRelationId(data.user);
      if (!userId) {
        throw new Error('User is required');
      }
    }
    
    if (data.recipe) {
      const recipeId = extractRelationId(data.recipe);
      if (!recipeId) {
        throw new Error('Recipe is required');
      }
    }
    
    // Duplicate checking was removed as requested
  },

  // After create hook - updates recipe statistics
  async afterCreate(event) {
    const { result } = event;
    const { data } = event.params;
    
    // Get the recipe ID using the same reliable method as in beforeCreate
    const recipeId = extractRelationId(data.recipe);
    // console.log(`afterCreate: extracted recipeId: ${util.inspect(recipeId)}`);
    
    // Update recipe statistics with a slight delay to ensure transaction completion
    if (recipeId) {
      try {
        // Small delay to make sure the transaction is complete
        setTimeout(async () => {
          try {
            // console.log(`Delayed update for recipe ${util.inspect(recipeId)}`);
            await updateRecipeRatingStats(strapi, recipeId);
          } catch (delayedError) {
            console.error(`Error in delayed afterCreate: ${delayedError.message}`);
          }
        }, 100); // 100ms delay
      } catch (error) {
        console.error(`Error in afterCreate hook: ${error.message}`);
      }
    }
  },
  
  // After update hook - updates recipe statistics
  async afterUpdate(event) {
    const { result } = event;
    const { data } = event.params;
    
    // Use existing recipe ID if it's not being changed, otherwise get from data
    let recipeId;
    if (data.recipe) {
      recipeId = extractRelationId(data.recipe);
    } else if (result.recipe) {
      // If we're not changing the recipe, use the one from the result
      recipeId = result.recipe?.id || 
        (typeof result.recipe === 'string' || typeof result.recipe === 'number' ? result.recipe : null);
    }
    
    console.log(`afterUpdate: extracted recipeId: ${util.inspect(recipeId)}`);
    
    // Update recipe statistics with a slight delay to ensure transaction completion
    if (recipeId) {
      try {
        // Small delay to make sure the transaction is complete
        setTimeout(async () => {
          try {
            console.log(`Delayed update for recipe ${util.inspect(recipeId)}`);
            await updateRecipeRatingStats(strapi, recipeId);
          } catch (delayedError) {
            console.error(`Error in delayed afterUpdate: ${delayedError.message}`);
          }
        }, 100); // 100ms delay
      } catch (error) {
        console.error(`Error in afterUpdate hook: ${error.message}`);
      }
    }
  },
  
  // After delete hook - updates recipe statistics
  async afterDelete(event) {
    const { result } = event;
    
    // For delete, we only have the result to work with
    // Try different approaches to get the recipe ID
    let recipeId = null;
    
    // Log entire result object for debugging
    console.log(`afterDelete result: ${util.inspect(result, { depth: 3 })}`);
    
    // Check if result.recipe exists in any format
    if (result.recipe) {
      if (typeof result.recipe === 'object' && result.recipe !== null) {
        recipeId = result.recipe.id || result.recipe.documentId;
      } else if (typeof result.recipe === 'string' || typeof result.recipe === 'number') {
        recipeId = result.recipe;
      }
    }
    
    console.log(`afterDelete: extracted recipeId: ${util.inspect(recipeId)}`);
    
    // Update recipe statistics with a slight delay to ensure transaction completion
    if (recipeId) {
      try {
        // Small delay to make sure the transaction is complete
        setTimeout(async () => {
          try {
            console.log(`Delayed update for recipe ${util.inspect(recipeId)}`);
            await updateRecipeRatingStats(strapi, recipeId);
          } catch (delayedError) {
            console.error(`Error in delayed afterDelete: ${delayedError.message}`);
          }
        }, 100); // 100ms delay
      } catch (error) {
        console.error(`Error in afterDelete hook: ${error.message}`);
      }
    } else {
      console.log('afterDelete: Could not extract recipe ID from deleted feedback');
    }
  }
};
