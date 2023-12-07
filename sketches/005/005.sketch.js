let pShader;
let distortionShader;

let prev, next;
let dMouse;
let fps = 60;

let midi = new Midi([0, 1, 12, 13, 14, 15, 16, 20]);

let parabolas = [];

class Parabola {
  constructor(k, edge, dx, dy, rotation, midiBindNote) {
    this.k = k;
    this.edge = edge;
    this.dx = dx;
    this.dy = dy;
    this.rotation = rotation;
    this.midiBindNote = midiBindNote;
    midi.register(this.midiBindNote);
    midi.disableLerp(this.midiBindNote);
  }

  updateParameters() {
    print(midi.get(this.midiBindNote));
    if (midi.get(this.midiBindNote) > -1.0) {
      this.rotation += midi.getDelta(12) * 2;
      this.dx += midi.getDelta(13) * 600;
      this.dy -= midi.getDelta(14) * 600;
      this.k += midi.getDelta(16) * 2;

      const infoElement = document.getElementById("info2");
      infoElement.textContent = `new ${this.repr()}`;
    }
  }

  repr() {
    // Round parameters to two decimal places
    let k = this.k.toFixed(2);
    let edge = this.edge.toFixed(2);
    let dx = this.dx.toFixed(2);
    let dy = this.dy.toFixed(2);
    let rotation = this.rotation.toFixed(2);

    return `Parabola(${k}, ${edge}, ${dx}, ${dy}, ${rotation}, ${this.midiBindNote})`;
  }
}

function preload() {
  pShader = loadShader("sketches/005/vertex.vert", "sketches/005/parabola.frag");
  distortionShader = loadShader("sketches/005/vertex.vert", "sketches/005/distortion.frag");
}

function setup() {
  createCanvas(960, 540, WEBGL);
  imageMode(CENTER);
  prev = createGraphics(width, height, WEBGL);
  prev.imageMode(CENTER);
  next = createGraphics(width, height, WEBGL);
  next.imageMode(CENTER);
  offscreen = createGraphics(width, height, WEBGL);
  offscreen.imageMode(CENTER);

  dMouse = createVector(0, 0);
  prevMouse = createVector(mouseX, mouseY);

  frameRate(fps);
  defineParabolas();
}

function defineParabolas() {
  parabolas.push(
    new Parabola(2.01, -0.1, 796.96, 1.65, -6.47, 48),
    new Parabola(4.92, -0.1, 453.68, 277.81, -1.2, 50),
    new Parabola(0.64, -0.1, 91.71, -195.09, -6.36, 52),
    new Parabola(-0.85, -0.1, -395.86, -195.09, -2.13, 53),
    new Parabola(-0.64, -0.1, -630.24, 11.16, -0.61, 55),
    new Parabola(-0.64, -0.1, -630.24, 11.16, -0.61, 57)
  );
}

function calcDeltaMouse() {
  dMouse = createVector(mouseX - width / 2, mouseY - height / 2);
  dMouse.x *= 0.1;
  dMouse.y *= 0.1;
}

function drawParabolas() {
  offscreen.clear();
  offscreen.shader(pShader);

  pShader.setUniform("resolution", [width, height]);
  pShader.setUniform("color", [0.4, 0, 1]);
  pShader.setUniform("pcount", parabolas.length);
  pShader.setUniform(
    "k",
    parabolas.map((p) => p.k)
  );
  pShader.setUniform(
    "edge",
    parabolas.map((p) => p.edge)
  );
  pShader.setUniform(
    "dx",
    parabolas.map((p) => p.dx)
  );
  pShader.setUniform(
    "dy",
    parabolas.map((p) => p.dy)
  );
  pShader.setUniform(
    "rotation",
    parabolas.map((p) => p.rotation)
  );

  offscreen.rectMode(CENTER);
  offscreen.noStroke();
  offscreen.rect(0, 0, width, height);

  next.image(offscreen, 0, 0);
}

function applyDistortion(target, src) {
  offscreen.clear();
  offscreen.shader(distortionShader);
  distortionShader.setUniform("image", src);
  distortionShader.setUniform("resolution", [width, height]);
  offscreen.rectMode(CENTER);
  offscreen.noStroke();
  offscreen.rect(0, 0, width, height);

  target.image(offscreen, 0, 0);
}

function draw() {
  // if (!drawNextFrame) {
  //   return;
  // }

  calcDeltaMouse();
  midi.updateValues();
  parabolas.forEach((p) => p.updateParameters());

  [prev, next] = [next, prev];

  next.clear();
  next.background(0);

  next.push();
  next.rotate((dMouse.x / width) * 10);
  next.scale(0.9);
  next.translate(dMouse.x, dMouse.y);
  next.image(prev, 0, 0);
  next.pop();

  drawParabolas();

  image(next, 0, 0);

  prevMouse = createVector(mouseX, mouseY);
  drawNextFrame = false;
}

function keyPressed() {
  // When any key is pressed, set drawNextFrame to true
  drawNextFrame = true;
}
