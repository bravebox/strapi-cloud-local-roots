module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/totals',
      handler: 'totals.getTotals',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
