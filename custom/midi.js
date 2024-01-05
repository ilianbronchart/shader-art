import { lerp } from "./utils.js";

export class Note {
  constructor(note, { lerpDisabled = false, isSymmetric = false, isBinary = false } = {}) {
    this.note = note;
    this.targetValue = 0;
    this.lerpDisabled = lerpDisabled;
    this.isSymmetric = isSymmetric;
    this.isBinary = isBinary;
    this.value = 0;
    this.prevValue = 0;

    if (this.isSymmetric) {
      this.value = 0.5;
      this.targetValue = 0.5;
      this.prevValue = 0.5;
    }
  }

  updateValue(lerpFactor = 0.5) {
    this.prevValue = this.value;

    if (this.lerpDisabled) {
      this.value = this.targetValue;
    } else {
      this.value = lerp(this.value, this.targetValue, lerpFactor);
    }
  }

  getBinary() {
    return this.value > 0 ? 1 : 0;
  }

  setTargetValue(value) {
    this.targetValue = value;
  }

  getValue() {
    if (this.isSymmetric) {
      return this.value * 2 - 1;
    } else if (this.isBinary) {
      return this.value > 0 ? 1 : 0;
    }

    return this.value;
  }
}

export class Midi {
  notes = {};

  recording = false;
  editRecording = false;
  editIndex = 0;
  recordingStartTime = 0;
  recordedMessages = [];
  loadedMessages = [];
  recordingFilePath = null;

  playbackIndex = 0;
  playback = false;
  playbackStartTime = 0;

  p = null;

  constructor(p, notes) {
    this.p = p;
    this.notes = notes.reduce((obj, note) => {
      obj[note.note] = note;
      return obj;
    }, {});
    this.setupMidi();
  }

  get(note) {
    if (this.notes[note]) {
      return this.notes[note].getValue();
    } else {
      return 0;
    }
  }

  startRecording(recordingFilePath, editRecording = false) {
    console.log("Starting recording.");
    if (this.playback) {
      console.error("Cannot start recording while playing back.");
      return;
    }

    this.recordedMessages = [];
    this.loadedMessages = [];
    this.recording = true;
    this.editRecording = editRecording;
    this.recordingStartTime = this.p.millis();
    this.editIndex = 0;
    this.recordingFilePath = recordingFilePath;

    if (editRecording) {
      this.p.loadJSON(this.recordingFilePath, (data) => {
        if (Array.isArray(data)) {
          this.loadedMessages = data;
        } else {
          console.error("Loaded recording data is not an array.");
        }
      });
    } else {
      Object.values(this.notes).forEach((note) => {
        this.recordedMessages.push({
          note: note.note,
          targetValue: note.targetValue,
          time: 0,
        });
      });
    }
  }

  stopRecording(download = true) {
    console.log("Stopping recording.");

    // Add the rest of the notes to the recording.
    if (this.editRecording) {
      while (this.editIndex < this.loadedMessages.length) {
        this.recordedMessages.push(this.loadedMessages[this.editIndex]);
        this.editIndex++;
      }
    }

    if (download) {
      const blob = new Blob([JSON.stringify(this.recordedMessages)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const pathParts = this.recordingFilePath.split("/");
      a.download = pathParts[pathParts.length - 1];
      a.click();
      URL.revokeObjectURL(url);
    }

    this.recording = false;
  }

  startPlayback(recordingFilePath) {
    console.log("Starting playback.");
    if (this.recording) {
      console.error("Cannot start playback while recording.");
      return;
    }

    if (recordingFilePath) {
      this.p.loadJSON(recordingFilePath, (data) => {
        if (Array.isArray(data)) {
          this.recordedMessages = data;
          this.playback = true;
          this.playbackIndex = 0;
          this.playbackStartTime = this.p.millis();
        } else {
          console.error("Loaded recording data is not an array.");
        }
      });
    } else if (this.recordedMessages.length > 0) {
      this.playback = true;
      this.playbackIndex = 0;
      this.playbackStartTime = this.p.millis();
    }
  }

  stopPlayback() {
    console.log("Stopping playback.");
    this.playback = false;
  }

  setupMidi() {
    if (navigator.requestMIDIAccess) {
      const onMIDIFailure = () => {
        console.error("Could not access MIDI devices.");
      };

      const getMIDIMessage = (midiMessage) => {
        let noteNumber = midiMessage.data[1];
        let velocity = midiMessage.data.length > 2 ? midiMessage.data[2] : 0;

        const midiInfoElement = document.getElementById("info1");
        if (!midiInfoElement) return;
        midiInfoElement.textContent = `MIDI Note: ${noteNumber}, Value: ${velocity}`;

        if (this.notes[noteNumber]) {
          this.notes[noteNumber].setTargetValue(this.p.map(velocity, 0, 127, 0, 1));

          if (this.recording) {
            this.recordedMessages.push({
              note: noteNumber,
              targetValue: this.notes[noteNumber].targetValue,
              time: this.p.millis() - this.recordingStartTime,
            });
          }
        }
      };

      const onMIDISuccess = (midiAccess) => {
        for (let input of midiAccess.inputs.values()) {
          input.onmidimessage = getMIDIMessage;
        }
      };

      navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
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
      if (this.notes[msg.note]) {
        this.notes[msg.note].setTargetValue(msg.targetValue);
      }
      this.playbackIndex++;
    }

    if (this.playbackIndex >= this.recordedMessages.length) {
      this.stopPlayback();
    }
  }

  updateEditRecording() {
    let currentTime = this.p.millis() - this.recordingStartTime;

    if (this.editIndex >= this.loadedMessages.length) return;

    while (this.editIndex < this.loadedMessages.length && this.loadedMessages[this.editIndex].time <= currentTime) {
      let msg = this.loadedMessages[this.editIndex];

      if (this.notes[msg.note]) {
        this.notes[msg.note].setTargetValue(msg.targetValue);
      }

      this.recordedMessages.push(msg);

      this.editIndex++;
    }
  }

  updateValues() {
    if (this.playback) this.updatePlayback();

    if (this.recording && this.editRecording) this.updateEditRecording();

    Object.values(this.notes).forEach((note) => note.updateValue());
  }
}
