// Fragment Shader - file "minimal.frag"

#version 130

precision highp float; // needed only for version 1.30

uniform sampler2D tex;
uniform uint m;
in  vec3 ex_Color;
in  vec2 ex_UV;
in vec4 gl_FragCoord;
out vec4 out_Color;

void main(void) {
    float mstep = 1./float(m);
	ivec2 p = ivec2(gl_FragCoord.xy);
	ivec2 p0 = p/2;
    vec2 inc = vec2(p.x&1,p.y&1)/vec2(m,m);
	out_Color = vec4(texture(tex,ex_UV).xy,0,0);//texelFetch(tex,p0,0).xy + inc,0,0);
    //out_Color = texture(tex,ex_UV);
	//out_Color = vec4(ex_Color,1.0);
}
