'use strict';

/**
 * user-feedback controller with validation
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { yup } = require('@strapi/utils');

// Schema for validating scores
const UserFeedbackSchema = yup.object().shape({
  score: yup.number().required().min(1).max(5)
});

/**
 * Helper function to extract relation IDs from various formats
 */
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

// Duplicate checking functionality was removed as requested

/**
 * user-feedback controller
 */
module.exports = createCoreController('api::user-feedback.user-feedback', ({ strapi }) => ({
  // Create method
  async create(ctx) {
    const { data } = ctx.request.body;
    
    try {
      // Validate score
      await UserFeedbackSchema.validate({ score: data.score });
      
      // Validate relations
      if (!data.user) {
        return ctx.badRequest('User is required');
      }
      
      if (!data.recipe) {
        return ctx.badRequest('Recipe is required');
      }
      
      // Create the entry
      const entry = await strapi.entityService.create('api::user-feedback.user-feedback', {
        data
      });
      
      return ctx.send({ data: entry });
    } catch (error) {
      console.error('Error in create:', error);
      return ctx.badRequest(error.message);
    }
  },
  
  // Update method
  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    
    try {
      // If score is provided, validate it
      if (data.score !== undefined) {
        await UserFeedbackSchema.validate({
          score: data.score
        });
      }
      
      // Validate relations if they are being changed
      if (data.user) {
        const userId = extractRelationId(data.user);
        if (!userId) {
          return ctx.badRequest('User is required');
        }
      }
      
      if (data.recipe) {
        const recipeId = extractRelationId(data.recipe);
        if (!recipeId) {
          return ctx.badRequest('Recipe is required');
        }
      }
      
      // Duplicate checking was removed as requested
            
      // Update the entry
      const entry = await strapi.entityService.update('api::user-feedback.user-feedback', id, {
        data
      });
      
      return ctx.send({ data: entry });
    } catch (error) {
      console.error('Error in update:', error);
      return ctx.badRequest(error.message);
    }
  }
}));

