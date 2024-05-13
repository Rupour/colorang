# colorang
 A (slightly) new way to visualize RGBA color

 ## There are two folders, 'Web' and 'C'. 

 ### The Web folder is the website demo colorang.org. 

 The Javascript code is messy, but functional. There is one main bug I know about, where it seems like HTML canvases premultiply the alpha into the RGB channels, causing a major loss of precision at low transparency values. However, if you select your color on a normal alpha value, then decrease the alpha, it works fine.

 You can just open the index.html in any web browser and the colorang should load. It uses no dependancies.

 ### The C folder contains a C99 compatible implementation of the colorang so you can embed it in your application. 
 There is also a copy of [Sean Barret's stb_image_write](https://github.com/nothings/stb/blob/master/stb_image_write.h) (commented out initially in the colorang.c file) so you can export the colorang to pngs if you want to look at them.

 You can compile the C code with any C compiler:
    MSVC:  cl /O2 colorang.c
    GNU:   gcc -O3 colorang.c
    CLANG: clang -O3 colorang.c 

 The C code compiles without warnings with the -Wall or /W4 flags (unless you uncomment and use the stb_image_write file, as those have warnings).

Hopefully this is of use to you. If you want an explaination of how it works / my reasonings for developing it, check out my blog post pursuitofgamedev.com/colorang

So long!
