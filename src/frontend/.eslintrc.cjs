// Configuración ESLint mínima — FRONTEND_OFFICIALIZATION_IMPLEMENTATION_PHASE_1 (P1)
// Objetivo: dotar al frontend de un gate de calidad ejecutable sin reescribir código.
// Alcance: analiza [src/] únicamente. Ignora `dist/` (build), `public/` (vendor
// auto-hospedado: circuitjs1, jsxgraph) y `_quarantine/` (código deprecado
// preservado, no parte de la app).
module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: { react: { version: 'detect' } },
  plugins: ['react', 'react-hooks', 'react-refresh'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'node_modules', 'public', '_quarantine', '*.config.js'],
  rules: {
    // JSX no usa React explícito (runtime automático); el prop-types no aplica a este repo.
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    // @react-three/fiber usa props válidas (position, args, emissive...) que la
    // regla no reconoce → falso positivo documentado.
    'react/no-unknown-property': 'off',
    // Deuda visible pero no bloqueante en esta fase (se endurecerá en una fase posterior).
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-empty': 'warn',
    'react/no-unescaped-entities': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'react-refresh/only-export-components': 'off',
  },
};
