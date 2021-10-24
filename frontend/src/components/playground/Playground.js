import React from 'react';
import update from 'react-addons-update';

import TypeArea from './typearea/TypeArea';
import Result from './result/Result';
import Timer from './timer/Timer';
import Loader from './loading/Loader';

const multiLine = `for _ in range(int(input())):
    n, m = map(int, input().split())
    l = [*map(int, input().split())]
    print(min(m, sum(l)))`;
const oneLiner = `fib = lambda x: 1 if x < 2 else fib(x - 1) + fib(x - 2)`;
const uwu = "uwu";
const testText = multiLine;

const GameState = Object.freeze({
    LOADING: Symbol("LOADING"),
    WAITING: Symbol("WAITING"),
    PLAYING: Symbol("PLAYING"),
    FINISHED: Symbol("FINISHED"),
});

class Playground extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            text: "",
            seconds: 0,
            startTime: null,
            validChars: 0,
            wantChars: 0,
            gameState: GameState.LOADING,
        };

        this.timerID = null;

        this.typeAreaRef = React.createRef();

        this.onChange = this.onChange.bind(this);
        this.tick = this.tick.bind(this);
        this.startTicking = this.startTicking.bind(this);
    }

    isPlaying() {
        return this.state.gameState === GameState.WAITING ||
            this.state.gameState === GameState.PLAYING;
    }

    componentDidMount() {
        const callBack = () => {
            if (this.isPlaying()) {
                this.focusTypeArea();
            }
        };

        fetch("http://localhost:8090/snippet?lang=python")
            .then(res => res.json())
            .then(res => {
                this.setState({
                    text: res.snippet,
                    gameState: GameState.WAITING,

                }, callBack)
            })
            .catch(err => console.log(err))

    }

    componentWillUnmount() { this.stopTicking(); }

    render() {
        switch (this.state.gameState) {
            case GameState.LOADING:
                return this.renderLoading();
            case GameState.WAITING:
            case GameState.PLAYING:
                return this.renderPlaying();
            case GameState.FINISHED:
                return this.renderFinished();
            default:
                return this.renderOops();
        }
    }

    renderLoading() {
        return <Loader />;
    }

    renderPlaying() {
        return (
            <div>
                <Timer seconds={this.state.seconds} />
                <TypeArea onChange={this.onChange} ref={this.typeAreaRef}>
                    {this.state.text}
                </TypeArea>
            </div>
        );
    }

    renderFinished() {
        return (
            <Result
                seconds={this.state.seconds}
                validChars={this.state.validChars}
                wantChars={this.state.wantChars}
            />
        );
    }

    renderOops() {
        return (
            <div>
                Well something went horribly wrong :/
            </div>
        )
    }

    focusTypeArea() {
        this.typeAreaRef.current.focus();
    }

    onChange(completedText, validChars, wantChars) {
        if (this.state.gameState === GameState.WAITING) {
            this.startTicking();
            this.setState(
                state => update(state, { gameState: { $set: GameState.PLAYING } })
            );
        }

        this.setState(
            state => update(state, {
                validChars: { $set: validChars },
                wantChars: { $set: wantChars },
            })
        );

        if (completedText) {
            this.setState(
                state => update(state, { gameState: { $set: GameState.FINISHED } }),
                this.stopTicking
            );
        }
    }

    tick() {
        this.setState(state => ({
            seconds: (Date.now() - state.startTime) / 1000,
        }));
    }

    startTicking() {
        this.stopTicking();

        this.setState(
            state => update(state, { startTime: { $set: Date.now() } }),
            () => { this.timerID = setInterval(() => this.tick(), 100) },
        )
    }

    stopTicking() {
        if (this.timerID !== null) {
            clearInterval(this.timerID);
            this.timerID = null;
        }
    }
}

export default Playground;