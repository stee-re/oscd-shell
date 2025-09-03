import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { hmrPlugin, presets } from 'vite-plugin-web-components-hmr';
import externalizeSourceDependencies from '@blockquote/rollup-plugin-externalize-source-dependencies';

// Polyfill __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // Main library entry (bundled for browser use)
        'oscd-shell': './oscd-shell.ts',
        // Demo page
        'demo/index': 'demo/index.html',
      },
      output: {
        // Place all outputs at root or in demo/
        entryFileNames: assetInfo =>
          assetInfo.name === 'oscd-editor-communication'
            ? 'oscd-editor-communication.js'
            : 'demo/[name].js',
        assetFileNames: assetInfo =>
          assetInfo.name && assetInfo.name.startsWith('demo/')
            ? 'demo/[name][extname]'
            : '[name][extname]',
      },
    },
  },
  plugins: [
    hmrPlugin({
      include: ['**/*.ts'],
      presets: [presets.lit],
    }),
    externalizeSourceDependencies([
      /* @web/test-runner-commands needs to establish a web-socket
       * connection. It expects a file to be served from the
       * @web/dev-server. So it should be ignored by Vite */
      '/__web-dev-server__web-socket.js',
    ]),
  ],
  server: {
    open: '/demo/index.html',
    watch: {
      ignored: [],
    },
    fs: {
      allow: [path.resolve(__dirname), path.resolve(__dirname, 'node_modules')],
    },
  },
  test: {
    /*
     * Currently tests won't run, primarilly because of the dependency on scl-lib and how its using fetch to load nsd.json
     * Vite doesn't seem interested in supporting this kind of dynamic imports, so if we want to use Vite we need to change
     * this, as work arounds are not the way forward.
     */
    include: ['./*.spec.ts'],
    globals: true,
    coverage: {
      reporter: ['text', 'html'],
    },

    browser: {
      enabled: true,
      provider: 'playwright',
      instances: [{ browser: 'chromium' }],
    },
  },
});
