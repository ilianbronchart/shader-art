#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTexCoord;

const int MAX_SPOTS = 10;

uniform float time;
uniform vec4 spots[MAX_SPOTS];

uniform float paramA;
uniform float paramB;
uniform float paramC;
uniform float paramD;
float PI = 3.1415926535897932384626433832795;

float f(float x) {
    return exp(-pow(paramA * x, 2.0));
}

float g(float x, float angle) {
    float angleMod = cos(paramC * angle);
    float COS = cos(paramB * angleMod * pow(x, 2.0) - time) * 0.5 + 0.5;
    return (COS + f(x)) * f(x) / 2.0;
}

float wave(vec2 p) {
    float d = length(p);
    float angle = atan(p.y, p.x);
    float val = g(d, angle) / pow(d, 0.5);
    return val; 
}

vec2 rotate(vec2 v, float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, -s, s, c);
    return m * v;
}

float sdCircle(vec2 p, float r) {
    float angle = atan(p.y, p.x);
    float modifier = cos(paramD * angle);
    float d = abs(length(p * modifier) - r);

    return 0.0005 / d;
}

void main() {
    vec2 uv = vTexCoord - 0.5;

    float d = 0.0;
    for (int i = 0; i < MAX_SPOTS; i++) {
        vec4 spot = spots[i];
        if (spot.x == 0.0 && spot.y == 0.0) break;

        float angle = atan(spot.w, spot.z) + PI / 2.0;
        vec2 transformedUV = rotate(uv, angle) - spot.xy;

        d = max(d, wave(transformedUV));
    }

    float pixelation = 10.0;
    uv = fract(uv * pixelation) - 0.5;  
    
    float dots = sdCircle(uv, min(d * 0.1, 0.35));
    dots = smoothstep(0.0, 0.015, dots);
    d = d * 0.4 * dots + d * 0.25;

    vec4 bgColor = vec4(0, 0, 0, 1.0);
    vec4 spotColor = vec4(0.24, 0.09, 0.65, d);

    gl_FragColor = mix(bgColor, spotColor, spotColor.a);
}