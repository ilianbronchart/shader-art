#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
uniform vec2 resolution;
uniform vec2 p1;
uniform vec2 p2;
uniform float thick;
uniform float time;


float sdOrientedBox(in vec2 p, in vec2 a, in vec2 b, float th) {
    float l = length(b - a);
    vec2 d = (b - a) / l;
    vec2 q = (p - (a + b) * 0.5);
    q = mat2(d.x, -d.y, d.y, d.x) * q;
    q = abs(q) - vec2(l, th) * 0.5;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

float line(vec2 uv, vec2 p1, vec2 p2, float thick) {
    float l = sdOrientedBox(uv, p1, p2, thick);
    l = 1.0 - smoothstep(0.0, 0.004, l);

    // Calculate unit direction vector of the line
    vec2 lineDir = normalize(p2 - p1);

    // Project uv onto the line direction
    float proj = dot(uv - p1, lineDir);

    // Calculate effective length of the line segment
    float lineLength = length(p2 - p1);

    // Calculate distance along line axis to the nearest endpoint
    float distToEnd = min(proj, lineLength - proj);

    // Fade effect near the endpoints
    float fadeDist = 0.2;
    float alpha = smoothstep(0.0, fadeDist, distToEnd);

    return l * alpha; // Apply the fade effect
}


void main() {
    vec2 uv = vTexCoord - 0.5;
    vec2 p1 = p1.xy / resolution.xy;
    vec2 p2 = p2.xy / resolution.xy;
    float thick = thick / resolution.y;

    float l1 = line(uv, p1, p2, thick + 0.012);
    float l2 = line(uv, p1, p2, thick);
    float l = max(l1, l2);

    vec3 l1Col = vec3(0.2235, 0.702, 0.0) * l1;
    vec3 l2Col = vec3(1.0, 0.4, 0.0) * l2;

    vec3 finalColor = l1Col + l2Col;


    gl_FragColor = vec4(finalColor, l);
}
