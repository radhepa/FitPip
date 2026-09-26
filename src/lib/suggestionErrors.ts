export type SuggestionErrorCode =
  | 'guest' // guest mode has no account to call the function with
  | 'not_deployed' // the function does not exist on the project yet
  | 'not_configured' // deployed, but no OPENROUTER_API_KEY secret
  | 'bad_key' // OpenRouter rejected the key
  | 'no_credits' // the OpenRouter account is out of credits
  | 'rate_limited'
  | 'timeout'
  | 'unauthorized' // the app session is not valid
  | 'empty_bank' // no exercises to choose from
  | 'model_failed' // the model never produced a usable workout
  | 'offline'
  | 'failed'

export interface Failure {
  code: SuggestionErrorCode
  message: string
}

/** Setup problems the owner can fix (as opposed to "try again"). */
export const SETUP_CODES: SuggestionErrorCode[] = ['not_deployed', 'not_configured', 'bad_key', 'no_credits']

const MESSAGES: Record<SuggestionErrorCode, string> = {
  guest: 'Workout suggestions need an account. Sign in to use them.',
  not_deployed: 'The suggestion function has not been deployed to this Supabase project yet.',
  not_configured: 'The suggestion service has no OpenRouter API key yet.',
  bad_key: 'OpenRouter rejected the API key. Check the OPENROUTER_API_KEY secret.',
  no_credits: 'The OpenRouter account is out of credits.',
  rate_limited: 'The model provider is busy. Try again in a minute.',
  timeout: 'The model took too long to answer. Try again.',
  unauthorized: 'Your session has expired. Sign in again.',
  empty_bank: 'Add some exercises first, then ask again.',
  model_failed: 'The model did not come back with a usable workout. Try again, or switch to a different model.',
  offline: "Couldn't reach the suggestion service. Check your connection and try again.",
  failed: 'Something went wrong getting a suggestion. Try again.',
}

export const messageFor = (code: SuggestionErrorCode): string => MESSAGES[code]

const BY_ERROR: Record<string, SuggestionErrorCode> = {
  not_configured: 'not_configured',
  provider_auth: 'bad_key',
  insufficient_credits: 'no_credits',
  provider_rate_limited: 'rate_limited',
  provider_timeout: 'timeout',
  unauthorized: 'unauthorized',
  empty_bank: 'empty_bank',
  invalid_model_output: 'model_failed',
}

/** Turns an HTTP failure from the function (or from the Supabase gateway in front of it) into a state the UI can explain. */
export function classifyFailure(status: number, body: unknown): Failure {
  const error = typeof body === 'object' && body !== null ? (body as Record<string, unknown>).error : undefined
  const code =
    typeof error === 'string' && BY_ERROR[error]
      ? BY_ERROR[error]
      : status === 404
        ? 'not_deployed' // the gateway's "Requested function was not found"
        : status === 401
          ? 'unauthorized'
          : status === 429
            ? 'rate_limited'
            : 'failed'
  return { code, message: MESSAGES[code] }
}
