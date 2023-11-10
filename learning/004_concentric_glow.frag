#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

const float speed = 1.0;
const float period = 8.0;

vec3 palette(float t) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263, 0.416, 0.557);

    return a + b * cos(6.28318 * (c * t + d));
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / u_resolution.y;

    float time = u_time * speed;

    float d = length(uv); // Distance function for a circle
    vec3 col = palette(d + time); // Add gradient to the color and vary with time

    d = sin(d * period + time) / period;
    d = abs(d); // Causes values inside the circle to be positive
    d = 0.02 / d; // Add a glow effect, by making values closer to the center brighter

    col *= d; // Multiply the color by the glow effect

    gl_FragColor = vec4(col, 1.0);
}