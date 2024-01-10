import { createGraphics } from "../../custom/utils.js";
import { Midi, Note } from "../../custom/midi.js";

const s = (p) => {
  let layer, starTexture, theShader;
  let fps = 60;
  let width = 1000;
  let height = 1000;

  let baseScale = 0.6;
  let scaleFactor = 0.5;
  let eyeOpen = 0;
  let deltaEyeOpen = 0;
  let circleSize = 1;
  let nearStars = [];
  let midStars = [];
  let farStars = [];
  let zoomSpeed = 0;
  let time = 0;
  let lastTime = 0
  let deltaTime = 0;
  let numIterations = 0;

  let midi = new Midi(p, [
    new Note(0, { isSymmetric: true, lerpFactor: 0.05 }),
    new Note(1, { lerpFactor: 0.05 }),
    new Note(12, { lerpFactor: 0.05 }),
    new Note(20, { lerpFactor: 0.05 }),
    new Note(14),
    new Note(15),
    new Note(16),
    new Note(44, { lerpDisabled: true, isBinary: true }),
    new Note(45, { lerpDisabled: true, isBinary: true }),
    new Note(48, { lerpDisabled: true, isBinary: true }),
    new Note(49, { lerpDisabled: true, isBinary: true }),
  ]);

  class Star {
    constructor() {
      this.x = p.random(0, 1.5);
      this.y = p.random(0, 1.5);
      this.speed = p.random(0.5, 0.5);
    }

    toArr() {
      return [this.x, this.y];
    }
  }

  p.preload = () => {
    theShader = p.loadShader("sketches/009/vertex.vert", "sketches/009/eye.frag");
  };

  p.setup = () => {
    p.createCanvas(width, height, p.WEBGL);
    p.imageMode(p.CENTER);
    p.rectMode(p.CENTER);

    layer = createGraphics(p, width, height, p.WEBGL);
    starTexture = p.createGraphics(32, 32); 

    createStarfield();

    p.noStroke();
    p.frameRate(100);
  };

  function updateParams() {
    let currentTime = p.millis();
    deltaTime = (currentTime - lastTime) / 1000.0; // Convert milliseconds to seconds
    lastTime = currentTime;
    time += deltaTime;

    deltaEyeOpen = eyeOpen - midi.get(12);
    eyeOpen = midi.get(12);

    circleSize = p.map(midi.get(20), 0.0, 1.0, -0.86, 1.3);
    
    zoomSpeed = p.map(midi.get(0), -1.0, 1.0, -0.1, 0.1)
    zoomSpeed = Math.abs(midi.get(0)) < 0.001 ? 0 : zoomSpeed;
 
    baseScale = Math.max(0.6, baseScale * (1 + zoomSpeed * deltaTime * 50));
    scaleFactor = 0.3 + midi.get(1) * 0.5;
  }

  function createStarsForLayer(count) {
    let stars = [];
    for (let i = 0; i < count; i++) {
      stars.push(new Star());
    }
    return stars;
  }

  function createStarfield() {
    nearStars = createStarsForLayer(100);
    midStars = createStarsForLayer(200);
    farStars = createStarsForLayer(300);
  }

  function updateStarsForLayer(stars, speedMultiplier) {
    return stars.map(star => {
      star.x = (star.x + star.speed * speedMultiplier * deltaTime) % 1.5;
      return star;
    });
  }

  function updateStarfield() {
    nearStars = updateStarsForLayer(nearStars, 1);
    midStars = updateStarsForLayer(midStars, 1 / 2);
    farStars = updateStarsForLayer(farStars, 1 / 4);
  }

  function calculateIterationScales() {
    // Calculate minimum iterations so that the scale is smaller than 0.01
    numIterations = Math.ceil(Math.log(0.01 / baseScale) / Math.log(scaleFactor));
    numIterations = Math.min(numIterations, 1000);

    let iterationScales = Array(300).fill(0);
    for (let i = 1; i <= numIterations; i++) {
      let scale = baseScale * Math.pow(scaleFactor, numIterations - i);
      if (scale < 10) {
        iterationScales[i-1] = scale;
      }
    }

    return iterationScales;
  }

  p.draw = () => {
    midi.updateValues();
    updateParams();
    updateStarfield();

    layer.clear();
    layer.shader(theShader);
    theShader.setUniform("time",  time * 7);
    theShader.setUniform("resolution", [width, height]);
    theShader.setUniform(
      "stars",
      nearStars
        .concat(midStars)
        .concat(farStars)
        .map((star) => star.toArr())
        .flat()
    );
    theShader.setUniform("eyeOpen", eyeOpen);
    theShader.setUniform("deltaEyeOpen", 100 * deltaEyeOpen);
    theShader.setUniform("circleSize", circleSize);
    theShader.setUniform("iterationScales", calculateIterationScales());
    theShader.setUniform("numIterations", numIterations);
    layer.rect(0, 0, width, height);

    p.image(layer, 0, 0);
  };

  p.keyPressed = () => {

  };

  // p.mousePressed = () => {
  //   p.saveCanvas("frame", "png");
  // };
};

new p5(s);
