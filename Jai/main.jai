#import "Basic";

#import "stb_image_write";
// #define STB_IMAGE_WRITE_IMPLEMENTATION
// #include "stb_image_write.h"

WIDTH :: 256;
HEIGHT :: 256;
ALPHA_HEIGHT :: 32;
GRAY_HEIGHT ::  32;
COLOR_HEIGHT ::  32;

MAX_COLOR_VALUE :: 256;
CHANNELS_PER_PIXEL :: 4;

// #define rgba(r, g, b, a) ((color){r, g, b, a})
// #define rgb(r, g, b) ((color){r, g, b, 255})

Color :: struct {
    r, g, b, a: u8;
}

Bitmap_Type :: enum u32 {
	RED_GREEN_BITMAP;
	GREEN_BLUE_BITMAP;
	BLUE_RED_BITMAP;
}

Colorang :: struct {
	red_green_bitmap:         [WIDTH * HEIGHT * CHANNELS_PER_PIXEL] u8;
	green_blue_bitmap:        [WIDTH * HEIGHT * CHANNELS_PER_PIXEL] u8;
	blue_red_bitmap:          [WIDTH * HEIGHT * CHANNELS_PER_PIXEL] u8;
	transparent_bitmap:       [WIDTH * HEIGHT * CHANNELS_PER_PIXEL] u8;

	gray_bitmap:              [WIDTH * GRAY_HEIGHT  * CHANNELS_PER_PIXEL] u8;
	alpha_bitmap:             [WIDTH * ALPHA_HEIGHT * CHANNELS_PER_PIXEL] u8;
	color_bitmap:             [WIDTH * COLOR_HEIGHT * CHANNELS_PER_PIXEL] u8;
	transparent_color_bitmap: [WIDTH * COLOR_HEIGHT * CHANNELS_PER_PIXEL] u8;

	gray_value: u8;
	alpha_value: u8;
	current_color: Color;

	current_bitmap: Bitmap_Type;
	x: u8;
	y: u8;
}


calculate_rg_bitmap :: (cr: *Colorang) {
	rg_bitmap   : [] u8 = cr.red_green_bitmap;
	gray_value  := cr.gray_value;
	alpha_value := cr.alpha_value;

    for y: 0..(HEIGHT-1) { 
        vertical_blend := 1.0 - (cast(float) y / (HEIGHT - 1.0));
		for x: 0..(WIDTH-1) { 
			horizontal_blend := cast(float) x / (WIDTH - 1);
			index := (y * WIDTH + x) * CHANNELS_PER_PIXEL;
            red, green, blue: u8;

			blend_factor := 1.0;
            if x > (HEIGHT - 1 - y) then blend_factor = 1 - horizontal_blend; else blend_factor = 1 - vertical_blend;

			adjusted_gray_value := cast(u8)(gray_value * blend_factor);

            red   = cast(u8)(255 * vertical_blend) + adjusted_gray_value;
            green = cast(u8)(255 * horizontal_blend) + adjusted_gray_value;
            blue  = adjusted_gray_value;

            rg_bitmap[index]     = red;
            rg_bitmap[index + 1] = green;
            rg_bitmap[index + 2] = blue;
            rg_bitmap[index + 3] = alpha_value;
			// log("[%, %, %, %] ", red, green, blue, alpha_value);
        }
    }
}

calculate_gb_bitmap :: (cr: *Colorang) {
	gb_bitmap   : [] u8 = cr.green_blue_bitmap;
    gray_value  := cr.gray_value;
    alpha_value := cr.alpha_value;

    for y: 0..(HEIGHT-1) { 
		vertical_blend := cast(float) y / (HEIGHT - 1);

		for x: 0..(WIDTH-1) { 
			horizontal_blend := cast(float) x / (WIDTH - 1);
			index := (y * HEIGHT + x) * CHANNELS_PER_PIXEL;
            red, green, blue : u8;
			index_channel: int;

			blend_factor := 1.0;
            if (x > y) then blend_factor = 1.0 - horizontal_blend; else blend_factor = 1.0 - vertical_blend;
			adjusted_gray_value := cast(u8)(gray_value * blend_factor);

            index_channel = index / CHANNELS_PER_PIXEL;
            red   = adjusted_gray_value;
            green = cast(u8)(index_channel % MAX_COLOR_VALUE) + adjusted_gray_value;
            blue  = cast(u8)(index_channel / MAX_COLOR_VALUE) + adjusted_gray_value;

            gb_bitmap[index]     = cast(u8) red;
            gb_bitmap[index + 1] = cast(u8) green;
            gb_bitmap[index + 2] = cast(u8) blue;
            gb_bitmap[index + 3] = alpha_value;
        }
    }
}

