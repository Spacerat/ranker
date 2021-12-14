import React, { PureComponent } from "react";

type Props = { name: string; onClick: () => void };

class Choice extends PureComponent<Props> {
  render() {
    return (
      <button className="choice" onClick={this.props.onClick}>
        {this.props.name}
      </button>
    );
  }
}

export default Choice;
