// Fragment Shader - file "correction.frag"

#version 330

precision highp float; // needed only for version 1.30

uniform sampler2D example_texture; // example texture
uniform sampler2D res; // synthesized texture
in vec2 uv_coord // uv coordinate
#define k_val 4 // the number of values to return in the set

out vec4 kcoh_set; // output values, (x,y) coords packed into floats

// calculate squared neighborhood distance for neighborhood of size k
float nbhd_dist(ivec2 res_ij, ivec2 ex_ij, int k) {
    int shift = int(k * 0.5);

    // check if center is far enough away from boundary if not, shift the 
    //  position of the pixel in the neighborhood so that the neighborhood
    //  fits into the boundaries of the image
    ivec2 c_res = clamp(res_ij, shift, textureSize(res, 0) - shift);
    ivec2 c_ex = clamp(ex_ij, shift, textureSize(example_texture, 0) - shift);
    
    // calculate summed squared euclidean distance for each channel for each
    //  pixel in the neighborhood
    vec4 dist = vec4(0.0f, 0.0f, 0.0f, 0.0f);
    for (int i = -1 * shift; i <= shift; i++) {
        for (int j = -1 * shift; j <= shift; j++) {
            dist += pow(texture(example_texture, c_ex + ivec2(i, j)) - texture(example_texture, texelFetch(res, c_res + ivec2(i, j),0).xy), vec4(2));
        }
    }
 
    // return summed channels for the neighborhood
    return dist.r + dist.g + dist.b + dist.a;
}

void main(void) {
    // reposition the neighborhood so that it fits within bounds.
    //  if it is out of bounds, shift where the pixel is within the 
    //  neighborhood so that it fits properly
    ivec2 c_res = clamp(gl_FragCoord, 3, textureSize(res, 0) - 3);
    ivec2 c_ex = clamp(ivec2(uv_coord * textureSize(example_texture, 0)), 3, textureSize(example_texture, 0) - 3);

    // array to store the neighborhood
    ivec3 nbhd_set[9];
    
    // iterate over neighborhood and calculate the neighborhood distances
    for (int i = -1; i <= 1; i++) {
        for (int j = -1; j <= 1; j++) {
            nbhd_set[((i+1) * 3) + (j+1)] = nbhd_dist(c_res + vec2(i, j), c_ex + vec2(i, j), 5);
        }
    }
    
    // store the current min val
    float min_val = nbhd_set[0].z;
    ivec3 swap_val;

    // find the top k (4) values
    for (int i = 0; i < 4; i++) {
        // for each cell, loop over all to find the next minimum val
        for (int j = i; j < 9; j++) {
            // find the min val
            min_val = min(min_val, nbhd_set[j].z);

            // choose the value to be put into cell i
            swap_val = ivec3(nbhd_set[j] * int(nbhd_set[j].z == min_val)) + ivec3(nbhd_set[i] * int(nbhd_set[j].z != min_val));
            
            // move the current value at nbhd_set[i] to j if it needs to be moved
            nbhd_set[j] = ivec3(nbhd_set[i] * int(nbhd_set[i].z != swap_val.z)) + ivec3(nbhd_set[j] * int(nbhd_set[i].z == swap_val.z))
            
            // value at nbhd_set[i] is now swap
            nbhd_set[i] = swap_val;
        }
    }
    
    // pack each pair into a float
    for (int i = 0; i < 4; i++) {
        kcoh_set[i] = (nbhd_set[i].x * 65536) + nbhd_set[i].y;
    }
}
