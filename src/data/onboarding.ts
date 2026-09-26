import { assessStrength, validateAssessment, type Assessment } from '../lib/assessment'
import type { AssessmentDraft } from '../lib/assessmentDraft'
import { getDb } from './local/context'
import { getMeta, setMeta } from './local/db'
import { bumpDataVersion } from './local/events'
import { writeTx } from './local/store'
import { getSettings, saveCompareSex } from './settings'
import { listBodyWeights } from './bodyWeights'

// Device-local and account-scoped, so existing accounts also experience the rollout once.
const COMPLETE = 'onboarding.v1.completed'
const ASSESSMENT = 'onboarding.v1.assessment'
const DRAFT = 'onboarding.v1.draft'
export interface SavedAssessment { answers: Assessment; completedAt: string }

export const hasFinishedOnboarding = async () => (await getMeta<boolean>(getDb(), COMPLETE)) === true
export const saveAssessmentDraft = (draft: AssessmentDraft) => setMeta(getDb(), DRAFT, draft)

export async function getAssessment(): Promise<SavedAssessment | null> {
  const saved = await getMeta<SavedAssessment>(getDb(), ASSESSMENT)
  if (!saved) return null
  try { validateAssessment(saved.answers); return saved } catch { return null }
}

export async function loadWelcomeData() {
  const [settings, weights, draft, assessment] = await Promise.all([
    getSettings(), listBodyWeights(), getMeta<AssessmentDraft>(getDb(), DRAFT), getAssessment(),
  ])
  return { settings, latestWeight: weights.at(-1), draft, assessment }
}

/** Assessment answers never create workouts, lift sets, weigh-ins or XP. */
export async function finishOnboarding(assessment?: Assessment): Promise<void> {
  if (assessment) assessStrength(assessment)
  await writeTx(async () => {
    if (assessment) {
      await saveCompareSex(assessment.sex)
      await setMeta(getDb(), ASSESSMENT, { answers: assessment, completedAt: new Date().toISOString() } satisfies SavedAssessment)
    }
    await setMeta(getDb(), COMPLETE, true)
  })
  bumpDataVersion()
}
