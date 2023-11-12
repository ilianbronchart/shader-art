#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
const float speed = 1.0;
const float period = 20.0;

float sdOrientedBox(in vec2 p, in vec2 a, in vec2 b, float th, float angle) {
    float l = length(b - a);
    vec2 d = (b - a) / l;

    // Create a rotation matrix based on the angle
    mat2 rotationMatrix = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));

    // Rotate the direction vector
    d = rotationMatrix * d;

    vec2 q = (p - (a + b) * 0.5);

    // Apply the rotation to the point 'p' relative to the box center
    q = mat2(d.x, -d.y, d.y, d.x) * q;
    q = abs(q) - vec2(l, th) * 0.5;

    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

float sdBox(in vec2 p, in vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float glow(float d) {
    return 0.002 / abs(d);
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / u_resolution.y;

    float angle = u_time * speed;

    float dRect = sdOrientedBox(uv, vec2(-0.5, -0.5), vec2(0.5, 0.5), 0.5, angle);
    float dSquare = sdBox(uv, vec2(0.5, 0.5));

    float d = max(-dRect, -dSquare);
    d = glow(d);

    vec3 finalColor = vec3(0.0);
    finalColor = vec3(d);

    gl_FragColor = vec4(finalColor, 1.0);
}
