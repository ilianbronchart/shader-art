let theShader;

function preload() {
  // Load the shader
  theShader = loadShader(
    "sketches/002_mandelbrot_mix/vertex.vert",
    "sketches/002_mandelbrot_mix/fragment.frag"
  );
}

function setup() {
  createCanvas(500, 500, WEBGL);
  noStroke();
}

function draw() {
  background(0);
  shader(theShader);
  rect(0, 0, width, height)
}
