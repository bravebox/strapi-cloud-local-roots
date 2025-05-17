import { getTranslation } from './utils/getTranslation';
import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { PluginIcon } from './components/PluginIcon';
import {getTrad} from './utils/getTrad';

export default {
  register(app: any) {

    app.customFields.register({
      name: 'color',
      pluginId: 'color-picker',
      type: 'string',
      intlLabel: {
        id: getTrad('color-picker.label'),
        defaultMessage: 'Color',
      },
      intlDescription: {
        id: getTrad('color-picker.description'),
        defaultMessage: 'Select any color',
      },
      icon: PluginIcon,
      components: {
        Input: async () =>
          import('./components/ColorInput'),
      },
      options: {
        advanced: [
          {
            sectionTitle: {
              id: 'global.settings',
              defaultMessage: 'Settings',
            },
            items: [
              {
                name: 'required',
                type: 'checkbox',
                intlLabel: {
                  id: 'color-picker.settings.requiredField',
                  defaultMessage: 'Required field',
                },
                description: {
                  id: 'color-picker.settings.requiredField.description',
                  defaultMessage: "You won't be able to create an entry if this field is empty",
                },
              },
            ],
          },
        ],
      },
    });
  

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);

          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};
