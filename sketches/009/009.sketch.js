import { createGraphics } from "../../custom/utils.js";
import { Midi, Note } from "../../custom/midi.js";

const s = (p) => {
  let layer, theShader;
  let fps = 60;

  let width = 800;
  let height = 800;

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
    new Note(48, { lerpDisabled: true, isBinary: true }),
    new Note(49, { lerpDisabled: true, isBinary: true }),
  ]);

  p.preload = () => {
    theShader = p.loadShader("sketches/009/vertex.vert", "sketches/009/fragment.frag");
  };

  p.setup = () => {
    p.createCanvas(width, height, p.WEBGL);
    p.imageMode(p.CENTER);
    p.rectMode(p.CENTER);

    layer = createGraphics(p, width, height);

    p.noStroke();
  };

  p.draw = () => {
    midi.updateValues();

    let time = (5 * p.frameCount) / fps;

    layer.clear();
    layer.background(0);
    layer.shader(theShader);
    theShader.setUniform("time", time);
    theShader.setUniform("paramA", midi.get(12));
    theShader.setUniform("paramB", midi.get(13));
    theShader.setUniform("paramC", midi.get(14));
    theShader.setUniform("paramD", midi.get(15));
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
