// @flow

import React, { PureComponent } from 'react';

type Props = { name: string, onClick: () => void }

class Choice extends PureComponent<Props> {
    render() {
        return (
            <span onClick={this.props.onClick}>{this.props.name} </span>
        );
    }
}

export default Choice;
