import React from 'react';
import './TypeArea.scss'
import update from 'react-addons-update';

const wordSeperator = /\s/;
const lineSeperator = '\n';

function zipTokens(got, want) {
    const tokens = Array(Math.max(got.length, want.length))
        .fill()
        .map((_, i) => ({
            gotToken: got[i] ? got[i] : "",
            wantToken: want[i] ? want[i] : "",
        }))
    return tokens;
}

function Letter({ got, want }) {
    let className = "Letter";
    let letter = want;

    if (got === want) {
        className = "Letter--valid";
    } else if (got === "") {
        className = "Letter--ghosted";
    } else if (want === "") {
        className = "Letter--extra";
        letter = got;
    } else {
        className = "Letter--invalid";
    }


    return (
        <div className={className}>
            {letter}
        </div>
    );
}

function Word({ got, want }) {
    got = got ? got : [];
    want = want ? want : [];

    const letters = zipTokens(got, want)
        .map(
            ({ gotToken, wantToken }, key) =>
                <Letter key={`word_#${key}`} got={gotToken} want={wantToken} />
        );

    let className = "Word";

    return (
        <div className={className}>
            {letters}
        </div>
    )
}

function Line({ got, want }) {
    const words = zipTokens(got, want)
        .map(
            ({ gotToken, wantToken }, key) =>
                <Word key={`word_#${key}`} got={gotToken} want={wantToken} />
        )


    return (
        <div className="Line">
            {words}
        </div>
    );
}

function Text({ got, want }) {
    const lines = zipTokens(got, want)
        .map(({ gotToken, wantToken }, key) =>
            <Line key={`line_#${key}`} got={gotToken} want={wantToken} />
        )

    return (
        <div>
            {lines}
        </div>
    );
}

class TypeArea extends React.Component {
    constructor(props) {
        super(props);

        const text = props.children ? props.children : "";
        const wantLines = text.split(lineSeperator)
            .map(line => line.split(wordSeperator)
                .map(word => word.split(''))
            )

        this.state = {
            wantLines: wantLines,
            gotLines: Array.from(Array(wantLines.length), () => [[]]),
            currentLine: 0,
            currentWord: 0,
            collection: [1, 2, 3, 4, 5],
        }

        this.handleInput = this.handleInput.bind(this)
        this.handleCharacter = this.handleCharacter.bind(this)
        this.handleEnter = this.handleEnter.bind(this)
        this.handleBackspace = this.handleBackspace.bind(this)
    }

    render() {
        const startIndex = Math.max(0, this.state.currentLine - 1);
        const endIndex = this.state.currentLine + 2;

        const gotSlice = this.state.gotLines.slice(startIndex, endIndex);
        const wantSlice = this.state.wantLines.slice(startIndex, endIndex);

        console.log(this.state.gotLines[0])
        return (
            <div
                tabIndex={0}
                onKeyDown={this.handleInput}
                className="TypeArea"
            >
                {<Text got={gotSlice} want={wantSlice} />}
            </div>
        );
    }

    handleInput(e) {
        if (e.key.length === 1) {
            this.handleCharacter(e.key)
        } else if (e.key === 'Enter') {
            this.handleEnter()
        } else if (e.key === 'Backspace') {
            this.handleBackspace(e.ctrlKey)
        }
    }

    handleCharacter(key) {
        this.setState(state => {
            let newState;

            if (key.match(wordSeperator)) {
                newState = update(state, {
                    gotLines: { [state.currentLine]: { $push: [[]] } },
                });
                newState.currentWord = state.currentWord + 1;
            } else {
                newState = update(state, {
                    gotLines: {
                        [state.currentLine]: { [state.currentWord]: { $push: [key] } }
                    }
                });
            }

            return newState;
        })
    }
    handleEnter() {
        this.setState(prevState => {
            const newState = {
                currentLine: prevState.currentLine + 1,
                currentWord: 0,
            };

            return newState;
        })
    }
    handleBackspace(ctrlKey) {
        this.setState(state => {
            const line = state.currentLine, word = state.currentWord;

            // Current word is not empty.
            if (state.gotLines[line][word].length > 0) {
                const splice = ctrlKey ? [[0, state.gotLines[line][word].length]] : [[-1, 1]];
                return update(state, {
                    gotLines: {
                        [state.currentLine]: { [state.currentWord]: { $splice: splice } }
                    }
                })
            }

            // Current line is empty.
            if (word === 0) {
                if (line === 0) return;

                return {
                    currentLine: line - 1,
                    currentWord: state.gotLines[line - 1].length - 1,
                };
            }

            // Delete current word.
            const splice = ctrlKey ? [[word, 1], [word - 1, 1, []]] : [[word, 1]];
            let newState = update(state, {
                gotLines: {
                    [state.currentLine]: { $splice: splice }
                }
            });
            newState.currentWord = word - 1;

            return newState;
        })
    }
}

export default TypeArea;