import './App.scss';
import TypeArea from './components/typearea/TypeArea'

const testText = `Lorem ipsum dolor sit amet,
consectetur adipiscing elit,
sed do eiusmod tempor incididunt ut
labore et dolore magna aliqua.
Ut enim ad minim veniam,
quis nostrud exercitation
ullamco laboris nisi ut aliquip ex ea
commodo consequat. Duis aute
irure dolor in reprehenderit in
voluptate velit esse cillum dolore
eu fugiat nulla pariatur. Excepteur
sint occaecat cupidatat non proident,
sunt in culpa qui officia deserunt
mollit anim id est laborum`;

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
