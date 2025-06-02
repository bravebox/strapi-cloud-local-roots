module.exports = {
  typeDefs: `
    type SimpleResponse {
      message: String!
      timestamp: String!
    }

    extend type Query {
      hello: SimpleResponse!
    }
  `,
  resolvers: {
    Query: {
      hello: async () => ({
        message: "Hello from GraphQL!",
        timestamp: new Date().toISOString(),
      }),
    },
  },
};
