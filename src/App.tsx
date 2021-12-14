import React, { Component } from "react";
import AppState from "./AppState";
import Choice from "./Choice";

type State = { state: AppState; itemspec: string };

type Props = {};

class App extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { state: new AppState().set_items(), itemspec: "" }; // TODO: replace itemspec with OrderedSet in AppState
  }

  render() {
    const state = this.state.state;
    const sample = state.get_sample();
    const showFinalSteps = sample || state.get_sorted_items().length > 0;

    return (
      <div className="main">
        <h1>Ranker!</h1>
        <p>
          How would you rank your favorite foods from best to worst? How should
          the Star Wars films be ranked? Who is the best footballer? Answer all
          of these questions and more, with <strong>Ranker</strong>.
        </p>
        <h2>Step 1: Write down the choices</h2>
        <p>
          Write the names of the things you would like to rank - one per line.
        </p>
        <div>
          <textarea onChange={(e) => this.set_items(e.target.value)} rows={5}>
            {this.state.itemspec}
          </textarea>
        </div>
        {showFinalSteps ? (
          <>
            <h2>Step 2: Rank stuff</h2>
            <p>Pick the greater choice for each pair.</p>

            <div className="questionBox">
              {sample && (
                <>
                  <p>Which is greater:</p>
                  <div>
                    <Choice name={sample[0]} onClick={() => this.choose(0)} />{" "}
                    or{" "}
                    <Choice name={sample[1]} onClick={() => this.choose(1)} />
                    {" ?"}
                  </div>
                </>
              )}
              {this.state.state.prev_state && (
                <div>
                  <br />
                  <button
                    onClick={() =>
                      this.setState({ state: this.state.state.undo() })
                    }
                  >
                    Undo
                  </button>
                </div>
              )}
            </div>
          </>
        ) : null}

        {showFinalSteps ? (
          <div>
            <h2>Step 3: See the final order</h2>
            <div>
              <p>Greatest...</p>
              <ol>
                {state.get_sorted_items().map((item) => (
                  <li key={item}>{item} </li>
                ))}
              </ol>
              <p>...Least great</p>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  set_items(text: string) {
    this.setState({
      state: this.state.state.set_items(
        text
          .split("\n")
          .map((x) => x.trim())
          .filter((x) => x.length > 0)
      ),
      itemspec: text,
    });
  }

  choose(idx: number) {
    this.setState({ state: this.state.state.choose(idx) });
  }
}

export default App;
