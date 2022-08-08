import React from 'react';
import RotorComponent from './RotorComponent.js';
import GetInput from './GetInput.js';
import RenderInput from './RenderInput.js';
import GetSettings from './GetSettings.js';
// Logic modules
import Machine from '../logic/Machine.js';
import Plugboard from '../logic/Plugboard.js';
import Reflector from '../logic/Reflector.js';
import Rotor from '../logic/Rotor.js';

// Define constants and default components
const rotorI = new Rotor(['e','k','m','f','l','g','d','q','v','z','n','t','o','w','y','h','x','u','s','p','a','i','b','r','c','j'], 'a', 1, 'r');
const rotorII = new Rotor(['a', 'j', 'd', 'k', 's', 'i', 'r', 'u', 'x', 'b', 'l', 'h', 'w', 't', 'm', 'c', 'q', 'g', 'z', 'n', 'p', 'y', 'f', 'v', 'o', 'e'], 'a', 1, 'f');
const rotorIII = new Rotor(['b', 'd', 'f', 'h', 'j', 'l', 'c', 'p', 'r', 't', 'x', 'v', 'z', 'n', 'y', 'e', 'i', 'w', 'g', 'a', 'k', 'm', 'u', 's', 'q', 'o'], 'a', 1, 'w');
const reflectorB = new Reflector({'a': 'y', 'b': 'r', 'c': 'u', 'd': 'h', 'e': 'q', 'f': 's','g': 'l','h': 'd','i': 'p','j': 'x','k': 'n','l': 'g','m': 'o','n': 'k','o': 'm',
'p': 'i', 'q': 'e', 'r': 'b', 's': 'f', 't': 'z', 'u': 'c', 'v': 'w','w': 'v'
, 'x': 'j','y': 's', 'z': 't'})

const preProcessChar = (char) => {
    // accept only letters a-z
    if (char.length === 1 && char.match(/[a-z]/i)) {
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
            inputVal: '',
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
        }
        this.handleChange = this.handleChange.bind(this);
        this.updateRotor = this.updateRotor.bind(this);
        this.updateRings = this.updateRings.bind(this);
        this.getUpdatedMachine = this.getUpdatedMachine.bind(this);
        this.handleConnect = this.handleConnect.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.colorPairs = this.colorPairs.bind(this);
        this.resetPlugColors = this.resetPlugColors.bind(this);

        
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

    handleReset(event) {
        event.preventDefault();
        document.querySelectorAll('.pair').forEach((elem) => {
            elem.value = null;
        })
        this.setState({
            plugboard: new Plugboard({})
        })
    }
    handleChange(event) {
        let updatedMachine = this.getUpdatedMachine();
        console.log("new plugboard:", updatedMachine.plugboard)

        const changedInput = event.target.value;
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
        const pairs = document.querySelectorAll('.pair')
        // use count to identify input box that has errored (if any)
        let count = 0
        let letters = [];
        pairs.forEach((elem) => {
            const val = elem.value;
            // exit if only a single letter has been given in an input field
            if (val.length === 1) {
                alert(`error: a pair cannot be made from a single letter. Field ${count + 1}`);
                return;
            } 
            // if value is defined, it must be a pair (maxlength is 2), so check for duplicates and previously used letters
            else if (val) {
                const first = val[0].toLowerCase();
                const second = val[1].toLowerCase();
                // if letters are duplicated in field, remove the value and do nothing else
                if (first === second) {
                    elem.value = null;
                }
                // then check if letter has been used in another pair or not
                else if (letters.includes(first) || letters.includes(second)) {
                    alert(`error: duplicate letter used in multiple pairs. Field ${count}`);
                    return;
                }
                // otherwise add letters to array to later "connect" in plugboard
                else {
                    letters.push(first, second)
                }
            }
            count++;
        })
        // if executed correctly, generate plugboard object
        let updatedPairs = {};
        // jump in 2s as only valid pairs are added in letters
        for (let i = 0; i < letters.length; i += 2) {
            updatedPairs[letters[i]] = letters[i+1];
            updatedPairs[letters[i+1]] = letters[i];
        }
        console.log(updatedPairs)
        // change the state of the plugboard
        this.setState({
            plugboard: new Plugboard(updatedPairs)
        })
        // color corresponding pairs on plugboard
        this.resetPlugColors();
        this.colorPairs(letters);
    }
    // pass in array of letters after plugboard has been connected
    
    // TODO: reset colors of all letters on reset click and those not included - might be easier to use the same reset method for both cases, the latter before then adding colors back
    resetPlugColors() {
        document.querySelectorAll('.plug').forEach((elem) => {
            elem.style.cssText = 'color: black; border-color: revert';
        })
    }
    colorPairs(letters) {
        let colorIdx = 0;
        
        for (let i = 0; i < letters.length; i++) {
            const letter = document.getElementById(letters[i]);
            const clr = 'red';

            letter.style.cssText = `color: ${clr}; border-color: ${clr}`
        
            // update color index of a pair has been successfully colored
            if ((i + 1) % 2 === 0) {
                colorIdx++;
            }
            
        }



    }
    render() {
        return (
            <div className="container-fluid text-center">
                <h1>Enigma</h1>
                <div className="row">
                    <div className="col">
                        <RotorComponent position={this.state.rotorPositions[0]} ring={this.state.ringSettings[0]}/>
                    </div>
                    <div className="col">
                        <RotorComponent position={this.state.rotorPositions[1]} ring={this.state.ringSettings[1]}/>
                    </div>
                    <div className="col">
                        <RotorComponent position={this.state.rotorPositions[2]} ring={this.state.ringSettings[2]}/>
                    </div>
                </div>
                <div className="row">
                    <GetInput input={this.state.inputVal} handleChange={this.handleChange}/>
                    <GetSettings updateRotor={this.updateRotor} updateRings={this.updateRings} handleConnect={this.handleConnect} handleReset={this.handleReset}/>

                    <RenderInput input={this.state.outputVal.join('')}/>
                </div>
            </div>
      
        )
    }
}

