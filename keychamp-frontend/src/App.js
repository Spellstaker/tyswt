import './App.scss';
import TypeArea from './components/typearea/TypeArea'

const testText = "A very interesting text";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>You're my little keychamp!</p>
        <TypeArea text={testText} />
      </header>
    </div>
  );
}

export default App;
