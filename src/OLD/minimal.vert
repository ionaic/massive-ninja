// Vertex Shader - file "minimal.vert"

#version 330

in  vec3 in_Position;
in  vec2 in_UV;
out vec2 uv_coord;

void main(void) {
    uv_coord = in_UV;
	gl_Position = vec4(in_Position, 1.0);
}
