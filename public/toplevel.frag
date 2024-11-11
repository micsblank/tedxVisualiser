#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
uniform sampler2D gol;
uniform vec2 golRes;
uniform sampler2D textGraphics;
uniform sampler2D lineGraphics;
uniform sampler2D bgImage;
uniform float amplitude;
uniform float time;
uniform bool performanceMode;
uniform int modeStep;

float sdRoundedBox( in vec2 p, in vec2 b, in vec4 r ) {
    r.xy = (p.x>0.0)?r.xy : r.zw;
    r.x  = (p.y>0.0)?r.x  : r.y;
    vec2 q = abs(p)-b+r.x;
    return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r.x;
}

vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade3(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise3d(vec3 P){
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade3(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}

float cnoise(vec2 P){
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 * 
    vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

// 2D Random
float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}


vec2 vFlip(vec2 xy) {
  return vec2(0.,1.) + vec2(1.,-1) * xy;
}


float calcGOL(vec2 uv) {
  vec2 gi = (.5/golRes)+floor(uv*golRes)/golRes;
  vec2 gv = mod(uv*golRes, 1.);

  return min(1., smoothstep(.1,.2,sdRoundedBox(gv -0.5, vec2(0.25), vec4(.1))) + texture2D(gol, (.5/golRes)+floor(uv*golRes)/golRes).r);
}

void main() {
  vec2 uv = vTexCoord;


  vec4 blue = vec4(.03,.089,.621, 1.);
  vec4 orange = vec4(.843, .33, .04, 1.);
  vec4 white = vec4(1.);
  vec4 black = vec4(0.,0.,0.,.9);
  vec4 purple = vec4(0.518,0.576,0.792, 1.);

  vec4 col = black;
  //vec4 col = texture2D(gol, (.5/golRes)+floor(uv*golRes)/golRes);
  //
  // mix in bg
  // col = texture2D(bgImage, vFlip(uv)*.9+vec2(0.05)+ 
  //         vec2(cnoise3d(vec3(uv.x,uv.y, time/2.)*.9),
  //           cnoise3d(vec3(-uv.x,-uv.y, time/2.)*.9)
  //           )*0.05);
  
  // Overlay Game Of Life
  // col = mix(col, white, calcGOL(uv));

  // mix in logo
  // col = mix(col, orange, texture2D(textGraphics, vFlip(uv)+ 
  //         vec2(cnoise3d(vec3(uv.x,uv.y, time)),
  //           cnoise3d(vec3(uv.x,uv.y, time))
  //           )*0.9*pow(amplitude*1.9,1.3)).a);


  if(performanceMode) {

    if(modeStep == 0) {
      vec2 lineWarp = vec2(cnoise3d(vec3(uv.x,uv.y, time/3.)*.9),
            cnoise3d(vec3(-uv.x,-uv.y, time/8.)*.9)
            )*0.05-vec2(cnoise3d(vec3(uv.x,uv.y, time/3.)*1.9),
            cnoise3d(vec3(-uv.x,-uv.y, time/3.)*8.9)
            )*0.2*amplitude;
      col = mix(col, orange, texture2D(lineGraphics, vFlip(uv*.9+.05)+lineWarp).a);
    }

    
    if(modeStep == 1) {
      vec2 lineWarp = vec2(cnoise3d(vec3(uv.x,uv.y, time/3.)*.9),
            cnoise3d(vec3(-uv.x,-uv.y, time/8.)*.9)
            )*0.05-vec2(cnoise3d(vec3(uv.x,uv.y, time/3.)*1.9),
            cnoise3d(vec3(-uv.x,-uv.y, time/3.)*8.9)
            )*pow(amplitude,10.0);
      col = mix(col, orange, texture2D(lineGraphics, vFlip(uv*.9+.05)+lineWarp).a);
      // mix in logo
        col = mix(col, orange, texture2D(textGraphics, vFlip(uv)+ 
              vec2(cnoise3d(vec3(uv.x,uv.y, time)),
                cnoise3d(vec3(uv.x,uv.y, time))
                )*0.9*pow(amplitude*3.0,3.0)).a);
    }

    if(modeStep == 2) {
      col = blue;
      vec2 lineWarp = vec2(cnoise3d(vec3(uv.x,uv.y, time/3.)*.9),
            cnoise3d(vec3(-uv.x,-uv.y, time/8.)*.9)
            )*0.05-vec2(cnoise3d(vec3(uv.x,uv.y, time/3.)*1.9),
            cnoise3d(vec3(-uv.x,-uv.y, time/3.)*8.9)
            )*0.2*amplitude;
      col = mix(col, orange, texture2D(lineGraphics, vFlip(uv*.9+.05)+lineWarp).a);
      // mix in logo
        col = mix(col, orange, texture2D(textGraphics, vFlip(uv)+ 
              vec2(cnoise3d(vec3(uv.x,uv.y, time)),
                cnoise3d(vec3(uv.x,uv.y, time))
                )*0.9*pow(amplitude*1.9,1.3)).a);
    }

    if(modeStep == 3) {
      col = black;
      // vec2 lineWarp = vec2(cnoise3d(vec3(uv.x,uv.y, time/3.)*.9),
      //       cnoise3d(vec3(-uv.x,-uv.y, time/8.)*.9)
      //       )*0.05-vec2(cnoise3d(vec3(uv.x,uv.y, time/3.)*1.9),
      //       cnoise3d(vec3(-uv.x,-uv.y, time/3.)*8.9)
      //       )*0.2*amplitude;
      // col = mix(col, blue, texture2D(lineGraphics, vFlip(uv*.9+.05)+lineWarp).a);
      // mix in logo
        // col = mix(col, purple, texture2D(textGraphics, vFlip(uv)+ 
        //       vec2(cnoise3d(vec3(uv.x,uv.y, time)), cnoise3d(vec3(uv.x,uv.y, time)))*0.1*pow(amplitude*1.,1.)).a);

        col = mix(
    col,
    purple,
    texture2D(
        textGraphics,
        vFlip(uv) + 
        vec2(
            cnoise3d(vec3(uv.x, uv.y, amplitude * 10.0)),  // Use amplitude instead of time to drive the noise
            cnoise3d(vec3(uv.x, uv.y, amplitude * 10.0))
        ) * (time/.05) * pow(amplitude, 1.9)  // Adjust scaling and power to exaggerate amplitude effect
    ).a
);

//       //Making every letter different
//         vec2 noiseOffsetK = vec2(cnoise3d(vec3(uv.x + 0.1, uv.y + 0.1, time)), cnoise3d(vec3(uv.x + 0.1, uv.y + 0.1, time)));
// vec2 noiseOffsetO = vec2(cnoise3d(vec3(uv.x + 0.2, uv.y + 0.2, time)), cnoise3d(vec3(uv.x + 0.2, uv.y + 0.2, time)));
// vec2 noiseOffsetU = vec2(cnoise3d(vec3(uv.x + 0.3, uv.y + 0.3, time)), cnoise3d(vec3(uv.x + 0.3, uv.y + 0.3, time)));
// vec2 noiseOffsetP = vec2(cnoise3d(vec3(uv.x + 0.4, uv.y + 0.4, time)), cnoise3d(vec3(uv.x + 0.4, uv.y + 0.4, time)));

// // Position each letter with its respective noise offset
// col = mix(col, blue, texture2D(textGraphics, vFlip(uv * 0.9 + noiseOffsetK)).a);
// col = mix(col, purple, texture2D(textGraphics, vFlip(uv * 0.9 + noiseOffsetO)).a);
// col = mix(col, orange, texture2D(textGraphics, vFlip(uv * 0.9 + noiseOffsetU)).a);
// col = mix(col, blue, texture2D(textGraphics, vFlip(uv * 0.9 + noiseOffsetP)).a);
        
    }

    if(modeStep == 4) {

    col = texture2D(bgImage, vFlip(uv)*.9+vec2(0.05)+ 
        vec2(cnoise3d(vec3(uv.x,uv.y, time/2.)*.9),
          cnoise3d(vec3(-uv.x,-uv.y, time/2.)*.9)
          )*0.05);

      col = mix(col, blue, calcGOL(uv/2.));

      // mix in logo
        col = mix(col, orange, texture2D(textGraphics, vFlip(uv)+ 
              vec2(cnoise3d(vec3(uv.x,uv.y, time)),
                cnoise3d(vec3(uv.x,uv.y, time))
                )*0.9*pow(amplitude*1.9,1.3)).a);
    }

    if(modeStep == 5) {

    col = texture2D(bgImage, vFlip(uv)*.9+vec2(0.05)+ 
        vec2(cnoise3d(vec3(uv.x,uv.y, time/2.)*.9),
          cnoise3d(vec3(-uv.x,-uv.y, time/2.)*.9)
          )*0.05);

      col = mix(col, orange, calcGOL(uv));

      // mix in logo
        col = mix(col, blue, texture2D(textGraphics, vFlip(uv)+ 
              vec2(cnoise3d(vec3(uv.x,uv.y, time)),
                cnoise3d(vec3(uv.x,uv.y, time))
                )*0.9*pow(amplitude*1.9,1.3)).a);
    }

    if(modeStep == 6) {

    col = texture2D(bgImage, vFlip(uv)*.9+vec2(0.05)+ 
        vec2(cnoise3d(vec3(uv.x,uv.y, time/2.)*.9),
          cnoise3d(vec3(-uv.x,-uv.y, time/2.)*.9)
          )*0.05);

      col = mix(col, blue, calcGOL(uv));

      // mix in logo
        col = mix(col, orange, texture2D(textGraphics, vFlip(uv)+ 
              vec2(cnoise3d(vec3(uv.x,uv.y, time)),
                cnoise3d(vec3(uv.x,uv.y, time))
                )*0.9*pow(amplitude*1.9,1.3)).a);
    }

  } else { // holding mode
    // all have base layer of 
    col = texture2D(bgImage, vFlip(uv)*.9+vec2(0.05)+ 
        vec2(cnoise3d(vec3(uv.x,uv.y, time/2.)*.9),
          cnoise3d(vec3(-uv.x,-uv.y, time/2.)*.9)
          )*0.05);

    vec2 lineWarp = vec2(cnoise3d(vec3(uv.x,uv.y, time/3.)*.9),
        cnoise3d(vec3(-uv.x,-uv.y, time/8.)*.9)
        )*0.05-vec2(cnoise3d(vec3(uv.x,uv.y, time/3.)*1.9),
          cnoise3d(vec3(-uv.x,-uv.y, time/3.)*8.9)
          )*0.2*amplitude;

    col = mix(col, texture2D(lineGraphics, vFlip(uv)+lineWarp 
        ), texture2D(lineGraphics, vFlip(uv)+lineWarp).a);

    col = mix(col, texture2D(textGraphics, vFlip(uv)), texture2D(textGraphics, vFlip(uv)).a);
    if(modeStep == 7) {
        col = mix(col, texture2D(textGraphics, vFlip(uv)), texture2D(textGraphics, vFlip(uv)).a);
        col = mix(col, white, calcGOL(uv));
    }

    

  }


  gl_FragColor = vec4(col.rgb, 1.0);
}
