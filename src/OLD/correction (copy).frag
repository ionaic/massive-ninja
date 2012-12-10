// Fragment Shader - file "correction.frag"

#version 330

precision highp float; // needed only for version 1.30

uniform sampler2D ex; // example texture
uniform sampler2D res; // synthesized texture
uniform sampler2D coords;
in vec4 gl_FragCoord; // coordinate of current fragment on screen
//in int nbhd_size; // neighborhood size 
in vec2 ex_UV; // corresponding coordinate of current pixel in example texture

out vec4 colorOut; // output color at this pixel


// calculate squared neighborhood distance for neighborhood of size k
float nbhd_dist(ivec2 res_ij, ivec2 ex_ij, int k) {
    int shift = int(k * 0.5);

    // check if center is far enough away from boundary if not, shift the 
    //  position of the pixel in the neighborhood so that the neighborhood
    //  fits into the boundaries of the image
    ivec2 c_res = clamp(res_ij, ivec2(shift), textureSize(res, 0) - ivec2(shift));
    ivec2 c_ex = clamp(ex_ij, ivec2(shift), textureSize(ex, 0) - ivec2(shift));
    
    // calculate summed squared euclidean distance for each channel for each
    //  pixel in the neighborhood
    vec4 dist = vec4(0.0f, 0.0f, 0.0f, 0.0f);
    for (int i = -1 * shift; i <= shift; i++) {
        for (int j = -1 * shift; j <= shift; j++) {
            dist += pow(texture(ex, c_ex + ivec2(i, j)) - texture(ex, texelFetch(res, c_res + ivec2(i, j),0).xy), vec4(2));
        }
    }
 
    // return summed channels for the neighborhood
    return dist.r + dist.g + dist.b + dist.a;
}

ivec2 unpackCoord(float coord) {
    int icoord = floatBitsToInt(coord);
    return ivec2(icoord/65536, (icoord*65536)/65536);
}

void main(void) {
    ivec2 size = textureSize(res,0);
    ivec2 my_pos = ivec2(vec2(size) * ex_UV);
    vec4 texcoord = texture(coords,ex_UV);
    ivec2 coord = unpackCoord(texcoord.x);
    float dist1 = nbhd_dist(ivec2(gl_FragCoord.xy), coord, 5);
    coord = unpackCoord(texcoord.y);
    float dist2 = nbhd_dist(ivec2(gl_FragCoord.xy), coord, 5);
    coord = unpackCoord(texcoord.z);
    float dist3 = nbhd_dist(ivec2(gl_FragCoord.xy), coord, 5);
    coord = unpackCoord(texcoord.w);
    float dist4 = nbhd_dist(ivec2(gl_FragCoord.xy), coord, 5);

    float dist = min(dist1,min(dist2,min(dist3,dist4)));
    coord = unpackCoord(texcoord.x*float(dist==dist1) + texcoord.y*float(dist==dist2) + texcoord.z*float(dist==dist3) + texcoord.w*float(coord==dist3));
    
    vec2 newCoord = vec2(coord) / vec2(textureSize(res,0));
     
    colorOut = vec4(newCoord,0,0);//texture(ex, ex_UV); // for now, just output the same texture coord
    colorOut = texture(ex,ex_UV);
}
