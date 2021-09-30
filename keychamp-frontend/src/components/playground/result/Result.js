import './Result.scss';

function Result({ seconds, validChars }) {
    const minutes = seconds / 60;
    const validWords = validChars / 5;
    const wpm = (validWords / minutes).toFixed(2);

    return (
        <div className="Result">
            <dl>
                <div>
                    <dt>Keys</dt>
                    <dd>{validChars}</dd>
                </div>
                <div>
                    <dt>Words</dt>
                    <dd>{validWords}</dd>
                </div>
                <div>
                    <dt>Time</dt>
                    <dd>{seconds.toFixed(1)}s</dd>
                </div>
                <div>
                    <dt>WPM</dt>
                    <dd>{wpm}</dd>
                </div>
            </dl>
        </div>
    );
}

export default Result;