calculate_br_bitmap :: (cr: *Colorang) {
	br_bitmap   : [] u8 = cr.blue_red_bitmap;
    gray_value  := cr.gray_value;
    alpha_value := cr.alpha_value;


    for y: 0..(HEIGHT-1) { 
		vertical_blend := cast(float) y / (HEIGHT - 1);

		for x: 0..(WIDTH-1) { 
			horizontal_blend := cast(float) x / (WIDTH - 1);
			index := (y * WIDTH + x) * CHANNELS_PER_PIXEL;
            red, green, blue: u8;

			blend_factor := 1.0;
            if x < y then blend_factor = (1.0 - horizontal_blend); else blend_factor = (1.0 - vertical_blend);

			adjusted_gray_value := cast(u8)(gray_value * (1.0 - blend_factor));

            red   = cast(u8)(255 * (1.0 - vertical_blend)) + adjusted_gray_value;
            green = adjusted_gray_value;
            blue  = cast(u8)(255 * (1.0 - horizontal_blend)) + adjusted_gray_value; 

            br_bitmap[index]     = red;
            br_bitmap[index + 1] = green;
            br_bitmap[index + 2] = blue;
            br_bitmap[index + 3] = alpha_value;
        }
    }
}

fill_gray_bitmap :: (cr: *Colorang) {
	gbitmap: [] u8 = cr.gray_bitmap;
	alpha   := cr.alpha_value;

	channels_per_pixel := 4;

    for y: 0..(GRAY_HEIGHT-1) {
		for x: 0..(WIDTH-1) {
			value := cast(u8)(255 * x / (WIDTH - 1));
			index := (y * WIDTH + x) * channels_per_pixel;

            gbitmap[index]     = value;
            gbitmap[index + 1] = value;
            gbitmap[index + 2] = value;
            gbitmap[index + 3] = alpha;
        }
    }
}


fill_alpha_bitmap :: (cr: *Colorang) {
	abitmap : [] u8 = cr.alpha_bitmap;
	gray_colors := u8.[128, 196];

	pixel_block_size := 8;
	channels_per_pixel := 4;


	for x: 0..(WIDTH-1) {
		blend_factor := cast(float)x / (WIDTH - 1);

		for y: 0..(GRAY_HEIGHT-1) {
			xindex := (x / pixel_block_size) % 2;
			yindex := (y / pixel_block_size) % 2;

			base_gray_color := gray_colors[(xindex + yindex) % 2];
			blended_value   := cast(u8)((1 - blend_factor) * base_gray_color + 255 * blend_factor);

			index := (y * WIDTH + x) * channels_per_pixel;

            abitmap[index]     = blended_value;
            abitmap[index + 1] = blended_value;
            abitmap[index + 2] = blended_value;
            abitmap[index + 3] = 255;
        }
    }
}


fill_current_color_bitmap :: (cr: *Colorang) {
	ccbitmap: [] u8 = cr.color_bitmap;
	alpha    := cr.alpha_value;
	r := cr.current_color.r;
	g := cr.current_color.g;
	b := cr.current_color.b;

	width  := WIDTH;
	height := GRAY_HEIGHT;
	channels_per_pixel := 4;

	for y: 0..(height-1) {
		for x: 0..(width-1) {
			index := (y * width + x) * channels_per_pixel;

            ccbitmap[index]     = r;
            ccbitmap[index + 1] = g;
            ccbitmap[index + 2] = b;
            ccbitmap[index + 3] = alpha;
        }
    }
}

fill_transparent_bitmap :: (cr: *Colorang) {
	tbitmap : [] u8 = cr.transparent_bitmap;
	alpha   := cr.alpha_value;
	gray_colors := u8.[128, 196];

	pixel_block_size := 16;

	for x: 0..(WIDTH-1) {
		for y: 0..(HEIGHT-1) {
			xindex := (x / pixel_block_size) % 2;
			yindex := (y / pixel_block_size) % 2;

			index := (y * WIDTH + x) * CHANNELS_PER_PIXEL;
			base_gray_color := gray_colors[(xindex + yindex) % 2];

            tbitmap[index]     = base_gray_color;
            tbitmap[index + 1] = base_gray_color;
            tbitmap[index + 2] = base_gray_color;
            tbitmap[index + 3] = alpha; 
        }
    }
}

fill_transparent_color_bitmap :: (cr: *Colorang) {
	tcbitmap : [] u8 = cr.transparent_color_bitmap;
	alpha    := cr.alpha_value;
	gray_colors := u8.[196, 128];

	pixel_block_size := 16;

    for x: 0..(WIDTH-1) {
		for y: 0..(COLOR_HEIGHT-1) {
			xindex := (x / pixel_block_size) % 2;
			yindex := (y / pixel_block_size) % 2;

			index := (y * WIDTH + x) * CHANNELS_PER_PIXEL;
			base_gray_color := gray_colors[(xindex + yindex) % 2];

            tcbitmap[index]     = base_gray_color;
            tcbitmap[index + 1] = base_gray_color;
            tcbitmap[index + 2] = base_gray_color;
            tcbitmap[index + 3] = alpha;
        }
    }
}

