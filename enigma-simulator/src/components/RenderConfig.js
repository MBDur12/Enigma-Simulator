import React from "react";


export default class RenderConfig extends React.Component {
    render() {
        return (
            <div>
                <div id="config" className="hstack gap-1 fw-bold clr">
                    <div>Rotors:</div> 
                    <div>({this.props.reflector}) {this.props.rotorTypes[0]}-
                    {this.props.rotorTypes[1]}-
                    {this.props.rotorTypes[2]} ({this.props.rotorPos[0].toUpperCase()},
                        {this.props.rotorPos[1].toUpperCase()},{this.props.rotorPos[2].toUpperCase()})</div> /
                    <div>Rings: {this.props.rings[0]}-{this.props.rings[1]}-{this.props.rings[2]}</div> /
                    <div>Plugboard: {this.props.displayPlugs}</div>
                </div>
            </div>
        )
    }
}