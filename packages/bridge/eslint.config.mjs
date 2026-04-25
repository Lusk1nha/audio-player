import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Aqui você pode adicionar regras específicas da sua equipe
      "@typescript-eslint/no-explicit-any": "warn"
    }
  }
);