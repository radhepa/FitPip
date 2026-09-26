import type { PostgrestError } from '@supabase/supabase-js'

export class DataError extends Error {
  code: string | undefined

  constructor(error: Pick<PostgrestError, 'message' | 'code'>) {
    super(error.message)
    this.name = 'DataError'
    this.code = error.code
  }
}

/** Returns the data of a Supabase response or throws a DataError. */
export function unwrap<T>(res: { data: T | null; error: PostgrestError | null }): T {
  if (res.error) throw new DataError(res.error)
  return res.data as T
}

/** For writes where only success or failure matters. */
export function assertOk(res: { error: PostgrestError | null }): void {
  if (res.error) throw new DataError(res.error)
}

const FRIENDLY: Record<string, string> = {
  '23505': 'That already exists.',
  // ON DELETE RESTRICT raises 23001; a plain foreign key violation is 23503.
  '23001': "It's still in use (it has logged sets), so it can't be deleted.",
  '23503': 'That refers to something that no longer exists.',
}

/** Turns any thrown value into a message that is safe to show. */
export function errorMessage(error: unknown): string {
  if (error instanceof DataError && error.code && FRIENDLY[error.code]) return FRIENDLY[error.code]
  if (error instanceof Error) return error.message
  return 'Something went wrong.'
}
