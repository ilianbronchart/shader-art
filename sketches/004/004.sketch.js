let lineShader;
let maskShader;

let prev, next, offscreen, maskGraphics;
let fps = 60;
let dMouse;
let prevMouse;
let drawNextFrame = false;
let parallelHeight = 450;
let parallelWidth = 800;
let bgColor;

let midiValues = {
  20: 0,
  1: 0,
  0: 0,
  12: 0,
};

let targetMidiValues = {
  20: 0,
  1: 0,
  0: 0,
  12: 0,
};

function preload() {
  lineShader = loadShader("sketches/004/vertex.vert", "sketches/004/line.frag");
  maskShader = loadShader("sketches/004/vertex.vert", "sketches/004/mask.frag");
}

function setup() {
  createCanvas(1000, 600, WEBGL);
  prev = createGraphics(width, height, WEBGL);
  prev.imageMode(CENTER);
  next = createGraphics(width, height, WEBGL);
  next.imageMode(CENTER);

  offscreen = createGraphics(width, height, WEBGL);
  offscreen.imageMode(CENTER);
  maskGraphics = createGraphics(width, height);
  maskGraphics.imageMode(CENTER);
  maskTarget = createGraphics(width, height, WEBGL);
  maskTarget.imageMode(CENTER);
  imageMode(CENTER);

  dMouse = createVector(0, 0);
  prevMouse = createVector(mouseX, mouseY);
  bgColor = color(5, 13, 43);

  frameRate(fps);

  setupMidi();
}

function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

function updateMidiValues() {
  for (let note in midiValues) {
    midiValues[note] = lerp(midiValues[note], targetMidiValues[note], 0.1);
  }
}

function setupMidi() {
  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

    function onMIDISuccess(midiAccess) {
      for (let input of midiAccess.inputs.values()) {
        input.onmidimessage = getMIDIMessage;
      }
    }

    function onMIDIFailure() {
      console.error("Could not access MIDI devices.");
    }

    function getMIDIMessage(midiMessage) {
      let command = midiMessage.data[0];
      let note = midiMessage.data[1];
      let velocity = midiMessage.data.length > 2 ? midiMessage.data[2] : 0;

      // Now you can use these MIDI values to interact with your p5.js sketch
      targetMidiValues[note] = ((velocity - 64) / 128) * 2;
      print(note);
    }
  } else {
    console.error("Web MIDI API not supported in this browser.");
  }
}

function applyMask(target, src, mask) {
  target.shader(maskShader);
  maskShader.setUniform("texture0", src);
  maskShader.setUniform("mask", mask);
  target.rect();
  target.resetShader();
}

function drawLine(target, p1, p2, thick) {
  target.push();
  target.shader(lineShader);
  lineShader.setUniform("resolution", [width, height]);
  lineShader.setUniform("p1", [p1.x, p1.y]);
  lineShader.setUniform("p2", [p2.x, p2.y]);
  lineShader.setUniform("thick", thick);
  lineShader.setUniform("time", millis() / 1000.0);
  target.noStroke();
  target.rectMode(CENTER);
  target.rect(0, 0, width, height);
  target.resetShader();
  target.pop();
}

function drawParallels(target, w, h, thick) {
  offscreen.clear();

  let y1 = -h / 2;
  let y2 = h / 2;
  drawLine(offscreen, createVector(-w / 2, y1), createVector(w / 2, y1), thick);
  drawLine(offscreen, createVector(-w / 2, y2), createVector(w / 2, y2), thick);

  // offscreen.fill(bgColor);
  // offscreen.noStroke();
  // // offscreen.fill(255)
  // offscreen.rectMode(CENTER);
  // offscreen.rect(0, -h, w, h - thick)
  // offscreen.rect(0, h, w, h - thick)

  target.image(offscreen, 0, 0);
}

function calcDeltaMouse() {
  dMouse = createVector(mouseX - width / 2, mouseY - height / 2);
  dMouse.x *= 0.1;
  dMouse.y *= 0.1;
}

function draw() {
  // if (!drawNextFrame) {
  //   return;
  // }

  calcDeltaMouse();
  updateMidiValues();

  [prev, next] = [next, prev];

  next.clear();
  next.background(bgColor);

  next.push();
  next.rotate(Math.PI * midiValues[20]);
  print(0.95 + 0.05 * midiValues[1], 0.3 * midiValues[1]);
  next.scale(0.89 + 0.06 * midiValues[1]);
  next.image(prev, 0, 0);
  next.pop();

  next.rotate(0.05 * midiValues[12]);
  next.push();
  drawParallels(next, parallelWidth, parallelHeight, 5);
  next.pop();

  image(next, 0, 0);

  prevMouse = createVector(mouseX, mouseY);
  drawNextFrame = false;
}

function keyPressed() {
  // When any key is pressed, set drawNextFrame to true
  drawNextFrame = true;
}
