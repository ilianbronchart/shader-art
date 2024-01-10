import { createGraphics } from "../../custom/utils.js";
import { Midi, Note } from "../../custom/midi.js";

const s = (p) => {
  let layer, prev, next, theShader;
  let fps = 60;
  let width = 1000;
  let height = 1000;

  let paramA = 0;
  let deltaParamA = 0;
  let paramB = 1;
  let nearStars = [];
  let midStars = [];
  let farStars = [];

  let midi = new Midi(p, [
    new Note(0),
    new Note(1),
    new Note(12, { lerpFactor: 0.2 }),
    new Note(20, { lerpFactor: 0.05, isSymmetric: true}),
    new Note(14),
    new Note(15),
    new Note(16),
    new Note(44, { lerpDisabled: true, isBinary: true }),
    new Note(45, { lerpDisabled: true, isBinary: true }),
    new Note(48, { lerpDisabled: true, isBinary: true }),
    new Note(49, { lerpDisabled: true, isBinary: true }),
  ]);

  class Star {
    constructor(depth) {
      this.x = p.random(0, 2);
      this.y = p.random(0, 2);
      this.depth = depth;
      this.speed = p.random(0.01, 0.015);
    }

    toArr() {
      return [this.x, this.y, this.depth];
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
    prev = createGraphics(p, width, height);
    next = createGraphics(p, width, height);

    createStarfield();

    p.noStroke();
    p.frameRate(fps);
  };

  function updateParams() {
    paramB = p.map(midi.get(20), -1.0, 1.0, - 0.86, 4.0);
  }

  function createStarsForLayer(count, depth) {
    let stars = [];
    for (let i = 0; i < count; i++) {
      stars.push(new Star(depth));
    }
    return stars;
  }

  function createStarfield() {
    nearStars = createStarsForLayer(100, 1);
    midStars = createStarsForLayer(200, 2);
    farStars = createStarsForLayer(300, 3);
  }

  function updateStarsForLayer(stars, speedMultiplier) {
    return stars.map(star => {
      star.x = (star.x + star.speed * speedMultiplier) % 1;
      return star;
    });
  }

  function updateStarfield() {
    nearStars = updateStarsForLayer(nearStars, 1);
    midStars = updateStarsForLayer(midStars, 1 / 2);
    farStars = updateStarsForLayer(farStars, 1 / 4);
  }


  p.draw = () => {
    midi.updateValues();
    updateStarfield();
    updateParams();

    [prev, next] = [next, prev];

    let time = (5 * p.frameCount) / fps;
    deltaParamA = paramA - midi.get(12);
    paramA = midi.get(12);

    let stars = nearStars
      .concat(midStars)
      .concat(farStars)
      .map((star) => star.toArr());

    next.clear();
    next.background(0);

    layer.clear();
    layer.shader(theShader);
    theShader.setUniform("time", time);
    theShader.setUniform("resolution", [width, height]);
    theShader.setUniform("prevTexture", prev);
    theShader.setUniform("stars", stars.flat());
    theShader.setUniform("paramA", midi.get(12));
    theShader.setUniform("deltaParamA", 5 * deltaParamA);
    theShader.setUniform("paramB", paramB);
    theShader.setUniform("paramC", midi.get(14));
    theShader.setUniform("paramD", 1 + p.map(midi.get(15), -1.0, 1.0, -2.0, 2.0));
    layer.rect(0, 0, width, height);

    next.image(layer, 0, 0)

    p.image(next, 0, 0);
  };

  p.keyPressed = () => {

  };

  // p.mousePressed = () => {
  //   p.saveCanvas("frame", "png");
  // };
};

new p5(s);
