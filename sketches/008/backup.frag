// float plotFunction(vec2 p) {
//     float range = 1.0; // Total range from -0.5 to 0.5
//     int steps = 1000;
//     float stepSize = range / float(steps);
//     float minDist = 1.0; // Initialize with a large number

//     const int MAX_STEPS = 1000;

//     p.y *= 2.0;

//     for(int i = 0; i < MAX_STEPS; ++i) {
//         if(i >= steps) {
//             break;
//         }

//         float x1 = -0.5 + stepSize * float(i);
//         float x2 = x1 + stepSize;
//         float y1 = g(x1, 0.);
//         float y2 = g(x2, 0.);

//         // Translate down by 0.5
//         y1 -= 0.5;
//         y2 -= 0.5;

//         vec2 a = vec2(x1, y1);
//         vec2 b = vec2(x2, y2);

//         float dist = sdSegment(p, a, b);
//         minDist = min(minDist, dist);
//     }

//     return 0.0007 / (minDist * 1.2);
// }

// float sdSegment(in vec2 p, in vec2 a, in vec2 b) {
//     vec2 pa = p - a, ba = b - a;
//     float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
//     return length(pa - ba * h);
// }

