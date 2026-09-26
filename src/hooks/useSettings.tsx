import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { DEFAULT_SETTINGS, getSettings, saveCompareSex, saveDisplayName, saveDistanceUnit, saveGoalWeight, saveRestSeconds, saveWeightUnit } from '../data/settings'
import type { DistanceUnit, Sex, UserSettings, WeightUnit } from '../types/db'
import { useAuth } from './useAuth'
import { useDataVersion } from './useSyncStatus'

interface SettingsValue {
  unit: WeightUnit
  distanceUnit: DistanceUnit
  goal: { weight: number; unit: WeightUnit } | null
  /** Seconds of rest after a lifting set; 0 means the timer is off. */
  restSeconds: number
  /** Which strength standards lifts are ranked against; null until chosen. */
  compareSex: Sex | null
  displayName: string | null
  setUnit: (unit: WeightUnit) => Promise<void>
  setDistanceUnit: (unit: DistanceUnit) => Promise<void>
  setGoal: (goal: { weight: number; unit: WeightUnit } | null) => Promise<void>
  setRestSeconds: (seconds: number) => Promise<void>
  setCompareSex: (sex: Sex) => Promise<void>
  setDisplayName: (name: string) => Promise<void>
}

const noop = async () => {}
const SettingsContext = createContext<SettingsValue>({
  unit: 'lb',
  distanceUnit: 'mi',
  goal: null,
  restSeconds: DEFAULT_SETTINGS.rest_seconds,
  compareSex: null,
  displayName: null,
  setUnit: noop,
  setDistanceUnit: noop,
  setGoal: noop,
  setRestSeconds: noop,
  setCompareSex: noop,
  setDisplayName: noop,
})

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const userId = session?.user.id
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const dataVersion = useDataVersion()

  useEffect(() => {
    if (!userId) return
    let active = true
    getSettings()
      .then((s) => active && setSettings(s))
      .catch(() => {}) // keep the defaults if settings can't be read
    return () => {
      active = false
    }
  }, [userId, dataVersion])

  /** Shows the change at once and puts it back if it could not be saved. */
  const change = useCallback(
    async (patch: Partial<UserSettings>, save: () => Promise<void>) => {
      if (!userId) return
      // Only the changed fields are put back, so two quick changes in a row don't undo each other.
      const previous = Object.fromEntries(Object.keys(patch).map((key) => [key, settings[key as keyof UserSettings]])) as Partial<UserSettings>
      setSettings((current) => ({ ...current, ...patch }))
      try {
        await save()
      } catch (e) {
        setSettings((current) => ({ ...current, ...previous }))
        throw e
      }
    },
    [userId, settings],
  )

  const value: SettingsValue = {
    unit: settings.weight_unit,
    distanceUnit: settings.distance_unit,
    goal: settings.goal_weight !== null && settings.goal_weight_unit ? { weight: settings.goal_weight, unit: settings.goal_weight_unit } : null,
    restSeconds: settings.rest_seconds,
    compareSex: settings.compare_sex,
    displayName: settings.display_name,
    setCompareSex: (sex) => change({ compare_sex: sex }, () => saveCompareSex(sex)),
    setDisplayName: (name) =>
      change({ display_name: name.replace(/\s+/g, ' ').trim() || null }, async () => {
        await saveDisplayName(name)
      }),
    setRestSeconds: (seconds) => change({ rest_seconds: seconds }, () => saveRestSeconds(seconds)),
    setUnit: (unit) => change({ weight_unit: unit }, () => saveWeightUnit(unit)),
    setDistanceUnit: (unit) => change({ distance_unit: unit }, () => saveDistanceUnit(unit)),
    setGoal: (goal) =>
      change({ goal_weight: goal?.weight ?? null, goal_weight_unit: goal?.unit ?? null }, () => saveGoalWeight(goal)),
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export const useSettings = () => useContext(SettingsContext)
