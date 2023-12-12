#ifdef GL_ES
precision mediump float;
#endif

#define MAX_PARABOLAS 20

varying vec2 vTexCoord;

uniform vec2 resolution;
uniform vec3 color;
uniform float pcount;

uniform float dx[MAX_PARABOLAS];
uniform float dy[MAX_PARABOLAS];
uniform float rotation[MAX_PARABOLAS];
uniform float edge[MAX_PARABOLAS];
uniform float k[MAX_PARABOLAS];

float sdParabola(in vec2 pos, in float k) {
    pos.x = abs(pos.x);
    float ik = 1.0 / k;
    float p = ik * (pos.y - 0.5 * ik) / 3.0;
    float q = 0.25 * ik * ik * pos.x;
    float h = q * q - p * p * p;
    float r = sqrt(abs(h));
    float x = (h > 0.0) ? pow(q + r, 1.0 / 3.0) - pow(abs(q - r), 1.0 / 3.0) * sign(r - q) : 2.0 * cos(atan(r, q) / 3.0) * sqrt(p);
    return length(pos - vec2(x, k * x * x)) * sign(pos.x - x);
}

vec2 rotate(vec2 v, float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, s, -s, c);
    return m * v;
}

void main() {
    float aspectRatio = resolution.x / resolution.y;
    vec2 uv = (vTexCoord - 0.5) * vec2(aspectRatio, 1.0);  // Adjust for aspect ratio

    // Apply transformations
    uv.y += min(abs(0.01 / uv.x), 0.3);

    float p = 10000.0;

    for(int i = 0; i < MAX_PARABOLAS; i++) {
        if(i >= int(pcount)) {
            break;
        }

        // Rotate and translate the UV
        vec2 transformedUV = uv;
        transformedUV.x += dx[i] / resolution.x;
        transformedUV.y += dy[i] / resolution.y;
        transformedUV = rotate(transformedUV, rotation[i]);

        // Get the distance to the current parabola
        float d = sdParabola(transformedUV, k[i]) + edge[i];

        p = min(p, d);
    }

    gl_FragColor = vec4(p, p, p, 1.0);

    // Determine the base color (parabola)
    float base = 1.0 - smoothstep(0.0, 0.003, p);
    vec3 pCol = color * base;

    // Determine the outline (thicker than the base)
    float outlineWidth = 0.02; // adjust for desired thickness
    float outline = 1.0 - smoothstep(outlineWidth, outlineWidth + 0.003, p);
    vec3 pOutlineCol = vec3(0.0, 0.0, 0.0) * outline;

    // Blend base color and outline
    vec3 color = mix(pOutlineCol, pCol, base);

    gl_FragColor = vec4(color, max(base, outline));
}