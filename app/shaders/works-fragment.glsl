precision highp float;

uniform float uAlpha;
uniform float uAspectRatio;
uniform sampler2D tMap;
uniform vec2 uCardSizes;
uniform vec2 uImageSizes;

varying vec2 vUv;

void main() {
  vec2 normalizedImageSizes;
  vec2 finalUv;

  if(uImageSizes.x * uCardSizes.y / (uImageSizes.y * uCardSizes.x) > 1.0){
    normalizedImageSizes = vec2(uImageSizes.x * uCardSizes.y / uImageSizes.y, uImageSizes.y * uCardSizes.y / uImageSizes.y);
    finalUv = vec2(vUv.x / (normalizedImageSizes.x / uCardSizes.x) + (1.0 - uCardSizes.x / normalizedImageSizes.x) / 2.0, vUv.y / (normalizedImageSizes.y / uCardSizes.y) );
  } else {
    normalizedImageSizes = vec2(uImageSizes.x * uCardSizes.x / uImageSizes.x, uImageSizes.y * uCardSizes.x / uImageSizes.x);
    finalUv = vec2(vUv.x / (normalizedImageSizes.x / uCardSizes.x), vUv.y / (normalizedImageSizes.y / uCardSizes.y) + (1.0 - uCardSizes.y / normalizedImageSizes.y) /2.0);
  }

  vec4 texture = texture2D(tMap, finalUv);

  gl_FragColor = texture;
  gl_FragColor.a *= uAlpha;
}
