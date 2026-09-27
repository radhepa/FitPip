import { useCallback, useEffect, useRef, useState } from 'react'
import { buzz } from '../components/fx'
import type { PipMood } from '../components/pip/types'
import { localDateIso } from '../lib/bodyWeight'
import type { PipFacts } from '../lib/pip/facts'
import { EMPTY_MEMORY, parseMemory, type PipMemory } from '../lib/pip/memory'
import { momentsFor } from '../lib/pip/moments'
import type { PipMoment, PipTalk } from '../lib/pip/types'
import { drawLaunch, drawTalk, drawTap, type Draw, type Said, type VoiceContext } from '../lib/pip/voice'
import { usePipGesture } from './usePipGesture'

const MEMORY_KEY = 'fitpip.pip-voice'
const OLD_DECK_KEY = 'fitpip.pip-deck'
/** How long to wait for your history before opening with an everyday line instead. */
const PATIENCE_MS = 900
/** Gestures for an everyday line that has none of its own, so a tap always does something. */
const FALLBACK_GESTURES: PipMood[] = ['nod', 'wave', 'bounce']

/** The opening line for this app launch, kept while you move between screens (unless your data changes). */
let launched: { stamp: string; said: Said } | null = null

function loadMemory(): PipMemory {
  try {
    localStorage.removeItem(OLD_DECK_KEY)
    return parseMemory(localStorage.getItem(MEMORY_KEY))
  } catch {
    return EMPTY_MEMORY
  }
}

function saveMemory(memory: PipMemory): void {
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(memory))
  } catch {
    // storage blocked or full: Pip just won't remember this time
  }
}

export interface PipVoice {
  /** What he is saying; null for a moment while he works out what to open with. */
  said: Said | null
  /** The gesture he is making right now, if any. */
  reaction: PipMood | undefined
  /** Changes each time he says something, to restart his animation and the bubble's entrance. */
  nonce: number
  tap: () => void
  talk: (kind: PipTalk) => void
  /** Picks one of the quick replies to a question. */
  choose: (index: number) => void
}

/**
 * Pip's voice on the Today card: an opening line that fits your day, another on each tap, three
 * "ask Pip" chips, and the occasional question with quick replies. `facts` is null until your
 * history (and, on Today, your plan) has loaded.
 */
export function usePipVoice({ facts, base }: { facts: PipFacts | null; base: PipMood }): PipVoice {
  const memory = useRef<PipMemory | null>(null)
  /** The moments for the current facts, kept between taps (they only change with your data or once Pip has asked). */
  const cache = useRef<{ facts: PipFacts; asked: boolean; moments: PipMoment[] } | null>(null)
  const taps = useRef(0)
  const interacted = useRef(false)
  /** Opened with an everyday line because your history was slow: keep it rather than swap it mid-read. */
  const fellBack = useRef(false)
  const [said, setSaid] = useState<Said | null>(() => launched?.said ?? null)
  const { reaction, nonce, play } = usePipGesture()

  const show = useCallback(
    (next: Said, mood: PipMood | null) => {
      setSaid(next)
      play(mood)
    },
    [play],
  )

  const context = useCallback((): { ctx: VoiceContext; memory: PipMemory } => {
    memory.current ??= loadMemory()
    const now = new Date()
    const asked = memory.current.askedOn === localDateIso(now)
    if (facts && (cache.current?.facts !== facts || cache.current.asked !== asked)) cache.current = { facts, asked, moments: momentsFor(facts, { askedToday: asked }) }
    const moments = facts && cache.current ? cache.current.moments : []
    return { ctx: { facts, moments, base, now }, memory: memory.current }
  }, [facts, base])

  const apply = useCallback(
    (draw: Draw, userAction: boolean) => {
      memory.current = draw.memory
      saveMemory(draw.memory)
      show(draw.said, draw.said.mood ?? (userAction ? FALLBACK_GESTURES[taps.current++ % FALLBACK_GESTURES.length] : null))
    },
    [show],
  )

  // The opening line: once your history has loaded (or after a moment, without it).
  const stamp = facts?.stamp ?? null
  useEffect(() => {
    if (interacted.current || fellBack.current) return
    if (stamp !== null && launched?.stamp === stamp) {
      setSaid(launched.said)
      return
    }
    const open = () => {
      if (interacted.current) return
      const { ctx, memory: current } = context()
      const draw = drawLaunch(ctx, current)
      if (stamp === null) fellBack.current = true
      launched = { stamp: stamp ?? 'none', said: draw.said }
      apply(draw, false)
    }
    if (stamp !== null) {
      open()
      return
    }
    const wait = setTimeout(open, PATIENCE_MS)
    return () => clearTimeout(wait)
    // context and apply change with facts; the stamp says when the data really changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stamp])

  const tap = useCallback(() => {
    buzz(8)
    interacted.current = true
    const { ctx, memory: current } = context()
    apply(drawTap(ctx, current), true)
  }, [context, apply])

  const talk = useCallback(
    (kind: PipTalk) => {
      buzz(8)
      interacted.current = true
      const { ctx, memory: current } = context()
      apply(drawTalk(kind, ctx, current), true)
    },
    [context, apply],
  )

  const choose = useCallback(
    (index: number) => {
      const choice = said?.choices?.[index]
      if (!said || !choice) return
      buzz(8)
      interacted.current = true
      show({ id: `${said.id}:reply`, text: choice.reply, mood: choice.mood, personal: true }, choice.mood)
    },
    [said, show],
  )

  return { said, reaction, nonce, tap, talk, choose }
}
