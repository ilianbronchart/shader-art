#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

const float maxIter = 12500.0;

float mandelbrot(vec2 c) {
    vec2 z = vec2(0.0, 0.0);
    float n = 0.0;
    for(float i = 0.0; i < maxIter; i += 1.0) {
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        if(length(z) > 2.0) {
            break;
        }
        n += 1.0;
    }
    return n + 1.0 - log(log2(length(z)));
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / u_resolution.y;

    // uv = fract(uv * 2.0) - 0.5;

    // Time-based rotation
    float time = u_time * 1.0; // 'u_time' should be passed as a uniform, and 'speed' controls the rotation speed
    float angle = time; // The angle of rotation

    // Rotation matrix components
    float cosAngle = cos(angle) * 0.5;
    float sinAngle = sin(angle) * 1.5;

    // Rotate the UV coordinates
    vec2 rotatedUv = uv;
    rotatedUv.x = uv.x * cosAngle - uv.y * sinAngle;
    rotatedUv.y = uv.x * sinAngle + uv.y * cosAngle;

    // Zoom the fractal
    float zoomFactor = 60000.0;

    // Apply the zoom factor to the UV coordinates
    vec2 zoomedUv = rotatedUv / zoomFactor;

    // Center the zoom on a point in the fractal (adjust these values as needed)
    float centerX = -1.3241009;
    float centerY = 0.0599315;
    zoomedUv.x += centerX;
    zoomedUv.y += centerY;

    float n = mandelbrot(zoomedUv);
    float v = 1.0 - (sin(u_time * 2.2) * 0.008 + 0.02) / (n / maxIter);

    vec3 finalColor = vec3(0.1 / sqrt(v) + 0.5, v + 0.3, abs(0.01 / v) - 0.2);

    gl_FragColor = vec4(finalColor, 1.0);
}
