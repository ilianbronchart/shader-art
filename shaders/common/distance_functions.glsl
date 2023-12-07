float sdEquilateralTriangle(in vec2 p, in float r) {
    const float k = sqrt(3.0);
    p.x = abs(p.x) - r;
    p.y = p.y + r / k;
    if(p.x + k * p.y > 0.0)
        p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
    p.x -= clamp(p.x, -2.0 * r, 0.0);
    float d = -length(p) * sign(p.y);
    // d = smoothstep(-0.001, 0.001, d);

    return d;
}

float sdCircle(vec2 p, float r) {
    float d = length(p) - r;
    // d = smoothstep(-0.001, 0.001, d);
    return d;
}
