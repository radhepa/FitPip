// Checks that need to read the migration files, so they live here (scripts has Node types) rather
// than under src. Run with the rest of the tests: npm test.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { EXTRA_CATALOG } from '../src/config/catalog/index.ts'
import { CATALOG_MIGRATION_FILE, renderCatalogMigration } from '../src/config/catalog/renderSql.ts'

const read = (path: string) => readFileSync(path, 'utf8')
const unquote = (sql: string) => sql.replace(/''/g, "'")

/** Every exercise name an account is seeded with before this catalogue (lifts, activities, extras). */
function earlierNames(): string[] {
  const names: string[] = []
  for (const file of ['20260925000100_activities.sql', '20260926000100_more_activities.sql']) {
    const sql = read(`supabase/migrations/${file}`)
    for (const m of sql.matchAll(/^\s*\('((?:[^']|'')+)',\s*'(?:cardio|swim|yoga|stretch|combat|sport|strength)'/gm)) names.push(unquote(m[1]))
  }
  const lifts = read('supabase/migrations/20260921000210_starter_exercise_catalog.sql')
  for (const m of lifts.matchAll(/^\s*\('[^']+',\s*'((?:[^']|'')+)',\s*'\{/gm)) names.push(unquote(m[1]))
  return names
}

describe('the expanded-catalogue migration', () => {
  it('is generated from src/config/catalog (run: node scripts/build-catalog-migration.ts)', () => {
    expect(read(CATALOG_MIGRATION_FILE)).toBe(renderCatalogMigration(EXTRA_CATALOG))
  })

  it('reads every earlier starter name (so the collision check below means something)', () => {
    const names = earlierNames()
    expect(names.length).toBe(187)
    expect(names).toContain('Barbell Bench Press')
    expect(names).toContain('Outdoor Run')
    expect(names).toContain("World's Greatest Stretch")
  })

  it('does not reuse a name from the earlier starter catalogues', () => {
    const taken = new Set(earlierNames().map((n) => n.toLowerCase()))
    for (const e of EXTRA_CATALOG) expect(taken.has(e.name.toLowerCase()), e.name).toBe(false)
  })

  it('quotes apostrophes for SQL', () => {
    expect(read(CATALOG_MIGRATION_FILE)).toContain("'Farmer''s Carry'")
  })
})
