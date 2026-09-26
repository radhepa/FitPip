import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { DEFAULT_SETTINGS } from '../data/guest'
import { getSettings, saveDistanceUnit, saveGoalWeight, saveWeightUnit } from '../data/settings'
import type { DistanceUnit, UserSettings, WeightUnit } from '../types/db'
import { useAuth } from './useAuth'

interface SettingsValue {
  unit: WeightUnit
  distanceUnit: DistanceUnit
  goal: { weight: number; unit: WeightUnit } | null
  setUnit: (unit: WeightUnit) => Promise<void>
  setDistanceUnit: (unit: DistanceUnit) => Promise<void>
  setGoal: (goal: { weight: number; unit: WeightUnit } | null) => Promise<void>
}

const noop = async () => {}
const SettingsContext = createContext<SettingsValue>({
  unit: 'lb',
  distanceUnit: 'mi',
  goal: null,
  setUnit: noop,
  setDistanceUnit: noop,
  setGoal: noop,
})

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const userId = session?.user.id
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    if (!userId) return
    let active = true
    getSettings()
      .then((s) => active && setSettings(s))
      .catch(() => {}) // keep the defaults if settings can't be read
    return () => {
      active = false
    }
  }, [userId])

  /** Shows the change at once and puts it back if it could not be saved. */
  const change = useCallback(
    async (patch: Partial<UserSettings>, save: (userId: string) => Promise<void>) => {
      if (!userId) return
      const previous = settings
      setSettings({ ...settings, ...patch })
      try {
        await save(userId)
      } catch (e) {
        setSettings(previous)
        throw e
      }
    },
    [userId, settings],
  )

  const value: SettingsValue = {
    unit: settings.weight_unit,
    distanceUnit: settings.distance_unit,
    goal: settings.goal_weight !== null && settings.goal_weight_unit ? { weight: settings.goal_weight, unit: settings.goal_weight_unit } : null,
    setUnit: (unit) => change({ weight_unit: unit }, (id) => saveWeightUnit(id, unit)),
    setDistanceUnit: (unit) => change({ distance_unit: unit }, (id) => saveDistanceUnit(id, unit)),
    setGoal: (goal) =>
      change({ goal_weight: goal?.weight ?? null, goal_weight_unit: goal?.unit ?? null }, (id) => saveGoalWeight(id, goal)),
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export const useSettings = () => useContext(SettingsContext)
