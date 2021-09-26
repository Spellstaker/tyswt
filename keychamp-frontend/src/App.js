import './App.scss';
import TypeArea from './components/typearea/TypeArea'

const testText = `In number theory, the Chinese remainder
theorem states that if one knows the remainders of the
Euclidean division of an integer n by several integers,
then one can determine uniquely the remainder of the
division of n by the product of these integers, under
the condition that the divisors are pairwise coprime.`;

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
