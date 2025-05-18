import type { Core } from '@strapi/strapi';

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.customFields.register({
    name: "month-selector",
    plugin: 'month-multi-selector',
    type: "json",
    inputSize: {
      default: 12,
      isResizable: false,
    },
  });
};

export default register;
