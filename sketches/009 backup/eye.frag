#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTexCoord;

#define MAX_STARS 1000

uniform float time;
uniform vec2 resolution;
uniform sampler2D prevTexture;
uniform vec3 stars[MAX_STARS];
uniform float paramA;
uniform float deltaParamA;
uniform float paramB;
uniform float paramC;
uniform float paramD;

const float PI = 3.1415926535897932384626433832795;
const vec4 bgColor = vec4(0.0, 0.0, 0.0, 1.0);
const vec4 colorA = vec4(0.21, 0.08, 1.0, 1.0);
const vec4 colorB = vec4(0.95, 0.44, 0.2, 1.0);

float gaussian(float x, float xScale) {
    return exp(-pow(x / xScale, 2.0));
}

float eyeOpenness() {
    return pow(paramA, 5.0);
}

float f(float x, float hScale) {
    float mult =  PI / 2.0;
    float bound = PI / (mult * paramA);

    if (-bound <= x && x <= bound) {
        return eyeOpenness() * (cos(paramA * mult * x) * 0.5 + 0.5) * hScale;
    }

    return 0.0;
}

float g(float x) {
    return exp(-pow(paramB * x, 2.0));
}

float wave(vec2 p) {
    float d = length(p) - paramB;
    float period = 20.0 * pow(paramA, 2.0);
    float COS = cos(period * d - time + deltaParamA) * 0.5 + 0.5;
    float hVal = (COS + g(d)) * g(d) * 0.5;
    return hVal;
}

vec4 drawStars(vec2 p, float waveVal) {
    vec2 dir = -normalize(p);
    p += dir * waveVal * 0.21 * eyeOpenness(); 

    float starVal = 0.0;
    for(int i = 0; i < MAX_STARS; i++) {
        vec3 star = stars[i];
        star.xy -= 0.5;
        if(star.z == 0.0) break;

        float d = length(p - star.xy);
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

vec4 getPrevColor(float finalScale) {
    float fbScale = paramB / finalScale;

    vec2 scaledSize = vec2(fbScale);
    vec2 offsetCoords = vTexCoord - 0.5;
    offsetCoords.x *= -1.0;

    float maskX = step(-scaledSize.x, offsetCoords.x) * step(offsetCoords.x, scaledSize.x);
    float maskY = step(-scaledSize.y, offsetCoords.y) * step(offsetCoords.y, scaledSize.y);

    if(maskX * maskY > 0.0) {
        vec2 adjustedCoords = (offsetCoords + scaledSize) / fbScale / 2.0;
        return texture2D(prevTexture, adjustedCoords);
    }

    return vec4(0.0, 0.0, 0.0, 0.0);
}

vec4 halfEye(vec2 p, float finalScale, float waveVal) {
    if (p.y <= 0.0) return vec4(0.0);
    
    float fVal = f(p.x, 0.93);
    float waveEffect = waveVal * 0.2 * paramA;
    float innerEdge = fVal + waveEffect;

    if(p.y <= innerEdge) {
        float eyelidDist = smoothstep(0.01, 0.0, innerEdge - p.y);

        float d = length(p) - paramB;
        if(d < 0.0) {
            // Inside the circle
            waveVal = smoothstep(-0.01, 0.0, d) * waveVal;
            vec4 eyeColor = getEyeColor(waveVal, eyelidDist);
            vec4 prevColor = getPrevColor(finalScale);
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

vec4 eye(vec2 p, float scale) {
    float finalScale = 3.0 / scale;
    vec2 pScaled = p * finalScale;
    float waveVal = wave(pScaled);
    
    vec4 starColor = drawStars(p, waveVal);
    
    vec4 upperHalf = halfEye(pScaled, finalScale ,waveVal);
    vec4 lowerHalf = halfEye(vec2(pScaled.x, -pScaled.y), finalScale, waveVal);

    vec4 eyeColor = upperHalf + lowerHalf;
    return mix(starColor, eyeColor, eyeColor.a);
}

void main() {
    vec2 uv = vTexCoord - 0.5;
    float aspect = resolution.x / resolution.y;
    uv.x *= aspect;

    for(int i = 0; i < 10000; i++) {
        vec4 testEye = eye(uv, 1.0);
    }

    gl_FragColor = eye(uv, 0.6 * paramD);
}