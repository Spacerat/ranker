// @flow

import React, { Component } from 'react';
import logo from './logo.svg';
import Ranker from './Ranker'

class App extends Component<{}> {
    render() {
        let ranking: Ranker = Ranker.make(["icecream", "pizza", "gum"]);
        ranking = ranking.add_ranking("pizza", "gum")
        ranking = ranking.add_ranking("icecream", "pizza")

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
