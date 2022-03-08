#ifdef GL_ES
precision highp float;
#endif

uniform float uTime;
uniform float uAlpha;

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123 * uTime);
}

const float PHI = 1.61803398874989484820459; // Φ = Golden Ratio 

float gold_noise(vec2 xy, float seed)
{
    return fract(tan(distance(xy * PHI, xy) * seed) * xy.x);
}


void main() {
    vec2 st = gl_FragCoord.xy;

    float rnd = gold_noise(st, fract(uTime) + 1.0);

    gl_FragColor = vec4(vec3(rnd), uAlpha); 
}