get_x_rg :: (c: Color) -> u8 {
    return c.g - c.b;
}
get_y_rg :: (c: Color) -> u8 {
    return c.r - c.b;
}
get_x_gb :: (c: Color) -> u8 {
    return c.g - c.r;
}
get_y_gb :: (c: Color) -> u8 {
    return c.b - c.r;
}
get_x_br :: (c: Color) -> u8 {
    return c.b - c.g;
}
get_y_br :: (c: Color) -> u8 {
    return c.r - c.g;
}

update_gray_value_and_position_from_color :: (cr: *Colorang, c: Color) {
	current_bitmap := cr.current_bitmap;

    if (current_bitmap == .RED_GREEN_BITMAP) {
		blue := c.b;

		x := get_x_rg(c);
		y := get_y_rg(c);
        y = (MAX_COLOR_VALUE-1) - y;

        cr.x = x;
        cr.y = y;

		horizontal_blend := cast(float) x / (WIDTH - 1.0);
		vertical_blend   := 1.0 - (cast(float) y / (HEIGHT - 1.0));

		blend_factor: float;
        if (x > (HEIGHT - 1 - y)) {
            blend_factor = 1.0 - horizontal_blend;
        } else {
            blend_factor = 1.0 - vertical_blend;
        }

        cr.gray_value = blue / cast(u8) blend_factor;

    }
    else if (current_bitmap == .GREEN_BLUE_BITMAP) {
		red := c.r;

		x := get_x_gb(c);
		y := get_y_gb(c);
        cr.x = x;
        cr.y = y;


		horizontal_blend := cast(float) x / (WIDTH - 1);
		vertical_blend   := cast(float) y / (HEIGHT - 1);

		blend_factor: float;
        if (x > y) {
            blend_factor = 1 - horizontal_blend;
        } else {
            blend_factor = 1 - vertical_blend;
        }

        cr.gray_value = red / cast(u8) blend_factor;
    }
    else if (current_bitmap == .BLUE_RED_BITMAP) {
		green := c.g;

		x := get_x_br(c);
		y := get_y_br(c);
        cr.x = (MAX_COLOR_VALUE-1) - x;
        cr.y = (MAX_COLOR_VALUE-1) - y;

		horizontal_blend := cast(float) (255-x) / (WIDTH - 1);
		vertical_blend := 1 - cast(float) (255-x) / (HEIGHT - 1);

		blend_factor : float;
        if ((255-x) < (255-y)) {
            blend_factor = 1 - horizontal_blend;
        } else {
            blend_factor = 1 - vertical_blend;
        }

		temp : float = green / (1.0 - blend_factor);
        cr.gray_value = cast(u8) temp;
    }

}

colorang_set_current_color :: (cr: *Colorang, c: Color) {
    cr.current_color = c;
    fill_current_color_bitmap(cr);
}


colorang_update_from_color :: (cr: *Colorang, c: Color) {
    r, g, b, a: u8;
    r = c.r;
    g = c.g;
    b = c.b;
    a = c.a;

    if (r >= b && g > b) {
        cr.current_bitmap = .RED_GREEN_BITMAP;
    }
    else if (g >= r && b > r) {
		cr.current_bitmap = .GREEN_BLUE_BITMAP;
    }
    else if (r >= g && b > g) {
		cr.current_bitmap = .BLUE_RED_BITMAP;
    }
    else {
		cr.current_bitmap = .RED_GREEN_BITMAP;
    }

    update_gray_value_and_position_from_color(cr, c);

    if (r == g && r == b) {
        cr.gray_value = r;
        cr.x = 0;
        cr.y = 0;
    }

    cr.alpha_value = a;
    cr.current_color = c;

    calculate_rg_bitmap(cr);
    calculate_gb_bitmap(cr);
    calculate_br_bitmap(cr);
    fill_current_color_bitmap(cr);
}

colorang_update_gray_value :: (cr: *Colorang, gray_value: u8) {
    cr.gray_value = gray_value;
    calculate_rg_bitmap(cr);
    calculate_gb_bitmap(cr);
    calculate_br_bitmap(cr);
    bitmap: [] u8;
    if cr.current_bitmap == {
        case .RED_GREEN_BITMAP;
            bitmap = cr.red_green_bitmap;
        case .GREEN_BLUE_BITMAP;
            bitmap = cr.green_blue_bitmap;
        case .BLUE_RED_BITMAP;
            bitmap = cr.blue_red_bitmap;
    }

	// offset_index := cr.current_bitmap + (cr.x + cr.y * WIDTH) * CHANNELS_PER_PIXEL;
	// color := rgba(*offset_index, *(offset_index+1), *(offset_index+2), *(offset_index+3));
	offset_index := (cr.x + cr.y * WIDTH) * CHANNELS_PER_PIXEL;
	color := rgba(bitmap[offset_index], bitmap[(offset_index+1)], bitmap[(offset_index+2)], bitmap[(offset_index+3)]);
    colorang_set_current_color(cr, color);
}

