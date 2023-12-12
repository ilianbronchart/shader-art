#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / u_resolution.y;

    float speed = 2.0;
    float thickness = 0.06;
    float period = 10.0;

    float d = length(uv); // Distance function for a circle
    d = sin(d * period + u_time * speed) / period;
    d = abs(d); // Causes values inside the circle to be positive

    d = 1.0 - smoothstep(0.0, thickness, d);

    gl_FragColor = vec4(d, d, d, 1.0);
}