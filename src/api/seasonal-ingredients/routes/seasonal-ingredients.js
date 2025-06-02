module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/seasonal-ingredients',
      handler: 'seasonal-ingredients.getSeasonalIngredients',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
