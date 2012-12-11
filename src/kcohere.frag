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
vec4 kcoh_set_dist;
// calculate squared neighborhood distance for neighborhood of size k
float nbhd_dist(ivec2 ex_ij, ivec2 cur_ij, int k) {
    // calculate the shift
    int shift = int(k * 0.5);

    // check if center is far enough away from boundary if not, shift the 
    //  position of the pixel in the neighborhood so that the neighborhood
    //  fits into the boundaries of the image
    
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

ivec2 imsize;
void doComparison(ivec2 lc, ivec2 c_cur) {
    float dist, tmp, equiv;
    vec4 finder, ifinder;
    // calc the distance
    dist = nbhd_dist(lc, c_cur, 5);
    // stick this value in the top 4 if it belongs there
    tmp = max(dist,max(kcoh_set_dist.x,max(kcoh_set_dist.y,max(kcoh_set_dist.z,kcoh_set_dist.w))));
    finder = vec4(tmp==kcoh_set_dist.x, tmp==kcoh_set_dist.y, tmp==kcoh_set_dist.z, tmp==kcoh_set_dist.w);
    ifinder = vec4(1) - finder;
    kcoh_set_dist = finder * kcoh_set_dist + ifinder * vec4(tmp);
    kcoh_set_x = finder * kcoh_set_x + ifinder * vec4(float(lc.x)/float(imsize.x));
    kcoh_set_y = finder * kcoh_set_y + ifinder * vec4(float(lc.y)/float(imsize.y));
}

void main(void) {
    int shift = int(0.5 * nbhd);
    // reposition the neighborhood so that it fits within bounds.
    //  if it is out of bounds, shift where the pixel is within the 
    //  neighborhood so that it fits properly
    ivec2 c_cur = ivec2(uv_coord * textureSize(res, 0));
    ivec2 c_ex = c_cur;

    // array to store the neighborhood
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
    imsize = textureSize(example_texture, 0);
    for (int i = begin.x; i<=end.x; i++) {
        for (int j = begin.y; j<=end.y; j++) {
            lc = ivec2(texelFetch(res, ivec2(i,j), 0).xy * imsize);
            doComparison(lc,c_cur);
        }
    }
    float tmp = min(kcoh_set_dist.x, min(kcoh_set_dist.y, min(kcoh_set_dist.z, kcoh_set_dist.w)));
    if (tmp == kcoh_set_dist.y) {
        tmp = kcoh_set_x.x;
        kcoh_set_x.x = kcoh_set_x.y;
        kcoh_set_x.y = tmp;

        tmp = kcoh_set_y.x;
        kcoh_set_y.x = kcoh_set_y.y;
        kcoh_set_y.y = tmp;
    } else if (tmp == kcoh_set_dist.z) {
        tmp = kcoh_set_x.x;
        kcoh_set_x.x = kcoh_set_x.z;
        kcoh_set_x.z = tmp;

        tmp = kcoh_set_y.x;
        kcoh_set_y.x = kcoh_set_y.z;
        kcoh_set_y.z = tmp;
    } else if (tmp == kcoh_set_dist.w) {
        tmp = kcoh_set_x.x;
        kcoh_set_x.x = kcoh_set_x.w;
        kcoh_set_x.w = tmp;

        tmp = kcoh_set_y.x;
        kcoh_set_y.x = kcoh_set_y.w;
        kcoh_set_y.w = tmp;
    }
    return;
}

