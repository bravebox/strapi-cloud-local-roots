'use strict';
const bootstrap = require("./bootstrap");

module.exports = {
  register({ strapi }) {
    const extensionService = strapi.plugin('graphql').service('extension');

    const extension = () => ({
      typeDefs: `
        type SimpleResponse {
          timestamp: String!
        }

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

        type Ingredient {
            id: ID!
            title: String!
            description: String
            body: JSON
            season: JSON
            handeling: String
            shopping: String
            cover: UploadFile
            createdAt: DateTime!
            updatedAt: DateTime!
            publishedAt: DateTime!
        }

        extend type Query {
          now: SimpleResponse!
          ingredientSeasonalTotals: SeasonalTotals!
          seasonalIngredients(month: String!): [Ingredient]!
        }
      `,

      resolvers: {
        Query: {
          now: {
            resolve() {
              return { 
                timestamp: new Date().toISOString() 
              };
            },
          },
          ingredientSeasonalTotals: {
            resolve: async (parent, args, ctx) => {
              // You can call your controller or put logic here
              return await strapi.controllers['api::totals.totals'].getTotals(ctx);
            },
          },
          seasonalIngredients: {
            resolve: async (parent, args, ctx) => {
              const { month } = args;
              const allIngredients = await strapi.entityService.findMany('api::ingredient.ingredient');
              return allIngredients.filter(
                (ingredient) => ingredient.season && ingredient.season[month] === 'high'
              );
            },
          },
        },
      },

      resolversConfig: {
        'Query.now': {
          auth: false,
        },
        'Query.ingredientSeasonalTotals': {
          auth: false,
        },
        'Query.seasonalIngredients': {
          auth: false,
        },
      },
    });
    extensionService.use(extension);
  },
  bootstrap,
};
