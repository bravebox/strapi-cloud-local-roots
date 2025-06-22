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
  console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`);
  console.log('what is recipeId', recipeId);

  try {
    // First get some recipe details
    const recipe = await strapi.entityService.findOne('api::recipe.recipe', recipeId, {
      fields: ['title', 'documentId']
    });
    
    if (!recipe) {
      throw new Error(`Recipe with ID ${recipeId} not found. Cannot update statistics.`);
    }

    console.log('~~ recipe title', recipe.title);
    console.log('~~ recipe documentId', recipe.documentId);
    
    // Get all feedbacks for this recipe using the join table
    const result = await strapi.db.connection.raw(`
      SELECT uf.score
      FROM user_feedbacks uf
      JOIN user_feedbacks_recipe_lnk lnk ON uf.id = lnk.user_feedback_id
      WHERE lnk.recipe_id = ?
    `, [recipeId]);
    
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
    console.log(`Found ${feedbackEntries.length} feedbacks for recipe ${recipeId}`);
    
    // Calculate new statistics
    const totalRatings = feedbackEntries.length;
    let averageRating = 0;
    
    if (totalRatings > 0) {
      // Calculate average rating
      const sum = feedbackEntries.reduce((acc, entry) => {
        // Handle different possible score formats
        let score = null;
        
        if (entry) {
          if (typeof entry.score === 'number') {
            // Direct number
            score = entry.score;
          } else if (entry.score && typeof entry.score === 'object' && entry.score !== null) {
            // Object with value property
            score = entry.score.value;
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

    // First, check if a statistic record already exists for this recipe using documentId
    const existingStats = await strapi.entityService.findMany('api::recipe-statistic.recipe-statistic', {
      filters: {
        recipe_document_id: recipe.documentId
      }
    });
    
    console.log(`Found ${existingStats?.length || 0} existing statistics for recipe documentId ${recipe.documentId}`);
    
    // Update or create recipe statistic
    if (existingStats && existingStats.length > 0) {
      const statsId = existingStats[0].id;
      await strapi.entityService.update('api::recipe-statistic.recipe-statistic', statsId, {
        data: {
          average_score: averageRating,
          total_ratings: totalRatings
        }
      });
      console.log(`~~~ Updated existing stats record with ID ${statsId}`);
    } else {        
      // Create the statistics record with the recipe data
      const newStats = await strapi.entityService.create('api::recipe-statistic.recipe-statistic', {
        data: {
          average_score: averageRating,
          total_ratings: totalRatings,
          title: recipe.title,
          recipe_document_id: recipe.documentId,  // Use documentId consistently
        }
      });
      console.log(`~~~ Created new stats record with ID ${newStats.id}`);
    }
    
    console.log(`~~~~~~ Done updating recipe rating stats for ${recipeId}`);
    console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`);

  } catch (error) {
    console.error(`Error updating recipe rating stats for ${recipeId}:`, error);
    // We don't re-throw since this function is called in lifecycle hooks
    // and we don't want to block the main operation if statistics update fails
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
};
