'use strict';

module.exports = {
  getSeasonalIngredients: async (ctx) => {
    const { month, locale } = ctx.query; // Accept locale as query parameter

    if (!month) {
      ctx.throw(400, 'Missing required "month" query parameter');
    }

    // Pass locale to entityService to get content for that locale
    const ingredients = await strapi.entityService.findMany('api::ingredient.ingredient', {
      fields: ['season', 'title', 'description', 'id'],
      populate: ['cover'],
      locale: locale || undefined, // if no locale, defaults to default locale
    });

    // Filter ingredients where season[month] === 'high'
    const filtered = ingredients.filter(ingredient => {
      const season = ingredient.season || {};
      return season[month]?.toLowerCase() === 'high';
    });

    return filtered;
  }
};
