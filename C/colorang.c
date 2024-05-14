#include <stdlib.h>

// #define STB_IMAGE_WRITE_IMPLEMENTATION
// #include "stb_image_write.h"

typedef unsigned char u8;

#define WIDTH  256
#define HEIGHT 256
#define ALPHA_HEIGHT 32
#define GRAY_HEIGHT  32
#define COLOR_HEIGHT  32

#define MAX_COLOR_VALUE 256
#define CHANNELS_PER_PIXEL 4

#define rgba(r, g, b, a) ((color){r, g, b, a})
#define rgb(r, g, b) ((color){r, g, b, 255})

typedef struct {
    u8 r, g, b, a;
} color;

typedef enum {
    RED_GREEN_BITMAP,
    GREEN_BLUE_BITMAP,
    BLUE_RED_BITMAP,
} BitmapType;

typedef struct {
    u8 red_green_bitmap         [WIDTH * HEIGHT * CHANNELS_PER_PIXEL];
    u8 green_blue_bitmap        [WIDTH * HEIGHT * CHANNELS_PER_PIXEL];
    u8 blue_red_bitmap          [WIDTH * HEIGHT * CHANNELS_PER_PIXEL];
    u8 transparent_bitmap       [WIDTH * HEIGHT * CHANNELS_PER_PIXEL];

    u8 gray_bitmap              [WIDTH * GRAY_HEIGHT  * CHANNELS_PER_PIXEL];
    u8 alpha_bitmap             [WIDTH * ALPHA_HEIGHT * CHANNELS_PER_PIXEL];
    u8 color_bitmap             [WIDTH * COLOR_HEIGHT * CHANNELS_PER_PIXEL];
    u8 transparent_color_bitmap [WIDTH * COLOR_HEIGHT * CHANNELS_PER_PIXEL];

    u8 gray_value;
    u8 alpha_value;
    color current_color;

    u8 *current_bitmap;
    u8 x;
    u8 y;
} colorang;


void calculate_rg_bitmap(colorang *cr) {
    u8 *rg_bitmap = cr->red_green_bitmap;
    u8 gray_value  = cr->gray_value;
    u8 alpha_value = cr->alpha_value;

    for (int y = 0; y < HEIGHT; ++y) {
        float vertical_blend = 1.0f - (float) y / (HEIGHT - 1);

        for (int x = 0; x < WIDTH; ++x) {
            float horizontal_blend = (float) x / (WIDTH - 1);
            int index = (y * WIDTH + x) * CHANNELS_PER_PIXEL;
            u8 red, green, blue;

            float blend_factor = 1.0f;
            if (x > (HEIGHT - 1 - y)) blend_factor = 1 - horizontal_blend;
            else       blend_factor = 1 - vertical_blend;
            u8 adjusted_gray_value = (u8)(gray_value * blend_factor);

            red   = (u8)(255 * vertical_blend) + adjusted_gray_value;
            green = (u8)(255 * horizontal_blend) + adjusted_gray_value;
            blue  = adjusted_gray_value;

            rg_bitmap[index]     = red;
            rg_bitmap[index + 1] = green;
            rg_bitmap[index + 2] = blue;
            rg_bitmap[index + 3] = alpha_value;
        }
    }
}

void calculate_gb_bitmap(colorang *cr) {
    u8 *gb_bitmap  = cr->green_blue_bitmap;
    u8 gray_value  = cr->gray_value;
    u8 alpha_value = cr->alpha_value;

    for (int y = 0; y < HEIGHT; ++y) {
        float vertical_blend   = (float) y / (HEIGHT - 1);

        for (int x = 0; x < WIDTH; ++x) {
            float horizontal_blend = (float) x / (WIDTH - 1);
            int index = (y * HEIGHT + x) * CHANNELS_PER_PIXEL;
            u8 red, green, blue;
            int index_channel;

            float blend_factor = 1.0f;
            if (x > y) blend_factor = 1 - horizontal_blend;
            else       blend_factor = 1 - vertical_blend;
            u8 adjusted_gray_value = (u8)(gray_value * blend_factor);

            index_channel = index / CHANNELS_PER_PIXEL;
            red   = adjusted_gray_value;
            green = (u8)(index_channel % MAX_COLOR_VALUE) + adjusted_gray_value;
            blue  = (u8)(index_channel / MAX_COLOR_VALUE) + adjusted_gray_value;

            gb_bitmap[index]     = (u8) red;
            gb_bitmap[index + 1] = (u8) green;
            gb_bitmap[index + 2] = (u8) blue;
            gb_bitmap[index + 3] = alpha_value;
        }
    }
}

