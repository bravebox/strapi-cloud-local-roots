'use strict';

const { yup } = require('@strapi/utils');
const util = require('util');

// Shared state between beforeDelete and afterDelete
const pendingDeletions = new Map();

// Helper function to extract relation ID from various formats
const extractRelationId = (relation) => {
  if (!relation) return null;
  if (typeof relation === 'string' || typeof relation !== 'object' && typeof relation !== 'undefined') {
    console.log('Using direct value as ID:', relation);
    return relation;
  }
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
  if (relation.id) {
    console.log('Using object.id:', relation.id);
    return relation.id;
  }
  if (relation.documentId) {
    console.log('Using object.documentId:', relation.documentId);
    return relation.documentId;
  }
  if (relation.set !== undefined) {
    if (Array.isArray(relation.set) && relation.set.length > 0) {
      console.log('Using GraphQL set array:', relation.set[0]);
      return relation.set[0];
    } else {
      console.log('Using GraphQL set property:', relation.set);
      return relation.set; 
    }
  }
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

// Helper to update recipe rating statistics
const updateRecipeRatingStats = async (strapi, recipeId) => {
  console.log(`updateRecipeRatingStats for recipe ID ${recipeId}`);
  
  if (!recipeId) {
    console.error('No recipe ID provided to updateRecipeRatingStats');
    return;
  }
  
  try {
    const ratings = await strapi.db.query('api::user-feedback.user-feedback').findMany({
      where: {
        recipe: {
          id: recipeId
        }
      },
      select: ['score']
    });
    
    const count = ratings.length;
    let average = 0;
    
    if (count > 0) {
      const sum = ratings.reduce((acc, { score }) => acc + score, 0);
      average = Math.round((sum / count) * 10) / 10; // Round to 1 decimal place
    }
    
    console.log(`Calculated stats for recipe ${recipeId}: average=${average}, total=${count}`);
    
    // Update the recipe with the new stats
    await strapi.entityService.update('api::recipe.recipe', recipeId, {
      data: {
        average_rating: average,
        total_ratings: count
      }
    });
    
    console.log(`Updated recipe ${recipeId} ratings`);
    return { average, count };
  } catch (error) {
    console.error(`Error updating recipe stats: ${error.message}`);
    return null;
  }
};

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    
    // Validate score
    if (data.score !== undefined) {
      const scoreValidation = yup.number().min(0).max(5).required().validate(data.score)
        .catch(() => {
          throw new Error('Score must be a number between 0 and 5');
        });
      await scoreValidation;
    }
    
    // Validate existence of required relations
    if (!data.recipe || (!data.recipe.id && !data.recipe.connect)) {
      throw new Error('Recipe relation is required');
    }
    
    if (!data.user && !data.user_id) {  // Adjust based on your relation naming
      throw new Error('User relation is required');
    }
  },
  
  async beforeUpdate(event) {
    const { data } = event.params;
    
    // Validate score if it's being updated
    if (data.score !== undefined) {
      const scoreValidation = yup.number().min(0).max(5).required().validate(data.score)
        .catch(() => {
          throw new Error('Score must be a number between 0 and 5');
        });
      await scoreValidation;
    }
  },
  
  async afterCreate(event) {
    const { result } = event;
    
    // Get recipeId using the helper
    const recipeId = extractRelationId(result.recipe);
    console.log(`afterCreate: extracted recipeId: ${util.inspect(recipeId)}`);
    
    // Update recipe statistics using direct DB connection
    if (recipeId) {
      // Make sure we have a plain ID, not an object
      let recipeToUpdate = recipeId;
      if (typeof recipeToUpdate === 'object' && recipeToUpdate !== null) {
        recipeToUpdate = recipeToUpdate.id || recipeToUpdate.documentId || recipeToUpdate;
        console.log(`Extracted numeric ID: ${recipeToUpdate} from object`);
      }
      
      setTimeout(() => {
        try {
          console.log(`Delayed update for recipe ${recipeToUpdate} after creation`);
          
          // Direct database query without transaction context
          strapi.db.connection.raw(`
            SELECT SUM(uf.score) as sum, COUNT(*) as count 
            FROM user_feedbacks uf
            JOIN user_feedbacks_recipe_lnk lnk ON uf.id = lnk.user_feedback_id
            WHERE lnk.recipe_id = ?
          `, [recipeToUpdate])
            .then(result => {
              // Get the first row of results in a consistent way
              const data = Array.isArray(result) && result.length > 0 ? result[0] : result;
              
              // If we get an object back directly, use it, otherwise try to get the first element
              const row = data && typeof data === 'object' && data.hasOwnProperty('sum') ? data : 
                        (Array.isArray(data) && data.length > 0 ? data[0] : {});
              
              const count = row.count || 0;
              const sum = row.sum || 0;
              let average = 0;
              
              if (count > 0) {
                average = Math.round((sum / count) * 10) / 10; // Round to 1 decimal place
              }
              
              console.log(`Direct DB stats for recipe ${recipeToUpdate}: average=${average}, total=${count} (sum=${sum})`);
              
              // Update recipe directly
              return strapi.db.connection('recipes')
                .where('id', recipeToUpdate)
                .update({
                  average_rating: average,
                  total_ratings: count
                });
            })
            .then(() => {
              console.log(`Directly updated recipe ${recipeToUpdate} ratings after creation`);
            })
            .catch(error => {
              console.error(`Error in direct DB update: ${error.message}`);
            });
        } catch (error) {
          console.error(`Error scheduling direct update: ${error.message}`);
        }
      }, 500); // 500ms delay
    }
  },
  
  async afterUpdate(event) {
    const { result } = event;
    const { data } = event.params;
    
    // Use existing recipe ID if it's not being changed, otherwise get from data
    let recipeId;
    if (data.recipe) {
      recipeId = extractRelationId(data.recipe);
    } else if (result.recipe) {
      // If we're not changing the recipe, use the same reliable extraction helper
      recipeId = extractRelationId(result.recipe);
    }
    
    console.log(`afterUpdate: extracted recipeId: ${util.inspect(recipeId)}`);
    
    // Update recipe statistics with direct DB connection
    if (recipeId) {
      // Make sure we have a plain ID, not an object
      let recipeToUpdate = recipeId;
      if (typeof recipeToUpdate === 'object' && recipeToUpdate !== null) {
        recipeToUpdate = recipeToUpdate.id || recipeToUpdate.documentId || recipeToUpdate;
        console.log(`Extracted numeric ID: ${recipeToUpdate} from object`);
      }
      
      setTimeout(() => {
        try {
          console.log(`Delayed update for recipe ${recipeToUpdate} after update`);
          
          // Try with correct join table query 
          strapi.db.connection.raw(`
            SELECT SUM(uf.score) as sum, COUNT(*) as count 
            FROM user_feedbacks uf
            JOIN user_feedbacks_recipe_lnk lnk ON uf.id = lnk.user_feedback_id
            WHERE lnk.recipe_id = ?
          `, [recipeToUpdate])
            .then(result => {
              // Get the first row of results in a consistent way
              const data = Array.isArray(result) && result.length > 0 ? result[0] : result;
              
              // If we get an object back directly, use it, otherwise try to get the first element
              const row = data && typeof data === 'object' && data.hasOwnProperty('sum') ? data : 
                        (Array.isArray(data) && data.length > 0 ? data[0] : {});
              
              const count = row.count || 0;
              const sum = row.sum || 0;
              let average = 0;
              
              if (count > 0) {
                average = Math.round((sum / count) * 10) / 10; // Round to 1 decimal place
              }
              
              console.log(`Direct DB stats for recipe ${recipeToUpdate}: average=${average}, total=${count} (sum=${sum})`);
              
              // Update recipe directly
              return strapi.db.connection('recipes')
                .where('id', recipeToUpdate)
                .update({
                  average_rating: average,
                  total_ratings: count
                });
            })
            .then(() => {
              console.log(`Directly updated recipe ${recipeToUpdate} ratings after update`);
            })
            .catch(error => {
              console.error(`Error in direct DB update: ${error.message}`);
            });
        } catch (error) {
          console.error(`Error scheduling direct update: ${error.message}`);
        }
      }, 500); // 500ms delay for update operation
    }
  },

  async beforeDelete(event) {
    const { where } = event.params;
    if (where && where.id) {
      // Query the entry before it's deleted to get relation data
      const entry = await strapi.db.query('api::user-feedback.user-feedback').findOne({
        where: { id: where.id },
        populate: ['recipe']
      });
      
      // Store the recipeId for use in afterDelete
      if (entry && entry.recipe) {
        const recipeId = entry.recipe.id;
        pendingDeletions.set(where.id.toString(), recipeId);
      }
    }
  },
  
  async afterDelete(event) {
    const { result } = event;
    let recipeId = null;
    
    console.log(`pendingDeletions: ${util.inspect(pendingDeletions, { depth: 3 })}`);
    
    // Get the stored recipeId from the map
    if (result && result.id) {
      recipeId = pendingDeletions.get(result.id.toString());
      console.log(`Found stored recipeId ${recipeId} for deleted feedback ${result.id}`);
      
      // Clean up the map to prevent memory leaks
      pendingDeletions.delete(result.id.toString());
    }
    
    // Update recipe statistics with direct DB connection after deletion
    if (recipeId) {
      // Make sure we have a plain ID, not an object
      let recipeToUpdate = recipeId;
      if (typeof recipeToUpdate === 'object' && recipeToUpdate !== null) {
        recipeToUpdate = recipeToUpdate.id || recipeToUpdate.documentId || recipeToUpdate;
        console.log(`Extracted numeric ID: ${recipeToUpdate} from object`);
      }
      
      // For delete operations, we need to increase the delay slightly to ensure
      // all related database operations are complete
      setTimeout(() => {
        try {
          console.log(`Delayed update for recipe ${recipeToUpdate} after deletion`);
          
          // Use the same query structure as in afterUpdate which is proven to work
          strapi.db.connection.raw(`
            SELECT SUM(uf.score) as sum, COUNT(*) as count 
            FROM user_feedbacks uf
            JOIN user_feedbacks_recipe_lnk lnk ON uf.id = lnk.user_feedback_id
            WHERE lnk.recipe_id = ?
          `, [recipeToUpdate])
            .then(result => {
              // Get the first row of results
              const data = Array.isArray(result) && result.length > 0 ? result[0] : result;
              
              // If we get an object back directly, use it, otherwise try to get the first element
              const row = data && typeof data === 'object' && data.hasOwnProperty('sum') ? data : 
                        (Array.isArray(data) && data.length > 0 ? data[0] : {});
              
              const count = row.count || 0;
              const sum = row.sum || 0;
              let average = 0;
              
              if (count > 0) {
                average = Math.round((sum / count) * 10) / 10; // Round to 1 decimal place
              }
              
              console.log(`Direct DB stats for recipe ${recipeToUpdate}: average=${average}, total=${count} (sum=${sum})`);
              
              // Update recipe directly with the new values
              return strapi.db.connection('recipes')
                .where('id', recipeToUpdate)
                .update({
                  average_rating: average,
                  total_ratings: count
                });
            })
            .then(() => {
              console.log(`Directly updated recipe ${recipeToUpdate} ratings after deletion`);
            })
            .catch(error => {
              console.error(`Error in direct DB update after deletion: ${error.message}`);
            });
        } catch (error) {
          console.error(`Error scheduling direct update: ${error.message}`);
        }
      }, 700); // Increase delay to 700ms for deletion to ensure all transactions are complete
    } else {
      console.log('afterDelete: Could not extract recipe ID from deleted feedback');
    }
  }
};
