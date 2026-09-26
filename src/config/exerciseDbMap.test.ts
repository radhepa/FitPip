import { describe, expect, it } from 'vitest'
import {
  cleanInstructions,
  isImportable,
  mapEquipment,
  mapExerciseDb,
  mapMuscles,
  titleCase,
  type ExerciseDbExercise,
} from './exerciseDbMap'

const bench: ExerciseDbExercise = {
  exerciseId: 'EIeI8Vf',
  name: 'barbell bench press',
  gifUrl: 'https://static.exercisedb.dev/media/EIeI8Vf.gif',
  bodyParts: ['chest'],
  equipments: ['barbell'],
  targetMuscles: ['pectorals'],
  secondaryMuscles: ['triceps', 'shoulders'],
  instructions: ['Step:1 Lie flat on a bench.', 'Step:2 Grasp the barbell.'],
}

describe('mapExerciseDb', () => {
  it('normalizes a typical record', () => {
    expect(mapExerciseDb(bench)).toEqual({
      external_id: 'EIeI8Vf',
      name: 'Barbell Bench Press',
      primary_muscles: ['chest'],
      secondary_muscles: ['triceps', 'front_delts'],
      equipment: 'barbell',
      image_url: 'https://static.exercisedb.dev/media/EIeI8Vf.gif',
      instructions: ['Lie flat on a bench.', 'Grasp the barbell.'],
    })
  })

  it('never lists a muscle as both primary and secondary', () => {
    const m = mapExerciseDb({ ...bench, targetMuscles: ['triceps'], secondaryMuscles: ['triceps', 'chest'] })
    expect(m.primary_muscles).toEqual(['triceps'])
    expect(m.secondary_muscles).toEqual(['chest'])
  })

  it('keeps third-party data within our limits', () => {
    const m = mapExerciseDb({ ...bench, name: 'x'.repeat(200), gifUrl: 'http://insecure.example/a.gif' })
    expect(m.name).toHaveLength(80)
    expect(m.image_url).toBeNull()
    const steps = Array.from({ length: 50 }, (_, i) => `Step:${i + 1} Do thing ${i}.`)
    expect(mapExerciseDb({ ...bench, instructions: steps }).instructions).toHaveLength(30)
  })

  it('flags cardio and other untracked work as not importable', () => {
    const cardio = mapExerciseDb({ ...bench, name: 'jumping jack', targetMuscles: ['cardiovascular system'] })
    expect(cardio.primary_muscles).toEqual([])
    expect(isImportable(cardio)).toBe(false)
    expect(isImportable(mapExerciseDb(bench))).toBe(true)
  })
})

describe('mapMuscles', () => {
  it('picks the deltoid head from the exercise name', () => {
    expect(mapMuscles(['delts'], 'primary', 'dumbbell lateral raise')).toEqual(['side_delts'])
    expect(mapMuscles(['delts'], 'primary', 'dumbbell rear fly')).toEqual(['rear_delts'])
    expect(mapMuscles(['delts'], 'primary', 'lever seated reverse fly')).toEqual(['rear_delts'])
    expect(mapMuscles(['delts'], 'primary', 'dumbbell front raise')).toEqual(['front_delts'])
    expect(mapMuscles(['delts'], 'primary', 'barbell seated overhead press')).toEqual(['front_delts', 'side_delts'])
  })

  it('maps synonyms, drops untracked muscles, and de-duplicates', () => {
    expect(mapMuscles(['quadriceps', 'quads'], 'secondary', 'x')).toEqual(['quads'])
    expect(mapMuscles(['hip flexors', 'ankles', 'glutes'], 'secondary', 'x')).toEqual(['glutes'])
    expect(mapMuscles(['back'], 'primary', 'x')).toEqual(['lats', 'upper_back'])
    expect(mapMuscles(undefined, 'primary', 'x')).toEqual([])
  })
})

describe('mapEquipment', () => {
  it('maps known gear and falls back to other', () => {
    expect(mapEquipment(['body weight'])).toBe('bodyweight')
    expect(mapEquipment(['ez barbell'])).toBe('barbell')
    expect(mapEquipment(['leverage machine'])).toBe('machine')
    expect(mapEquipment(['stability ball'])).toBe('other')
    expect(mapEquipment([])).toBe('other')
  })
})

describe('text helpers', () => {
  it('title-cases names, including hyphens and parentheses', () => {
    expect(titleCase('lever t bar row')).toBe('Lever T Bar Row')
    expect(titleCase('chin-up')).toBe('Chin-Up')
    expect(titleCase('cable pulldown (pro lat bar)')).toBe('Cable Pulldown (Pro Lat Bar)')
  })

  it('strips the "Step:N" prefix', () => {
    expect(cleanInstructions(['Step:1 Do it.', 'Step:12 Then this.', 'Plain'])).toEqual(['Do it.', 'Then this.', 'Plain'])
  })
})
