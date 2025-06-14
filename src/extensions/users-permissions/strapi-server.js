'use strict';

// Validation function for user_meta
function validateUserMeta(userMeta) {
  // Check if userMeta is an object
  if (!userMeta || typeof userMeta !== 'object') {
    throw new Error('user_meta must be an object');
  }

  // Check app field
  if (!userMeta.app || typeof userMeta.app !== 'object') {
    throw new Error('user_meta.app must be an object');
  }

  if (typeof userMeta.app.locale !== 'string') {
    throw new Error('user_meta.app.locale must be a string');
  }

  if (typeof userMeta.app.skipOnboarding !== 'boolean') {
    throw new Error('user_meta.app.skipOnboarding must be a boolean');
  }

  if (typeof userMeta.app.lastLogin !== 'string') {
    throw new Error('user_meta.app.lastLogin must be a string');
  }

  if (typeof userMeta.app.lastUpdate !== 'string') {
    throw new Error('user_meta.app.lastUpdate must be a string');
  }

  // Check favorites field
  if (!userMeta.favorites || typeof userMeta.favorites !== 'object') {
    throw new Error('user_meta.favorites must be an object');
  }
  
  // Check ingredients
  if (!Array.isArray(userMeta.favorites.ingredients)) {
    throw new Error('user_meta.favorites.ingredients must be an array');
  }
  for (const id of userMeta.favorites.ingredients) {
    if (typeof id !== 'string') {
      throw new Error('Each item in user_meta.favorites.ingredients must be a string');
    }
  }
  
  // Check recipes
  if (!Array.isArray(userMeta.favorites.recipes)) {
    throw new Error('user_meta.favorites.recipes must be an array');
  }
  for (const id of userMeta.favorites.recipes) {
    if (typeof id !== 'string') {
      throw new Error('Each item in user_meta.favorites.recipes must be a string');
    }
  }
  
  // Check local_heroes
  if (!Array.isArray(userMeta.favorites.local_heroes)) {
    throw new Error('user_meta.favorites.local_heroes must be an array');
  }
  for (const id of userMeta.favorites.local_heroes) {
    if (typeof id !== 'string') {
      throw new Error('Each item in user_meta.favorites.local_heroes must be a string');
    }
  }
  
  return true;
}

module.exports = (plugin) => {
  // Get the controller
  const userController = plugin.controllers.user;
  const authController = plugin.controllers.auth;
  const contentAPI = plugin.contentTypes.user;
  
  // Add lifecycle hooks to validate user_meta before create/update
  if (contentAPI && contentAPI.lifecycles) {
    // Before create hook
    const originalBeforeCreate = contentAPI.lifecycles.beforeCreate || (() => {});
    contentAPI.lifecycles.beforeCreate = async (data) => {
      await originalBeforeCreate(data);
      if (data.user_meta) {
        try {
          validateUserMeta(data.user_meta);
        } catch (error) {
          throw new Error(`Invalid user_meta: ${error.message}`);
        }
      }
    };
    
    // Before update hook
    const originalBeforeUpdate = contentAPI.lifecycles.beforeUpdate || (() => {});
    contentAPI.lifecycles.beforeUpdate = async (params, data) => {
      await originalBeforeUpdate(params, data);
      if (data.user_meta) {
        try {
          validateUserMeta(data.user_meta);
        } catch (error) {
          throw new Error(`Invalid user_meta: ${error.message}`);
        }
      }
    };
  }
  
  // Override update method on the controller to validate user_meta
  if (userController) {
    const originalUpdate = userController.update;
    
    userController.update = async (ctx) => {
      const { user_meta } = ctx.request.body;
      if (user_meta) {
        try {
          validateUserMeta(user_meta);
        } catch (error) {
          return ctx.badRequest(`Invalid user_meta: ${error.message}`);
        }
      }
      
      return await originalUpdate(ctx);
    };
  }
  
  // Override register method on the auth controller to validate user_meta
  if (authController) {
    const originalRegister = authController.register;
    
    authController.register = async (ctx) => {
      const { user_meta } = ctx.request.body;
      if (user_meta) {
        try {
          validateUserMeta(user_meta);
        } catch (error) {
          return ctx.badRequest(`Invalid user_meta: ${error.message}`);
        }
      }
      
      return await originalRegister(ctx);
    };
  }
  
  return plugin;
};
