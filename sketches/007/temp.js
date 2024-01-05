import { createGraphics } from "../../custom/utils.js";
import { Midi, Note } from "../../custom/midi.js";

const s = (p) => {
  let width = 1080;
  let height = 1080;

  let next, prev, offscreen;
  let noiseTexture;
  let theShader;

  let mousePos = p.createVector(p.mouseX, p.mouseY);
  let prevMouse = p.createVector(p.mouseX, p.mouseY);
  let deltaMouse = () => p.createVector(p.mouseX - prevMouse.x, p.mouseY - prevMouse.y);
  let fps = 60;
  let drawNextFrame = true;

  let midi = new Midi(p, [
    new Note(0),
    new Note(1),
    new Note(12),
    new Note(13),
    new Note(14),
    new Note(15),
    new Note(16),
    new Note(20),
    new Note(44),
    new Note(45),
    new Note(48),
    new Note(49),
  ]);

  p.preload = () => {
    theShader = p.loadShader("sketches/007/vertex.vert", "sketches/007/fragment.frag");
    noiseTexture = p.loadImage("sketches/007/noiseTexture.png");
  };

  p.setup = () => {
    p.createCanvas(width, height, p.WEBGL);
    p.imageMode(p.CENTER);
    p.rectMode(p.CENTER);

    prev = p.createFramebuffer();
    next = p.createFramebuffer();
    offscreen = createGraphics(p, width, height);

    p.frameRate(fps);
  };

  p.draw = () => {
    // if (!drawNextFrame) return;
    // drawNextFrame = false;

    midi.updateValues();

    // [prev, next] = [next, prev];

    prev.begin();
    p.image(noiseTexture, 0, 0);
    prev.end();

    // next.begin();
    // p.clear();
    // p.background(0);

    offscreen.clear();
    offscreen.background(0);
    offscreen.shader(theShader);
    theShader.setUniform("resolution", [width, height]);
    theShader.setUniform("time", p.frameCount / fps);
    theShader.setUniform("prevFrame", prev.color);
    offscreen.noStroke();
    offscreen.rect(0, 0, width, height);

    p.image(offscreen, 0, 0);
    // next.end();

    // p.image(next, 0, 0);
  };

  p.keyPressed = () => {
    if (p.keyCode === 32) {
      // Spacebar
      if (!midi.recording) {
        midi.startRecording("sketches/006_train/midi-recording.json", true);
        song.stop();
        song.play();
      } else {
        midi.stopRecording();
        song.stop();
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
        midi.startPlayback("sketches/006_train/midi-recording.json");
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
