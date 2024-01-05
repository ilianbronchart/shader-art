import { createGraphics } from "../../custom/utils.js";
import { Midi, Note } from "../../custom/midi.js";

class Spot {
  constructor(pos, rot, vel) {
    this.pos = pos
    this.rot = rot;
    this.vel = vel;
  }
}

const s = (p) => {
  let layer, theShader;
  let fps = 60;

  let width = 2000;
  let height = 2000;
  let song;

  let mediaRecorder;
  let chunks = [];
  let recording = false;


  let midi = new Midi(p, [
    new Note(0),
    new Note(1),
    new Note(12),
    new Note(13),
    new Note(14),
    new Note(15),
    new Note(16),
    new Note(20),
    new Note(44, { lerpDisabled: true, isBinary: true }),
    new Note(45, { lerpDisabled: true, isBinary: true }),
    new Note(46, { lerpDisabled: true, isBinary: true }),
    new Note(47, { lerpDisabled: true, isBinary: true }),
    new Note(48, { lerpDisabled: true, isBinary: true }),
    new Note(49, { lerpDisabled: true, isBinary: true }),
    new Note(50, { lerpDisabled: true, isBinary: true }),
    new Note(51, { lerpDisabled: true, isBinary: true }),
    new Note(60, { lerpDisabled: true, isBinary: true }),
    new Note(62, { lerpDisabled: true, isBinary: true }),
    new Note(64, { lerpDisabled: true, isBinary: true }),
    new Note(65, { lerpDisabled: true, isBinary: true }),
    new Note(67, { lerpDisabled: true, isBinary: true }),
    new Note(69, { lerpDisabled: true, isBinary: true }),
    new Note(71, { lerpDisabled: true, isBinary: true }),
    new Note(72, { lerpDisabled: true, isBinary: true }),
  ]);

  let spots = [];
  let NUM_SPOTS = 6;
  let targetParamC = 0;
  let paramC = 0;
  let targetParamD = 0;
  let paramD = 0;

  p.preload = () => {
    theShader = p.loadShader("sketches/008/vertex.vert", "sketches/008/fragment.frag");
  };

  p.setup = () => {
    song = p.loadSound("assets/solaris_end.wav");
    song.setVolume(0.1);

    p.createCanvas(width, height, p.WEBGL);
    p.imageMode(p.CENTER);
    p.rectMode(p.CENTER);

    layer = createGraphics(p, width, height);

    p.noStroke();

    createSpots();
    setupVideo();
  };

  function setupVideo() {
    // Setup for video recording
    let stream = p.canvas.captureStream(fps); // Adjust the frame rate as needed
    let options = {
      mimeType: "video/webm; codecs=vp9",
      videoBitsPerSecond: 20000000, // Adjust this value for bitrate
    };

    mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };

    mediaRecorder.onstop = exportVideo;
  }

  function exportVideo() {
    const blob = new Blob(chunks, { type: "video/webm" });
    chunks = [];
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = "sketch.webm";
    a.click();
    window.URL.revokeObjectURL(url);
  }

  function createSpots() { 
    spots = [];
    let min = -0.4;
    let max = 0.4;
    for (let i = 0; i < NUM_SPOTS; i++) {
      spots.push(new Spot(
        p.createVector(p.random(min, max), p.random(min, max)), 
        p.random(0.0, 2 * Math.PI),
        p.createVector(p.random(-0.01, 0.01), p.random(-0.01, 0.01))
      ));
    }
  }

  function updateSpotPositions() {
    let min = -0.3;
    let max = 0.3;
    let repelForce = 0.00005;

    spots.forEach(spot => {
      if (spot.pos.x < min) spot.vel.x += repelForce;
      if (spot.pos.x > max) spot.vel.x -= repelForce;
      if (spot.pos.y < min) spot.vel.y += repelForce;
      if (spot.pos.y > max) spot.vel.y -= repelForce;

      spot.vel = spot.vel.limit(0.003);

      spot.pos.add(spot.vel)
    });
  }

  function updateParams() {
    if (midi.get(44) > 0) targetParamC = 0;
    if (midi.get(45) > 0) targetParamC = 1;
    if (midi.get(46) > 0) targetParamC = 2;
    if (midi.get(47) > 0) targetParamC = 3;
    if (midi.get(48) > 0) targetParamC = 4;
    if (midi.get(49) > 0) targetParamC = 5;
    if (midi.get(50) > 0) targetParamC = 6;
    if (midi.get(51) > 0) targetParamC = 7;
    paramC = p.lerp(paramC, targetParamC, (1 / fps) * 20);
  
    if (midi.get(60) > 0) targetParamD = 0;
    if (midi.get(62) > 0) targetParamD = 1;
    if (midi.get(64) > 0) targetParamD = 3;
    if (midi.get(65) > 0) targetParamD = 4;
    if (midi.get(67) > 0) targetParamD = 5;
    paramD = p.lerp(paramD, targetParamD, (1 / fps) * 20);
  }


  p.draw = () => {
    midi.updateValues();
    updateParams();
    updateSpotPositions();

    let time = 5 * p.frameCount / fps;

    layer.clear();
    layer.background(0);
    layer.shader(theShader);
    theShader.setUniform("time", time * 1.5);
    theShader.setUniform("spots", spots.map(spot => [spot.pos.x, spot.pos.y, spot.vel.x, spot.vel.y]).flat());
    theShader.setUniform("paramA", 2 + midi.get(12) * 20);
    theShader.setUniform("paramB", midi.get(13) * 1000);
    theShader.setUniform("paramC", paramC);
    theShader.setUniform("paramD", paramD);
    layer.rect(0, 0, width, height);

    p.image(layer, 0, 0);
  };

  p.keyPressed = () => {
     if (p.keyCode === 32) {
      createSpots();
    }
  }

  p.keyPressed = () => {
    if (p.keyCode === 32) {
      // Spacebar
      if (!midi.recording) {
        midi.startRecording("sketches/008/midi-recording.json", true);
        song.stop();
        song.play();
      } else {
        midi.stopRecording();
        song.stop();
      }

      if (!recording) {
        console.log("Starting media recording.");
        mediaRecorder.start();
        recording = true;
      } else {
        console.log("Stopping media recording.");
        mediaRecorder.stop();
        recording = false;
      }
    }

    // Esc
    if (p.keyCode === 27) {
      if (midi.recording) {
        midi.stopRecording(false);
        song.stop();
      }
    }

    if (p.keyCode === p.ENTER) {
      if (!midi.playback) {
        midi.startPlayback("sketches/008/midi-recording.json");
        song.stop();
        song.play();
      } else {
        midi.stopPlayback();
        song.stop();
      }

      if (!recording) {
        console.log("Starting media recording.");
        mediaRecorder.start();
        recording = true;
      } else {
        console.log("Stopping media recording.");
        mediaRecorder.stop();
        recording = false;
      }
    }

    drawNextFrame = true;
  };
};

new p5(s);
