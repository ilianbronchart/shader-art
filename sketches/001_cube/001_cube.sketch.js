let cubeShader;

function preload() {
  // Load the shader
  cubeShader = loadShader(
    "sketches/001_test/vertex.vert",
    "sketches/001_test/fragment.frag"
  );
}

class Cube {
  constructor(size) {
    this.size = size;
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationZ = 0;
    this.position = createVector(0, 0, 0);
  }

  setPosition(x, y, z) {
    this.position.set(x, y, z);
  }

  setRotation(x, y, z) {
    this.rotationX = x;
    this.rotationY = y;
    this.rotationZ = z;
  }

  rotate(x, y, z) {
    this.rotationX += x;
    this.rotationY += y;
    this.rotationZ += z;
  }

  draw(shader) {
    push(); // Save the current state of transformations
    translate(this.position.x, this.position.y, this.position.z);
    rotateX(this.rotationX);
    rotateY(this.rotationY);
    rotateZ(this.rotationZ);
    shader(shader); // Set the shader for this object
    box(this.size); // Draw the cube with the current transformations
    pop(); // Restore the state
  }
}

function setup() {
  createCanvas(600, 600, WEBGL);
  shader(cubeShader);
  noStroke();
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  myCube = new Cube(200);
}

function draw() {
  background(0);
  myCube.rotate(0.01, 0.01, 0);
  myCube.draw(cubeShader);
}