// Minimal lint: ONLY the React hooks correctness rule. It exists because a
// hook declared below an early return shipped to production and blanked the
// participant submit page for every real contest (React error #310). This
// rule catches that entire class at build time. Deliberately no style rules.
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
    },
  },
];
