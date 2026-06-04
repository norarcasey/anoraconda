import type { CSSProperties } from 'react'
import type { Point } from '../game/types'

interface BoardProps {
  cols: number
  rows: number
  snake: Point[]
  food: Point
}

/**
 * Renders the playfield. The grid lines come from a CSS background, and the
 * snake + apple are absolutely positioned as a percentage of the board so the
 * whole thing scales fluidly without re-rendering every empty cell.
 */
export function Board({ cols, rows, snake, food }: BoardProps) {
  const cellW = 100 / cols
  const cellH = 100 / rows

  const cellStyle = (p: Point): CSSProperties => ({
    left: `${p.x * cellW}%`,
    top: `${p.y * cellH}%`,
    width: `${cellW}%`,
    height: `${cellH}%`,
  })

  const gridStyle: CSSProperties = {
    aspectRatio: `${cols} / ${rows}`,
    backgroundSize: `${cellW}% ${cellH}%`,
  }

  return (
    <div className="anoraconda__board" style={gridStyle} data-testid="board">
      <div className="anoraconda__cell anoraconda__food" style={cellStyle(food)} aria-hidden />
      {snake.map((seg, i) => (
        <div
          key={`${seg.x},${seg.y}`}
          className={`anoraconda__cell anoraconda__segment${i === 0 ? ' anoraconda__segment--head' : ''}`}
          style={cellStyle(seg)}
          aria-hidden
        />
      ))}
    </div>
  )
}