void calculate_br_bitmap(colorang *cr) {
    u8 *br_bitmap  = cr->blue_red_bitmap;
    u8 gray_value  = cr->gray_value;
    u8 alpha_value = cr->alpha_value;


    for (int y = 0; y < HEIGHT; ++y) {
        float vertical_blend = (float) y / (HEIGHT - 1);

        for (int x = 0; x < WIDTH; ++x) {
            float horizontal_blend = (float) x / (WIDTH - 1);
            int index = (y * WIDTH + x) * CHANNELS_PER_PIXEL;
            u8 red, green, blue;

            float blend_factor = 1.0f;
            if (x < y) blend_factor = (1.0f - horizontal_blend);
            else       blend_factor = (1.0f - vertical_blend);

            u8 adjusted_gray_value = (u8)(gray_value * (1.0f - blend_factor));

            red   = (u8)(255 * (1.0f - vertical_blend)) + adjusted_gray_value;
            green = adjusted_gray_value;
            blue  = (u8)(255 * (1.0f - horizontal_blend)) + adjusted_gray_value; 

            br_bitmap[index]     = red;
            br_bitmap[index + 1] = green;
            br_bitmap[index + 2] = blue;
            br_bitmap[index + 3] = alpha_value;
        }
    }
}

void fill_gray_bitmap(colorang *cr) {
    u8 *gbitmap = cr->gray_bitmap;
    u8 alpha    = cr->alpha_value;

    int channels_per_pixel = 4;

    for (int y = 0; y < GRAY_HEIGHT; y++) {
        for (int x = 0; x < WIDTH; x++) {
            u8 value  = (u8)(255 * x / (WIDTH - 1));
            int index = (y * WIDTH + x) * channels_per_pixel;

            gbitmap[index]     = value;
            gbitmap[index + 1] = value;
            gbitmap[index + 2] = value;
            gbitmap[index + 3] = alpha;
        }
    }
}


void fill_alpha_bitmap(colorang *cr) {
    u8 *abitmap = cr->alpha_bitmap;
    u8 gray_colors[2] = {128, 196};

    int pixel_block_size   = 8;
    int channels_per_pixel = 4;


    for (int x = 0; x < WIDTH; x++) {
        float blend_factor = (float)x / (WIDTH - 1);

        for (int y = 0; y < GRAY_HEIGHT; y++) {
            int xindex = (x / pixel_block_size) % 2;
            int yindex = (y / pixel_block_size) % 2;

            u8 base_gray_color = gray_colors[(xindex + yindex) % 2];
            u8 blended_value   = (u8)((1 - blend_factor) * base_gray_color + 255 * blend_factor);

            int index = (y * WIDTH + x) * channels_per_pixel;

            abitmap[index]     = blended_value;
            abitmap[index + 1] = blended_value;
            abitmap[index + 2] = blended_value;
            abitmap[index + 3] = 255;
        }
    }
}


void fill_current_color_bitmap(colorang *cr) {
    u8 *ccbitmap = cr->color_bitmap;
    u8 alpha     = cr->alpha_value;
    u8 r = cr->current_color.r;
    u8 g = cr->current_color.g;
    u8 b = cr->current_color.b;

    int width  = WIDTH;
    int height = GRAY_HEIGHT;
    int channels_per_pixel = 4;

    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            int index = (y * width + x) * channels_per_pixel;

            ccbitmap[index]     = r;
            ccbitmap[index + 1] = g;
            ccbitmap[index + 2] = b;
            ccbitmap[index + 3] = alpha;
        }
    }
}

void fill_transparent_bitmap(colorang *cr) {
    u8 *tbitmap = cr->transparent_bitmap;
    u8 alpha    = cr->alpha_value;
    u8 gray_colors[2] = {128, 196};

    u8 pixel_block_size = 16;

    for (int x = 0; x < WIDTH; ++x) {

        for (int y = 0; y < HEIGHT; ++y) {
            int xindex = (x / pixel_block_size) % 2;
            int yindex = (y / pixel_block_size) % 2;

            int index = (y * WIDTH + x) * CHANNELS_PER_PIXEL;
            u8 base_gray_color = gray_colors[(xindex + yindex) % 2];

            tbitmap[index]     = base_gray_color;
            tbitmap[index + 1] = base_gray_color;
            tbitmap[index + 2] = base_gray_color;
            tbitmap[index + 3] = alpha; 
        }
    }
}

