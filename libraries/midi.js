class Midi {
  values = {};
  targetValues = {};
  lerpDisabled = {};
  infoElementID = null;

  constructor(notes) {
    this.setupMidi();
    for (let note of notes) {
      this.register(note);
    }
    this.infoElementID = "info1";
  }

  register(note) {
    this.values[note] = -1.0;
    this.targetValues[note] = -1.0;
  }

  get(note) {
    return this.values[note];
  }

  getDelta(note) {
    // Check if the note exists in the values and targetValues
    if (
      this.values.hasOwnProperty(note) &&
      this.targetValues.hasOwnProperty(note)
    ) {
      return this.values[note] - this.targetValues[note];
    } else {
      console.warn(`Note ${note} not found.`);
      return 0; // Return 0 if the note doesn't exist
    }
  }

  disableLerp(note) {
    this.lerpDisabled[note] = true;
  }

  setInfoElement(id) {
    this.infoElementID = id;
  }

  setupMidi() {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

      function onMIDIFailure() {
        console.error("Could not access MIDI devices.");
      }

      let getMIDIMessage = (midiMessage) => {
        let command = midiMessage.data[0];
        let note = midiMessage.data[1];
        let velocity = midiMessage.data.length > 2 ? midiMessage.data[2] : 0;

        // Now you can use these MIDI values to interact with your p5.js sketch
        this.targetValues[note] = ((velocity - 64) / 128) * 2;

        const midiInfoElement = document.getElementById(this.infoElementID);
        midiInfoElement.textContent = `MIDI Note: ${note}, Value: ${this.targetValues[
          note
        ].toFixed(2)}`;
      };

      function onMIDISuccess(midiAccess) {
        for (let input of midiAccess.inputs.values()) {
          input.onmidimessage = getMIDIMessage;
        }
      }
    } else {
      console.error("Web MIDI API not supported in this browser.");
    }
  }

  updateValues() {
    for (let note in this.values) {
      if (this.lerpDisabled[note]) {
        this.values[note] = this.targetValues[note];
        continue;
      }
      this.values[note] = lerp(this.values[note], this.targetValues[note], 0.5);
    }
  }
}
