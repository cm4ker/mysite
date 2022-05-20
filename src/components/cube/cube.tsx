import { render } from "@testing-library/react";
import React from "react"
import './cube.css'



export class Cube extends React.Component<{}, {side: string}> {

    sides = ["front", "right", "top", "left", "bottom", "back"];
    index = 0;

    tick() {

        if (this.index > this.sides.length)
            this.index = 0;

        this.setState({ side: this.sides[this.index] });
        this.index++;
    }

    componentWillMount() {
        this.tick();
    }

    componentDidMount() {
        setInterval(() => this.tick(), 3000);
    }

    render() {
        return (
            <div className="scene">
                <div id="cube" className={`cube show-${this.state.side}`} >
                    <div id="front" className="cube_face">c#</div>
                    <div id="right" className="cube_face">sql</div>
                    <div id="back" className="cube_face">1C</div>
                    <div id="left" className="cube_face">backend</div>
                    <div id="top" className="cube_face">frontend</div>
                    <div id="bottom" className="cube_face">dwh</div>
                </div>
            </div>
        )
    }
}

export default Cube;