import { MuscleType } from 'react-body-highlighter'
import { describe, expect, it } from 'vitest'
import { MUSCLES } from '../types/db'
import { BODY_LABEL, BODY_TO_MUSCLES, LEVEL_COLORS, LEVEL_LABELS, LEVEL_STARTS, MUSCLE_TO_BODY, UNTRACKED_REGIONS } from './muscleMap'

const LIBRARY_REGIONS: string[] = Object.values(MuscleType)

describe('MUSCLE_TO_BODY', () => {
  it('maps every one of our muscles to at least one region', () => {
    for (const muscle of MUSCLES) expect(MUSCLE_TO_BODY[muscle].length, muscle).toBeGreaterThan(0)
  })

  it('only uses region names the library really has', () => {
    for (const regions of Object.values(MUSCLE_TO_BODY)) {
      for (const region of regions) expect(LIBRARY_REGIONS, region).toContain(region)
    }
  })

  it('lights every tracked region from at least one muscle, and leaves head/neck/knees alone', () => {
    for (const region of LIBRARY_REGIONS) {
      if (UNTRACKED_REGIONS.includes(region as (typeof UNTRACKED_REGIONS)[number])) {
        expect(BODY_TO_MUSCLES[region as keyof typeof BODY_TO_MUSCLES], region).toBeUndefined()
      } else {
        expect(BODY_TO_MUSCLES[region as keyof typeof BODY_TO_MUSCLES]?.length, region).toBeGreaterThan(0)
      }
    }
  })

  it('has a heading for every region that can be tapped', () => {
    for (const region of Object.keys(BODY_TO_MUSCLES)) expect(BODY_LABEL[region as keyof typeof BODY_LABEL], region).toBeTruthy()
  })
})

describe('levels', () => {
  it('has one colour per level 1-4 and a label per level 0-4', () => {
    expect(LEVEL_COLORS).toHaveLength(4)
    expect(LEVEL_STARTS).toHaveLength(4)
    expect(LEVEL_LABELS).toHaveLength(5)
  })
})

describe('the misnamed thigh regions of the library', () => {
  it('lights both inner-thigh shapes from adductors and puts hip abductors on the glutes', () => {
    expect(MUSCLE_TO_BODY.adductors).toEqual(['adductor', 'abductors'])
    expect(MUSCLE_TO_BODY.abductors).toEqual(['gluteal'])
    expect(BODY_TO_MUSCLES.gluteal).toEqual(['glutes', 'abductors'])
    expect(BODY_TO_MUSCLES.abductors).toEqual(['adductors'])
  })
})
