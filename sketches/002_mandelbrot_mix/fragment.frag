#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
uniform float u_time;

const float maxIter = 500.0;

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
    vec2 uv = vTexCoord - 0.5;
    vec2 position = vec2(0.5, 0.0);

    uv /= 0.5;
    uv -= position;

    float n = mandelbrot(uv);
    float v = n / maxIter;

    vec3 finalColor = vec3(v, v, v);

    gl_FragColor = vec4(finalColor, 1.0);
}