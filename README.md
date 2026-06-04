# Anoraconda 🐍

An embeddable React + TypeScript snake game. Steer the anaconda with the
**arrow keys** (or **WASD**), eat apples to grow longer, and try not to run into
the walls or yourself.

Built with **Vite** and tested with **Vitest** + **React Testing Library**.

## Quick start

```bash
npm install
npm run dev        # demo site at http://localhost:5173
npm test           # run the test suite
npm run build      # build the demo site for deployment
npm run build:lib  # build the embeddable component library
```

## Embedding the component

```tsx
import { Anoraconda } from "@norarcasey/anoraconda";
import "@norarcasey/anoraconda/style.css";

export function App() {
  return <Anoraconda />;
}
```

`react` / `react-dom` are peer dependencies you already have.

### Props

| Prop             | Type             | Default        | Description                                          |
| ---------------- | ---------------- | -------------- | ---------------------------------------------------- |
| `cols`           | `number`         | `20`           | Board width in cells.                                |
| `rows`           | `number`         | `20`           | Board height in cells.                               |
| `speed`          | `number`         | `120`          | Milliseconds between moves; lower is faster.         |
| `enableKeyboard` | `boolean`        | `true`         | Steer with the arrow keys / WASD.                    |
| `title`          | `string \| null` | `"Anoraconda"` | Heading above the board; pass `null` to hide it.     |
| `className`      | `string`         | —              | Extra class on the root element.                     |

### Headless engine

The game logic lives in a framework-free hook if you want to build your own UI:

```tsx
import { useAnoraconda } from "@norarcasey/anoraconda";

const game = useAnoraconda({ cols: 30, rows: 30, speed: 90 });
// game.snake, game.food, game.score, game.status
// game.start(), game.reset(), game.turn("up" | "down" | "left" | "right")
```

## Roadmap

This is the MVP: move, eat, grow. Planned flavor to come — walls/portals,
power-ups, speed ramps, and a high-score table.

## License

MIT © Nora Casey
