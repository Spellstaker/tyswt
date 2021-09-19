import React from 'react';
import './TypeArea.scss'

function Letter(props) {
    return (
        <span className="Letter">
            {props.symbol}
        </span>
    )
}

function Word(props) {
    return (
        <span className="Word">
            {props.token.split('').map(
                (symbol, key) => <Letter key={key} symbol={symbol} />
            )}
        </span>
    )
}

function Line(props) {
    return (
        <div className="Line">
            {props.line.split(' ').map(
                (token, key) => <Word key={key} token={token} />
            )}
        </div>
    )
}

class TypeArea extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            text: props.text,
            lines: props.text.split('\n').map(
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