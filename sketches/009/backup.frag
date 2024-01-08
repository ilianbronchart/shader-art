// float sdSegment(in vec2 p, in vec2 a, in vec2 b) {
//     vec2 pa = p - a, ba = b - a;
//     float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
//     return length(pa - ba * h);
// }

// float plotFunction(vec2 p, float xrange, float hScale) {
//     float xMin = -xrange / 2.0;
//     int steps = 1000;
//     float stepSize = xrange / float(steps);
//     float minDist = 1.0; // Initialize with a large number

//     const int MAX_STEPS = 1000;

//     for(int i = 0; i < MAX_STEPS; ++i) {
//         if(i >= steps) {
//             break;
//         }

//         float x1 = xMin + stepSize * float(i);
//         float x2 = x1 + stepSize;
//         float y1 = f(x1, hScale);
//         float y2 = f(x2, hScale);

//         vec2 a = vec2(x1, y1);
//         vec2 b = vec2(x2, y2);

//         float dist = sdSegment(p, a, b);
//         minDist = min(minDist, dist);
//     }

//     return 0.003 / (minDist * 1.2);
// }