'use strict';

// Define the expected schema for user_meta JSON
const userMetaSchema = {
  type: 'object',
  required: ['app', 'favorites'],
  properties: {
    app: {
      type: 'object',
      required: ['locale'],
      properties: {
        locale: { type: 'string' }
      }
    },
    favorites: {
      type: 'object',
      required: ['ingredients', 'recipes', 'local_heroes'],
      properties: {
        ingredients: {
          type: 'array',
          items: { type: 'string' }
        },
        recipes: {
          type: 'array',
          items: { type: 'string' }
        },
        local_heroes: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  }
};

module.exports = userMetaSchema;
