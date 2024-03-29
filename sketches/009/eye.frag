#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTexCoord;

#define MAX_STARS 700
#define MAX_ITERATIONS 300

uniform float time;
uniform vec2 resolution;
uniform vec2 stars[MAX_STARS];
uniform float eyeOpen;
uniform float deltaEyeOpen;
uniform float circleSize;
uniform float iterationScales[MAX_ITERATIONS];
uniform int numIterations;

const float PI = 3.1415926535897932384626433832795;
const vec4 bgColor = vec4(0.0, 0.0, 0.0, 1.0);
const vec4 colorA = vec4(0.21, 0.08, 1.0, 1.0);
const vec4 colorB = vec4(0.95, 0.44, 0.2, 1.0);

float gaussian(float x, float xScale) {
    return exp(-pow(x / xScale, 2.0));
}

float eyeOpenness() {
    return pow(eyeOpen, 5.0);
}

float f(float x, float hScale) {
    float mult =  PI / 2.0;
    float bound = PI / (mult * eyeOpen);

    if (-bound <= x && x <= bound) {
        return eyeOpenness() * (cos(eyeOpen * mult * x) * 0.5 + 0.5) * hScale;
    }

    return 0.0;
}

float g(float x) {
    return exp(-pow(circleSize * x, 2.0));
}

float wave(vec2 p) {
    float d = length(p) - circleSize;
    float period = 20.0 * pow(eyeOpen, 2.0);
    float COS = cos(period * d - time + deltaEyeOpen) * 0.5 + 0.5;
    float hVal = (COS + g(d)) * g(d) * 0.5;
    return hVal;
}

vec4 drawStars(vec2 p, float waveVal) {
    vec2 dir = -normalize(p);
    p += dir * waveVal * 0.21 * eyeOpenness(); 

    float starVal = 0.0;
    for(int i = 0; i < MAX_STARS; i++) {
        if (stars[i].x == 0.0) break;
        float d = length(p - stars[i] + 0.5);
        starVal = max(starVal, (0.001) / d);
    }

    return vec4(vec3(starVal), 1.0);
}

vec4 getEyeColor(float waveVal, float eyelidDist) {
    vec4 eyeColor = mix(colorA, colorB, waveVal);
    vec4 eyelidColor = mix(colorA, colorB, eyelidDist);
    vec4 finalColor = mix(bgColor, eyeColor, waveVal);
    finalColor = mix(finalColor, eyelidColor, eyelidDist); 
    return finalColor;
}

vec4 halfEye(vec2 p, float waveVal, vec4 prevColor) {    
    float fVal = f(p.x, 0.93);
    float waveEffect = waveVal * 0.15 * eyeOpenness();
    float innerEdge = fVal + waveEffect;

    if(p.y <= innerEdge) {
        float eyelidDist = smoothstep(0.05, 0.0, innerEdge - p.y);

        float d = length(p) - circleSize;
        if(d < 0.0) {
            // Inside the circle
            waveVal = smoothstep(-0.01, 0.0, d) * waveVal;
            vec4 eyeColor = getEyeColor(waveVal, eyelidDist);
            return mix(prevColor, eyeColor, max(waveVal,eyelidDist));
        }
        
        return getEyeColor(waveVal, eyelidDist);
    }

    if(p.y > innerEdge || p.y < 0.0) {
        // Eyelid
        float outerEdge = 0.3 * gaussian(p.x, 2.3);
        float eyelidDist = (max(fVal + outerEdge + waveEffect - p.y, 0.0)) / (outerEdge) + 0.01;
        vec4 eyeColor = getEyeColor(0.0, eyelidDist);
        return vec4(eyeColor.rgb, eyelidDist) * (pow(eyelidDist, 1.0));
    }

    return vec4(0.0);
}

vec4 eye(vec2 p, float scale, vec4 prevColor) {
    float finalScale = 3.0 / scale;
    vec2 pScaled = p * finalScale;
    float waveVal = wave(pScaled);

    vec4 starColor = drawStars(p, waveVal);
    vec4 eyeColor = halfEye(vec2(pScaled.x, abs(pScaled.y)), waveVal, prevColor);

    return mix(starColor, eyeColor, eyeColor.a);
}

vec2 rotate(vec2 p, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    mat2 m = mat2(c, -s, s, c);
    return m * p;
}

void main() {
    vec2 uv = vTexCoord - 0.5;
    float aspect = resolution.x / resolution.y;
    uv.x *= aspect;

    vec4 prevColor = vec4(0.0, 0.0, 0.0, 1.0);
    for(int i = 0; i < MAX_ITERATIONS; i++) {
        float scale = iterationScales[i];
        if(scale < 0.0001) break;

        // Calculate rotation based on scale
        // float rotationAngle = scale * PI; // Example linear mapping

        // uv = rotate(uv, rotationAngle);

        vec4 eyeColor = eye(uv, scale, prevColor);
        prevColor = mix(prevColor, eyeColor, 1.0);
    }

    gl_FragColor = prevColor;
}