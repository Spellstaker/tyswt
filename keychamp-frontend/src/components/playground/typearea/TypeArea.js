import React from 'react';
import './TypeArea.scss'
import update from 'react-addons-update';

const wordSeperator = /\s/;
const lineSeperator = '\n';

const returnKey = "↵";

function zipTokens(got, want) {
    const tokens = Array(Math.max(got.length, want.length))
        .fill()
        .map((_, i) => ({
            gotToken: got[i] ? got[i] : "",
            wantToken: want[i] ? want[i] : "",
        }))
    return tokens;
}


function Caret() {
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

function Word({ activeIndex, currentIndex, got, want }) {
    got = got && got.length > 0 ? got : [""];
    want = want && want.length > 0 ? want : [""];

    let letters = zipTokens(got, want)
        .map(
            ({ gotToken, wantToken }, key) =>
                <Letter
                    key={`letter_#${key}`}
                    got={gotToken}
                    want={wantToken}
                />
        );

    if (
        activeIndex.line === currentIndex.line &&
        activeIndex.word === currentIndex.word
    ) {
        letters.splice(activeIndex.letter, 0, <Caret key="Caret" />)
    }

    let className = "Word";
    if (
        currentIndex.line < activeIndex.line ||
        (
            currentIndex.line === activeIndex.line &&
            currentIndex.word < activeIndex.word
        )

    ) {
        if (JSON.stringify(got) !== JSON.stringify(want)) {
            className = "Word--invalid";
        }
    }

    return (
        <div className={className}>
            {letters}
        </div>
    )
}

function Line({ activeIndex, currentIndex, got, want }) {
    const words = zipTokens(got, want)
        .map(
            ({ gotToken, wantToken }, key) =>
                <Word
                    key={`word_#${key}`}
                    activeIndex={activeIndex}
                    currentIndex={{ ...currentIndex, word: key }}
                    got={gotToken}
                    want={wantToken}
                />

        );

    const gotLine = JSON.stringify(got), wantLine = JSON.stringify(want);
    let className = "Line";
    if (currentIndex.line < activeIndex.line && gotLine !== wantLine) {
        className = "Line--invalid";
    }
    if (currentIndex.line === activeIndex.line) {
        className = "Line--active";
    }

    return (
        <div className={className}>
            {words}
        </div>
    );
}

function Text({ activeIndex, got, want }) {
    const lines = zipTokens(got, want)
        .map(({ gotToken, wantToken }, key) => {
            return <Line
                key={`line_#${key}`}
                activeIndex={activeIndex}
                currentIndex={{ line: key }}
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

function countValidCharacters(got, want) {
    if (got === undefined || want === undefined)
        return 0;

    if (typeof want === "string") {
        return got === want ? 1 : 0;
    }

    let validCount = 0;
    for (const i in want) {
        validCount += countValidCharacters(got[i], want[i])
    }

    return validCount;
}

class TypeArea extends React.Component {
    constructor(props) {
        super(props);

        const text = props.children ? props.children : "";
        const wantLines = text.split(lineSeperator)
            .map(line => line.split(wordSeperator)
                .map(word => word.split('')));
        const gotLines = Array.from(Array(wantLines.length), () => [[]]);

        for (const line of wantLines) {
            line[line.length - 1].push(returnKey)
        }

        let wordIndex = 0;
        while (
            wordIndex < wantLines[0].length - 1 &&
            wantLines[0][wordIndex].length === 0
        ) {
            wordIndex++;
            gotLines[0].push([]);
        }
        this.state = {
            wantLines: wantLines,
            gotLines: gotLines,
            activeIndex: { line: 0, word: wordIndex, letter: 0 },
            startTime: Date.now(),
            seconds: 0,
            completedText: false,
        }

        this.handleInput = this.handleInput.bind(this);
    }

    render() {
        const beginOffset = 5, endOffset = 5;
        const { line, word, letter } = this.state.activeIndex;

        const startIndex = Math.max(0, line - beginOffset);
        const endIndex = startIndex + endOffset;

        const gotSlice = this.state.gotLines.slice(startIndex, endIndex);
        const wantSlice = this.state.wantLines.slice(startIndex, endIndex);

        const activeIndex = {
            line: Math.min(line, beginOffset),
            word: word,
            letter: letter,
        };

        return (
            <div>
                <div
                    tabIndex={1}
                    onKeyDown={this.handleInput}
                    className="TypeArea"
                >
                    {<Text
                        got={gotSlice}
                        want={wantSlice}
                        activeIndex={activeIndex}
                    />}
                </div>
            </div >

        );
    }

    handleInput(e) {
        const callBack = () => {
            const validChars = countValidCharacters(
                this.state.gotLines,
                this.state.wantLines
            );
            this.props.onChange(validChars, this.state.completedText);
        };

        if (e.key.length === 1) {
            this.setState(TypeArea.handleCharacter(e.key), callBack);
        } else if (e.key === 'Enter') {
            this.setState(TypeArea.handleEnter(), callBack);
        } else if (e.key === 'Backspace') {
            this.setState(TypeArea.handleBackspace(e.ctrlKey), callBack);
        }
    }

    static handleCharacter(key) {
        return state => {
            const { line, word, letter } = state.activeIndex;

            if (key.match(wordSeperator)) {
                return update(state, {
                    gotLines: { [line]: { $push: [[]] } },
                    activeIndex: {
                        word: { $set: word + 1 },
                        letter: { $set: 0 },
                    },
                });
            }

            return update(state, {
                gotLines: {
                    [line]: { [word]: { $push: [key] } }
                },
                activeIndex: { letter: { $set: letter + 1 } },
            });
        }
    }

    static handleEnter() {
        return state => {
            const { line, word } = state.activeIndex;

            const lineCount = state.wantLines.length;
            const lineIndex = line + 1;

            const completedText = state.completedText || lineIndex === lineCount;

            let updateSpec = {
                gotLines: {
                    [line]: { [word]: { $push: [returnKey] } },
                },
                activeIndex: {
                    line: { $set: Math.min(lineIndex, lineCount) },
                    word: { $set: 0 },
                    letter: { $set: 0 },
                },
                completedText: { $set: completedText },
            };

            let wordIndex = 0;
            if (lineIndex < lineCount) {
                let newGotLine = [];
                const currentLine = state.wantLines[lineIndex];
                while (
                    wordIndex < currentLine.length - 1 &&
                    currentLine[wordIndex].length === 0
                ) {
                    newGotLine.push([]);
                    wordIndex++;
                }
                updateSpec.gotLines[lineIndex] = { $push: newGotLine };
            }
            updateSpec.activeIndex.word = { $set: wordIndex };

            return update(state, updateSpec);
        }
    }

    static handleBackspace(ctrlKey) {
        return state => {
            const { line, word, letter } = state.activeIndex;

            // Current word is not empty.
            if (state.gotLines[line][word].length > 0) {
                const splice = ctrlKey ? [[0, state.gotLines[line][word].length]] : [[-1, 1]];
                return update(state, {
                    gotLines: {
                        [line]: { [word]: { $splice: splice } }
                    },
                    activeIndex: {
                        letter: { $set: (ctrlKey ? 0 : letter - 1) },
                    },
                });
            }

            // Current line is empty.
            if (word === 0) {
                if (line === 0) return;

                const newLine = line - 1;
                const newWord = state.gotLines[newLine].length - 1;
                const newLetter = state.gotLines[newLine][newWord].length;
                return {
                    activeIndex: {
                        line: newLine,
                        word: newWord,
                        letter: newLetter,
                    }
                };
            }

            // Delete current word.
            const splice = ctrlKey ? [[word, 1], [word - 1, 1, []]] : [[word, 1]];
            const newLetter = ctrlKey ? 0 : state.gotLines[line][word - 1].length;
            return update(state, {
                gotLines: {
                    [line]: { $splice: splice }
                },
                activeIndex: {
                    word: { $set: word - 1 },
                    letter: { $set: newLetter },
                }
            });
        }
    }
}

export default TypeArea;