// Fragment Shader - file "correction.frag"

#version 330

precision highp float; // needed only for version 1.30

uniform sampler2D ex; // example texture
uniform sampler2D res; // synthesized texture
in vec4 gl_FragCoord; // coordinate of current fragment on screen
in vec2 ex_UV; // corresponding coordinate of current pixel in example texture
#define k_val 4 // the number of values to return in the set

out vec4 kcoh_set; // output values, (x,y) coords packed into floats

// calculate squared neighborhood distance for neighborhood of size k
float nbhd_dist(ivec2 res_ij, ivec2 ex_ij, int k) {
    int shift = int(k * 0.5);

    // check if center is far enough away from boundary if not, shift the 
    //  position of the pixel in the neighborhood so that the neighborhood
    //  fits into the boundaries of the image
    ivec2 c_res = clamp(res_ij, shift, textureSize(res, 0) - k);
    ivec2 c_ex = clamp(ex_ij, shift, textureSize(ex, 0) - k);
    
    // calculate summed squared euclidean distance for each channel for each
    //  pixel in the neighborhood
    vec4 dist = vec4(0.0f, 0.0f, 0.0f, 0.0f);
    for (int i = -1 * shift; i < shift; i++) {
        for (int j = -1 * shift; j < shift; j++) {
            dist += pow(texture(ex, c_ex + vec2(i, j)) - texture(ex, texelFetch(res, c_res + vec2(i, j))), 2);
        }
    }
 
    // return summed channels for the neighborhood
    return dist.r + dist.g + dist.b + dist.a;
}

void main(void) {
    // for 3x3 nbhd around the current pixel
    // look up the coordinates, compare squared nbhd distances
    // take top k results
    
    // reposition the neighborhood so that it fits within bounds.
    //  if it is out of bounds, shift where the pixel is within the 
    //  neighborhood so that it fits properly
    ivec2 c_res = clamp(gl_FragCoord, 3, textureSize(res, 0) - 3);
    ivec2 c_ex = clamp(ex_UV, 3, textureSize(ex, 0) - 3);

    // array to store the neighborhood
    

    // iterate over neighborhood and calculate the neighborhood distances
    for (int i = -1 * shift; i < shift; i++) {
        for (int j = -1 * shift; j < shift; j++) {
        }
    }

}
