import oscdEslintConfig from '@omicronenergy/oscd-tooling/configs/eslint.config.js';

export default [
  ...oscdEslintConfig,
  {
    ignores: ['src/locales.ts', 'src/locales/'],
  },
  {
    // Scoped to match the shared config's ts-file config object (index 6 of
    // `oscdEslintConfig`) so the `import-x` plugin it registers is
    // guaranteed to be present wherever these rules apply.
    files: ['**/*.{ts,tsx,mts,cts}'],
    rules: {
      // Shell-specific: `LocaleTag` values are read directly off `this`
      // without invoking any instance method, so `no-this-in-static` style
      // enforcement doesn't apply to the localize accessor.
      'class-methods-use-this': ['error', { exceptMethods: ['locale'] }],

      // Local overrides of the shared import-x config: OpenSCD packages'
      // deep subpath exports aren't reliably resolvable by import-x, and
      // spec/test files live alongside their source (not under a `test/`
      // directory), so the shared devDependencies allow-list doesn't cover
      // them.
      'import-x/no-unresolved': 'off',
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.test.ts',
            '**/*.spec.ts',
            'eslint.config.js',
            'rollup.config.js',
            'web-test-runner.config.js',
            'web-dev-server.*',
          ],
        },
      ],
    },
  },
];
