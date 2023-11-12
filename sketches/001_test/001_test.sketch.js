let theShader;

function preload() {
  // Load the shader
  basicShader = loadShader(
    "sketches/001_test/vertex.vert",
    "sketches/001_test/fragment.frag"
  );
}

function setup() {
  createCanvas(1000, 1000, WEBGL);
  basicShader.setUniform("u_resolution", [width, height]);
  shader(basicShader);
  noStroke();
}

function draw() {
  background(0);

  rect(0, 0, width, height);
}
