#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

// A simple hash function to get pseudo-random number based on a 2D coordinate.
float hash(vec2 p) {
    float h = dot(p, vec2(127.1, 311.7));
    return fract(sin(h) * 43758.5453123);
}

// This function returns a random 2D point inside a unit grid cell.
vec2 randomPointInCell(vec2 gridCell) {
    return vec2(hash(gridCell), hash(gridCell + 1.0));
}

// The main Voronoi function that computes the distance to the nearest random point.
float voronoi(vec2 p, vec2 grid) {
    float minDist = 1.0; // Start with max distance
    vec2 pCell = floor(p * grid); // Find the cell that point 'p' falls in

    for(int x = -1; x <= 1; x++) {
        for(int y = -1; y <= 1; y++) {
            // Neighbor cell coordinates
            vec2 neighbor = pCell + vec2(float(x), float(y));
            // Random point in the neighbor cell
            vec2 point = randomPointInCell(neighbor);
            // Calculate the position of the point in space
            vec2 diff = (neighbor + point) / grid - p;
            // Update minimum distance if necessary
            minDist = min(minDist, dot(diff, diff));
        }
    }
    return sqrt(minDist);
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / u_resolution.y;

    float noise = voronoi(uv, vec2(10));
    noise = 0.01 / noise;

    gl_FragColor = vec4(noise, noise, noise, 1.0);
}
