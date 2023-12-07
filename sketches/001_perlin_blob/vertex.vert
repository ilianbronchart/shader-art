#ifdef GL_ES
precision mediump float;
#endif

// A basic vertex shader
attribute vec3 aPosition;

void main() {
    vec4 pos4 = vec4(aPosition, 1.0);

    gl_Position = pos4;
}