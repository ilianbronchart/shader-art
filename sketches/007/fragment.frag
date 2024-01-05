precision highp float;

varying vec2 vTexCoord;
uniform sampler2D prevFrame;
uniform float time;

float outline(float d, float size, float smoothFactor) {
    float edge1 = -size - smoothFactor;
    float edge2 = -size;
    float edge3 = size;
    float edge4 = size + smoothFactor;
    return min(smoothstep(edge1, edge2, d), smoothstep(edge4, edge3, d));
}

float sdEquilateralTriangle(in vec2 p, in float r) {
    const float k = sqrt(3.0);
    p.x = abs(p.x) - r;
    p.y = p.y + r / k;
    if(p.x + k * p.y > 0.0)
        p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
    p.x -= clamp(p.x, -2.0 * r, 0.0);
    float d = abs(-length(p) * sign(p.y));
    return outline(d - 0.00001 / d, 0.001, 0.003);
}

vec2 rotate(vec2 v, float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, -s, s, c);
    return m * v;
}

void main() {
    vec2 uv = vTexCoord - 0.5;

    // vec2 rotatedUV = rotate(uv, time);

    float t = sdEquilateralTriangle(uv, 0.3);
    vec4 triangleColor = vec4(t);

    // Color mixing
    // vec4 prevColor = texture2D(prevFrame, vTexCoord);
    // gl_FragColor = mix(prevColor, triangleColor, triangleColor.a);

    gl_FragColor = vec4(t, t, t, 0.1);
}
