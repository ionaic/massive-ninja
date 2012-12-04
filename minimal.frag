// Fragment Shader - file "minimal.frag"

#version 130

precision highp float; // needed only for version 1.30

uniform sampler2D tex;
in  vec3 ex_Color;
in  vec2 ex_UV;
in vec4 gl_FragCoord;
out vec4 out_Color;

void main(void) {
	ivec2 p = ivec2(round(gl_FragCoord).xy);
	ivec2 p0 = p/2;
	//texture(tex,p0)+
	out_Color = texture(tex,ex_UV);
	//out_Color = vec4(ex_Color,1.0);
}
