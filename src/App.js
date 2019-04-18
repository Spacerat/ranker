// @flow

import { Set } from 'immutable';
import React, { Component } from 'react';
import Ranker from './Ranker'
import type Pair from './Ranker'

type State = {
    items: Set<string>,
    ranker: Ranker,
    sample: ?Pair,
    prevState: ?State
}

type Props = {}

class App extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            ranker: Ranker.make([]),
            items: Set([]),
            sample: null,
            prevState: null
        }
    }

    render() {
        return (
            <div>
                <header>

                </header>
            </div>
        );
    }
}

export default App;
