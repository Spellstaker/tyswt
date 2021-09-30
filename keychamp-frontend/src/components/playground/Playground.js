import React from 'react';
import update from 'react-addons-update';

import TypeArea from './typearea/TypeArea';
import Result from './result/Result';
import Timer from './timer/Timer';

const testText = `for _ in range(int(input())):
    n, m = map(int, input().split())
    l = [*map(int, input().split())]
    print(min(m, sum(l)))`;

const GameState = Object.freeze({
    WAITING: Symbol("WAITING"),
    PLAYING: Symbol("PLAYING"),
    FINISHED: Symbol("FINISHED"),
});

class Playground extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            text: testText,
            seconds: 0,
            startTime: null,
            validChars: 0,
            gameState: GameState.WAITING,
        };

        this.timerID = null;

        this.onChange = this.onChange.bind(this);
        this.tick = this.tick.bind(this);
        this.startTicking = this.startTicking.bind(this);
    }

    componentWillUnmount() { this.stopTicking(); }

    render() {
        switch (this.state.gameState) {
            case GameState.WAITING:
                return this.renderWaiting();
            case GameState.PLAYING:
                return this.renderPlaying();
            case GameState.FINISHED:
                return this.renderFinished();
            default:
                return this.renderOops();
        }
    }

    renderWaiting() {
        return (
            <div>
                <TypeArea onChange={this.onChange}>
                    {this.state.text}
                </TypeArea>
            </div>
        );
    }

    renderPlaying() {
        return (
            <div>
                <Timer seconds={this.state.seconds} />
                <TypeArea onChange={this.onChange}>
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

    onChange(validChars, completedText) {
        if (this.state.gameState === GameState.WAITING) {
            // this.startTicking();
            this.setState(
                state => update(state, { gameState: { $set: GameState.PLAYING } })
            );
        }

        this.setState(
            state => update(state, { validChars: { $set: validChars } })
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