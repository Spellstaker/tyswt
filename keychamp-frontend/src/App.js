import './App.scss';
import TypeArea from './components/typearea/TypeArea'

const testText = "A very interesting text";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>Hello, World!</p>
        <TypeArea text={testText} />
      </header>
    </div>
  );
}

export default App;
