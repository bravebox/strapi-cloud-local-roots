'use strict';

module.exports = {
  getSeasonalIngredients: async (ctx) => {
    const { month } = ctx.query;
    if (!month) {
      ctx.throw(400, 'Missing required "month" query parameter');
    }

    const ingredients = await strapi.entityService.findMany('api::ingredient.ingredient', {
      fields: ['season', 'title', 'description', 'id'],
      populate: ['cover'],
    });

    // Filter ingredients where season[month] === 'high'
    const filtered = ingredients.filter(ingredient => {
      const season = ingredient.season || {};
      return season[month]?.toLowerCase() === 'high';
    });

    return filtered;
  }
};