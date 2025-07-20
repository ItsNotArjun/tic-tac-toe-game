import * as React from 'react';
import logo from './logo.svg';
import './App.css';
import GameBoard from './components/GameBoard';
import { Home } from './screens/home';

function ChangeScreen(data: any) {
  if (data.type === "created" || data.type === "start") {
    return true;
  }
  else {
    return false;
  }
}

function App() {
  const [menu, setMenu] = React.useState(false);
  // setMenu(ChangeScreen())
  return (
    <div>
      {/* <GameBoard roomCode={"4922"} /> */}
      <Home/>
    </div>
  );
}

export default App;
