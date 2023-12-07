#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D texture0; // Original texture (canvas)
uniform sampler2D mask;     // Mask texture

varying vec2 vTexCoord;     // Texture coordinate

void main() {
    vec2 uv = vTexCoord - 0.5;
    
    vec4 texColor = texture2D(texture0, uv);
    float maskValue = texture2D(mask, uv).r; // Assuming mask is grayscale

    if(maskValue < 1.0) {
        gl_FragColor = vec4(0,0,0,0); // Discard pixel (make transparent) if mask value is low
    } else {
        gl_FragColor = texColor; // Keep pixel if mask value is high
    }
}