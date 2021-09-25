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


function Caret({ top, left }) {
    return (
        <span className="Caret" />
    );
}

function Letter({ caretRef, got, want }) {
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

    if (caretRef) {
        return (
            <div
                ref={caretRef}
                className={`${className} Special`}
            >
                {letter}
            </div>
        );
    }

    return (
        <div className={className}>
            {letter}
        </div>
    );
}

function Word({ activeIndex, got, want }) {
    got = got ? got : [''];
    want = want ? want : [''];

    let letters = zipTokens(got, want)
        .map(
            ({ gotToken, wantToken }, key) =>
                <Letter
                    key={`letter_#${key}`}
                    got={gotToken}
                    want={wantToken}
                />

        );

    if (activeIndex) {
        letters.splice(activeIndex.letter, 0, <Caret />)
    }

    let className = "Word";

    return (
        <div className={className}>
            {letters}
        </div>
    )
}

function Line({ caretRef, activeIndex, got, want }) {
    const words = zipTokens(got, want)
        .map(
            ({ gotToken, wantToken }, key) => {
                if (activeIndex && key === activeIndex.word) {
                    return <Word
                        caretRef={caretRef}
                        activeIndex={activeIndex}
                        key={`word_#${key}`}
                        got={gotToken}
                        want={wantToken}
                    />
                }

                return <Word
                    key={`word_#${key}`}
                    got={gotToken}
                    want={wantToken}
                />
            }
        )


    return (
        <div className="Line">
            {words}
        </div>
    );
}

function Text({ caretRef, activeIndex, got, want }) {
    const lines = zipTokens(got, want)
        .map(({ gotToken, wantToken }, key) => {
            if (activeIndex && key === activeIndex.line) {
                return <Line
                    caretRef={caretRef}
                    activeIndex={activeIndex}
                    key={`line_#${key}`}
                    got={gotToken}
                    want={wantToken}
                />
            }
            return <Line
                key={`line_#${key}`}
                got={gotToken}
                want={wantToken}
            />
        })

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
            );

        this.caretRef = React.createRef();

        this.state = {
            wantLines: wantLines,
            gotLines: Array.from(Array(wantLines.length), () => [[]]),

            currentLine: 0,
            currentWord: 0,
            currentLetter: 0,

            caretOffsetTop: 0,
            caretOffsetLeft: 0,
        }

        this.handleInput = this.handleInput.bind(this)
    }

    render() {
        const beginOffset = 2, endOffset = 5;

        const startIndex = Math.max(0, this.state.currentLine - beginOffset);
        const endIndex = startIndex + endOffset;

        const gotSlice = this.state.gotLines.slice(startIndex, endIndex);
        const wantSlice = this.state.wantLines.slice(startIndex, endIndex);

        const currentLine = Math.min(this.state.currentLine, beginOffset);
        const activeIndex = {
            line: currentLine,
            word: this.state.currentWord,
            letter: this.state.currentLetter,
        };

        return (
            <div
                tabIndex={0}
                onKeyDown={this.handleInput}
                className="TypeArea"
            >
                {<Text
                    caretRef={this.caretRef}
                    got={gotSlice}
                    want={wantSlice}
                    activeIndex={activeIndex}
                />}
            </div>
        );
    }

    handleInput(e) {
        if (this.caretRef.current) {
            const { offsetTop, offsetLeft } = this.caretRef.current;
            this.setState({
                caretOffsetTop: offsetTop,
                caretOffsetLeft: offsetLeft,
            })
        }

        if (e.key.length === 1) {
            this.setState(TypeArea.handleCharacter(e.key));
        } else if (e.key === 'Enter') {
            this.setState(TypeArea.handleEnter());
        } else if (e.key === 'Backspace') {
            this.setState(TypeArea.handleBackspace(e.ctrlKey))
        }
    }

    static handleCharacter(key) {
        return state => {
            let newState;

            if (key.match(wordSeperator)) {
                newState = update(state, {
                    gotLines: { [state.currentLine]: { $push: [[]] } },
                });
                newState.currentWord = state.currentWord + 1;
                newState.currentLetter = 0;
            } else {
                newState = update(state, {
                    gotLines: {
                        [state.currentLine]: { [state.currentWord]: { $push: [key] } }
                    }
                });
                newState.currentLetter = state.currentLetter + 1;
            }

            return newState;
        }
    }

    static handleEnter() {
        return state => ({
            currentLine: state.currentLine + 1,
            currentWord: 0,
            currentLetter: 0,
        })
    }

    static handleBackspace(ctrlKey) {
        return state => {
            const line = state.currentLine,
                word = state.currentWord,
                letter = state.currentLetter;

            // Current word is not empty.
            if (state.gotLines[line][word].length > 0) {
                const splice = ctrlKey ? [[0, state.gotLines[line][word].length]] : [[-1, 1]];
                let newState = update(state, {
                    gotLines: {
                        [line]: { [word]: { $splice: splice } }
                    }
                });
                newState.currentLetter = ctrlKey ? 0 : letter - 1;
                return newState;
            }

            // Current line is empty.
            if (word === 0) {
                if (line === 0) return;

                const newLine = line - 1;
                const newWord = state.gotLines[newLine].length - 1;
                const newLetter = state.gotLines[newLine][newWord].length;
                return {
                    currentLine: newLine,
                    currentWord: newWord,
                    currentLetter: newLetter
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
            newState.currentLetter = newState.gotLines[line][word - 1].length;

            return newState;
        }
    }
}

export default TypeArea;