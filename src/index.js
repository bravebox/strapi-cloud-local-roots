'use strict';
const bootstrap = require("./bootstrap");

module.exports = {
  register({ strapi }) {
    const extensionService = strapi.plugin('graphql').service('extension');

    extensionService.use(({ nexus }) => ({
      types: [
        nexus.extendType({
          type: 'UsersPermissionsMe',
          definition(t) {
            t.json('user_meta');
          },
        }),
      ]
    }));

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
          ingredientSeasonalTotals(locale: String): SeasonalTotals!
          seasonalIngredients(
            month: String!
            locale: String
            limit: Int
            offset: Int
            sort: String
          ): [Ingredient]!
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
              const { locale = 'en' } = args;
              
              const ingredients = await strapi.entityService.findMany('api::ingredient.ingredient', {
                fields: ['season'],
                locale,
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
            },
          },
          seasonalIngredients: {
            resolve: async (parent, args, ctx) => {
              const { month, locale = 'en', limit = 25, offset = 0, sort = 'title:asc' } = args;
              
              if (!month) {
                throw new Error('Missing required "month" parameter');
              }

              const ingredients = await strapi.entityService.findMany('api::ingredient.ingredient', {
                fields: ['season', 'title', 'description', 'id'],
                populate: ['cover'],
                locale,
                limit: parseInt(limit),
                start: parseInt(offset),
                sort: [sort],
              });

              // Filter ingredients where season[month] === 'high'
              const filtered = ingredients.filter(ingredient => {
                const season = ingredient.season || {};
                return season[month]?.toLowerCase() === 'high';
              });

              // Return direct array of ingredients (no data/attributes wrapper for GraphQL)
              return filtered;
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
