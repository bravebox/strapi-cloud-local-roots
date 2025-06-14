'use strict';

// Define the expected schema for user_meta JSON
const userMetaSchema = {
  type: 'object',
  required: ['app', 'favorites'],
  properties: {
    app: {
      type: 'object',
      required: ['locale', 'skipOnboarding', 'lastLogin', 'lastUpdate'],
      properties: {
        locale: { type: 'string' },
        skipOnboarding: { type: 'boolean' },
        lastLogin: { type: 'string' },
        lastUpdate: { type: 'string' }
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
