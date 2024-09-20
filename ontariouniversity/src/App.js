import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Main from "./components/Main"
import BrowserRouter from "./BrowserRouter"
import { AuthProvider } from './components/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter />
      </div>
    </AuthProvider>
  );
}

export default App;
