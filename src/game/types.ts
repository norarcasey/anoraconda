// Framework-free types shared by the game engine and the React layer.

/** A cell on the board. Origin is top-left; x grows right, y grows down. */
export interface Point {
  x: number
  y: number
}

/** The four directions the snake can travel. */
export type Direction = 'up' | 'down' | 'left' | 'right'

/**
 * Lifecycle of a single game:
 *  - `idle`    — board is set up, waiting for the player to start.
 *  - `running` — the snake is moving on every tick.
 *  - `over`    — the snake hit a wall or itself.
 *  - `won`     — the snake filled every cell on the board.
 */
export type GameStatus = 'idle' | 'running' | 'over' | 'won'
