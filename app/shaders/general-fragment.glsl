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

void main() {
   vec2 st = gl_FragCoord.xy;

    float rnd = random( st );

    gl_FragColor = vec4(vec3(rnd), uAlpha); 
}