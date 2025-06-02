// src/extensions/graphql/config/ingredient-seasonal-totals.graphql.js

module.exports = ({ strapi }) => ({
  typeDefs: `
    type SeasonalTotals {
      january: Int!
      february: Int!
      march: Int!
      april: Int!
      may: Int!
      june: Int!
      july: Int!
      august: Int!
      september: Int!
      october: Int!
      november: Int!
      december: Int!
    }

    type Query {
      ingredientSeasonalTotals: SeasonalTotals!
    }
  `,
  resolvers: {
    Query: {
      ingredientSeasonalTotals: {
        resolve: async (parent, args, ctx) => {
          // You can call your controller or put logic here
          return await strapi.controllers['api::totals.totals'].getTotals(ctx);
        },
      },
    },
  },
});
