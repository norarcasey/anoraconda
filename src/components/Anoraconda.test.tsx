import { StrictMode } from 'react'
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Anoraconda } from './Anoraconda'
import { useAnoraconda } from '../game/useAnoraconda'
import type { Direction } from '../game/types'

describe('<Anoraconda />', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders a title, the score, and the idle overlay by default', () => {
    render(<Anoraconda />)
    expect(screen.getByRole('heading', { name: 'Anoraconda' })).toBeInTheDocument()
    expect(screen.getByText('Score: 0')).toBeInTheDocument()
    expect(screen.getByText('Ready to slither?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
  })

  it('hides the title when title is null', () => {
    render(<Anoraconda title={null} />)
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('starts the game and renders the initial 3-segment snake', () => {
    const { container } = render(<Anoraconda />)
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    // Overlay is gone once running, snake has its starting length.
    expect(screen.queryByText('Ready to slither?')).not.toBeInTheDocument()
    expect(container.querySelectorAll('.anoraconda__segment')).toHaveLength(3)
  })

  it('ends the game when the snake hits a wall', () => {
    // A 5-wide board: the centered head sits one cell from the right wall, so a
    // few rightward ticks run it off the edge.
    render(<Anoraconda cols={5} rows={5} speed={10} />)
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(screen.getByText(/Game over/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play again' })).toBeInTheDocument()
  })
})

describe('useAnoraconda', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('grows the snake and bumps the score when it eats an apple', () => {
    // Pin every apple to the first empty cell (top-left) so the path is stable.
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const opposite: Record<Direction, Direction> = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left',
    }

    // Run under StrictMode: it double-invokes state updaters, which is the
    // condition that previously corrupted the eat/grow logic.
    const { result } = renderHook(() => useAnoraconda({ cols: 10, rows: 10, speed: 10 }), {
      wrapper: StrictMode,
    })

    act(() => result.current.start())
    expect(result.current.snake).toHaveLength(3)

    // Each tick, step toward the apple along whichever axis still differs,
    // preferring a move that isn't a reversal into the snake's own neck.
    for (let i = 0; i < 200 && result.current.score === 0; i++) {
      const head = result.current.snake[0]
      const food = result.current.food
      const dir = result.current.direction
      const horiz: Direction | null = food.x > head.x ? 'right' : food.x < head.x ? 'left' : null
      const vert: Direction | null = food.y > head.y ? 'down' : food.y < head.y ? 'up' : null
      const want =
        horiz && horiz !== opposite[dir]
          ? horiz
          : vert && vert !== opposite[dir]
            ? vert
            : (horiz ?? vert ?? dir)
      act(() => result.current.turn(want))
      act(() => vi.advanceTimersByTime(10))
    }

    expect(result.current.score).toBe(1)
    expect(result.current.snake).toHaveLength(4)
  })

  it('ignores a quick double-tap that would reverse the snake into itself', () => {
    const { result } = renderHook(() => useAnoraconda({ cols: 10, rows: 10, speed: 10 }))
    act(() => result.current.start()) // moving right

    // Up is a legal turn; left right after it would point back into the neck.
    // The turn lock should drop the second tap so the snake never reverses.
    act(() => {
      result.current.turn('up')
      result.current.turn('left')
    })
    act(() => vi.advanceTimersByTime(10))

    expect(result.current.direction).toBe('up')
    expect(result.current.status).toBe('running')
  })
})
