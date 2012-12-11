// Fragment Shader - file "correction.frag"

#version 330

precision highp float; // needed only for version 1.30

uniform sampler2D example_texture; // example texture
uniform sampler2D res; // synthesized texture
uniform sampler2D matches_x;
uniform sampler2D matches_y;

in vec2 uv_coord; // uv coordinate
#define k_val 4 // the number of values to return in the set
#define nbhd 5

out vec4 kcoh_set_x; // output x values
out vec4 kcoh_set_y; // output y values

// calculate squared neighborhood distance for neighborhood of size k
float nbhd_dist(ivec2 ex_ij, ivec2 cur_ij, int k) {
    // calculate the shift
    int shift = int(k * 0.5);

    // check if center is far enough away from boundary if not, shift the 
    //  position of the pixel in the neighborhood so that the neighborhood
    //  fits into the boundaries of the image
    //ivec2 c_ex = clamp(ex_ij, ivec2(shift), textureSize(example_texture, 0) - ivec2(shift));
    //ivec2 c_cur = clamp(cur_ij, ivec2(shift), textureSize(res, 0) - ivec2(shift));
    
    //ivec4 cur_coord = ivec4(max(cur_ij - ivec2(shift), ivec2(0)), min(cur_ij + ivec2(shift), texturesize(res,0)));
    //ivec4 ex_coord = ivec4(max(ex_ij - ivec2(shift), ivec2(0)), min(ex_ij + ivec2(shift), texturesize(example_texture,0)));
    ivec2 s_min = min(min(ex_ij-ivec2(shift),0),min(cur_ij-ivec2(shift),0));
    ivec2 s_max = ivec2(-1) * min(min(textureSize(example_texture,0)-ex_ij-ivec2(shift),0),min(textureSize(res,0)-cur_ij-ivec2(shift),0));

    // calculate summed squared euclidean distance for each channel for each
    //  pixel in the neighborhood; k is assumed to be odd
    vec4 dist = vec4(0.0f);
    vec4 cur_val;
    vec4 ex_val;
    for (int i = s_min.y; i <= s_max.y; i++) {
        for (int j = s_min.x; j <= s_max.x; j++) {
            ex_val = texelFetch(example_texture, ex_ij+ivec2(i,j), 0);
            cur_val = texelFetch(res, cur_ij+ivec2(i,j), 0);
            cur_val = texture(example_texture, cur_val.xy);
            dist += pow(cur_val - ex_val, vec4(2));
        }
    }
    dist /= vec4((s_max.x-s_min.x)*(s_max.y-s_min.y)); 
    // return summed channels for the neighborhood
    return dist.r + dist.g + dist.b + dist.a;
}

void main(void) {
    int shift = int(0.5 * nbhd);
    // reposition the neighborhood so that it fits within bounds.
    //  if it is out of bounds, shift where the pixel is within the 
    //  neighborhood so that it fits properly
    //ivec2 c_cur = clamp(ivec2(uv_coord * textureSize(res, 0)), ivec2(shift), textureSize(res, 0) - shift);
    ivec2 c_cur = ivec2(uv_coord * textureSize(res, 0));
    ivec2 c_ex = c_cur;

    // array to store the neighborhood
    ivec3 nbhd_set[nbhd * nbhd];
    int index = 0;

    // iterate over neighborhood and calculate the neighborhood distances
    ivec2 lc;
    ivec2 begin = max(c_ex - ivec2(shift),ivec2(0));
    ivec2 end = min(c_ex + ivec2(shift),textureSize(res,0));
    
    if (begin != ivec2(c_ex-ivec2(shift)) || end != ivec2(c_ex+ivec2(shift))) {
        kcoh_set_x = vec4(texelFetch(res,c_ex,0).x);
        kcoh_set_y = vec4(texelFetch(res,c_ex,0).y);
        return;
    }

    for (int i = begin.x; i<=end.x; i++) {
        for (int j = begin.y; j<=end.y; j++) {
            lc = ivec2(texelFetch(res, ivec2(i,j), 0).xy * textureSize(example_texture, 0));
            nbhd_set[index] = ivec3(lc, nbhd_dist(lc, c_cur, 5));
            index++;
        }
    }

    // store the current min val
    float min_val = nbhd_set[0].z;
    ivec3 swap_val;

    // find the top k (4) values
    for (int i = 0; i < 4; i++) {
        // for each cell, loop over all to find the next minimum val
        for (int j = i; j < index; j++) {
            // find the min val
            min_val = min(min_val, nbhd_set[j].z);

            // choose the value to be put into cell i
            swap_val = ivec3(nbhd_set[j] * int(nbhd_set[j].z == min_val)) + ivec3(nbhd_set[i] * int(nbhd_set[j].z != min_val));
            
            // move the current value at nbhd_set[i] to j if it needs to be moved
            nbhd_set[j] = ivec3(nbhd_set[i] * int(nbhd_set[i].z != swap_val.z)) + ivec3(nbhd_set[j] * int(nbhd_set[i].z == swap_val.z));
            
            // value at nbhd_set[i] is now swap
            nbhd_set[i] = swap_val;
        }
    }
    for (int i = 0; i < 4; i++) {
        kcoh_set_x[i] = nbhd_set[i].x;
        kcoh_set_y[i] = nbhd_set[i].y;
    }
    kcoh_set_x /= vec4(textureSize(example_texture, 0).x);
    kcoh_set_y /= vec4(textureSize(example_texture, 0).y);
}

