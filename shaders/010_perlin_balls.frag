#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

const float PI = 3.14159265358979;

vec2 fade(vec2 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

vec4 permute(vec4 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float cnoise(vec2 P) {
    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation

    vec4 ix = Pi.xzxz;
    vec4 iy = Pi.yyww;
    vec4 fx = Pf.xzxz;
    vec4 fy = Pf.yyww;
    vec4 i = permute(permute(ix) + iy);
    vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
    vec4 gy = abs(gx) - 0.5;
    vec4 tx = floor(gx + 0.5);
    gx = gx - tx;
    vec2 g00 = vec2(gx.x, gy.x);
    vec2 g10 = vec2(gx.y, gy.y);
    vec2 g01 = vec2(gx.z, gy.z);
    vec2 g11 = vec2(gx.w, gy.w);
    vec4 norm = 1.79284291400159 - 0.85373472095314 *
        vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
    g00 *= norm.x;
    g01 *= norm.y;
    g10 *= norm.z;
    g11 *= norm.w;
    float n00 = dot(g00, vec2(fx.x, fy.x));
    float n10 = dot(g10, vec2(fx.y, fy.y));
    float n01 = dot(g01, vec2(fx.z, fy.z));
    float n11 = dot(g11, vec2(fx.w, fy.w));
    vec2 fade_xy = fade(Pf.xy);
    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
}

float squigglyCircle(vec2 p, float radius, float thickness, float seed, float time) {
    vec2 norm = normalize(p);

    float sample = cnoise(norm * 2.5 + time + seed);
    sample *= 1.0 + radius;

    p.y *= 3.0;
    p = p + sample * 0.1 * norm;

    float circle = length(p) - radius;
    circle = abs(circle);
    circle = thickness / circle;

    return circle;
}

vec3 palette(float t) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263, 0.416, 0.557);

    return a + b * cos(6.28318 * (c * t + d));
}

vec3 squigglyDiving(vec2 uv, float scale) {
    uv /= scale;
    float seed = u_time * 0.3;

    vec3 finalColor = vec3(0);
    float divingThickness = 0.01;
    float divingRadius = 0.3;
    float squigglyRadius = 0.6;
    float squigglyThickness = 0.010;

    float circleInner = squigglyCircle(uv, squigglyRadius, squigglyThickness, seed, u_time);

    for(float i = 0.0; i < 40.0; i += 1.0) {
        vec2 p = uv;
        p.y += sin(u_time * 2.0 + i * 0.1) * 0.5;

        float radius = divingRadius + cos(2.0 * (u_time + PI) + i * 0.1) * 0.3 + 0.3;

        float divingCircle = squigglyCircle(p, radius, divingThickness, seed, u_time);

        vec3 color = palette(i / 50.0 + u_time);

        finalColor = max(finalColor, color * divingCircle);
    }

    finalColor = max(finalColor, vec3(circleInner));

    return finalColor;
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / u_resolution.y;

    vec3 squiggleDivingCircles = squigglyDiving(uv, 0.7);

    gl_FragColor = vec4(squiggleDivingCircles, 1.0);
}
