#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform vec2 resolution;
uniform float time;

uniform vec2 rectSize;
uniform float rectThick;

uniform sampler2D noiseTexture;
uniform sampler2D prevTexture;
uniform float fbScale;
uniform vec2 fbOffset;

uniform float lineCount;
uniform float circleSize;

float sdBox(in vec2 p, in vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

vec4 getPrevColor() {
    vec2 scaledSize = vec2(fbScale);
    vec2 offsetCoords = vTexCoord + fbOffset / resolution.xy;

    float maskX = step(-scaledSize.x, offsetCoords.x) * step(offsetCoords.x, scaledSize.x);
    float maskY = step(-scaledSize.y, offsetCoords.y) * step(offsetCoords.y, scaledSize.y);

    if (maskX * maskY > 0.0) {
        vec2 adjustedCoords = (offsetCoords + scaledSize) / fbScale / 2.0;
        return texture2D(prevTexture, adjustedCoords);
    } 
    
    return vec4(0.0, 0.0, 0.0, 0.0);
}

vec4 getPrevColorInCircle(float normCircleSize, float aspectRatio) {
    vec2 normalizedCoords = vTexCoord * vec2(aspectRatio, 1.0);

    vec2 pixelSize = vec2(16.0) * vec2(aspectRatio, 1.0);
    vec2 pixelatedCoords = floor(normalizedCoords * resolution.xy / pixelSize.xy) * pixelSize.xy / resolution.xy;
    
    float circleMask = step(length(pixelatedCoords), normCircleSize);

    float scale = 0.4;
    vec2 scaledSize = vec2(scale);
    float maskX = step(-scaledSize.x, vTexCoord.x) * step(vTexCoord.x, scaledSize.x);
    float maskY = step(-scaledSize.y, vTexCoord.y) * step(vTexCoord.y, scaledSize.y);

    float outline = 0.0;
    float outlineThick = 0.03;
    float outlineSize = normCircleSize - outlineThick;
    float outlineMask = circleMask - step(length(pixelatedCoords), outlineSize);

    if (outlineMask > 0.0) {
        float outlineTexScale = 0.9;
        vec2 texSize = vec2(outlineTexScale);
        vec2 adjustedCoords = (vTexCoord + texSize) / outlineTexScale / 2.0;
        vec4 texColor = texture2D(prevTexture, adjustedCoords);
        texColor.a = 0.5;
        return texColor;

    } else if (circleMask * maskX * maskY > 0.0) {
        vec2 adjustedCoords = (vTexCoord + scaledSize) / scale / 2.0;
        return texture2D(prevTexture, adjustedCoords);
    } else if (circleMask > 0.0) {
        return vec4(0.0, 0.0, 0.0, 1.0);
    }
    
    return vec4(0.0, 0.0, 0.0, 0.0);
}

vec3 palette(float t) {
    vec3 a = vec3(0.878, -3.202, 0.658);
    vec3 b = vec3(0.558, 0.500, -0.602);
    vec3 c = vec3(0.498, 0.988, 0.138);
    vec3 d = vec3(-0.112, 0.428, 0.158);

    return a + b * cos(6.28318 * (c * t + d));
}

vec4 getBoxColor(float aspectRatio) {
    vec2 adjustedRectSize = vec2(rectSize.x, rectSize.y);

    float b = sdBox(vTexCoord, adjustedRectSize / resolution.xy);
    float th = rectThick / resolution.x;
    b = smoothstep(-th, -th + 0.001, b);

    vec3 color = palette((vTexCoord.x + vTexCoord.y) * 0.2);
    return vec4(color * b, b);
}

float sfxLine(in vec2 p, in vec2 a, in vec2 b, float yCutoff, float noiseScale, float lineThickness) {
    // Original Line Logic
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    vec2 pointOnLine = a + ba * h;
    vec2 lineDir = normalize(ba);

    if (pointOnLine.y > yCutoff) {
        return 0.0; // Do not render the line below yCutoff
    }

    // Perpendicular Direction
    vec2 perpDir = vec2(-lineDir.y, lineDir.x);

    // Apply Noise
    vec2 normCoord = (p + 1.0) / 2.0;
    vec2 offset = vec2(mod(time * 0.3, 1.0), normCoord.y);
    float noise = texture2D(noiseTexture, offset).r * noiseScale;
    pointOnLine += perpDir * (noise - 0.5) * 0.03;

    // Distance Calculation
    float d = length(p - pointOnLine);
    d = 1.0 - smoothstep(0.0, lineThickness, d);

    return d;
}

vec4 getLines(vec2 p, float normCircleSize) {
    float edgeOffset = 0.05;
    float yCutoff = -normCircleSize + 0.05;

    float leftEdgeLine = sfxLine(p, vec2(-1.0 + edgeOffset, -1.0), vec2(-1.0 + edgeOffset, 1.0), 1000.0, 1.0, 0.003);
    float rightEdgeLine = sfxLine(p, vec2(1.0 - edgeOffset, -1.0), vec2(1.0 - edgeOffset, 1.0), 1000.0, 1.0, 0.003);
    float horizontalLine = sfxLine(p, vec2(-1.0, yCutoff), vec2(1.0, yCutoff), 1000.0, 1.0, 0.009);

    float l = max(leftEdgeLine, rightEdgeLine);
    l = max(l, horizontalLine);


    vec2 convergencePoint = vec2(0.0, 0.5);

    // Lines from top edge
    for (int i = -40; i < 40; i++) {
        float x = float(i) / 50.0 * 2.0;
        float y = -1.0;
        float line = sfxLine(p, vec2(x, y), convergencePoint, yCutoff, 1.0, 0.003);
        l = max(l, line);
    }

    vec3 color = palette((p.x + p.y) * 0.2) * 1.5;
    float brightnessFactor = 0.97; // Adjust this value between 0.0 and 1.0 to control the brightness
    vec3 brightColor = mix(color, vec3(1.0, 1.0, 1.0), brightnessFactor);
    return vec4(l * brightColor, l * 0.5);
}

vec4 fadeAway() {
    float l = 0.0; // Aggregate line intensity
    float lineThickness = 0.01;
    float transparency = 0.4;

    const int MAX_LINES = 400; // Use a constant value that's reasonably high
    for (int i = 0; i < MAX_LINES; ++i) {
        if (i >= int(lineCount)) break; 

        float noiseA = texture2D(noiseTexture, vec2(float(i) / lineCount, time)).r;
        float noiseB = texture2D(noiseTexture, vec2((float(i)+0.2) / lineCount, time + 1.0)).r;
        float noiseC = texture2D(noiseTexture, vec2((float(i)-0.3) / lineCount, time + 2.0)).r;
        float noiseD = texture2D(noiseTexture, vec2((float(i)-0.5) / lineCount, time + 3.0)).r;
        
        // Selecting random start and end points on opposing edges
        vec2 startPoint, endPoint;
        bool isEven = (i - (i / 2) * 2) == 0;
        if (isEven) { // Horizontal lines
            startPoint = vec2(-1.0, (noiseA * 2.0 - 1.0) * 4.0);
            endPoint = vec2(1.0, (noiseB * 2.0 - 1.0) * 4.0);
        } else { // Vertical lines
            startPoint = vec2((noiseC * 2.0 - 1.0) * 4.0, -1.0);
            endPoint = vec2((noiseD * 2.0 - 1.0) * 4.0, 1.0);
        }

        l = max(l, sfxLine(vTexCoord, startPoint, endPoint, 1000.0, 0.0, lineThickness));
    }

    vec3 lineColor = palette((vTexCoord.x + vTexCoord.y) * 0.2);
    return vec4(lineColor, (transparency * l) * (1.0 - lineCount / float(MAX_LINES)) + 1.0 * lineCount / float(MAX_LINES));
}

void main() {
    float aspectRatio = resolution.x / resolution.y;
    float normCircleSize = circleSize / resolution.x * 2.0;

    vec4 sfxLinesColor = getLines(vTexCoord, normCircleSize);
    vec4 prevColor = getPrevColor();
    vec4 prevColorInCircle = getPrevColorInCircle(normCircleSize, aspectRatio);
    vec4 boxColor = getBoxColor(aspectRatio);
    vec4 fadeAwayColor = fadeAway();

    vec4 combinedColor = mix(prevColor, sfxLinesColor, sfxLinesColor.a);
    combinedColor = mix(combinedColor, prevColorInCircle, prevColorInCircle.a);
    combinedColor = mix(combinedColor, boxColor, boxColor.a);
    combinedColor = mix(combinedColor, fadeAwayColor, fadeAwayColor.a);

    gl_FragColor = combinedColor;
}

// void main() {
//     float aspectRatio = resolution.x / resolution.y;
//     float normCircleSize = circleSize / resolution.x * 2.0;

//     vec4 sfxLinesColor = getLines(vTexCoord, normCircleSize);
//     vec4 prevColor = getPrevColor(); // Background texture color
//     vec4 prevColorInCircle = getPrevColorInCircle(normCircleSize, aspectRatio); // Texture color within the circle
//     vec4 boxColor = getBoxColor(aspectRatio); // Color of the box
//     // vec4 fadeAwayColor = fadeAway(10.0);

//     vec4 combinedColor = mix(prevColor, sfxLinesColor, sfxLinesColor.a);
//     combinedColor = mix(combinedColor, prevColorInCircle, prevColorInCircle.a);
//     combinedColor = mix(combinedColor, boxColor, boxColor.a)
//     // combinedColor = mix(combinedColor, fadeAwayColor, fadeAwayColor.a)

//     gl_FragColor = combinedColor;
// }