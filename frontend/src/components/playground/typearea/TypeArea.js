import React from 'react';
import './TypeArea.scss'
import update from 'react-addons-update';

const wordSeperator = /\s/;
const whiteSpace = /\s/;
const lineSeperator = '\n';

const returnKey = "↵";
const spaceKey = "⎵";

function Caret() {
    return (
        <span className="Caret" />
    );
}

function displayLetter(want, showSpace = false) {
    switch (want) {
        case " ": return showSpace ? "\u00B7" : "\u00A0";
        case "\n": return returnKey;
        default: return want;
    }
}

function Letter({ got, want }) {
    let className = "Letter";
    let letter = displayLetter(want);

    if (got === want) {
        className = "Letter--valid";
    } else if (want === "") {
        className = "Letter--extra";
        letter = displayLetter(got, true);
    } else if (got === "" || got === " ") {
        className = "Letter--ghosted";
    } else {
        className = "Letter--invalid";
    }

    return (
        <div className={className}>
            {letter}
        </div>
    );
}

function Word({ activeIndex, currentIndex, token }) {
    let showSymbols = token.zipSymbols()
        .map(
            ({ got, want }, key) =>
                <Letter
                    key={`letter_#${key}`}
                    got={got}
                    want={want}
                />
        );

    if (
        activeIndex.line === currentIndex.line &&
        activeIndex.word === currentIndex.word
    ) {
        showSymbols.splice(activeIndex.letter, 0, <Caret key="Caret" />)
    }

    let className = "Word";
    const isBeforeActive = currentIndex.line < activeIndex.line ||
        (currentIndex.line === activeIndex.line &&
            currentIndex.word < activeIndex.word);

    if (isBeforeActive && !token.isValid()) {
        className = "Word--invalid";
    }

    return (
        <div className={className}>
            {showSymbols}
        </div>
    )
}

function Line({ activeIndex, currentIndex, tokens }) {
    const showTokens = tokens
        .map(
            (token, key) => {
                return <Word
                    key={`word_#${key}`}
                    activeIndex={activeIndex}
                    currentIndex={{ ...currentIndex, word: key }}
                    token={token}
                />
            }
        );

    const isValid = tokens.every(token => token.isValid());

    let className = "Line";
    if (currentIndex.line < activeIndex.line && !isValid) {
        className = "Line--invalid";
    }
    if (currentIndex.line === activeIndex.line) {
        className = "Line--active";
    }

    return (
        <div className={className}>
            {showTokens}
        </div>
    );
}

function Text({ lines, activeIndex }) {
    const showLines = lines
        .map((tokens, key) => {
            return <Line
                key={`line_#${key}`}
                activeIndex={activeIndex}
                currentIndex={{ line: key }}
                tokens={tokens}
            />
        })

    return (
        <div>
            {showLines}
        </div>
    );
}

class Token {
    constructor(want = [], got = []) {
        this.want = want;
        this.got = got;
    }

    hasSeperator() {
        return this.want.some(symbol => Boolean(symbol.match(wordSeperator)));
    }
    isWhiteSpace() {
        return this.want.every(symbol => Boolean(symbol.match(whiteSpace)));
    }

    isValid() {
        return this.want.join() === this.got.join();
    }

    zipSymbols() {
        const symbols = Array(Math.max(this.got.length, this.want.length))
            .fill()
            .map((_, i) => ({
                got: this.got[i] ? this.got[i] : "",
                want: this.want[i] ? this.want[i] : "",
            }))
        return symbols;
    }

    getCount() {
        let validCount = 0, wantCount = 0;
        for (let { got, want } of this.zipSymbols()) {
            if (want !== "") {
                wantCount++;
                if (got === want) {
                    validCount++;
                }
            }
        }
        return { validCount, wantCount };
    }
}

class TypeArea extends React.Component {
    constructor(props) {
        super(props);

        const text = props.children ? props.children : "";

        const lines = [[new Token()]];
        for (const symbol of text) {
            const tokens = lines.at(-1);
            tokens.at(-1).want.push(symbol);
            if (symbol.match(lineSeperator)) {
                lines.push([new Token()])
            } else if (tokens.at(-1).hasSeperator()) {
                tokens.push(new Token());
            }
        }

        let wordIndex = 0;
        while (wordIndex < lines[0].length) {
            if (!lines[0][wordIndex].isWhiteSpace()) {
                break;
            }
            lines[0][wordIndex].got.push(' ');
            wordIndex++;
        }
        this.state = {
            lines: lines,
            activeIndex: { line: 0, word: wordIndex, letter: 0 },
            completedText: false,
        }

        this.typeAreaRef = React.createRef();

        this.handleInput = this.handleInput.bind(this);
    }

