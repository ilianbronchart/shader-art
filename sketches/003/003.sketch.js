let buffer;
let theShader;
let prev, next, circleMask, maskedInterim, interim;
let song;
let prevMousePos = [0, 0];
let deltaMousePos = [0, 0];
let mouseFactor = 1.0;
let smoothingFactor = 0.95;
let circleRadius = 100;
let savedTime;
let fps = 60;

let mediaRecorder;
let chunks = [];
let recording = false;

function preload() {
  theShader = loadShader("sketches/003/vertex.vert", "sketches/003/fragment.frag");
  song = loadSound("assets/juno_reactor_solaris.mp3");
}

function setup() {
  createCanvas(2000, 2000, WEBGL);
  prev = createGraphics(width, height, WEBGL);
  interim = createGraphics(width, height, WEBGL);
  maskedInterim = createGraphics(width, height);
  next = createGraphics(width, height, WEBGL);
  next.imageMode(CENTER);
  prev.imageMode(CENTER);
  interim.imageMode(CENTER);
  imageMode(CENTER);
  frameRate(fps);
  savedTime = millis();
  setupVideo();
}

function setupVideo() {
  // Setup for video recording
  let stream = canvas.captureStream(fps); // Adjust the frame rate as needed
  let options = {
    mimeType: "video/webm; codecs=vp9",
    videoBitsPerSecond: 10000000, // Adjust this value for bitrate
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

function deltaMouse() {
  deltaMousePos[0] += mouseX - prevMousePos[0];
  deltaMousePos[1] += mouseY - prevMousePos[1];
  deltaMousePos[0] *= smoothingFactor;
  deltaMousePos[1] *= smoothingFactor;
}

function drawInterim() {
  interim.clear();
  interim.background(0);

  // Draw previous frame with transformations
  interim.rotate(0.0015);
  interim.push();
  interim.scale(0.97);
  interim.translate(deltaMousePos[0], deltaMousePos[1], 0);
  interim.image(prev, 0, 0);
  interim.pop();

  // Draw shader contents
  interim.shader(theShader);
  theShader.setUniform("circleRadius", circleRadius / width);
  interim.rect(0, 0, 100, 100);
  interim.resetShader();
}

function drawNext() {
  next.clear();
  next.background(0);
  next.push();
  next.scale((circleRadius * 2) / width);
  next.rotate(0.2 + frameCount * 0.05);
  next.image(interim, 0, 0);
  next.pop();

  maskedInterim.clear();
  maskedInterim.image(interim, 0, 0);
  maskedInterim.erase();
  maskedInterim.circle(width / 2, height / 2, circleRadius * 2);
  maskedInterim.noErase();

  next.image(maskedInterim, 0, 0);
}

function draw() {
  circleRadius = circleRadius + Math.sin(frameCount * 0.05) * 10;
  [prev, next] = [next, prev];

  deltaMouse();
  drawInterim();
  drawNext();

  image(next, 0, 0);
  prevMousePos = [mouseX, mouseY];
}

function keyPressed() {
  if (keyCode === 32) {
    // if (!recording) {
    //   mediaRecorder.start();
    //   recording = true;
    // } else {
    //   mediaRecorder.stop();
    //   recording = false;
    // }

    if (song.isPlaying()) {
      song.stop();
      clear();
      prev.clear();
      next.clear();
      interim.clear();
      deltaMousePos = [0, 0];
    } else {
      song.play();
    }
  }

  if (keyCode === ENTER) {
    saveCanvas("savedFrame", "png"); // This saves the current canvas frame as a PNG file
  }
}
