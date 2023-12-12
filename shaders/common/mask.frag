#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
uniform sampler2D src;
uniform sampler2D mask;
uniform float threshold;

void main() {
    vec4 srcColor = texture2D(src, vTexCoord);
    float maskValue = texture2D(mask, vTexCoord).r;

    if(maskValue > threshold) {
        gl_FragColor = srcColor;
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    }
}
