import { lerp } from "./utils.js";

export class Midi {
  values = {};
  targetValues = {};
  lerpDisabled = {};
  infoElementID = null;
  recordedMessages = [];
  p = null;

  recording = false;
  recordingStartTime = 0;
  recordedMessages = [];
  playbackIndex = 0;
  playback = false;
  playbackStartTime = 0;

  constructor(p, notes) {
    this.p = p;
    this.setupMidi();
    for (let note of notes) {
      this.register(note);
    }
    this.infoElementID = "info1";
  }

  startRecording() {
    console.log("Starting recording.");
    this.recordedMessages = [];
    this.recording = true;
    this.recordingStartTime = this.p.millis();
  }

  stopRecording() {
    console.log("Stopping recording.");
    console.log(this.recordedMessages);
    this.recording = false;
  }

  startPlayback() {
    console.log("Starting playback.");

    if (this.recordedMessages.length > 0) {
      this.playback = true;
      this.playbackIndex = 0;
      this.playbackStartTime = this.p.millis();
    }
  }

  stopPlayback() {
    console.log("Stopping playback.");
    this.playback = false;
  }

  register(note) {
    this.values[note] = 0;
    this.targetValues[note] = 0;
  }

  get(note) {
    return this.values[note];
  }

  getSymmetric(note) {
    return this.values[note] * 2 - 1;
  }

  getBinary(note) {
    return this.values[note] > 0 ? 1 : 0;
  }

  getDelta(note) {
    if (this.values.hasOwnProperty(note) && this.targetValues.hasOwnProperty(note)) {
      return this.values[note] - this.targetValues[note];
    } else {
      console.warn(`Note ${note} not found.`);
      return 0;
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
        let note = midiMessage.data[1];
        let velocity = midiMessage.data.length > 2 ? midiMessage.data[2] : 0;

        // Now you can use these MIDI values to interact with your p5.js sketch
        this.targetValues[note] = this.p.map(velocity, 0, 127, 0, 1);

        if (this.recording) {
          this.recordedMessages.push({
            note: note,
            value: this.targetValues[note],
            time: this.p.millis() - this.recordingStartTime,
          });
        }

        const midiInfoElement = document.getElementById(this.infoElementID);
        midiInfoElement.textContent = `MIDI Note: ${note}, Value: ${this.targetValues[note].toFixed(2)}`;
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

  updatePlayback() {
    let currentTime = this.p.millis() - this.playbackStartTime;

    while (
      this.playbackIndex < this.recordedMessages.length &&
      this.recordedMessages[this.playbackIndex].time <= currentTime
    ) {
      let msg = this.recordedMessages[this.playbackIndex];
      console.log(msg);
      this.targetValues[msg.note] = msg.value;
      this.playbackIndex++;
    }

    if (this.playbackIndex >= this.recordedMessages.length) {
      this.stopPlayback();
    }
  }

  updateMidi() {
    for (let note in this.values) {
      if (this.lerpDisabled[note]) {
        this.values[note] = this.targetValues[note];
        continue;
      }
      this.values[note] = lerp(this.values[note], this.targetValues[note], 0.5);
    }
  }

  updateValues() {
    if (this.playback) {
      this.updatePlayback();
    }
    this.updateMidi();
  }
}
