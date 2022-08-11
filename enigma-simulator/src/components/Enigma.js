import React from 'react';
import RotorComponent from './RotorComponent.js';
import GetInput from './GetInput.js';
import RenderInput from './RenderInput.js';
import Lampboard from './Lampboard.js';
// Logic modules
import Machine from '../logic/Machine.js';
import Plugboard from '../logic/Plugboard.js';
import Reflector from '../logic/Reflector.js';
import Rotor, { ALPHABET } from '../logic/Rotor.js';
import RenderPlugboard from './RenderPlugboard.js';


// Define constants and default components
const rotorI = new Rotor(['e', 'k', 'm', 'f', 'l', 'g', 'd', 'q', 'v', 'z', 'n', 't', 'o', 'w', 'y', 'h', 'x', 'u', 's', 'p', 'a', 'i', 'b', 'r', 'c', 'j'], 'a', 1, 'q');
const rotorII = new Rotor(['a', 'j', 'd', 'k', 's', 'i', 'r', 'u', 'x', 'b', 'l', 'h', 'w', 't', 'm', 'c', 'q', 'g', 'z', 'n', 'p', 'y', 'f', 'v', 'o', 'e'], 'a', 1, 'e');
const rotorIII = new Rotor(['b', 'd', 'f', 'h', 'j', 'l', 'c', 'p', 'r', 't', 'x', 'v', 'z', 'n', 'y', 'e', 'i', 'w', 'g', 'a', 'k', 'm', 'u', 's', 'q', 'o'], 'a', 1, 'v');
const reflectorB = new Reflector({
    'a': 'y', 'b': 'r', 'c': 'u', 'd': 'h', 'e': 'q', 'f': 's', 'g': 'l', 'h': 'd', 'i': 'p', 'j': 'x', 'k': 'n', 'l': 'g', 'm': 'o', 'n': 'k', 'o': 'm',
    'p': 'i', 'q': 'e', 'r': 'b', 's': 'f', 't': 'z', 'u': 'c', 'v': 'w', 'w': 'v'
    , 'x': 'j', 'y': 's', 'z': 't'
})

// filter keyboard input for only letters
const isLetterOrBack = (str) => {
    // is of correct length and type
    if (str.length === 1 && typeof (str) === 'string') {
        // matches all letters
        if (RegExp(/^\p{L}/, 'u').test(str) === true) {
            return true
        }
    }
    else if (str === 'Backspace') {
        return true;
    }
    else {
        return false;
    }
}
const preProcessChar = (char) => {
    // accept only letters a-z
    if (isLetterOrBack(char)) {
        return char.toLowerCase();
    }
    else {
        return null;
    }
}

const colors = ['red', 'green', 'blue', 'goldenrod', 'pink', 'purple', 'orange', 'teal', 'grey', 'brown']
const revertRotors = (machine, arr) => {
    // shift rotor positions to those passed into as an array
    for (let i = 0; i < 3; i++) {
        machine.rotors[i].setRotor(arr[i])
    }
};


