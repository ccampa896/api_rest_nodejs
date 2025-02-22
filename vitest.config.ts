import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';

// Carrega o .env.test ANTES dos testes rodarem
config({ path: '.env.test' });

export default defineConfig({
  test: {
    setupFiles: './test/setup.ts', // Arquivo de setup que pode carregar variáveis
  },
});