void fill_transparent_color_bitmap(colorang *cr) {
    u8 *tcbitmap = cr->transparent_color_bitmap;
    u8 alpha     = cr->alpha_value;
    u8 gray_colors[2] = {196, 128};

    u8 pixel_block_size = 16;

    for (int x = 0; x < WIDTH; ++x) {

        for (int y = 0; y < COLOR_HEIGHT; ++y) {
            int xindex = (x / pixel_block_size) % 2;
            int yindex = (y / pixel_block_size) % 2;

            int index = (y * WIDTH + x) * CHANNELS_PER_PIXEL;
            u8 base_gray_color = gray_colors[(xindex + yindex) % 2];

            tcbitmap[index]     = base_gray_color;
            tcbitmap[index + 1] = base_gray_color;
            tcbitmap[index + 2] = base_gray_color;
            tcbitmap[index + 3] = alpha;
        }
    }
}

u8 get_x_rg(color c) {
    return c.g - c.b;
}
u8 get_y_rg(color c) {
    return c.r - c.b;
}
u8 get_x_gb(color c) {
    return c.g - c.r;
}
u8 get_y_gb(color c) {
    return c.b - c.r;
}
u8 get_x_br(color c) {
    return c.b - c.g;
}
u8 get_y_br(color c) {
    return c.r - c.g;
}

void update_gray_value_and_position_from_color(colorang *cr, color c) {
    u8 *current_bitmap = cr->current_bitmap;

    if (current_bitmap == cr->red_green_bitmap) {
        u8 blue = c.b;

        u8 x = get_x_rg(c);
        u8 y = get_y_rg(c);
        y = (MAX_COLOR_VALUE-1) - y;

        cr->x = x;
        cr->y = y;

        float horizontal_blend = (float) x / (WIDTH - 1.0f);
        float vertical_blend   = 1.0f - ((float) y / (HEIGHT - 1.0f));

        float blend_factor;
        if (x > (HEIGHT - 1 - y)) {
            blend_factor = 1.0f - horizontal_blend;
        } else {
            blend_factor = 1.0f - vertical_blend;
        }

        cr->gray_value = blue / (u8) blend_factor;

    }
    else if (current_bitmap == cr->green_blue_bitmap) {
        u8 red = c.r;

        u8 x = get_x_gb(c);
        u8 y = get_y_gb(c);
        cr->x = x;
        cr->y = y;


        float horizontal_blend = (float) x / (WIDTH - 1);
        float vertical_blend   = (float) y / (HEIGHT - 1);

        float blend_factor;
        if (x > y) {
            blend_factor = 1 - horizontal_blend;
        } else {
            blend_factor = 1 - vertical_blend;
        }

        cr->gray_value = red / (u8) blend_factor;
    }
    else if (current_bitmap == cr->blue_red_bitmap) {
        u8 green = c.g;

        u8 x = get_x_br(c);
        u8 y = get_y_br(c);
        cr->x = (MAX_COLOR_VALUE-1) - x;
        cr->y = (MAX_COLOR_VALUE-1) - y;

        float horizontal_blend = (float) (255-x) / (WIDTH - 1);
        float vertical_blend = 1 - (float) (255-x) / (HEIGHT - 1);

        float blend_factor;
        if ((255-x) < (255-y)) {
            blend_factor = 1 - horizontal_blend;
        } else {
            blend_factor = 1 - vertical_blend;
        }

        cr->gray_value = green / (u8) (1.0 - blend_factor);
    }

}

void colorang_set_current_color(colorang *cr, color c) {
    cr->current_color = c;
    fill_current_color_bitmap(cr);
}


void colorang_update_from_color(colorang *cr, color c) {
    u8 r, g, b, a;
    r = c.r;
    g = c.g;
    b = c.b;
    a = c.a;

    if (r >= b && g > b) {
        cr->current_bitmap = cr->red_green_bitmap;
    }
    else if (g >= r && b > r) {
        cr->current_bitmap = cr->green_blue_bitmap;
    }
    else if (r >= g && b > g) {
        cr->current_bitmap = cr->blue_red_bitmap;
    }
    else {
        cr->current_bitmap = cr->red_green_bitmap;
    }

    update_gray_value_and_position_from_color(cr, c);

    if (r == g && r == b) {
        cr->gray_value = r;
        cr->x = 0;
        cr->y = 0;
    }

    cr->alpha_value = a;
    cr->current_color = c;

    calculate_rg_bitmap(cr);
    calculate_gb_bitmap(cr);
    calculate_br_bitmap(cr);
    fill_current_color_bitmap(cr);
}

