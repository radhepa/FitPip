// Builds the expanded-catalogue SQL migration from src/config/catalog.
//
//   node scripts/build-catalog-migration.ts
//
// The catalogue (what is in it, and why) lives in src/config/catalog/*.ts. Edit those files, run this,
// and commit both. scripts/catalogMigration.test.ts fails if the migration is out of date.
import { writeFileSync } from 'node:fs'
import { EXTRA_CATALOG } from '../src/config/catalog/index.ts'
import { CATALOG_MIGRATION_FILE, renderCatalogMigration } from '../src/config/catalog/renderSql.ts'

writeFileSync(CATALOG_MIGRATION_FILE, renderCatalogMigration(EXTRA_CATALOG))
console.log(`wrote ${EXTRA_CATALOG.length} exercises to ${CATALOG_MIGRATION_FILE}`)
