import { Midi, Note } from "../../custom/midi.js";

const s = (p) => {
  let theShader;
  let width = 1440;
  let height = 810;

  let next, prev, offscreen;
  let song;
  let noiseTexture;
  let mousePos;
  let deltaMouse;
  let prevMouse;
  let fps = 20;
  let drawNextFrame = true;

  let mediaRecorder;
  let chunks = [];
  let recording = false;

  let midi = new Midi(p, [
    new Note(0),
    new Note(1),
    new Note(12, { isSymmetric: true }),
    new Note(13, { isSymmetric: true }),
    new Note(14),
    new Note(15),
    new Note(16),
    new Note(20),
    new Note(44, { lerpDisabled: true, isBinary: true }),
    new Note(45, { lerpDisabled: true, isBinary: true }),
    new Note(48, { lerpDisabled: true, isBinary: true }),
    new Note(49, { lerpDisabled: true, isBinary: true }),
  ]);

  p.preload = () => {
    theShader = p.loadShader("sketches/006_train/vertex.vert", "sketches/006_train/fragment.frag");
    noiseTexture = p.loadImage("sketches/006_train/noiseTexture.png");
    song = p.loadSound("assets/juno_reactor_train.wav");
  };

  p.setup = () => {
    p.createCanvas(width, height, p.WEBGL);
    p.imageMode(p.CENTER);
    p.rectMode(p.CENTER);

    next = p.createGraphics(width, height, p.WEBGL);
    next.imageMode(p.CENTER);
    next.rectMode(p.CENTER);

    prev = p.createGraphics(width, height, p.WEBGL);
    prev.imageMode(p.CENTER);
    prev.rectMode(p.CENTER);

    offscreen = p.createGraphics(width, height, p.WEBGL);
    offscreen.imageMode(p.CENTER);
    offscreen.rectMode(p.CENTER);

    mousePos = p.createVector(0, 0);
    prevMouse = p.createVector(p.mouseX, p.mouseY);

    p.frameRate(fps);
    setupVideo();
  };

  function setupVideo() {
    // Setup for video recording
    let stream = p.canvas.captureStream(fps); // Adjust the frame rate as needed
    let options = {
      mimeType: "video/webm; codecs=vp9",
      videoBitsPerSecond: 10000000, // Adjust this value for bitrate
    };

    // mediaRecorder = new MediaRecorder(stream, options);

    // mediaRecorder.ondataavailable = (event) => {
    //   if (event.data.size > 0) chunks.push(event.data);
    // };

    // mediaRecorder.onstop = exportVideo;
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

  let calcMousePos = () => {
    mousePos = p.createVector(p.mouseX - width / 2, p.mouseY - height / 2);
    mousePos.x *= 0.1;
    mousePos.y *= 0.1;

    deltaMouse = p.createVector(p.mouseX - prevMouse.x, p.mouseY - prevMouse.y);
  };

  p.draw = () => {
    // if (!drawNextFrame) return;
    // drawNextFrame = false;

    calcMousePos();
    midi.updateValues();

    [prev, next] = [next, prev];

    next.clear();
    next.background(0);

    offscreen.clear();

    offscreen.shader(theShader);

    theShader.setUniform("resolution", [width, height]);
    theShader.setUniform("time", p.frameCount / fps);

    theShader.setUniform("rectSize", [width, height]);
    theShader.setUniform("rectThick", 25);
    theShader.setUniform("rectOutlineColor", [1, 0, 0]);

    theShader.setUniform("noiseTexture", noiseTexture);
    theShader.setUniform("prevTexture", prev);
    theShader.setUniform("fbScale", 0.86 + midi.get(20) * 0.1);

    let jumpDistance = 200;
    theShader.setUniform("fbOffset", [
      100 * midi.get(12) - jumpDistance * midi.get(48) + jumpDistance * midi.get(49),
      -100 * midi.get(13) + jumpDistance * midi.get(44) - jumpDistance * midi.get(45),
    ]);

    theShader.setUniform("circleSize", 350 + midi.get(1) * 400);
    theShader.setUniform("lineCount", 400 * midi.get(16));

    offscreen.noStroke();
    offscreen.rect(0, 0, width, height);

    next.image(offscreen, 0, 0);

    p.image(next, 0, 0);

    prevMouse = p.createVector(p.mouseX, p.mouseY);
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
