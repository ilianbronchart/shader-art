#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTexCoord;
uniform sampler2D image;

uniform vec2 resolution;

float smoothSquare(float x) {
    float delta = 0.04;
    float k = 0.5;
    float w = fract(x);
    return smoothstep(k - delta, k, w) *
        (1. - smoothstep(k, k + delta, w));
}

float lattice(vec2 p) {
    return smoothSquare(p.x) + smoothSquare(p.y);
}

mat2 rotate2d(float alpha) {
    return mat2(cos(alpha), -sin(alpha), sin(alpha), cos(alpha));
}

vec2 warp(vec2 p) {
    float t = 0.001;
    float r = length(p);
    float alpha = t * r;
    return rotate2d(alpha) * p;
}

void main() {
    float aspectRatio = resolution.x / resolution.y;
    vec2 uv = (vTexCoord - 0.5) * vec2(aspectRatio, 1.0);
    uv *= 2.0;

    // Apply warp function to UV coordinates
    vec2 warpedUV = warp(uv);

    // Clamp the coordinates to the 0.0 to 1.0 range
    warpedUV = clamp(warpedUV, 0.0, 1.0);

    // Sample the texture with the warped coordinates
    vec4 texColor = texture2D(image, warpedUV);

    // Use texColor as output
    gl_FragColor = texColor;
}