export default class Enigma extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            inputVal: [],
            prevInput: '',
            outputVal: [],
            history: [
                {
                    positions: ['a', 'a', 'a']
                }
            ],
            stepNo: 0,
            currentPositions: ['a', 'a', 'a'],
            machine: new Machine([rotorI, rotorII, rotorIII], reflectorB, new Plugboard({})),
            rotorPositions: ['a', 'a', 'a'],
            ringSettings: [1, 1, 1],
            rotorTypes: [rotorI, rotorII, rotorIII],
            reflector: reflectorB,
            plugboard: new Plugboard({}),
            plugCount: 0,
            colorIndex: 0,
            selectedPlugs: []
        }
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleChar = this.handleChar.bind(this);
        this.updateRotor = this.updateRotor.bind(this);
        this.updateRings = this.updateRings.bind(this);
        this.getUpdatedMachine = this.getUpdatedMachine.bind(this);
        this.handleConnect = this.handleConnect.bind(this);
        this.connectPlug = this.connectPlug.bind(this);
        this.resetPlugs = this.resetPlugs.bind(this);
        this.changeRotor = this.changeRotor.bind(this);
        this.changeRing = this.changeRing.bind(this);


    }

    handleBackspace() {
        const updatedMachine = this.getUpdatedMachine();
        const updatedHistory = this.state.history.slice(0, this.state.stepNo);
        // revert rotor position by passing in the last positions in the history
        revertRotors(updatedMachine, updatedHistory[updatedHistory.length - 1].positions)
        this.setState({
            inputVal: this.state.inputVal.slice(0, this.state.inputVal.length - 1),
            outputVal: this.state.outputVal.slice(0, this.state.outputVal.length - 1),
            history: updatedHistory,
            stepNo: this.state.stepNo - 1,
            rotorPositions: [updatedMachine.rotors[0].rotorPos, updatedMachine.rotors[1].rotorPos, updatedMachine.rotors[2].rotorPos],
            machine: updatedMachine
        })
    }
    handleKeyDown(event) {
        // pre proccess char and encrypt if it is a valid letter, null otherwise
        const char = preProcessChar(event.key);
        if (char !== null) {
            if (char === 'backspace') {
                this.handleBackspace();
            }
            else {
                this.handleChar(char)
            }
            // TODO: highlight key pressed on keyboard
            // encrypt character

            // TODO: display encrypted character
        }
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown)
    }
    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown)
    }
    // update this.state.inputVal field as user types.
    getUpdatedMachine() {
        let updatedMachine = new Machine(
            [this.state.rotorTypes[0],
            this.state.rotorTypes[1],
            this.state.rotorTypes[2]],

            this.state.reflector,
            this.state.plugboard
        );
        for (let i = 0; i < 3; i++) {
            updatedMachine.rotors[i].setRotor(this.state.rotorPositions[i]);
            updatedMachine.rotors[i].setRing(this.state.ringSettings[i]);
        }
        return updatedMachine;
    }

    handleChar(char) {
        const updatedMachine = this.getUpdatedMachine();
        const encryptedChar = updatedMachine.encodeChar(char);


        this.setState({
            inputVal: this.state.inputVal.concat(char),
            outputVal: this.state.outputVal.concat(encryptedChar),
            history: this.state.history.concat([
                {
                    positions: [updatedMachine.rotors[0].rotorPos, updatedMachine.rotors[1].rotorPos, updatedMachine.rotors[2].rotorPos]
                }
            ]),
            stepNo: this.state.stepNo + 1,
            machine: updatedMachine,
            rotorPositions: [updatedMachine.rotors[0].rotorPos, updatedMachine.rotors[1].rotorPos, updatedMachine.rotors[2].rotorPos]
        })

        /*
        // input has been fully deleted - reset everything
        if (changedInput === '') {
            revertRotors(updatedMachine, this.state.history[0].positions)
            this.setState(
                {
                    prevInput: this.state.inputVal,
                    inputVal: changedInput,
                    outputVal: [],
                    history: this.state.history.slice(0, 1),
                    stepNo: 0,
                    machine: updatedMachine,
                    rotorPositions: [
                        updatedMachine.rotors[0].rotorPos, 
                        updatedMachine.rotors[1].rotorPos, 
                        updatedMachine.rotors[2].rotorPos
                                    ]
                }
            )
            
            return;
        } 
        // check for difference when input field changes
        const newLength = changedInput.length;
        const prevLength = this.state.inputVal.length;
        let updatedHistory;
        let newStepNo;
        let newOutput;

        // new input is >=, so encode only the new letter and add to output value
        if (newLength >= prevLength) {
            let addedInput;
            if (this.state.inputVal === '') {
                addedInput = preProcessChar(changedInput);
            } 
            else {
                addedInput = preProcessChar(changedInput[changedInput.length - 1]);
            }
            // exit if new character is not alphabetical
            if (addedInput === null) {
                return;
            }
            newOutput = this.state.outputVal.concat(updatedMachine.encodeChar(addedInput));
            updatedHistory = this.state.history.concat([
                {
                    positions: [updatedMachine.rotors[0].rotorPos, updatedMachine.rotors[1].rotorPos, updatedMachine.rotors[2].rotorPos]
                }
            ]);
            newStepNo = this.state.stepNo + 1;
        }
        // input is smaller, so a char has been deleted and the machine needs to reverse its rotor position
        else {
            let deletedInput = preProcessChar(this.state.prevInput[this.state.prevInput.length - 1]);
            // ignore if not alphabetical
            if (deletedInput === null) {
                return;
            }
            newOutput = this.state.outputVal.slice(0, this.state.outputVal.length - 1);
            updatedHistory = this.state.history.slice(0, this.state.stepNo);
            newStepNo = this.state.stepNo - 1;

            // revert rotor position by passing in the last positions in the history
            revertRotors(updatedMachine, updatedHistory[updatedHistory.length - 1].positions);

        }

       
        this.setState({
            prevInput: this.state.inputVal,
            inputVal: changedInput,
            outputVal: newOutput,
            history: updatedHistory,
            stepNo: newStepNo,
            machine: updatedMachine,
            rotorPositions: [updatedMachine.rotors[0].rotorPos, updatedMachine.rotors[1].rotorPos, updatedMachine.rotors[2].rotorPos]
        });
        */

    }
    updateRotor(event) {
        let newPos = this.state.rotorPositions.slice();
        newPos[event.target.id] = event.target.value.toLowerCase();
        this.setState({
            rotorPositions: newPos
        })
    }
    updateRings(event) {
        let newRings = this.state.ringSettings
        newRings[event.target.id] = parseInt(event.target.value);
        this.setState({
            ringSettings: newRings
        })
    }
    // update (and re-render) component only if input value has changed
    /*shouldComponentUpdate(nextProps, nextState) {
        if (nextState.inputVal !== this.state.inputVal || nextState.rotorPositions !== this.state.rotorPositions) {
            return true;
        }
        return false;
    }*/
    handleConnect(event) {
        event.preventDefault();
        const plugs = this.state.selectedPlugs
        const plugLen = this.state.selectedPlugs.length;
        // don't connect if a plug is not in a pair
        if (plugLen % 2 !== 0) {
            alert(`Error: The letter ${this.state.selectedPlugs[plugLen - 1]} is not paired up`);
            return;
        }
        // if executed correctly, generate plugboard object
        let updatedPairs = {};
        // jump in 2s as only valid pairs are added
        for (let i = 0; i < plugs.length; i += 2) {
            updatedPairs[plugs[i]] = plugs[i + 1];
            updatedPairs[plugs[i + 1]] = plugs[i];
        }
        // change the state of the plugboard
        this.setState({
            plugboard: new Plugboard(updatedPairs)
        })
    }

    // pass in array of letters after plugboard has been connected

    connectPlug(event) {
        const plug = event.currentTarget;
        let newPlugCnt = this.state.plugCount;
        let newClrIdx = this.state.colorIndex;
        // if plug has already been highlighted, remove its color (and paired letter if any)
        if (plug.classList.contains('clicked') === false && newClrIdx <= 9) {
            // switch to a new color if starting a new pair
            if (this.state.plugCount % 2 === 0 && this.state.plugCount !== 0) {
                newClrIdx++;
            }
            plug.classList.add('clicked');
            plug.style.cssText = `color: ${colors[newClrIdx]}; border-color: ${colors[newClrIdx]}`
            newPlugCnt++;

            this.setState({
                plugCount: newPlugCnt,
                colorIndex: newClrIdx,
                selectedPlugs: this.state.selectedPlugs.concat(plug.id)
            });
        }
    }
    resetPlugs() {
        document.querySelectorAll('.plug').forEach((elem) => {
            elem.classList.remove('clicked')
            elem.style.cssText = 'color: black; border-color: revert';
        })
        this.setState({
            plugCount: 0,
            colorIndex: 0,
            selectedPlugs: []
        })
    }


    changeRotor(event) {
        const updatedPositions = this.state.rotorPositions.slice(0);
        const rotorId = event.currentTarget.id;
        const val = event.currentTarget.value;
        // Get new letter by finding the incremented index and using the ALPHABET constant to get it
        let newLetter;
        // val is either + or -
        if (val === '+') {
            newLetter = ALPHABET[(this.state.rotorPositions[rotorId].charCodeAt() - 97 + 1) % 26];
        }
        else {
            let idx = this.state.rotorPositions[rotorId].charCodeAt() - 97 - 1;
            // only if going from A to Z
            if (idx < 0) {
                idx = 25;
            }
            newLetter = ALPHABET[idx]
        }

        updatedPositions[rotorId] = newLetter;



        this.setState({
            rotorPositions: updatedPositions
        })
    }
    changeRing(event) {
        const newSettings = this.state.ringSettings.slice(0);
        const ringId = event.currentTarget.id;
        const btnVal = event.currentTarget.value;
        // increase ring setting if adding
        if (btnVal === '+') {
            newSettings[ringId] = (this.state.ringSettings[ringId] % 26) + 1;
        }
        // otherwise it must be '-', so decrease the value, looping 1 to 26;
        else {
            let newNum = this.state.ringSettings[ringId] - 1;
            if (newNum === 0) {
                newNum = 26;
            }
            newSettings[ringId] = newNum;
        }

        this.setState({
            ringSettings: newSettings
        });
    }

    render() {
        return (
            <div className="container-fluid text-center">
                <h1>Enigma</h1>
                <div className="d-flex flex-row justify-content-center">
                    <div className='p-2'>
                        <RotorComponent posID={0} position={this.state.rotorPositions[0]} ring={this.state.ringSettings[0]} changeRotor={this.changeRotor} changeRing={this.changeRing} />
                    </div>
                    <div className='p-2'>
                        <RotorComponent posID={1} position={this.state.rotorPositions[1]} ring={this.state.ringSettings[1]} changeRotor={this.changeRotor} changeRing={this.changeRing} />
                    </div>
                    <div className='p-2'>
                        <RotorComponent posID={2} position={this.state.rotorPositions[2]} ring={this.state.ringSettings[2]} changeRotor={this.changeRotor} changeRing={this.changeRing} />
                    </div>
                </div>
                <div className="row">
                    <Lampboard />
                    <RenderPlugboard handleConnect={this.props.handleConnect} resetPlugs={this.resetPlugs} connectPlug={this.connectPlug} />
                </div>
                <div className="row">
                    <GetInput input={this.state.inputVal.join('')} handleChar={this.handleChar} />
                    <RenderInput input={this.state.outputVal.join('')} />
                </div>
            </div>

        )
    }
}

