#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

float circle_shape(vec2 uv, float radius) {
    // This actually uses the signed distance function of a circle
    // The signed distance function is positive outside the circle, negative inside the circle, and 0 on the circle
    // This means that the inside and outside of the circle is a gradient from 0 to 1 when we omit the step function and take the absolute value of the result
    return step(length(uv), radius);
}

float circle_thick(vec2 uv, float radius, float thickness) {
    float d = length(uv) - radius; // Signed distance function of a circle
    d = abs(d); // Makes the inside and outside of the circle a gradient from 0 to 1
    return 1.0 - step(thickness, d);
}

float circle_smooth(vec2 uv, float radius, float thickness) {
    float d = length(uv) - radius; // Signed distance function of a circle
    d = abs(d); // Makes the inside and outside of the circle a gradient from 0 to 1
    return 1.0 - smoothstep(thickness, 0.1, d);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution; // gives us a value from (0, 0) to (1, 1)
    uv -= vec2(0.5); // makes it so that the center of the screen is (0, 0)
    uv *= 2.0; // makes it so that the screen is (-1, -1) to (1, 1)
    uv *= u_resolution.x / u_resolution.y; // corrects the aspect ratio

    // Condensed to a single line, it'll look like this:
    uv = (gl_FragCoord.xy * 2.0 - u_resolution) / u_resolution.y;

    vec3 col = vec3(0.0);

    float circle = circle_shape(uv, 0.5);
    float circle_thick = circle_thick(uv, 0.7, 0.03);
    float circle_smooth = circle_smooth(uv, 0.9, 0.003);

    col = vec3(circle);
    col += vec3(circle_thick);
    col += vec3(circle_smooth);

    gl_FragColor = vec4(col, 1.0);
}
