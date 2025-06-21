'use strict';

const { yup } = require('@strapi/utils');
const util = require('util');

// Define validation schema
const UserFeedbackSchema = yup.object().shape({
  score: yup.number().min(0).max(5).required()
});

// Helper function to extract relation ID from various formats
const extractRelationId = (relation) => {
  if (!relation) return null;
  
  // Handle primitive values
  if (typeof relation === 'string' || typeof relation === 'number') {
    return relation;
  }
  
  // Handle objects
  if (typeof relation === 'object') {
    // Admin UI format
    if (relation.connect && relation.connect.id) {
      return relation.connect.id;
    }
    
    // Regular object with ID
    if (relation.id) {
      return relation.id;
    }
    
    // GraphQL set format
    if (relation.set !== undefined) {
      if (Array.isArray(relation.set) && relation.set.length > 0) {
        return relation.set[0];
      }
      return relation.set;
    }
  }
  
  return null;
};

// Helper to update recipe rating statistics
async function updateRecipeRatingStats(strapi, recipeId) {
  try {
    // Make sure we have a primitive ID, not an object
    let recipeIdValue;
    if (recipeId && typeof recipeId === 'object' && recipeId !== null) {
      recipeIdValue = recipeId.id || recipeId.documentId;
      console.log(`Extracted primitive ID ${recipeIdValue} from object for SQL query`);
    } else {
      recipeIdValue = recipeId;
    }
    
    // Get all feedbacks for this recipe using the join table
    console.log(`Querying feedbacks for recipe ID: ${recipeIdValue}`);
    
    const result = await strapi.db.connection.raw(`
      SELECT uf.score
      FROM user_feedbacks uf
      JOIN user_feedbacks_recipe_lnk lnk ON uf.id = lnk.user_feedback_id
      WHERE lnk.recipe_id = ?
    `, [recipeIdValue]);
    
    console.log(`Raw DB result:`, result);
    
    // Handle different database result formats with better error handling
    let feedbackEntries = [];
    
    if (result) {
      // SQLite typically returns an array with the first element containing rows
      if (Array.isArray(result) && result.length > 0) {
        feedbackEntries = Array.isArray(result[0]) ? result[0] : result;
      } 
      // PostgreSQL typically has a rows property
      else if (result.rows) {
        feedbackEntries = result.rows;
      }
      // Direct array of results
      else if (Array.isArray(result)) {
        feedbackEntries = result;
      }
    }
    
    // Ensure we always have an array even if all above checks fail
    if (!Array.isArray(feedbackEntries)) {
      console.log(`Invalid feedbackEntries format, using empty array:`, feedbackEntries);
      feedbackEntries = [];
    }
    
    // Log the number of feedbacks found for this recipe
    console.log(`Found ${feedbackEntries.length} feedbacks for recipe ${recipeIdValue}`);
    
    // Calculate new statistics
    const totalRatings = feedbackEntries.length;
    
    // If there are no ratings, set average to 0
    let averageRating = 0;
    
    // Log the feedback entries for debugging
    console.log('Feedback entries:', JSON.stringify(feedbackEntries));
    
    if (totalRatings > 0) {
      // Extract scores safely regardless of the structure returned by the database
      const sum = feedbackEntries.reduce((acc, entry) => {
        // The score might be a direct property or nested in a score property
        // It might also be an object with values 
        let score = 0;
        
        if (typeof entry === 'number') {
          // If entry is directly the score number
          score = entry;
        } else if (entry && typeof entry === 'object') {
          if (typeof entry.score === 'number') {
            // Normal case: entry has a score property
            score = entry.score;
          } else if (entry.score && typeof entry.score.value === 'number') {
            // Some database drivers nest it further
            score = entry.score.value;
          }
        }
        
        console.log(`Adding score: ${score} to sum`);
        return acc + (score || 0);
      }, 0);
      
      console.log(`Total sum of scores: ${sum}`);
      averageRating = sum / totalRatings;
      averageRating = Math.round(averageRating * 10) / 10; // Round to 1 decimal place
    }
    
    // Update the recipe - make sure we're using a primitive ID here too
    await strapi.entityService.update('api::recipe.recipe', recipeIdValue, {
      data: {
        average_rating: averageRating,
        total_ratings: totalRatings
      }
    });
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
    
    // Check for duplicates
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
  },

  // After create hook - updates recipe statistics
  async afterCreate(event) {
    const { result } = event;
    const { data } = event.params;
    
    // Get the recipe ID using the same reliable method as in beforeCreate
    let recipeId = extractRelationId(data.recipe);
    
    // Make sure we have a primitive value
    if (recipeId && typeof recipeId === 'object' && recipeId !== null) {
      recipeId = recipeId.id || recipeId.documentId;
      console.log(`afterCreate: extracted primitive ID ${recipeId} from object`);
    } else {
      console.log(`afterCreate: using primitive recipeId: ${util.inspect(recipeId)}`);
    }
    
    // Update recipe statistics with a slight delay to ensure transaction completion
    if (recipeId) {
      try {
        // Small delay to make sure the transaction is complete
        setTimeout(async () => {
          try {
            console.log(`Delayed update for recipe ${util.inspect(recipeId)}`);
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
    
    // Make sure we have a primitive value
    if (recipeId && typeof recipeId === 'object' && recipeId !== null) {
      recipeId = recipeId.id || recipeId.documentId;
      console.log(`afterUpdate: extracted primitive ID ${recipeId} from object`);
    } else {
      console.log(`afterUpdate: using primitive recipeId: ${util.inspect(recipeId)}`);
    }
    
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
    
    // Make sure we have a primitive value
    if (recipeId && typeof recipeId === 'object' && recipeId !== null) {
      recipeId = recipeId.id || recipeId.documentId;
      console.log(`afterDelete: extracted primitive ID ${recipeId} from object`);
    } else {
      console.log(`afterDelete: using primitive recipeId: ${util.inspect(recipeId)}`);
    }
    
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
