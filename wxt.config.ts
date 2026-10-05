import { defineConfig } from 'wxt';

export default defineConfig({
  manifestVersion: 3,
  manifest: ({ browser }) => ({
    name: 'Quick URL Copy',
    description: 'Copy the current tab URL',
    permissions: [
      'tabs',
      'clipboardWrite',
      ...(browser === 'firefox' ? [] : ['offscreen']),
    ],
    commands: {
      'copy-url': {
        suggested_key: {
          default: 'Ctrl+Shift+C',
          mac: 'Command+Shift+C',
        },
        description: 'Copy the current tab URL',
      },
    },
    ...(browser === 'firefox'
      ? {
          browser_specific_settings: {
            gecko: {
              id: 'quick-url-copy@local',
              data_collection_permissions: {
                required: ['none'],
              },
            },
          },
        }
      : {}),
  }),
});
