import { useCallback, useEffect, useReducer } from 'react'
import type { Direction, GameStatus, Point } from './types'

export interface UseAnoracondaOptions {
  /** Board width in cells. Default `20`. */
  cols?: number
  /** Board height in cells. Default `20`. */
  rows?: number
  /** Milliseconds between moves; lower is faster. Default `120`. */
  speed?: number
}

export interface AnoracondaApi {
  cols: number
  rows: number
  /** The snake, head first. */
  snake: Point[]
  /** The apple the snake is chasing. */
  food: Point
  /** Direction the snake is travelling. */
  direction: Direction
  status: GameStatus
  /** Apples eaten so far. */
  score: number
  /** Reset the board and begin moving. */
  start: () => void
  /** Reset the board to `idle` without moving. */
  reset: () => void
  /** Queue a turn for the next tick. 180° reversals are ignored. */
  turn: (dir: Direction) => void
}

const DEFAULTS = { cols: 20, rows: 20, speed: 120 }

const OPPOSITE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
}

const DELTA: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

// The entire game lives in one reducer so each transition is computed from the
// previous state in a single pure step. That keeps it correct when several
// ticks fire between renders, and safe under StrictMode's double-invocation —
// both things that break when the loop juggles several useState setters at once.
interface GameState {
  cols: number
  rows: number
  snake: Point[]
  food: Point
  /** The direction the last tick moved (and the next tick will, unless turned). */
  direction: Direction
  /** The direction queued for the next tick. */
  pending: Direction
  /** A turn is already queued this tick — block further turns until it lands. */
  turnLocked: boolean
  status: GameStatus
  score: number
}

type GameAction =
  | { type: 'configure'; cols: number; rows: number }
  | { type: 'reset' }
  | { type: 'start' }
  | { type: 'turn'; dir: Direction }
  | { type: 'tick' }

function makeInitial(cols: number, rows: number): GameState {
  const snake = initialSnake(cols, rows)
  return {
    cols,
    rows,
    snake,
    food: spawnFood(snake, cols, rows),
    direction: 'right',
    pending: 'right',
    turnLocked: false,
    status: 'idle',
    score: 0,
  }
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'configure':
      return makeInitial(action.cols, action.rows)
    case 'reset':
      return makeInitial(state.cols, state.rows)
    case 'start':
      return { ...makeInitial(state.cols, state.rows), status: 'running' }
    case 'turn': {
      // Only one turn lands per tick, validated against the committed direction.
      // The lock stops two quick taps (right → up → left) from folding the snake
      // back into its own neck before a tick has a chance to consume the first.
      if (state.turnLocked) return state
      if (action.dir === state.direction || action.dir === OPPOSITE[state.direction]) {
        return state
      }
      return { ...state, pending: action.dir, turnLocked: true }
    }
    case 'tick': {
      if (state.status !== 'running') return state

      const dir = state.pending
      const delta = DELTA[dir]
      const head = { x: state.snake[0].x + delta.x, y: state.snake[0].y + delta.y }

      // Wall collision.
      if (head.x < 0 || head.y < 0 || head.x >= state.cols || head.y >= state.rows) {
        return { ...state, direction: dir, turnLocked: false, status: 'over' }
      }

      const willEat = head.x === state.food.x && head.y === state.food.y
      // When not eating, the tail vacates its cell this tick, so moving into it
      // is legal. When eating, the whole body stays put and the snake grows.
      const body = willEat ? state.snake : state.snake.slice(0, -1)
      if (body.some((p) => p.x === head.x && p.y === head.y)) {
        return { ...state, direction: dir, turnLocked: false, status: 'over' }
      }

      const snake = [head, ...body]
      const base = { ...state, snake, direction: dir, turnLocked: false }
      if (!willEat) return base

      const score = state.score + 1
      if (snake.length === state.cols * state.rows) {
        return { ...base, score, status: 'won' }
      }
      return { ...base, score, food: spawnFood(snake, state.cols, state.rows) }
    }
  }
}

export function useAnoraconda(options: UseAnoracondaOptions = {}): AnoracondaApi {
  const cols = options.cols ?? DEFAULTS.cols
  const rows = options.rows ?? DEFAULTS.rows
  const speed = options.speed ?? DEFAULTS.speed

  const [state, dispatch] = useReducer(reducer, undefined, () => makeInitial(cols, rows))

  // Re-seed the board whenever its dimensions change.
  useEffect(() => {
    dispatch({ type: 'configure', cols, rows })
  }, [cols, rows])

  const start = useCallback(() => dispatch({ type: 'start' }), [])
  const reset = useCallback(() => dispatch({ type: 'reset' }), [])
  const turn = useCallback((dir: Direction) => dispatch({ type: 'turn', dir }), [])

  // The game loop: tick on an interval only while running.
  useEffect(() => {
    if (state.status !== 'running') return
    const id = setInterval(() => dispatch({ type: 'tick' }), speed)
    return () => clearInterval(id)
  }, [state.status, speed])

  return {
    cols: state.cols,
    rows: state.rows,
    snake: state.snake,
    food: state.food,
    direction: state.direction,
    status: state.status,
    score: state.score,
    start,
    reset,
    turn,
  }
}

/** A length-3 snake centered on the board, facing right. */
function initialSnake(cols: number, rows: number): Point[] {
  const cy = Math.floor(rows / 2)
  const cx = Math.floor(cols / 2)
  return [
    { x: cx, y: cy },
    { x: cx - 1, y: cy },
    { x: cx - 2, y: cy },
  ]
}

/** Pick a random empty cell for the next apple. */
function spawnFood(snake: Point[], cols: number, rows: number): Point {
  const occupied = new Set(snake.map((p) => `${p.x},${p.y}`))
  const empty: Point[] = []
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!occupied.has(`${x},${y}`)) empty.push({ x, y })
    }
  }
  if (empty.length === 0) return snake[0]
  return empty[Math.floor(Math.random() * empty.length)]
}
