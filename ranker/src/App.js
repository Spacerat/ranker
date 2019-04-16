// @flow

import React, { Component } from 'react';
import logo from './logo.svg';
import Ranker from './Ranker'
import './App.css';

class App extends Component<{}> {
  render() {
    let ranking: Ranker<string> = Ranker.make(["icecream", "pizza", "gum"]);
    ranking = ranking.add_ranking("pizza", "gum")
    ranking = ranking.add_ranking("icecream", "pizza")
    console.log(ranking.toJS());
    console.log(ranking.is_complete());
    console.log(ranking.sample())
    console.log(ranking.compare("gum", "pizza"))


    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

export default App;
