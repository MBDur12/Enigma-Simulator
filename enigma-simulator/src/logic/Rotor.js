const ALPHABET = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];

// TODO
const rotateArray = (arr, n) => {}

class Rotor {
    constructor(wiring, rotorPos='a', ringSetting=1, steppingPoint) {
        // Array of characters substituted by index: ["b", "d"...]
        this.wiring = wiring;
        this.rotorPos = rotorPos;
        this.ringSetting = ringSetting
        this.steppingPoint = steppingPoint;
        // adjusts entry and exit points. changes with configuration
        this.offset = 0;
    }

    // computes entry or exit offset depending on val (1: entry, -1: exit)
    offsetIndex(char, val) {
        if (val === 1) {
            return (char.charCodeAt() - 97 + this.offset) % 26;
        }
        else if (val === -1) {
            return char.charCodeAt() - 97 - this.offset;
        }
        return;
    }

    // adjust offset by 1 (loops round with modulus 26) and "increase" the character in the rotor position
    step() {
        this.offset = (this.offset + 1) % 26;
        this.rotorPos = String.fromCharCode(97 + this.offset);
        console.log("Offset:", this.offset, "Rotor at position:", this.rotorPos);
    }
    // adjusts offset and rotor position depending on user defined setting. Position is given as a lowercase character
    setRotor(position) {
        this.offset = position.charCodeAt() - 97;
        this.rotorPos = position;
    }   

    // assumes that the new ring setting is different from the current (which is handle when processing user input)
    setRing(setting) {
        // find the dot position ('a' by default) in wiring before shifting
        let dotPos = this.wiring.indexOf('a');

        let diff = setting - 1;
        // update wiring table by shifting based on the new ring setting (relative to a: 1)
        
        this.wiring = this.wiring.map(char => {
            let newCharIndex = (char.charCodeAt() - 97 + diff) % 26;
            return ALPHABET[newCharIndex];
            });
            
        dotPos = (dotPos + diff) % 26;
        // shift ring setting character (e.g. 1:'a') to dot position
        let ringIndex = this.wiring.indexOf(String.fromCharCode(setting + 96));

        this.wiring = 

        



    }
    // char assumed to be pre-processed to lowercase
    forwardPass(char) {
        // Account for entry offset (subtract ASCII value to set in index range)
        let charIndex = this.offsetIndex(char, 1);      
        console.log("character index:", charIndex, "resulting in:", ALPHABET[charIndex])
        // perform substitution by checking index against ALPHABET
        char = this.wiring[charIndex];
        
        // adjust for exit offset and return value
        char = ALPHABET[this.offsetIndex(char, -1)];
        return char;
    }

    reversePass(char) {
        // entry offset (is string to then do reverse substitution from wiring)
        char = String.fromCharCode(char.charCodeAt() + this.offset);
        // find index of target character to swap in ALPHABET   
        let charIndex = this.wiring.indexOf(char);
        char = ALPHABET[charIndex];

        // exit offset
        return ALPHABET[this.offsetIndex(char, -1)];

    }



    
}

const testRotor = new Rotor(['e','k','m','f','l','g','d','q','v','z','n','t','o','w','y','h','x','u','s','p','a','i','b','r','c','j']);
console.log(testRotor);
console.log(testRotor.step());
console.log(testRotor.forwardPass('a'));
console.log(testRotor.reversePass('c'))