void colorang_update_gray_value(colorang *cr, u8 gray_value) {
    cr->gray_value = gray_value;
    calculate_rg_bitmap(cr);
    calculate_gb_bitmap(cr);
    calculate_br_bitmap(cr);

    u8 *offset_index = cr->current_bitmap + (cr->x + cr->y * WIDTH) * CHANNELS_PER_PIXEL;
    colorang_set_current_color(cr, rgba(*offset_index, *(offset_index+1), *(offset_index+2), *(offset_index+3)));
}

void colorang_update_current_color_from_pos(colorang *cr, u8 x, u8 y, BitmapType type) {
    u8 *bitmap = NULL;
    switch (type){
        case RED_GREEN_BITMAP:
            bitmap = cr->red_green_bitmap;
            break;
        case GREEN_BLUE_BITMAP:
            bitmap = cr->green_blue_bitmap;
            break;
        case BLUE_RED_BITMAP:
            bitmap = cr->blue_red_bitmap;
            break;
    }

    cr->x = x;
    cr->y = y;
    cr->current_bitmap = bitmap;
    u8 *offset_index = cr->current_bitmap + (cr->x + cr->y * WIDTH) * CHANNELS_PER_PIXEL;
    colorang_set_current_color(cr, rgba(*offset_index, *(offset_index+1), *(offset_index+2), *(offset_index+3)));
}

void colorang_update_alpha_value(colorang *cr, u8 alpha_value) {
    cr->alpha_value = alpha_value;
    cr->current_color.a = alpha_value;
    calculate_rg_bitmap(cr);
    calculate_gb_bitmap(cr);
    calculate_br_bitmap(cr);
    fill_current_color_bitmap(cr);
}

void colorang_init(colorang *cr) {
    cr->alpha_value = 255;
    cr->gray_value  = 0;

    cr->current_color = rgba(0, 0, 0, 255);

    cr->current_bitmap = cr->red_green_bitmap;
    cr->x = 0;
    cr->y = 255;

    // Should only need to be called once
    fill_gray_bitmap(cr);
    fill_alpha_bitmap(cr);
    fill_transparent_bitmap(cr);
    fill_transparent_bitmap(cr);
    fill_transparent_color_bitmap(cr);

    // Needs to be called every time the user clicks a new color
    fill_current_color_bitmap(cr);

    calculate_rg_bitmap(cr);
    calculate_gb_bitmap(cr);
    calculate_br_bitmap(cr);
}


int main(void) {
    
    colorang *cr = (colorang*)malloc(sizeof(colorang)); 

    if (!cr) return 1;
    colorang_init(cr);

    // For when the user selects a new color
    colorang_update_current_color_from_pos(cr, 0, 0, RED_GREEN_BITMAP);

    // For when the user updates the gray / alpha value
    colorang_update_gray_value(cr, 80);
    colorang_update_alpha_value(cr, 100);

    // For when the user pastes a new color
    color light_purple = rgba(123, 66, 158, 255);
    colorang_update_from_color(cr, light_purple);


    /*
        Below writes out the colorang to png images in the 'images' folder
        Uncomment the #define and #include at the top of this file if you want to use it.
    */

    // stbi_write_png("images/br_bitmap.png", WIDTH, HEIGHT, 4, cr->blue_red_bitmap,    WIDTH * 4);
    // stbi_write_png("images/rg_bitmap.png", WIDTH, HEIGHT, 4, cr->red_green_bitmap,   WIDTH * 4);
    // stbi_write_png("images/gb_bitmap.png", WIDTH, HEIGHT, 4, cr->green_blue_bitmap,  WIDTH * 4);
    // stbi_write_png("images/g_bitmap.png" , WIDTH, GRAY_HEIGHT,  4, cr->gray_bitmap,  WIDTH * 4);
    // stbi_write_png("images/a_bitmap.png" , WIDTH, ALPHA_HEIGHT, 4, cr->alpha_bitmap, WIDTH * 4);
    // stbi_write_png("images/cc_bitmap.png", WIDTH, COLOR_HEIGHT, 4, cr->color_bitmap, WIDTH * 4);
    // stbi_write_png("images/t_bitmap.png",  WIDTH, HEIGHT,       4, cr->transparent_bitmap, WIDTH * 4);
    // stbi_write_png("images/tc_bitmap.png", WIDTH, COLOR_HEIGHT, 4, cr->transparent_color_bitmap, WIDTH * 4);
}
