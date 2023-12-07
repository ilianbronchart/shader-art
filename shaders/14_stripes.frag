#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

float stripes(vec2 uv) {
    return step(0.5, fract(uv.x * 15.0));
}

float square(vec2 uv, vec2 size) {
    vec2 p = abs(uv) - size;
    return step(max(p.x, p.y), 0.0);
}

vec2 rotate(vec2 v, float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, s, -s, c);
    return m * v;
}

vec4 stripedSquares(vec2 uv, float scale) {
    uv *= scale;
    float scaler = -pow((fract(u_time * 0.5) * 2.0 - 1.0), 2.0) + 1.0;
    scaler = max(scaler, 0.0);

    vec4 c1 = vec4(0.25, 0.46, 0.9, 1.0);
    vec4 c2 = vec4(0.93, 0.61, 0.18, 0.9);
    vec4 c3 = vec4(0.74, 0.16, 0.40, 0.9);

    float speed = 3.0;
    float angle = u_time * speed;
    vec2 uv1 = rotate(uv, angle * 0.5);
    vec2 uv2 = rotate(uv, angle * 1.0);
    vec2 uv3 = rotate(uv, angle * 1.5);

    vec4 s1 = stripes(uv1) * c1;
    vec4 s2 = stripes(uv2) * c2;
    vec4 s3 = stripes(uv3) * c3;

    vec4 sq1 = square(uv, vec2(0.4) * scaler) * s1;
    vec4 sq2 = square(uv2, vec2(0.5) * scaler) * s2;
    vec4 sq3 = square(uv3, vec2(0.6) * scaler) * s3;

    vec4 finalColor = vec4(0.0, 0.0, 0.0, 1.0);
    finalColor = mix(finalColor, sq1, sq1.a);
    finalColor = mix(finalColor, sq2, sq2.a);
    finalColor = mix(finalColor, sq3, sq3.a);

    return finalColor;
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / u_resolution.y;

    uv = fract(uv * 2.0) - 0.5;

    vec4 sq = stripedSquares(uv, 1.0);

    gl_FragColor = sq;
}