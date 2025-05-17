'use strict';

/**
 * local-hero service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::local-hero.local-hero');
