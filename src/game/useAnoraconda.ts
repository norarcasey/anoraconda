import { useCallback, useEffect, useRef, useState } from 'react'
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
  /** Direction the snake will travel on the next tick. */
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

export function useAnoraconda(options: UseAnoracondaOptions = {}): AnoracondaApi {
  const cols = options.cols ?? DEFAULTS.cols
  const rows = options.rows ?? DEFAULTS.rows
  const speed = options.speed ?? DEFAULTS.speed

  const [snake, setSnake] = useState<Point[]>(() => initialSnake(cols, rows))
  const [food, setFood] = useState<Point>(() => spawnFood(initialSnake(cols, rows), cols, rows))
  const [direction, setDirection] = useState<Direction>('right')
  const [status, setStatus] = useState<GameStatus>('idle')
  const [score, setScore] = useState(0)

  // The committed direction (used to reject reversals) and the queued turn live
  // in refs so the tick can read the freshest values without re-subscribing.
  const directionRef = useRef<Direction>('right')
  const queuedRef = useRef<Direction>('right')
  const foodRef = useRef<Point>(food)
  foodRef.current = food

  const reset = useCallback(() => {
    const start = initialSnake(cols, rows)
    directionRef.current = 'right'
    queuedRef.current = 'right'
    setSnake(start)
    setFood(spawnFood(start, cols, rows))
    setDirection('right')
    setScore(0)
    setStatus('idle')
  }, [cols, rows])

  // Re-seed the board whenever its dimensions change.
  useEffect(() => {
    reset()
  }, [reset])

  const start = useCallback(() => {
    reset()
    setStatus('running')
  }, [reset])

  const turn = useCallback((dir: Direction) => {
    // Compare against the last queued turn, not just the committed direction, so
    // two quick taps (e.g. right → up → left) can't fold back into the snake.
    if (dir === OPPOSITE[queuedRef.current]) return
    queuedRef.current = dir
    setDirection(dir)
  }, [])

  const step = useCallback(() => {
    setSnake((prev) => {
      const dir = queuedRef.current
      directionRef.current = dir

      const delta = DELTA[dir]
      const head = { x: prev[0].x + delta.x, y: prev[0].y + delta.y }

      // Wall collision.
      if (head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows) {
        setStatus('over')
        return prev
      }

      const willEat = head.x === foodRef.current.x && head.y === foodRef.current.y
      // When not eating, the tail vacates its cell this tick, so moving into it
      // is legal. When eating, the whole body stays put and grows.
      const body = willEat ? prev : prev.slice(0, -1)
      if (body.some((p) => p.x === head.x && p.y === head.y)) {
        setStatus('over')
        return prev
      }

      const next = [head, ...body]

      if (willEat) {
        setScore((s) => s + 1)
        if (next.length === cols * rows) {
          setStatus('won')
        } else {
          setFood(spawnFood(next, cols, rows))
        }
      }

      return next
    })
  }, [cols, rows])

  // The game loop: tick on an interval only while running.
  useEffect(() => {
    if (status !== 'running') return
    const id = setInterval(step, speed)
    return () => clearInterval(id)
  }, [status, speed, step])

  return {
    cols,
    rows,
    snake,
    food,
    direction,
    status,
    score,
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
