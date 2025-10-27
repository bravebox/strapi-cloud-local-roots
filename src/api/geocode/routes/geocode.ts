export default {
  routes: [
    {
      method: 'POST',
      path: '/geocode',
      handler: 'geocode.batchReverse',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
