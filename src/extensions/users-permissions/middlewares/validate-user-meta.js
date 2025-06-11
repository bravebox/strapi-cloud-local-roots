'use strict';

// Direct require approach - TypeScript issues are suppressed
// @ts-ignore
const Ajv = require('ajv');
// @ts-ignore
const ajv = new (Ajv.default || Ajv)({ allErrors: true });
const userMetaSchema = require('../content-types/user/user-meta.schema');
const validateUserMeta = ajv.compile(userMetaSchema);

// Create middleware to validate user_meta
module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // Only run validation when updating users
    if (ctx.request.method === 'PUT' || 
        ctx.request.method === 'POST' || 
        ctx.request.method === 'PATCH') {
      
      // Check if this is a request to update a user
      const isUserUpdate = ctx.request.url.includes('/users/') || 
                          ctx.request.url.includes('/user/') || 
                          ctx.request.url.includes('/users-permissions/user');
      
      if (isUserUpdate && ctx.request.body && ctx.request.body.user_meta) {
        const isValid = validateUserMeta(ctx.request.body.user_meta);
        
        if (!isValid) {
          return ctx.badRequest('Invalid user_meta structure', {
            errors: validateUserMeta.errors.map(err => ({
              path: err.instancePath,
              message: err.message
            }))
          });
        }
      }
    }

    return next();
  };
};
