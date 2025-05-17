'use strict';

/**
 * local-hero router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::local-hero.local-hero');
