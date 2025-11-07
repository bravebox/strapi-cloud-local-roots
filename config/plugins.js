const { env } = require('@strapi/utils');

module.exports = () => ({



  graphql: {
    config: {
      endpoint: "/graphql",
      shadowCRUD: true,
      playgroundAlways: true,
      introspection: true,
      depthLimit: 7,
      amountLimit: 100,
      apolloServer: {
        tracing: false,
      },
    },
  },

  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for port 465, false for port 587
        auth: {
          user: env('SMTP_USERNAME'), // your Gmail address
          pass: env('SMTP_PASSWORD'), // your Gmail app password
        },
      },
      settings: {
        defaultFrom: env('SMTP_USERNAME'), // your Gmail address
        defaultReplyTo: env('SMTP_USERNAME'),
      },
    },
  },

  'address-selection': {
    enabled: true
  },

  'strapi-import-export': {
    enabled: true,
    config: {},
  }

});
