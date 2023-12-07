#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
uniform float circleRadius;

float circle(vec2 uv, float radius, float thickness) {
    float d = length(uv) - radius; // Signed distance function of a circle
    d = abs(d); // Makes the inside and outside of the circle a gradient from 0 to 1
    return thickness / d;
}

float sdBox(in vec2 p, in vec2 b, float thickness) {
    vec2 d = abs(p) - b;
    float len = abs(length(max(d, 0.0)) + min(max(d.x, d.y), 0.0));
    return len;
}

vec3 palette(float t) {
    vec3 a = vec3(0.878, -3.202, 0.658);
    vec3 b = vec3(0.558, 0.500, -0.602);
    vec3 c = vec3(0.498, 0.988, 0.138);
    vec3 d = vec3(-0.112, 0.428, 0.158);

    return a + b * cos(6.28318 * (c * t + d));
}

void main() {
    vec2 uv = vTexCoord;
    
    vec3 red = palette(uv.x *4.0); 

    float c = 0.0; //circle(uv, circleRadius, 0.002);
    float r = sdBox(uv, vec2(0.496, 0.3), 0.002);
    float d = max(c, r);

    vec3 finalColor = vec3(0);
    finalColor = max(finalColor, red * d);

    gl_FragColor = vec4(finalColor, d);
}