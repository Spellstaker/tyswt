import './Timer.scss';

function Timer({ seconds }) {
    return (
        <div className="Timer">
            {seconds.toFixed(1)}
        </div>
    )
}

export default Timer;