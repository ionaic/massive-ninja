#version 330

precision highp float; // needed only for version 1.30

uniform sampler2D exemplar;
in vec2 uv_coord; // uv coordinate

out vec4 matches_x;
out vec4 matches_y;

// store the current min val
float min_val;
// store the nearest 4 neighborhoods
vec3 nbhd_set[4];

// size of the neighborhood we're looking at
#define nbhd 5

// keep only the smallest 4 out of the 4 current smallest and the new value
void keepSmallest(vec3 new_val) {
    min_val == nbhd_set[0].z
    // compare the given value to the existing values
    for (int i = 0; i < 4; i++) {
        // find the min val between the newcomer and this value
        min_val = min(min_val, new_val.z);

        // choose the value to be put into cell i
        nbhd_set[i] = vec3(new_val * int(new_val.z == min_val)) + vec3(nbhd_set[i] * int(new_val.z != min_val));
    }
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
            a_val = texelFetch(exemplar, a_val + ivec2(j, i), 0);
            b_val = texelFetch(exemplar, b_val + ivec2(j, i), 0);
            dist += pow(a_val - b_val, vec4(2));
        }
    }
    //dist /= vec4((s_max.x-s_min.x)*(s_max.y-s_min.y)); 
    // return summed channels for the neighborhood
    return dist.r + dist.g + dist.b + dist.a;
}

void main(void) {
    // calculate the shift
    int shift = int(nbhd * 0.5);
    ivec2 size textureSize(exemplar, 0);
    ivec2 cur_pos = ivec2(size * uv_coords);
    
    // loop over all of the pixels in the image, only iterate over the middle
    //  to avoid the edge cases
    vec3 cur_vals;
    for (int i = shift; i < size.y; i++) {
        for (int j = shift; j < size.x; j++) {
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

	//matches_x = vec4(uv_coord.x);
	//matches_y = vec4(uv_coord.y);
}

