let theShader;

function preload() {
  // Load the shader
  theShader = loadShader(
    "sketches/001_perlin_blob/vertex.vert",
    "sketches/001_perlin_blob/fragment.frag"
  );
}

function setup() {
  createCanvas(500, 500, WEBGL);
  noStroke();
}

function draw() {
  background(0);
  shader(theShader);
  rect(0, 0, width, height);
}
