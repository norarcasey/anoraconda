import { useEffect } from 'react'
import { useAnoraconda } from '../game/useAnoraconda'
import type { Direction } from '../game/types'
import { Board } from './Board'
import './Anoraconda.css'

export interface AnoracondaProps {
  /** Board width in cells. Default `20`. */
  cols?: number
  /** Board height in cells. Default `20`. */
  rows?: number
  /** Milliseconds between moves; lower is faster. Default `120`. */
  speed?: number
  /** Steer with the arrow keys / WASD. Default `true`. */
  enableKeyboard?: boolean
  /** Heading shown above the board. Pass `null` to hide it. */
  title?: string | null
  /** Extra class on the root element. */
  className?: string
}

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
}

export function Anoraconda({
  cols,
  rows,
  speed,
  enableKeyboard = true,
  title = 'Anoraconda',
  className,
}: AnoracondaProps) {
  const game = useAnoraconda({ cols, rows, speed })
  const { status, start, turn } = game

  useEffect(() => {
    if (!enableKeyboard) return

    const onKeyDown = (e: KeyboardEvent) => {
      const dir = KEY_TO_DIRECTION[e.key]
      if (!dir) return
      e.preventDefault()
      // First arrow press from a stopped board kicks off a new game.
      if (status === 'running') {
        turn(dir)
      } else {
        start()
        turn(dir)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enableKeyboard, status, start, turn])

  const isOver = status === 'over' || status === 'won'

  return (
    <section
      className={`anoraconda${className ? ` ${className}` : ''}`}
      aria-label={title ?? 'Snake game'}
    >
      <header className="anoraconda__header">
        {title !== null && <h2 className="anoraconda__title">{title}</h2>}
        <span className="anoraconda__score" aria-live="polite">
          Score: {game.score}
        </span>
      </header>

      <div className="anoraconda__stage">
        <Board cols={game.cols} rows={game.rows} snake={game.snake} food={game.food} />

        {status !== 'running' && (
          <div className="anoraconda__overlay" role="status">
            {status === 'idle' && <p className="anoraconda__message">Ready to slither?</p>}
            {status === 'over' && (
              <p className="anoraconda__message">Game over — score {game.score}</p>
            )}
            {status === 'won' && <p className="anoraconda__message">You filled the board! 🏆</p>}
            <button type="button" className="anoraconda__button" onClick={start}>
              {isOver ? 'Play again' : 'Start'}
            </button>
            <p className="anoraconda__hint">Use the arrow keys or WASD</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default Anoraconda
