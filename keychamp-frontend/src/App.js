import './App.scss';
import TypeArea from './components/typearea/TypeArea'

const testText = `uwu
Lorem ipsum dolor`;

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
