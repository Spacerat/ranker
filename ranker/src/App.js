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
            <div>
                <header>

                </header>
            </div>
        );
    }
}

export default App;
