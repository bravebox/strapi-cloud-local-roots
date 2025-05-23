'use strict';

/**
 * health-reason service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::health-reason.health-reason');
