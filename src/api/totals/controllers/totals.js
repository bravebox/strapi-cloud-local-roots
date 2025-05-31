'use strict';

module.exports = {
  getTotals: async () => {

    const ingredients = await strapi.entityService.findMany('api::ingredient.ingredient', {
      fields: ['season'],
    });

    const seasonalTotals = {
      january: 0,
      february: 0,
      march: 0,
      april: 0,
      may: 0,
      june: 0,
      july: 0,
      august: 0,
      september: 0,
      october: 0,
      november: 0,
      december: 0,
    };

    ingredients.forEach(ingredient => {
      const season = ingredient.season || {};
      Object.entries(season).forEach(([month, value]) => {
        if (value?.toLowerCase() === 'high' && seasonalTotals.hasOwnProperty(month)) {
          seasonalTotals[month]++;
        }
      });
    });

    return seasonalTotals;
  }
};
