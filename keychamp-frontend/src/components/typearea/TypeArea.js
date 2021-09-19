import React from 'react';
import './TypeArea.scss'

function Symbol(props) {
    return (
        <span className="Symbol--valid">
            {props.symbol}
        </span>
    )
}

function Token(props) {
    return (
        <span className="Token">
            {props.token.split('').map(
                (symbol, key) => <Symbol key={key} symbol={symbol} />
            )}
        </span>
    )
}

function Line(props) {
    return (
        <div className="Line">
            {props.line.split(' ').map(
                (token, key) => <Token key={key} token={token} />
            )}
        </div>
    )
}

class TypeArea extends React.Component {
    constructor(props) {
        super(props);

        const text = props.text ? props.text : "";

        this.state = {
            text: text,
            lines: text.split('\n').map(
                (line, key) => <Line line={line} key={key} />
            ),
            currentLine: 0,
        };
    }

    render() {
        return (
            <div
                tabIndex={0}
                onKeyDown={e => console.log(`Key pressed! : ${e.key}`)}
                className="TypeArea"
            >
                {this.state.lines.slice(this.state.currentLine, this.state.currentLine + 3)}
            </div>
        );
    }
}

export default TypeArea;