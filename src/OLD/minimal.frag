// Fragment Shader - file "minimal.frag"

#version 330

precision highp float; // needed only for version 1.30

uniform sampler2D tex; // previous level of the texture pyramid 
uniform uint m; // exemplar image size
in  vec2 ex_UV; // texture coordinate in tex. comes in at 2x res of tex
in vec4 gl_FragCoord; // coordinate of current fragment on screen (in output texture in this case)
out vec4 colorOut; // output color for this pixel

// *****************************************************************************
// NOISE FUNCTIONS
// Description : Array and textureless GLSL 2D simplex noise function.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
// 

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
// *****************************************************************************
 
void main(void) {
	// upsampling
    float mstep = 1./float(m);
	ivec2 p = ivec2(gl_FragCoord.xy);
	ivec2 p0 = p/2;
    vec2 inc = vec2(p.x&1,p.y&1)/vec2(m,m);
	inc = 2*texture(tex,ex_UV).xy+inc;
	inc = mod(inc,1);
    colorOut = vec4(inc,0,0);
    return;
	// jitter
    float r = 0.;
	vec2 n = vec2(snoise(gl_FragCoord.xy), snoise(600*vec2(1.,1.)/gl_FragCoord.xy));
    n = mod(n, 1);
    n *= 2;
    n -= 1;
    for (int i = 0; i < 2; i++) { 
        if (n[i] > (1-r)) {
            n[i] = 1;
        }
        else if (n[i] < -1 * (1-r)) {
            n[i] = -1;
        }
        else{
            n[i] = 0;
        }
    }
    n /= m;
    inc = inc + n;
	inc = mod(inc,1);
    
	colorOut = vec4(inc,0,0);//texelFetch(tex,p0,0).xy + inc,0,0);
}