    render() {
        const beginOffset = 5, endOffset = 5;
        const { line, word, letter } = this.state.activeIndex;

        const startIndex = Math.max(0, line - beginOffset);
        const endIndex = startIndex + endOffset;

        const lineSlice = this.state.lines.slice(startIndex, endIndex);

        const activeIndex = {
            line: Math.min(line, beginOffset),
            word: word,
            letter: letter,
        };

        return (
            <div
                tabIndex={1}
                onKeyDown={this.handleInput}
                className="TypeArea"
                ref={this.typeAreaRef}
            >
                {<Text
                    lines={lineSlice}
                    activeIndex={activeIndex}
                />}
            </div>
        );
    }

    focus() {
        this.typeAreaRef.current.focus();
    }

    handleInput(e) {
        const callBack = () => {
            let validChars = 0, wantChars = 0;
            for (let line of this.state.lines) {
                for (let token of line) {
                    const { validCount, wantCount } = token.getCount();
                    validChars += validCount;
                    wantChars += wantCount;
                }
            }
            this.props.onChange(this.state.completedText, validChars, wantChars);
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

            let updateSpec = {
                lines: {
                    [line]: { [word]: { got: { $push: [key] } } }
                },
            };

            if (key.match(wordSeperator)) {
                const newWordIndex = word + 1;
                if (newWordIndex >= state.lines[line].length) {
                    updateSpec.lines[line] = {
                        ...updateSpec.lines[line],
                        $push: [new Token()],
                    }
                }
                updateSpec.activeIndex = {
                    word: { $set: newWordIndex },
                    letter: { $set: 0 },
                }
            } else {
                updateSpec.activeIndex = { letter: { $set: letter + 1 } };
            }

            return update(state, updateSpec);
        }
    }

    static handleEnter() {
        return state => {
            const { line, word } = state.activeIndex;

            const lineCount = state.lines.length;
            const lineIndex = line + 1;

            const completedText = lineIndex === lineCount;

            let updateSpec = {
                lines: {
                    [line]: { [word]: { got: { $push: ['\n'] } } },
                },
                activeIndex: {
                    line: { $set: Math.min(lineIndex, lineCount) },
                    word: { $set: 0 },
                    letter: { $set: 0 },
                },
                completedText: { $set: completedText },
            };

            if (lineIndex < lineCount) {
                const currentLine = state.lines[lineIndex];
                for (let wordIndex = 0; wordIndex < currentLine.length; wordIndex++) {
                    updateSpec.activeIndex.word = { $set: wordIndex };
                    if (!currentLine[wordIndex].isWhiteSpace()) {
                        break;
                    }
                    updateSpec.lines[lineIndex] = {
                        ...updateSpec.lines[lineIndex],
                        [wordIndex]: { got: { $push: [" "] } },
                    };
                }
            }

            return update(state, updateSpec);
        }
    }

    static handleBackspace(ctrlKey) {
        const deleteLastLetterSplice = [[-1, 1]];
        return state => {
            const { line, word, letter } = state.activeIndex;

            // No text entered.
            if (line === 0 && word === 0 && letter === 0) {
                return;
            }

            // Current line is empty.
            if (word === 0 && letter === 0) {
                const newLine = line - 1;
                const newWord = state.lines[newLine].length - 1;
                const newLetter = state.lines[newLine][newWord].got.length - 1;;

                return update(state, {
                    lines: {
                        [newLine]: {
                            [newWord]: {
                                got: { $splice: deleteLastLetterSplice },
                            },
                        },
                    },
                    activeIndex: {
                        line: { $set: newLine },
                        word: { $set: newWord },
                        letter: { $set: newLetter },
                    },
                });
            }

            const newLine = line;
            const newWord = letter === 0 ? word - 1 : word;
            const newLetter = ctrlKey ?
                0 :
                state.lines[newLine][newWord].got.length - 1;

            const splice = ctrlKey ?
                [[0, state.lines[newLine][newWord].got.length]] :
                [[-1, 1]];

            return update(state, {
                lines: {
                    [newLine]: { [newWord]: { got: { $splice: splice } } },
                },
                activeIndex: {
                    line: { $set: newLine },
                    word: { $set: newWord },
                    letter: { $set: newLetter },
                },
            });
        }
    }
}

export default TypeArea;