#version 330

precision highp float; // needed only for version 1.30

uniform sampler2D exemplar;
in vec2 uv_coord; // uv coordinate

out vec4 matches_x;
out vec4 matches_y;

// store the nearest 4 neighborhoods
vec3 nbhd_set[4];

// size of the neighborhood we're looking at
#define nbhd 5

// keep only the smallest 4 out of the 4 current smallest and the new value
void keepSmallest(vec3 new_val) {
    // store the current max val
    vec3 test_val == nbhd_set[0];
    float test_z;

    // find the maximum value in the current set
    for (int i = 0; i < 4; i++) {
        test_z = max(test_val.z, nbhd_set[i].z);
        // find the min val between the newcomer and this value
        test_val = test_val * int(test_val.z == test_z) + nbhd_set[i] * int(test_val.z != test_z);
    }
    test_z = max(test_val.z, new_val);
    // find the min val between the newcomer and this value
    test_val = test_val * int(test_val.z == test_z) + new_val * int(test_val.z != test_z);
    
}

// calculate squared neighborhood distance for neighborhood of size k
float nbhd_dist(ivec2 a_ij, ivec2 b_ij, int k) {
    // calculate the shift
    int shift = int(k * 0.5);

    // calculate summed squared euclidean distance for each channel for each
    //  pixel in the neighborhood; k is assumed to be odd
    vec4 dist = vec4(0.0f);
    vec4 a_val;
    vec4 b_val;
    for (int i = -1 * shift; i <= shift; i++) {
        for (int j = -1 * shift; j <= shift; j++) {
            a_val = texelFetch(exemplar, a_ij + ivec2(j, i), 0);
            b_val = texelFetch(exemplar, b_ij + ivec2(j, i), 0);
            dist += pow(a_val - b_val, vec4(2));
        }
    }
    // return summed channels for the neighborhood
    return dist.r + dist.g + dist.b + dist.a;
}

void main(void) {
    // calculate the shift
    int shift = int(nbhd * 0.5);
    ivec2 size = textureSize(exemplar, 0);
    ivec2 cur_pos = ivec2(size * uv_coord);
    
    // loop over all of the pixels in the image, only iterate over the middle
    //  to avoid the edge cases
    vec3 cur_vals;
    for (int i = shift; i < size.y - shift; i++) {
        for (int j = shift; j < size.x - shift; j++) {
            cur_vals.xy = vec2(j, i);
            cur_vals.z = nbhd_dist(ivec2(cur_vals.xy), cur_pos, nbhd);
            keepSmallest(cur_vals);
        }
    }

    for (int i = 0; i < 4; i++) {
        matches_x[i] = nbhd_set[i].x;
        matches_y[i] = nbhd_set[i].y;
    }
    matches_x /= vec4(textureSize(exemplar, 0).x);
    matches_y /= vec4(textureSize(exemplar, 0).y);
}

