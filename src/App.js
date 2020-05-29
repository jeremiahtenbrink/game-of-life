import React from "react";
import "./App.css";
import GameOfLife from "./components/GameOfLife.js";

function App(){
  return ( <div className="App">
    <header className="App-header">
      <h1>Game of life.</h1>
      <GameOfLife/>
    </header>
  </div> );
}

export default App;
