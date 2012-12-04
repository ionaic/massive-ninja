#include <GL/glew.h>
#include <GL/glfw.h>
#include <stdlib.h>
#include <fstream>
#include <iostream>
using std::cout; using std::endl;

// global variables to store the scene geometry
GLuint vertexArrayID;
GLuint bufferIDs[3];

// initialize the scene geometry
void initGeometry() {
	static const GLfloat rawVertexData[12] = { -1.0f,-1.0f,0.0f,  -1.0f,1.0f,0.0f,  1.0f,-1.0f,0.0f, 1.0f,1.0f,0.0f };
	static const GLfloat rawColorData[12]  = {  1.0f,0.0f,0.0f,  0.0f,1.0f,0.0f,  0.0f,0.0f,1.0f, 1.0f, 1.0f, 0.0f };
	static const GLfloat rawUVData[8] = {0,0, 0,1, 1,0, 1,1};
    // create a new renderable object and set it to be active
	glGenVertexArrays(1,&vertexArrayID);
	glBindVertexArray(vertexArrayID);
	// create buffers for associated data
	glGenBuffers(3,bufferIDs);
	// set a buffer to be active and shove vertex data into it
	glBindBuffer(GL_ARRAY_BUFFER, bufferIDs[0]);
	glBufferData(GL_ARRAY_BUFFER, 12*sizeof(GLfloat), rawVertexData, GL_STATIC_DRAW);
	// bind that data to shader variable 0
	glVertexAttribPointer((GLuint)0, 3, GL_FLOAT, GL_FALSE, 0, 0);
	glEnableVertexAttribArray(0);
	// set a buffer to be active and shove color data into it
	glBindBuffer(GL_ARRAY_BUFFER, bufferIDs[1]);
	glBufferData(GL_ARRAY_BUFFER, 12*sizeof(GLfloat), rawColorData, GL_STATIC_DRAW);
	// bind that data to shader variable 1
	glVertexAttribPointer((GLuint)1, 3, GL_FLOAT, GL_FALSE, 0, 0);
	glEnableVertexAttribArray(1);

    glBindBuffer(GL_ARRAY_BUFFER, bufferIDs[2]);
    glBufferData(GL_ARRAY_BUFFER, 8*sizeof(GLfloat), rawUVData, GL_STATIC_DRAW);
    glVertexAttribPointer((GLuint)2, 2, GL_FLOAT, GL_FALSE, 0, 0);
	glEnableVertexAttribArray(2);
}

// loadFile - loads text file into char* fname
// allocates memory - so need to delete after use
// size of file returned in fSize
char* loadFile(const char *fname, GLint &fSize) {
	std::ifstream::pos_type size;
	char * memblock;

	// file read based on example in cplusplus.com tutorial
	std::ifstream file (fname, std::ios::in|std::ios::binary|std::ios::ate);
	if (file.is_open()) {
		size = file.tellg();
		fSize = (GLuint) size;
		memblock = new char [size];
		file.seekg (0, std::ios::beg);
		file.read (memblock, size);
		file.close();
	} else {
		std::cout << "Unable to open " << fname << std::endl;
		exit(1);
	}
	cout << fname << " loaded" << endl;
	return memblock;
}

GLuint compileShader(const char *fname, GLuint type) {
	GLuint shader;
	GLint length;
	// create a shader ID
	shader = glCreateShader(type);
	// load the file into memory and try to compile it
	char *source = loadFile(fname,length);
	glShaderSource(shader, 1, (const GLchar**)&source,&length);
	GLint compiled;
	glCompileShader(shader);
	// print out errors if they're there
	glGetShaderiv(shader, GL_COMPILE_STATUS, &compiled);
	if (!compiled) {
		std::cout << fname << " failed to compile" << std::endl;
		// find the error length
		glGetShaderiv(shader, GL_INFO_LOG_LENGTH, &length);
		if (length>0) {
			// print the errors
			char *error = new GLchar[length];
			GLint written;
			glGetShaderInfoLog(shader,length, &written, error);
			std::cout << "Error log:\n" << error << std::endl;
			delete[] error;
		}
	}
	delete[] source;
	return shader;
}

