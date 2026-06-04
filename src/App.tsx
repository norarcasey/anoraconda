import { Anoraconda } from './components/Anoraconda'
import './App.css'

export default function App() {
  return (
    <main className="demo">
      <header className="demo__intro">
        <h1 className="demo__title">Anoraconda 🐍</h1>
        <p className="demo__lede">
          Steer the anaconda with the arrow keys (or <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd>{' '}
          <kbd>D</kbd>). Eat the apples to grow longer — just don't run into the walls or
          yourself.
        </p>
      </header>

      <Anoraconda />

      <p className="demo__credit">
        An embeddable React component. Drop <code>&lt;Anoraconda /&gt;</code> anywhere.
      </p>
    </main>
  )
}
