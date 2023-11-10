#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / u_resolution.y;

    vec3 col = vec3(0.0);

    gl_FragColor = vec4(col, 1.0);
}
