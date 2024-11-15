#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
uniform sampler2D tex;
uniform vec2 normalRes;

void main() {
  vec2 uv = vTexCoord;
  uv.y = 1.0 - uv.y;
  
  vec4 col = texture2D(tex, uv);
  float a = col.r;
  
  float num = 0.0;
  for(float i = -1.0; i < 2.0; i++) {
    for(float j = -1.0; j < 2.0; j++) {
      float x = uv.x + i * normalRes.x;
      float y = uv.y + j * normalRes.y;

      num += texture2D(tex, vec2(x, y)).r;
    }
  }
  
  num -= a;
  
  if(a > 0.5) {
    if(num < 1.5) {
      a = 0.0;
    }
    if(num > 3.5) {
      a = 0.0;
    }
  } else {
    if(num > 2.5 && num < 3.5) {
      a = 1.0;
    }
  }

  // Set alive cells to #FFFDF6 and dead cells to black
  vec3 aliveColor = vec3(1.0, 0.992, 0.965);  // #FFFDF6
  vec3 deadColor = vec3(0.0, 0.0, 0.0);       // Black (or another background color)

  vec3 finalColor = mix(deadColor, aliveColor, a); // Interpolate based on 'a' (alive or dead)
  gl_FragColor = vec4(finalColor, 1.0);  // Output color with full opacity
}

