export class Mask {
  constructor(p, width, height) {
    this.p = p;
    this.width = width;
    this.height = height;

    this.graphics = p.createGraphics(width, height, p.WEBGL);
    this.graphics.imageMode(p.CENTER);
    this.graphics.rectMode(p.CENTER);

    this.applyLayer = p.createGraphics(width, height, p.WEBGL);
    this.applyLayer.imageMode(p.CENTER);
    this.applyLayer.rectMode(p.CENTER);

    this.maskShader = p.loadShader("shaders/common/vertex.vert", "shaders/common/mask.frag");

    this.threshold = 0.5;
  }

  setThreshold(value) {
    this.threshold = value;
  }

  applyTo(source) {
    this.applyLayer.clear();
    this.applyLayer.shader(this.maskShader);

    this.maskShader.setUniform("src", source);
    this.maskShader.setUniform("mask", this.graphics);
    this.maskShader.setUniform("threshold", this.threshold);

    this.applyLayer.noStroke();
    this.applyLayer.rect(0, 0, this.width, this.height);

    return this.applyLayer;
  }
}
