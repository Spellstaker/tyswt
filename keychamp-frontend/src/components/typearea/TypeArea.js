import React from 'react';
import './TypeArea.scss'



class TypeArea extends React.Component {
    constructor(props) {
        super(props);

        this.state = { text: props.text };
    }

    render() {
        return (
            <div
                tabIndex={0}
                onKeyDown={e => console.log(`Key pressed! : ${e.key}`)}
                className="TypeArea"
            >
                {this.state.text}
            </div>
        );
    }
}

export default TypeArea;