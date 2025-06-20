'use strict';

/**
 * user-feedback service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::user-feedback.user-feedback');
