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
    vec2 uv0 = uv;
    vec3 finalColor = vec3(0.0);

    for(float i = 0.0; i < 3.0; i++) {
        uv = fract(uv * 1.5) - 0.5;

        float d = length(uv); // Distance function for a circle

        d *= exp(-length(uv0));

        vec3 col = palette(length(uv0) + i * .4 + u_time * .4);  // Add gradient to the color and vary with time

        d = sin(d * period + u_time) / period;

        d = abs(d);

        d = pow(0.005 / d, 1.2); // Increase contrast

        finalColor += col * d;
    }

    gl_FragColor = vec4(finalColor, 1.0);
}