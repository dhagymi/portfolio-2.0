#define PI 3.1415926535897932384626433832795

attribute vec3 position;
attribute vec2 uv;

uniform float uTime;
uniform float uInfiniteTime;
uniform float uSpeed;
uniform float uWidth;
uniform float uMagnification;
uniform float uScrollSpeed;
uniform float uAspectRatio;
uniform bool uFirstWave;
uniform bool uHover;
uniform vec2 uViewportSizes;
uniform vec2 uCardSizes;
uniform vec2 uImageSizes;
uniform vec2 uResolution;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv;

const float speed = 0.2;                      
const float frequency = 8.0; 

vec2 shift( vec2 p ) {                        
  float d = uInfiniteTime * speed;
  vec2 f = frequency * (p + d);
  vec2 q = cos(vec2(cos(f.x - f.y) * cos(f.y), sin(f.x + f.y) * sin(f.y)));                   
  return q;                                  
}

void main() {

  vec2 r = position.xy;                      
  vec2 p = shift( r );             
  vec2 q = shift(r + 1.0);                        
  float amplitude = uMagnification;
  vec2 s = r + amplitude * (p - q) + 0.5;

  if(uHover){

    
    if(uFirstWave){    
      vec2 aspectRatioMultiplier = vec2(1.0, uAspectRatio);
      vec2 centerUv = (uv - 0.5);

      float radius = length(centerUv);

      float timeMax = uTime * uSpeed + uWidth;
      float timeMin = uTime * uSpeed;

      float smoothedRadius = smoothstep(radius, timeMin, timeMax);
      float oneMinusSmoothedRadius = 1.0 - smoothedRadius;

      float stripedRadius = smoothedRadius * oneMinusSmoothedRadius;
  
      vUv = (stripedRadius + s);
    } else {      
      vUv = s;
    }
    
  } else {
    vUv = uv;
  }


  vec4 newPosition = modelViewMatrix * vec4(position, 1.0);
  
  newPosition.z += (sin(newPosition.y / uViewportSizes.y * PI + PI / 2.0) * uScrollSpeed);

  gl_Position = projectionMatrix * newPosition;
}