GLuint initShaders(const char * vert, const char * frag) {
	GLuint p, f, v;
	// get the shader code
	v = compileShader(vert,GL_VERTEX_SHADER);
	f = compileShader(frag,GL_FRAGMENT_SHADER);	
	// the GLSL program links shaders together to form the render pipeline
	p = glCreateProgram();
	// assign numerical IDs to the variables that we pass to the shaders 
	glBindAttribLocation(p,0, "in_Position");
	glBindAttribLocation(p,1, "in_Color");
	glBindAttribLocation(p,2, "in_UV");
	//glBindAttribLocation(p,3, "tex");
	// bind our shaders to this program
	glAttachShader(p,v);
	glAttachShader(p,f);
	// link things together and activate the shader
	glLinkProgram(p);
	return p;
}

// Callback for when the window is resized
void GLFWCALL windowResize( int width, int height ) {
	glViewport(0,0,(GLsizei)width,(GLsizei)height);
}

GLuint createBlankTex(GLuint size) {
	GLuint texture;
    glGenTextures( 1, &texture );
    glBindTexture( GL_TEXTURE_2D, texture );
    glTexParameterf( GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT );
    glTexParameterf( GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT ); 
    void* data = calloc(size*size,sizeof(GLuint));
    glTexImage2D(GL_TEXTURE_2D,0,GL_RGB16,size,size,0,GL_RGB,GL_UNSIGNED_SHORT,data);
    free(data);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    return texture;
}

int main( void ) {
	// Initialize GLFW
	if( !glfwInit() ) {
		exit( EXIT_FAILURE );
	}
	// Open an OpenGL window
	if( !glfwOpenWindow( 512,512, 0,0,0,0,0,0, GLFW_WINDOW ) ) {
		glfwTerminate();
		exit( EXIT_FAILURE );
	}
	glfwSetWindowTitle("Triangle");
	glfwSetWindowSizeCallback( windowResize );
	glfwSwapInterval( 1 );
	windowResize(512,512);
	glewInit();
	glClearColor(1.0f, 0.0f, 0.0f, 0.0f);
	glClearDepth(1.0f);
	glEnable(GL_DEPTH_TEST);
	glDepthFunc(GL_LEQUAL);
	initGeometry();
	GLuint p = initShaders("minimal.vert", "minimal.frag");
	GLuint q = initShaders("minimal.vert", "tex.frag");
	// Main loop
    GLuint pyramid[10];
    for (int i = 0, j=1; i<10; ++i, j*=2) {
        pyramid[i] = createBlankTex(j);
        cout << j << endl;
    }
	cout << GL_MAX_COMBINED_TEXTURE_IMAGE_UNITS << endl;
	for (GLuint i = 0; i<10; ++i) {
		glActiveTexture(GL_TEXTURE0 + i);
		glBindTexture(GL_TEXTURE_2D, pyramid[i]);
	}
	GLint tex = glGetUniformLocation(p, "tex");
	cout << tex << endl;
	glUseProgram(p);
	
	GLuint FBO;
	glGenFramebuffers(1, &FBO);
	glBindFramebuffer(GL_FRAMEBUFFER,FBO);
	for (GLuint i=1; i<10; ++i) {
		glUniform1i(tex, i-1);
		glFramebufferTexture2D(GL_FRAMEBUFFER,GL_COLOR_ATTACHMENT0,GL_TEXTURE_2D,pyramid[i],0);
		glClear( GL_COLOR_BUFFER_BIT );
		glBindVertexArray(vertexArrayID);
		glDrawArrays(GL_TRIANGLE_STRIP,0,4);
		glfwSwapBuffers();
	}
	glBindFramebuffer(GL_FRAMEBUFFER,0);
	glBindRenderbuffer(GL_RENDERBUFFER,0);
	glUseProgram(q);
	tex = glGetUniformLocation(q, "tex");
	cout << tex << endl;
	glUniform1i(tex, 9);
    int running = GL_TRUE;
	while( running ) {
		// OpenGL rendering goes here...
		glClear( GL_COLOR_BUFFER_BIT );
		// draw the triangle
		glBindVertexArray(vertexArrayID);
		glDrawArrays(GL_TRIANGLE_STRIP,0,4);
		// Swap front and back rendering buffers
		glfwSwapBuffers();
		// Check if ESC key was pressed or window was closed
		running = !glfwGetKey( GLFW_KEY_ESC ) && glfwGetWindowParam( GLFW_OPENED );
	}
	// Close window and terminate GLFW
	glfwTerminate();
	// Exit program
	exit( EXIT_SUCCESS );
}
