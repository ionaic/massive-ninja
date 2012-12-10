#version 330

precision highp float; // needed only for version 1.30

uniform sampler2D example_texture; // example texture
uniform sampler2D res; // synthesized texture
in vec2 uv_coord; // uv coordinate
in vec4 gl_FragCoord; // coordinate of current fragment on screen (in output texture in this case)
#define k_val 4 // the number of values to return in the set

out vec4 kcoh_set_x; // output x values
//out vec4 kcoh_set_y; // output y values

void main() {
    kcoh_set_x = vec4(gl_FragCoord.xy/textureSize(res,0),0,0);//texelFetch(res,ivec2(),0);
   //kcoh_set_y = texture(res,uv_coord);
}