colorang_update_current_color_from_pos :: (cr: *Colorang, x: u8, y: u8, type: Bitmap_Type) {
    bitmap: [] u8;
    if type == {
        case .RED_GREEN_BITMAP;
            bitmap = cr.red_green_bitmap;
        case .GREEN_BLUE_BITMAP;
            bitmap = cr.green_blue_bitmap;
        case .BLUE_RED_BITMAP;
            bitmap = cr.blue_red_bitmap;
    }

    cr.x = x;
    cr.y = y;
    cr.current_bitmap = type;
	offset_index := (cr.x + cr.y * WIDTH) * CHANNELS_PER_PIXEL;
	color := rgba(bitmap[offset_index], bitmap[(offset_index+1)], bitmap[(offset_index+2)], bitmap[(offset_index+3)]);
    colorang_set_current_color(cr, color);
}

colorang_update_alpha_value :: (cr: *Colorang, alpha_value: u8) {
    cr.alpha_value = alpha_value;
    cr.current_color.a = alpha_value;
    calculate_rg_bitmap(cr);
    calculate_gb_bitmap(cr);
    calculate_br_bitmap(cr);
    fill_current_color_bitmap(cr);
}

colorang_init :: (cr: *Colorang) {
    cr.alpha_value = 255;
    cr.gray_value  = 0;

    cr.current_color = rgba(0, 0, 0, 255);

    cr.current_bitmap = .RED_GREEN_BITMAP;
    cr.x = 0;
    cr.y = 255;

    // Should only need to be called once
    fill_gray_bitmap(cr);
    fill_alpha_bitmap(cr);
    fill_transparent_bitmap(cr);
    fill_transparent_color_bitmap(cr);

    // Needs to be called every time the user clicks a new color
    fill_current_color_bitmap(cr);

    calculate_rg_bitmap(cr);
    calculate_gb_bitmap(cr);
    calculate_br_bitmap(cr);
}

rgba :: (r: u8, g: u8, b: u8, a: u8) -> Color {
	return Color.{r,g,b,a};
}

rgb :: (r: u8, g: u8, b: u8) -> Color {
	return Color.{r,g,b,255};
}


main :: () {
    
    cr := New(Colorang); 
    colorang_init(cr);

    // For when the user selects a new color on one of the three bitmaps
    colorang_update_current_color_from_pos(cr, 0, 0, .RED_GREEN_BITMAP);

    // For when the user updates the gray / alpha value
    colorang_update_gray_value(cr, 80);
    colorang_update_alpha_value(cr, 100);

    // For when the user pastes a new color
	light_purple := rgba(123, 66, 158, 255);
	colorang_update_from_color(cr, light_purple);



    /*
        Below writes out the colorang to png images in the 'images' folder
        Uncomment the #define and #include at the top of this file if you want to use it.
    */

    // stbi_write_png("images/br_bitmap.png", WIDTH, HEIGHT, 4, cr.blue_red_bitmap.data,    WIDTH * 4);


    stbi_write_png("images/br_bitmap.png", WIDTH, HEIGHT, 4, cr.blue_red_bitmap.data,    WIDTH * 4);
    stbi_write_png("images/rg_bitmap.png", WIDTH, HEIGHT, 4, cr.red_green_bitmap.data,   WIDTH * 4);
    stbi_write_png("images/gb_bitmap.png", WIDTH, HEIGHT, 4, cr.green_blue_bitmap.data,  WIDTH * 4);
    stbi_write_png("images/g_bitmap.png" , WIDTH, GRAY_HEIGHT,  4, cr.gray_bitmap.data,  WIDTH * 4);
    stbi_write_png("images/a_bitmap.png" , WIDTH, ALPHA_HEIGHT, 4, cr.alpha_bitmap.data, WIDTH * 4);
    stbi_write_png("images/cc_bitmap.png", WIDTH, COLOR_HEIGHT, 4, cr.color_bitmap.data, WIDTH * 4);
    stbi_write_png("images/t_bitmap.png",  WIDTH, HEIGHT,       4, cr.transparent_bitmap.data, WIDTH * 4);
    stbi_write_png("images/tc_bitmap.png", WIDTH, COLOR_HEIGHT, 4, cr.transparent_color_bitmap.data, WIDTH * 4);
}
