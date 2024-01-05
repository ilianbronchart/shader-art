#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTexCoord;

uniform float time;
uniform float paramA;
uniform float paramB;
uniform float paramC;
uniform float paramD;

float pixelation = 80.0;

float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

float modifiedCircle(vec2 p, float r) {
    float d = length(p) - r;
    d = 1.0 - d;
    return pow(d, 20.0);
}

void main() {
    vec2 uv = vTexCoord - 0.5;

    float c = modifiedCircle(uv, 0.25);

    uv = fract(uv * pixelation) - 0.5;
    float dots = sdCircle(uv, c * 0.7);
    dots = 1.0 - smoothstep(0.0, 0.01, dots);

    dots = pow(dots + 0.5, 1.0);
    gl_FragColor = vec4(dots * c);
}