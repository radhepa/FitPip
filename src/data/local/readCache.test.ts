import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { setActiveDbForTests } from './context'
import { FitPipDB } from './db'
import { bumpDataVersion, emitLocalWrite, getDataGeneration } from './events'
import { clearReadCache, peekRead, rememberRead } from './readCache'

const db = new FitPipDB('read-cache-test')
const at = (iso: string) => new Date(iso)

afterEach(() => {
  clearReadCache()
  setActiveDbForTests(db, 'user-1')
})

describe('remembered reads', () => {
  it('hands a read back, with its age, while nothing has changed', () => {
    setActiveDbForTests(db, 'user-1')
    rememberRead('k', [1, 2], getDataGeneration(), at('2026-09-27T10:00:00'))
    expect(peekRead('k', at('2026-09-27T10:00:05'))).toEqual({ value: [1, 2], age: 5000 })
  })

  it('forgets it after a local write or a sync', () => {
    setActiveDbForTests(db, 'user-1')
    rememberRead('a', 1, getDataGeneration())
    emitLocalWrite(false)
    expect(peekRead('a')).toBeUndefined()

    rememberRead('b', 2, getDataGeneration())
    bumpDataVersion()
    expect(peekRead('b')).toBeUndefined()
  })

  it('does not keep a read that something changed under while it ran', () => {
    setActiveDbForTests(db, 'user-1')
    const started = getDataGeneration()
    emitLocalWrite(false)
    rememberRead('k', 'stale', started)
    expect(peekRead('k')).toBeUndefined()
  })

  it('is per person and per day', () => {
    setActiveDbForTests(db, 'user-1')
    rememberRead('k', 'mine', getDataGeneration(), at('2026-09-27T23:59:00'))
    setActiveDbForTests(db, 'user-2')
    expect(peekRead('k', at('2026-09-27T23:59:30'))).toBeUndefined()

    rememberRead('k', 'today', getDataGeneration(), at('2026-09-27T23:59:00'))
    expect(peekRead('k', at('2026-09-28T00:00:10'))).toBeUndefined()
  })
})
