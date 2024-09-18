import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Main from "./components/Main"
import BrowserRouter from "./BrowserRouter"

function App() {
  return (
    <div className="App">
      <BrowserRouter />
    </div>
  );
}

export default App;
