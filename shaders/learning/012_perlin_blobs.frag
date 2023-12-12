#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

const int blob_count = 20;
const float particleCount = 40.0; // Define the number of particles
const float particleRadius = 0.025;
const vec2 particleVelocity = vec2(-1.5, 0.0); // Negative for leftward movement

float random(vec2 uv) {
    return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453123);
}

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

float smoothMax(float a, float b, float k) {
    return log(exp(k * a) + exp(k * b)) / k;
}

vec3 palette(float t) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263, 0.416, 0.557);

    return a + b * cos(6.28318 * (c * t + d));
}

float sdCircle(vec2 p, float r) {
    float d = length(p) - r;
    // d = smoothstep(-0.001, 0.001, d);
    return d;
}

float blob(vec2 uv, float scale, inout vec3 finalColor, float time) {
    uv /= scale;

    float baseRadius = 0.2;
    float k = 12.0;
    float maxDistance = -1e10; // Start with a very low distance

    for(int i = 0; i < blob_count; i++) {
        float fi = float(i);
        vec2 circleSeed = vec2(fi, fi * 1.3);
        float radius = clamp(baseRadius + cnoise(circleSeed + time) * 0.3, 0.1, 1.0);

        // Translate in a random vec2 direction based on time and noise
        vec2 noiseDirection = vec2(cnoise(circleSeed + 0.3), cnoise(circleSeed * 2.0 + 0.3));
        vec2 translate = noiseDirection * cnoise(circleSeed + vec2(time, time * 1.3)); // Remove normalize and vary time

        float circle = sdCircle(uv + translate, radius);

        // Get color from palette and apply to circle
        vec3 color = palette(fi / float(blob_count));

        // Combine the color with the distance field of the circle
        finalColor = max(finalColor, color * circle);

        // Update maxDistance with the new circle distance
        maxDistance = smoothMax(maxDistance, -circle, k);
    }

    return maxDistance;
}

float particleField(vec2 uv, inout vec3 finalColor, float time) {
    vec3 fieldColor = vec3(0.0);
    float minDist = 1e10; // Use a large positive number for minimum distance initialization

    float aspect = u_resolution.x / u_resolution.y;
    float left = -1.0 * aspect;
    float right = 1.0 * aspect;
    float screenWidth = right - left;

    for(float i = 1.0; i <= particleCount; i += 1.0) {
        float noiseX = random(vec2(i * 1.2));
        float noiseY = random(vec2(i * 1.15)) - 0.5;

        vec2 vel = particleVelocity * (noiseX + 0.5);

        vec2 pos = time * vel + vel;
        pos.x = fract(pos.x + noiseX) * screenWidth - screenWidth / 2.0;
        pos.y = noiseY * 2.0; // Assuming you have defined screenHeight somewhere

        float dCircle = sdCircle(uv - pos, particleRadius);
        minDist = min(minDist, dCircle); // Update the minimum distance

        // Calculate color based on the minimum distance
        vec3 color = palette(i / float(particleCount));
        float alpha = smoothstep(particleRadius, particleRadius + 0.1, dCircle);
        fieldColor = max(fieldColor, color * alpha); // Blend the color based on the smoothed step function
    }

    // The final color is divided by the particle count to average the contributions of each particle
    finalColor = max(finalColor, fieldColor / particleCount);

    return minDist;
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / u_resolution.y;
    float time = u_time * 0.6;

    vec3 finalColor = vec3(0.0);

    float dBlob = blob(uv, 1.0, finalColor, time);
    float dParticles = particleField(uv, finalColor, time);
    float d = smoothMax(-dParticles, dBlob, 8.0);

    finalColor *= 0.007 / abs(d);

    gl_FragColor = vec4(finalColor, 1.0); // Combine blobs and particles
}