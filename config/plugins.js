const { env } = require('@strapi/utils');

module.exports = () => ({
  upload: {
    config: {
      providerOptions: {
        sizeLimit: 10 * 1024 * 1024, // 10MB in bytes
      },
      breakpoints: {
        large: 1000,
        medium: 750,
        small: 500,
        thumbnail: 100,
      },
      // This forces Strapi to create all formats regardless of original size
      transformations: {
        size: {
          large: { width: 1000, height: 1000 },
          medium: { width: 750, height: 750 },
          small: { width: 500, height: 500 },
          thumbnail: { width: 100, height: 100 }
        },
      },
    },
  },

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

});
