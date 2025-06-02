module.exports = ({ strapi }) => ({
  typeDefs: `
    type Ingredient {
      id: ID!
      title: String
      description: String
      season: JSON
    }

    type Query {
      seasonalIngredients(month: String!): [Ingredient]!
    }
  `,
  resolvers: {
    Query: {
      seasonalIngredients: {
        resolve: async (parent, args, ctx) => {
          const { month } = args;
          const allIngredients = await strapi.entityService.findMany('api::ingredient.ingredient', {
            populate: ['season'],
          });
          return allIngredients.filter(
            (ingredient) => ingredient.season && ingredient.season[month] === 'high'
          );
        },
      },
    },
  },
});
