// @flow

import React, { Component } from 'react';
import AppState from './AppState'
import Choice from './Choice'

type State = { state: AppState, itemspec: string }


type Props = {}



class App extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { state: new AppState().set_items(), itemspec: "" }
    }

    render() {
        console.log(this.state)
        const state = this.state.state;
        const sample = state.get_sample();
        return (
            <div>
                <h2>
                    Items
                </h2>
                <div>
                    <input type="text" value={this.state.itemspec} onChange={(e) => this.set_items(e.target.value)} />
                </div>
                <div>
                    {state.get_sorted_items().map(item => <span key={item}>{item} </span>)}
                </div>
                <h2>
                    Choices
                </h2>
                <div>
                    {!sample ? null : sample.map((item, idx) => <Choice key={idx} name={item} onClick={() => this.choose(idx)} />)}
                </div>
            </div>
        );
    }

    set_items(text: string) {
        this.setState({ state: this.state.state.set_items(text.split(" ")), itemspec: text })
    }

    choose(idx: number) {
        this.setState({ state: this.state.state.choose(idx) })
    }
}

export default App;
