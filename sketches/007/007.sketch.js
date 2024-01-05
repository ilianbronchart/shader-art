const s = (p) => {
  let layer, fogShader, fog;
  let noiseTexture;
  let fps = 60;

  p.preload = () => {
    fogShader = p.loadShader("sketches/007/vertex.vert", "sketches/007/fragment.frag");
  };

  p.setup = () => {
    p.createCanvas(710, 710, p.WEBGL);
    layer = p.createFramebuffer();
    p.rectMode(p.CENTER);
    fog = p.color("#b2bdcf");
    p.noStroke();
    noiseTexture = p.loadImage("sketches/007/square.png");
  };

  p.draw = () => {
    // Draw a scene to a framebuffer
    layer.begin();
    p.clear();
    p.image(noiseTexture, -p.width / 2, -p.height / 2);
    layer.end();

    // Apply fog to the scene
    p.shader(fogShader);
    fogShader.setUniform("fog", [p.red(fog), p.green(fog), p.blue(fog)]);
    fogShader.setUniform("prevFrame", layer.color);
    fogShader.setUniform("time", p.frameCount / fps);
    p.rect(0, 0, p.width, p.height);
  };
};

new p5(s);
