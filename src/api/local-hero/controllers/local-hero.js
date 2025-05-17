'use strict';

/**
 * local-hero controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::local-hero.local-hero');
