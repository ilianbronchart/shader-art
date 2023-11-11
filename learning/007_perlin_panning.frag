#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

const float noise_scale = 4.0;
const float lineThickness = 0.008;
const float speed = 0.13;

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

float perline(vec2 p, float noiseY, float lineThickness) {
    float x = p.x / 2.0;

    float referenceSample = cnoise(vec2(x, 0.0) * noise_scale);
    float sample = cnoise(vec2(x, noiseY) * noise_scale);

    float deltaY = referenceSample - sample;

    float distanceToLine = abs(p.y - sample);
    float alpha = smoothstep(lineThickness, lineThickness * 0.5, distanceToLine);

    return alpha;
}

vec2 lineDelta(float i) {
    float deltaX = 0.002;
    float deltaY = 0.001;

    float deltaMouseX = u_mouse.x / u_resolution.x * 2.0 - 1.0;
    float deltaMouseY = u_mouse.y / u_resolution.y * 2.0 - 1.0;

    deltaX += deltaMouseX * i * 0.1;
    deltaY += deltaMouseY * i * 0.05;

    return vec2(deltaX, deltaY);
}

vec3 palette(float t) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263, 0.416, 0.557);

    return a + b * cos(6.28318 * (c * t + d));
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / u_resolution.y;

    float sampleY = 0.0;
    sampleY += u_time * speed;

    vec3 finalColor = vec3(0.0);
    float deltaY = 0.001;
    float deltaOpacity = 0.2;

    for(float i = 0.0; i <= 15.0; i += 1.0) {
        vec2 p = uv;
        p += lineDelta(i);

        sampleY += i * deltaY;

        float line = perline(p, sampleY, lineThickness);
        float opacity = exp(-abs(i * 0.2));
        vec3 col = palette(i * .04 + 0.3) * 2.0 * line * opacity;

        if(i > 14.0) {
            col = vec3(1.0) * line * 0.3;
        }

        finalColor = max(finalColor, col);
    }

    gl_FragColor = vec4(finalColor, 1.0);
}
