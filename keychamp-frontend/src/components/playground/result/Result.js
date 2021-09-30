import './Result.scss';

function Result({ seconds, validChars }) {
    const minutes = seconds / 60;
    const validWords = validChars / 5;
    const wpm = (validWords / minutes).toFixed(2);

    return (
        <div className="Result">
            <p> <span className="ResultKey">Valid Keys</span> {validChars}</p>
            <p> <span className="ResultKey">Valid Words</span> {validWords}</p>
            <p> <span className="ResultKey">Time taken</span> {seconds.toFixed(1)}<span className="ResultKey">s</span></p>
            <p> <span className="ResultKey">WPM</span> {wpm}</p>
        </div>
    );
}

export default Result;