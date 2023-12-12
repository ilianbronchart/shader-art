#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void initCubeVertices(inout vec3 vertices[8], float scale) {
    vertices[0] = vec3(-1.0, -1.0, -1.0) * scale;
    vertices[1] = vec3(1.0, -1.0, -1.0) * scale;
    vertices[2] = vec3(-1.0, 1.0, -1.0) * scale;
    vertices[3] = vec3(1.0, 1.0, -1.0) * scale;
    vertices[4] = vec3(-1.0, -1.0, 1.0) * scale;
    vertices[5] = vec3(1.0, -1.0, 1.0) * scale;
    vertices[6] = vec3(-1.0, 1.0, 1.0) * scale;
    vertices[7] = vec3(1.0, 1.0, 1.0) * scale;
}

vec2 project(vec3 v) {
    return vec2(v.x / v.z, v.y / v.z);
}

float circleShape(vec2 uv, vec2 center, float radius) {
    return step(length(uv - center), radius);
}

float sdSegment(in vec2 p, in vec2 a, in vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    float d = length(pa - ba * h);

    float lineWidth = 0.005;
    float aaWidth = 1.0 / u_resolution.y;
    float alpha = smoothstep(lineWidth + aaWidth, lineWidth - aaWidth, d);
    return alpha;
}

vec3 rotate(vec3 v, float x, float y, float z) {
    mat3 rx = mat3(1.0, 0.0, 0.0, 0.0, cos(x), -sin(x), 0.0, sin(x), cos(x));

    mat3 ry = mat3(cos(y), 0.0, sin(y), 0.0, 1.0, 0.0, -sin(y), 0.0, cos(y));

    mat3 rz = mat3(cos(z), -sin(z), 0.0, sin(z), cos(z), 0.0, 0.0, 0.0, 1.0);

    return rx * ry * rz * v;
}

vec3 cubeShape(vec2 uv, vec3 pos, float scale) {
    vec3 finalColor = vec3(0.0);

    vec3 vertices[8];
    initCubeVertices(vertices, scale);

    for(int i = 0; i < 8; i++) {
        vec3 vertex = vertices[i];
        vertex = rotate(vertex, 1.5, 0.0, u_time * 0.5);
        vertex += pos;
        vertex *= 0.5;
        vertices[i] = vertex;
    }

    for(int i = 0; i < 8; i++) {
        for(int j = 0; j < 8; j++) {
            if(i == j) {
                continue;
            }

            vec3 a = vertices[i];
            vec3 b = vertices[j];

            if(length(a - b) > scale) {
                continue;
            }

            vec2 pos = project(a);
            vec2 pos2 = project(b);

            float segment = sdSegment(uv, pos, pos2);
            float circle = circleShape(uv, pos, 0.015);

            finalColor = max(finalColor, vec3(circle));
            finalColor = max(finalColor, vec3(segment));
        }
    }

    return finalColor;
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / u_resolution.y;

    float scale = 0.5;
    vec3 finalColor = vec3(0.0);

    for(float i = 1.0; i < 7.0; i++) {
        vec3 pos = vec3(0.0, 0.0, 6.0);
        vec3 cube = cubeShape(uv, pos, scale + i * 0.3);
        finalColor = max(finalColor, cube);
    }

    gl_FragColor = vec4(finalColor, 1.0);
}
