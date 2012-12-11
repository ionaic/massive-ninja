// Fragment Shader - file "correction.frag"

#version 330
precision highp float;

//uniform sampler2D example_texture; // example texture
in vec2 uv_coord; // uv coordinate
out vec4 colorOut; // output color at this pixel

void main(void) {
	colorOut = vec4(uv_coord,0,0);//texture(example_texture, uv_coord);
}
