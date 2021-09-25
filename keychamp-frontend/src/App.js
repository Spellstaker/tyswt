import './App.scss';
import TypeArea from './components/typearea/TypeArea'

const testText = `A very interesting text...
That's super fun to read...
And that never stops giving.`;

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>You're my little keychamp!</p>
        <TypeArea>{testText}</TypeArea>
      </header>
    </div>
  );
}

export default App;
