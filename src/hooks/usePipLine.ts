import { useCallback, useState } from 'react'
import { PIP_LINES } from '../config/pipLines'
import { drawLine, parseDeck } from '../lib/pipDeck'

const DECK_KEY = 'fitpip.pip-deck'

/** The line dealt for this app launch, so moving between screens doesn't change it. */
let launchLine: number | null = null

function deal(): number {
  let stored = null
  try {
    stored = parseDeck(localStorage.getItem(DECK_KEY))
  } catch {
    // storage blocked: fall back to an in-memory deck
  }
  const { index, deck } = drawLine(stored, PIP_LINES.length)
  try {
    localStorage.setItem(DECK_KEY, JSON.stringify(deck))
  } catch {
    // not remembered across launches this time
  }
  return index
}

/** What Pip is saying: a fresh line each time the app opens, and another on each tap. */
export function usePipLine() {
  const [index, setIndex] = useState(() => {
    if (launchLine === null) launchLine = deal()
    return launchLine
  })
  const next = useCallback(() => {
    launchLine = deal()
    setIndex(launchLine)
  }, [])
  return { line: PIP_LINES[index] ?? PIP_LINES[0], index, next }
}
