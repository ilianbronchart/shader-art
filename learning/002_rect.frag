#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

float rect_shape(vec2 position, vec4 rect) {
    float x = position.x;
    float y = position.y;

    float left = rect.x;
    float right = rect.x + rect.z;
    float top = rect.y;
    float bottom = rect.y + rect.w;

    if(x >= left && x <= right && y >= top && y <= bottom) {
        return 1.0;
    } else {
        return 0.0;
    }
}

float rect_shape_step(vec2 position, vec2 scale) {
    scale = vec2(0.5) - scale * 0.5;
    vec2 shaper = vec2(step(scale.x, position.x), step(scale.y, position.y));
    shaper *= vec2(step(scale.x, 1.0 - position.x), step(scale.y, 1.0 - position.y));
    return shaper.x * shaper.y;
}

void main() {
    vec2 position = gl_FragCoord.xy / u_resolution;

    vec3 col = vec3(0.0);

    vec2 rect_pos = vec2(0.7, 0.1);
    float rect_shape = rect_shape(position, vec4(rect_pos, 0.1, 0.5));

    float rect_step = rect_shape_step(position, vec2(0.3, 0.5));

    col = vec3(rect_step);
    col = vec3(max(rect_shape, rect_step));

    gl_FragColor = vec4(col, 1.0);
}
