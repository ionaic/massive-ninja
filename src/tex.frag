// Fragment Shader - file "minimal.frag"

#version 130

precision highp float; // needed only for version 1.30

uniform sampler2D tex;
uniform sampler2D exemplar;
uniform int mode;
in  vec3 ex_Color;
in  vec2 ex_UV;
out vec4 out_Color;

void main(void) {
	if (mode==0)
		out_Color = texture(tex,ex_UV);
	else if (mode==1)
		out_Color = texture(exemplar,texture(tex,ex_UV).xy);
	else
		out_Color = texture(exemplar,ex_UV);
	//out_Color = vec4(ex_Color,1.0);
}
