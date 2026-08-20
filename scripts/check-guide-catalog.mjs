#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { validateCatalog } from './guide-catalog-core.mjs';

try {
  const path = resolve(import.meta.dirname, '../src/data/guias.json');
  const catalog = JSON.parse(await readFile(path, 'utf8'));
  validateCatalog(catalog);
  console.log(`Catálogo válido: ${catalog.length} guías.`);
} catch (error) {
  console.error(`Catálogo inválido: ${error instanceof Error ? error.message : 'error desconocido'}`);
  process.exitCode = 1;
}
