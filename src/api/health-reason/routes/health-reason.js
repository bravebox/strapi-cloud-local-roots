'use strict';

/**
 * health-reason router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::health-reason.health-reason');
