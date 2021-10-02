import './Result.scss';

function Result({ seconds, validChars, wantChars }) {
    const minutes = seconds / 60;
    const validWords = validChars / 5;
    const wpm = (validWords / minutes).toFixed(2);
    const accuracy = (validChars / wantChars) * 100;

    return (
        <div className="Result">
            <dl>
                <div>
                    <dt>WPM</dt>
                    <dd>{wpm}</dd>
                </div>
                <div>
                    <dt>Accuracy</dt>
                    <dd>{accuracy.toFixed(1)}<span className="Unit">%</span></dd>
                </div>
                <div>
                    <dt>Time</dt>
                    <dd>{seconds.toFixed(1)}<span className="Unit">s</span></dd>
                </div>
                <div>
                    <dt>Words</dt>
                    <dd>{validWords}</dd>
                </div>
            </dl>
        </div>
    );
}

export default Result;