'use strict';

const { yup } = require('@strapi/utils');

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

// Removed duplicate checking functionality

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
  }
};
