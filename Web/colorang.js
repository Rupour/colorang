const rgcanvas = document.getElementById('redGreenCanvas');
const gbcanvas = document.getElementById('greenBlueCanvas');
const brcanvas = document.getElementById('blueRedCanvas');
const gcanvas = document.getElementById('grayCanvas');
const acanvas = document.getElementById('alphaCanvas');
const cccanvas = document.getElementById('currentColorCanvas');
const tbrcanvas = document.getElementById('transparentCanvasBR');
const trgcanvas = document.getElementById('transparentCanvasRG');
const tgbcanvas = document.getElementById('transparentCanvasGB');
const tcccanvas = document.getElementById('transparentCurrentColorCanvas');
const rgctx = rgcanvas.getContext('2d', { willReadFrequently: true });
const gbctx = gbcanvas.getContext('2d', { willReadFrequently: true });
const brctx = brcanvas.getContext('2d', { willReadFrequently: true });
const gctx  = gcanvas.getContext('2d', { willReadFrequently: true });
const actx  = acanvas.getContext('2d', { willReadFrequently: true });
const ccctx  = cccanvas.getContext('2d', { willReadFrequently: true });
const tbrctx  = tbrcanvas.getContext('2d', { willReadFrequently: true });
const trgctx  = trgcanvas.getContext('2d', { willReadFrequently: true });
const tgbctx  = tgbcanvas.getContext('2d', { willReadFrequently: true });
const tccctx  = tcccanvas.getContext('2d', { willReadFrequently: true });
let dragging = false;
let gdragging = false;
let adragging = false;
let grayColor = 0;
let alphaColor = 255;
let pickerRadius = 10;
let currentColor = [0, 0, 0, 1.0];
let previousX = 0;
let previousY = 255;

function setDrawingStyles(ctx, fillStyle, strokeStyle, lineWidth) {
    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
}

function drawCircle(ctx, x, y, radius, fill = false) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}

function handleBlueRedCanvas(ctx, x, y, fillColor) {
    if (x >= 255-(pickerRadius+2)) {
        setDrawingStyles(rgctx, fillColor, '#000', 2);
        drawCircle(rgctx, -(256 - x), y, pickerRadius+2, true);
    }
    if (y >= 255-(pickerRadius+2)) {
        setDrawingStyles(gbctx, fillColor, '#000', 2);
        drawCircle(gbctx, -(256 - x), -(256 - y), pickerRadius+2, true);
    }
    if (x >= 255-pickerRadius) {
        setDrawingStyles(rgctx, fillColor, '#FFF', 2);
        drawCircle(rgctx, -(256 - x), y, pickerRadius, true);
    }
    if (y >= 255-pickerRadius) {
        setDrawingStyles(gbctx, fillColor, '#FFF', 2);
        drawCircle(gbctx, -(256 - x), -(256 - y), pickerRadius, true);
    }

}

function handleRedGreenCanvas(ctx, x, y, fillColor) {
    if (x <= pickerRadius+2) {
        setDrawingStyles(brctx, fillColor, '#000', 2);
        drawCircle(brctx, 256 + x, y, pickerRadius+2, true);
    }
    if (y >= 255-(pickerRadius+2)) {
        setDrawingStyles(gbctx, fillColor, '#000', 2);
        drawCircle(gbctx, x, -(256 - y), pickerRadius+2, true);
    }
    if (x <= pickerRadius) {
        setDrawingStyles(brctx, fillColor, '#FFF', 2);
        drawCircle(brctx, 256 + x, y, pickerRadius, true);
    }
    if (y >= 255-pickerRadius) {
        setDrawingStyles(gbctx, fillColor, '#FFF', 2);
        drawCircle(gbctx, x, -(256 - y), pickerRadius, true);
    }
}

function handleGreenBlueCanvas(ctx, x, y, fillColor) {
    if (y <= pickerRadius+2) {
        setDrawingStyles(rgctx, fillColor, '#000', 2);
        drawCircle(rgctx, x, 256 + y, pickerRadius+2, true);
    }
    if (x <= pickerRadius+2) {
        setDrawingStyles(brctx, fillColor, '#000', 2);
        drawCircle(brctx, 256 + x, 256 + y, pickerRadius+2, true);
    }
    if (y <= pickerRadius) {
        setDrawingStyles(rgctx, fillColor, '#FFF', 2);
        drawCircle(rgctx, x, 256 + y, pickerRadius, true);
    }
    if (x <= pickerRadius) {
        setDrawingStyles(brctx, fillColor, '#FFF', 2);
        drawCircle(brctx, 256 + x, 256 + y, pickerRadius, true);
    }
}


function handleGCanvas(ctx, x, y, fillColor, radius, outlineColor) {
    setDrawingStyles(gctx, fillColor, outlineColor, 1);  // Outline color is now a parameter
    drawCircle(gctx, x, 16, radius, true);
}

function handleACanvas(ctx, x, y, fillColor, radius) {
    setDrawingStyles(actx, fillColor, '#000', 1);
    drawCircle(actx, x, 16, radius, true);
}


function drawCirclePicker(canvas, ctx, x, y, fillColor, radius = 15) {

    let prevctx = previousCanvas.getContext('2d', { willReadFrequently: true });
    setDrawingStyles(ctx, fillColor, '#FFF', 2);

    switch (canvas.id) {
        case 'blueRedCanvas':
            setDrawingStyles(ctx, fillColor, '#000', 2);
            drawCircle(ctx, x, y, pickerRadius+2, false);
            setDrawingStyles(ctx, fillColor, '#FFF', 2);
            drawCircle(ctx, x, y, pickerRadius, true);
            handleBlueRedCanvas(ctx, x, y, fillColor);
            break;
        case 'redGreenCanvas':
            setDrawingStyles(ctx, fillColor, '#000', 2);
            drawCircle(ctx, x, y, pickerRadius+2, false);
            setDrawingStyles(ctx, fillColor, '#FFF', 2);
            drawCircle(ctx, x, y, pickerRadius, true);
            handleRedGreenCanvas(ctx, x, y, fillColor);
            break;
        case 'greenBlueCanvas':
            setDrawingStyles(ctx, fillColor, '#000', 2);
            drawCircle(ctx, x, y, pickerRadius+2, false);
            setDrawingStyles(ctx, fillColor, '#FFF', 2);
            drawCircle(ctx, x, y, pickerRadius, true);
            handleGreenBlueCanvas(ctx, x, y, fillColor);
            break;
        case 'grayCanvas':
            if (previousCanvas != null) {
                let alpha = currentColor[3];
                let alpha_one = alpha;
                if (alpha == 0) alpha_one = 0;
                let color = `rgba(${Math.round(currentColor[0] * alpha_one + 240 * (1 - alpha_one))}, 
                                  ${Math.round(currentColor[1] * alpha_one + 240 * (1 - alpha_one))}, 
                                  ${Math.round(currentColor[2] * alpha_one + 240 * (1 - alpha_one))}, 
                                  ${currentColor[3]}`;
                setDrawingStyles(prevctx, color, '#FFF', 2);
                switch(previousCanvas.id) {
                    case 'blueRedCanvas':
                        setDrawingStyles(prevctx, color, '#000', 2);
                        drawCircle(prevctx, previousX, previousY, pickerRadius+2, false);
                        setDrawingStyles(prevctx, color, '#FFF', 2);
                        drawCircle(prevctx, previousX, previousY, pickerRadius, true);
                        handleBlueRedCanvas(prevctx, previousX, previousY, color);
                        break;
                    case 'redGreenCanvas':
                        setDrawingStyles(prevctx, color, '#000', 2);
                        drawCircle(prevctx, previousX, previousY, pickerRadius+2, false);
                        setDrawingStyles(prevctx, color, '#FFF', 2);
                        drawCircle(prevctx, previousX, previousY, pickerRadius, true);
                        handleRedGreenCanvas(prevctx, previousX, previousY, color);
                        break;
                    case 'greenBlueCanvas':
                        setDrawingStyles(prevctx, color, '#000', 2);
                        drawCircle(prevctx, previousX, previousY, pickerRadius+2, false);
                        setDrawingStyles(prevctx, color, '#FFF', 2);
                        drawCircle(prevctx, previousX, previousY, pickerRadius, true);
                        handleGreenBlueCanvas(prevctx, previousX, previousY, color);
                        break;
                }

            }
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            const startValue = 100;
            const multiplier = 35;
            const transitionPixel = 97;
            const transitionValue = 55;
            if (pixel[0] <= startValue){
                let outlineColor = `rgb(${(startValue-pixel[0]) * multiplier}, ${(startValue-pixel[0]) * multiplier}, ${(startValue-pixel[0]) * multiplier}`;
                if (pixel[0] == transitionPixel) {
                    outlineColor = `rgb(${transitionValue}, ${transitionValue}, ${transitionValue})`;
                }
                handleGCanvas(ctx, x, y, fillColor, radius, outlineColor);
                break;
            }

            handleGCanvas(ctx, x, y, fillColor, radius, `rgb(0, 0, 0)`);

            break;
        case 'alphaCanvas':
            if (previousCanvas != null) {
                let alpha = currentColor[3];
                let alpha_one = alpha;
                if (alpha == 0) alpha_one = 0;
                // Assume currentColor is an array of RGB values like [R, G, B]
                // and alpha is a float between 0 and 1.
                let color = `rgba(${Math.round(currentColor[0] * alpha_one + 240 * (1 - alpha_one))}, 
                                  ${Math.round(currentColor[1] * alpha_one + 240 * (1 - alpha_one))}, 
                                  ${Math.round(currentColor[2] * alpha_one + 240 * (1 - alpha_one))}, 
                                  ${currentColor[3]}`;
                setDrawingStyles(prevctx, color, '#FFF', 2);
                switch(previousCanvas.id) {
                    case 'blueRedCanvas':
                        setDrawingStyles(prevctx, color, '#000', 2);
                        drawCircle(prevctx, previousX, previousY, pickerRadius+2, true);
                        setDrawingStyles(prevctx, color, '#FFF', 2);
                        drawCircle(prevctx, previousX, previousY, pickerRadius, true);
                        handleBlueRedCanvas(prevctx, previousX, previousY, color);
                        break;
                    case 'redGreenCanvas':
                        setDrawingStyles(prevctx, color, '#000', 2);
                        drawCircle(prevctx, previousX, previousY, pickerRadius+2, true);
                        setDrawingStyles(prevctx, color, '#FFF', 2);
                        drawCircle(prevctx, previousX, previousY, pickerRadius, true);
                        handleRedGreenCanvas(prevctx, previousX, previousY, color);
                        break;
                    case 'greenBlueCanvas':
                        setDrawingStyles(prevctx, color, '#000', 2);
                        drawCircle(prevctx, previousX, previousY, pickerRadius+2, true);
                        setDrawingStyles(prevctx, color, '#FFF', 2);
                        drawCircle(prevctx, previousX, previousY, pickerRadius, true);
                        handleGreenBlueCanvas(prevctx, previousX, previousY, color);
                        break;
                }

            }
            alphaFill = `rgb(0, 0, 0, 0.15)`;
            handleACanvas(ctx, x, y, alphaFill, radius);

            break;
    }
}



function calculateGBBitmap(gbcanvas, grayValue, alphaValue) {
    const ctx = gbcanvas.getContext('2d', { willReadFrequently: true });
    const width = gbcanvas.width;
    const height = gbcanvas.height;
    const imageData = gbctx.createImageData(width, height);

    for (let y = 0; y < height; ++y) {
        let vertical_blend = y / (height - 1);

        for (let x = 0; x < width; ++x) {
            let horizontal_blend = x / (width - 1);
            let index = (y * width + x) * 4;
            let blend_factor = 1.0;
            if (x > y) blend_factor = 1 - horizontal_blend;
            else blend_factor = 1 - vertical_blend;
            let adjusted_gray_value = grayValue * blend_factor;

            let red   = adjusted_gray_value; // Red influenced by gray scaling
            let green  = 255 * horizontal_blend + adjusted_gray_value; // Blue changes horizontally
            let blue  = 255 * vertical_blend + adjusted_gray_value; // Green changes vertically

            imageData.data[index]     = red;
            imageData.data[index + 1] = green;
            imageData.data[index + 2] = blue;
            imageData.data[index + 3] = alphaValue;
        }
    }
    gbctx.putImageData(imageData, 0, 0);
}

function calculateRGBitmap(canvas, grayValue, alphaValue) {
    const width = canvas.width;
    const height = canvas.height;
    const imageData = rgctx.createImageData(width, height);

    for (let y = 0; y < height; ++y) {
        let vertical_blend = 1.0 - y / (height - 1);
        for (let x = 0; x < width; ++x) {
            let horizontal_blend = x / (width - 1);
            let index = (y * width + x) * 4;
            let blend_factor = 1.0;
            if (x > (height - 1 - y)) blend_factor = 1 - horizontal_blend;
            else blend_factor = 1 - vertical_blend;
            let adjusted_gray_value = grayValue * blend_factor;
            let red = 255 * vertical_blend + adjusted_gray_value;
            let green = 255 * horizontal_blend + adjusted_gray_value;
            let blue = adjusted_gray_value;

            imageData.data[index] = red;
            imageData.data[index + 1] = green;
            imageData.data[index + 2] = blue;
            imageData.data[index + 3] = alphaValue;
        }
    }
    rgctx.putImageData(imageData, 0, 0);
}


function calculateBRBitmap(brcanvas, grayValue, alphaValue) {
    const ctx = brcanvas.getContext('2d', { willReadFrequently: true });
    const width = brcanvas.width;
    const height = brcanvas.height;
    const imageData = brctx.createImageData(width, height);

    for (let y = 0; y < height; ++y) {
        let vertical_blend = y / (height - 1);

        for (let x = 0; x < width; ++x) {
            let horizontal_blend = x / (width - 1);
            let index = (y * width + x) * 4;
            let blend_factor = 1.0;
            if (x < y) blend_factor = (1.0 - horizontal_blend);
            else       blend_factor = (1.0 - vertical_blend);

            let adjusted_gray_value = grayValue * (1.0 - blend_factor);

            let red   = 255 * (1.0 - vertical_blend) + adjusted_gray_value;
            let green = adjusted_gray_value;
            let blue  = 255 * (1.0 - horizontal_blend) + adjusted_gray_value;

            if (index == 256 * 100 * 4 )  {
                console.log(`${red}, ${green}, ${blue}, ${alphaValue}`);
            }

            imageData.data[index]     = red;
            imageData.data[index + 1] = green;
            imageData.data[index + 2] = blue;
            imageData.data[index + 3] = alphaValue;
        }
    }
    brctx.putImageData(imageData, 0, 0);
}

function fillGrayBitmap(gcanvas, alphaValue) {
    const ctx = gcanvas.getContext('2d', { willReadFrequently: true });
    const width = gcanvas.width;
    const height = gcanvas.height;

    const imageData = ctx.createImageData(width, height);
    const pixels = imageData.data;

    const channelsPerPixel = 4;

    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            const value = Math.round(255 * x / (width - 1));
            const index = (y * width + x) * channelsPerPixel;

            pixels[index] = value;       // R
            pixels[index + 1] = value;   // G
            pixels[index + 2] = value;   // B
            pixels[index + 3] = alphaValue; // A
        }
    }

    ctx.putImageData(imageData, 0, 0);
}


function fillAlphaBitmap(acanvas, grayColors) {
    const ctx = acanvas.getContext('2d', { willReadFrequently: true });
    const width = acanvas.width;
    const height = acanvas.height;

    const imageData = ctx.createImageData(width, height);
    const pixels = imageData.data;

    const pixelBlockSize = 8;
    const channelsPerPixel = 4;

    for (let x = 0; x < width; ++x) {
        const blendFactor = x / (width - 1);

        for (let y = 0; y < height; ++y) {
            const xIndex = Math.floor(x / pixelBlockSize) % 2;
            const yIndex = Math.floor(y / pixelBlockSize) % 2;
            const grayColorIndex = (xIndex + yIndex) % 2;

            const baseGrayColor = grayColors[grayColorIndex];
            const blendedValue = Math.round((1 - blendFactor) * baseGrayColor + 255 * blendFactor);

            const index = (y * width + x) * channelsPerPixel;

            pixels[index] = blendedValue;
            pixels[index + 1] = blendedValue;
            pixels[index + 2] = blendedValue;
            pixels[index + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}


function fillCurrentColorBitmap(canvas, grayColors) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const width = canvas.width;
    const height = canvas.height;

    const imageData = ctx.createImageData(width, height);
    const pixels = imageData.data;

    const pixelBlockSize = 8;  // Changed from 16 to 4
    const channelsPerPixel = 4;

    for (let x = 0; x < width; ++x) {
        const blendFactor = x / (width - 1);

        for (let y = 0; y < height; ++y) {
            // Calculate index for x and y to oscillate the color
            const xIndex = Math.floor(x / pixelBlockSize) % 2;
            const yIndex = Math.floor(y / pixelBlockSize) % 2;
            const grayColorIndex = (xIndex + yIndex) % 2; // Oscillate between the two gray colors every 4th pixel

            const baseGrayColor = grayColors[grayColorIndex];
            const blendedValue = Math.round((1 - blendFactor) * baseGrayColor + 255 * blendFactor);


            const index = (y * width + x) * channelsPerPixel;

            pixels[index]     = currentColor[0];       // R
            pixels[index + 1] = currentColor[1];   // G
            pixels[index + 2] = currentColor[2];   // B
            pixels[index + 3] = currentColor[3] * 255;            // A
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function fillTransparentBlockBitmap(canvas, grayColors) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const width = canvas.width;
    const height = canvas.height;

    const imageData = ctx.createImageData(width, height);
    const pixels = imageData.data;

    const pixelBlockSize = 16;
    const channelsPerPixel = 4;

    for (let x = 0; x < width; ++x) {

        for (let y = 0; y < height; ++y) {
            // Calculate index for x and y to oscillate the color
            const xIndex = Math.floor(x / pixelBlockSize) % 2;
            const yIndex = Math.floor(y / pixelBlockSize) % 2;
            const grayColorIndex = (xIndex + yIndex) % 2; // Oscillate between the two gray colors every 4th pixel

            const index = (y * width + x) * channelsPerPixel;
            const baseGrayColor = grayColors[grayColorIndex];

            pixels[index]     = baseGrayColor;       // R
            pixels[index + 1] = baseGrayColor;   // G
            pixels[index + 2] = baseGrayColor;   // B
            pixels[index + 3] = 255;            // A
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function fillTransparentBlockBitmapCurrentColor(canvas, grayColors) {
    const invertGrayColors = [grayColors[0], grayColors[1]];
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const width = canvas.width;
    const height = canvas.height;

    const imageData = ctx.createImageData(width, height);
    const pixels = imageData.data;

    const pixelBlockSize = 16;
    const channelsPerPixel = 4;

    for (let x = 0; x < width; ++x) {

        for (let y = 0; y < height; ++y) {
            // Calculate index for x and y to oscillate the color
            const xIndex = Math.floor(x / pixelBlockSize) % 2;
            const yIndex = Math.floor(y / pixelBlockSize) % 2;
            const grayColorIndex = (xIndex + yIndex) % 2; // Oscillate between the two gray colors every 4th pixel

            const index = (y * width + x) * channelsPerPixel;
            const baseGrayColor = invertGrayColors[grayColorIndex];

            pixels[index]     = baseGrayColor;       // R
            pixels[index + 1] = baseGrayColor;   // G
            pixels[index + 2] = baseGrayColor;   // B
            pixels[index + 3] = 255;            // A
        }
    }

    ctx.putImageData(imageData, 0, 0);
}


function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function getOriginalColor(x, y, ctx) {
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    let alpha = pixel[3] / 255;  // Normalize alpha to [0, 1]

    // Reverse the pre-multiplication by alpha if alpha is not 0
    let red = alpha > 0 ? pixel[0] / alpha : 0;
    let green = alpha > 0 ? pixel[1] / alpha : 0;
    let blue = alpha > 0 ? pixel[2] / alpha : 0;

    // Round the values to avoid floating-point inaccuracies
    red = Math.round(red);
    green = Math.round(green);
    blue = Math.round(blue);

    let color = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    console.log(color);
    return color;
}

function updateCanvas(canvas, e, paste = false) {
    let startTime = performance.now();

    switch (canvas.id) {
        case 'blueRedCanvas':
        case 'redGreenCanvas':
        case 'greenBlueCanvas':
            let alpha_one = alphaColor;
            if (alphaColor == 0) alpha_one = 0;
            calculateRGBitmap(rgcanvas, grayColor, alpha_one);
            calculateGBBitmap(gbcanvas, grayColor, alpha_one);
            calculateBRBitmap(brcanvas, grayColor, alpha_one);
            break;
        case 'grayCanvas':
            fillGrayBitmap(gcanvas, 255);
            break;
        case 'alphaCanvas':
            fillAlphaBitmap(acanvas, grayColors);
            break;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true }); // Ensure you get the context of the right canvas.
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;   
    const scaleY = canvas.height / rect.height; 

    let x = previousX;
    let y = previousY;
    if (!paste) {
        x = Math.floor((e.clientX - rect.left) * scaleX);
        y = Math.floor((e.clientY - rect.top) * scaleY);
    }

    // Clamping x and y to the canvas dimensions to avoid out-of-bounds issues
    x = clamp(x, 0, canvas.width - 1);
    y = clamp(y, 0, canvas.height - 1);
    console.log(`${x}, ${y}`)

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    let alpha = pixel[3] / 255;
    
    let color = `rgba(${Math.round(pixel[0])}, ${Math.round(pixel[1])}, ${Math.round(pixel[2])}, ${alpha})`;
    // color = getOriginalColor(x, y, ctx);
    console.log(color);
    if (canvas.id === 'grayCanvas') {
        grayColor = pixel[0];
        let alpha_one = alphaColor;
        if (alphaColor == 0) alpha_one = 0;
        calculateRGBitmap(rgcanvas, grayColor, alpha_one);
        calculateGBBitmap(gbcanvas, grayColor, alpha_one);
        calculateBRBitmap(brcanvas, grayColor, alpha_one);
    } 

    if (canvas.id === 'alphaCanvas') {
        alphaColor = x;
        console.log(alphaColor);
        let alpha_one = alphaColor;
        if (alphaColor == 0) alpha_one = 0;
        calculateRGBitmap(rgcanvas, grayColor, alpha_one);
        calculateGBBitmap(gbcanvas, grayColor, alpha_one);
        calculateBRBitmap(brcanvas, grayColor, alpha_one);
    }

    switch (canvas.id) {
        case 'blueRedCanvas':
        case 'redGreenCanvas':
        case 'greenBlueCanvas':
            previousCanvas = canvas;
            previousX = x;
            previousY = y;
            if (!paste) {
                currentColor[0] = pixel[0];
                currentColor[1] = pixel[1];
                currentColor[2] = pixel[2];
                currentColor[3] = alpha;
            }
            break;
        case 'alphaCanvas':
            let prevctx = previousCanvas.getContext('2d', { willReadFrequently: true });
            const pixelN = prevctx.getImageData(previousX, previousY, 1, 1).data;
            const alphaN = pixelN[3] / 255;
            // currentColor[0] = pixelN[0];
            // currentColor[1] = pixelN[1];
            // currentColor[2] = pixelN[2];
            currentColor[3] = alphaN;
            break;
        case 'grayCanvas':
            let ngctx = previousCanvas.getContext('2d', { willReadFrequently: true });
            const pixelG = ngctx.getImageData(previousX, previousY, 1, 1).data;
            const alphaG = pixelG[3] / 255;
            currentColor[0] = pixelG[0];
            currentColor[1] = pixelG[1];
            currentColor[2] = pixelG[2];
            currentColor[3] = alphaG;
            break;

    }

    fillCurrentColorBitmap(cccanvas, grayColors);
    drawCirclePicker(canvas, ctx, x, y, color);
    updateParagraphColor(currentColor);
    updateGrayColorParagraph();


    let endTime = performance.now();
    let elapsedTime = endTime - startTime;
    // console.log(`Canvases took ${elapsedTime.toFixed(4)} ms`);
}

let currentCanvas = null;  // This will store the canvas currently being dragged.
let gcurrentCanvas = null;  // This will store the canvas currently being dragged.
let acurrentCanvas = null;  // This will store the canvas currently being dragged.
let previousCanvas = rgcanvas;  // This will store the canvas currently being dragged.
let copyCanvas = null;

  function enableSelection(element) {
    element.style.userSelect = "text"; // Enable text selection on the paragraph
  }

  function disableSelection(element) {
    element.style.userSelect = "none"; // Disable text selection when not interacting directly
  }


// Function to attach the necessary events to each canvas
function setupCanvasEvents(canvas) {
    canvas.addEventListener('mousedown', (e) => {
        dragging = true;
        previousCanvas = currentCanvas;
        currentCanvas = canvas; // Set the current canvas
        disableSelection(document.getElementById('colorParagraph'));
        updateCanvas(canvas, e);
    });

    canvas.addEventListener('mouseup', (e) => {
        dragging = false;
        currentCanvas = null; // Clear the current canvas
    });

    canvas.addEventListener('mousemove', (e) => {
        if (dragging && currentCanvas) {
            previousCanvas = currentCanvas;
            currentCanvas = canvas;
            updateCanvas(canvas, e);
        }
    });
}
function setupGCanvasEvents(canvas) {
    canvas.addEventListener('mousedown', (e) => {
        gdragging = true;
        gcurrentCanvas = canvas; // Set the current canvas
        disableSelection(document.getElementById('colorParagraph'));
        updateCanvas(canvas, e);
    });

    canvas.addEventListener('mouseup', (e) => {
        gdragging = false;
        gcurrentCanvas = null; // Clear the current canvas
    });

    canvas.addEventListener('mousemove', (e) => {
        if (gdragging && gcurrentCanvas) {
            gcurrentCanvas = canvas;
            updateCanvas(canvas, e);
        }
    });
}
function setupACanvasEvents(canvas) {
    canvas.addEventListener('mousedown', (e) => {
        adragging = true;
        acurrentCanvas = canvas; // Set the current canvas
        disableSelection(document.getElementById('colorParagraph'));
        updateCanvas(canvas, e);
    });

    canvas.addEventListener('mouseup', (e) => {
        adragging = false;
        acurrentCanvas = null; // Clear the current canvas
    });

    canvas.addEventListener('mousemove', (e) => {
        if (adragging && acurrentCanvas) {
            acurrentCanvas = canvas;
            updateCanvas(canvas, e);
        }
    });
}
function findCanvasNextToCursor(currentCanvas, x, y) {
    let rect   = currentCanvas.getBoundingClientRect();
    let rgrect = rgcanvas.getBoundingClientRect();
    let brrect = brcanvas.getBoundingClientRect();
    let gbrect = gbcanvas.getBoundingClientRect();
    let grect = gcanvas.getBoundingClientRect();
    let arect = acanvas.getBoundingClientRect();
    switch (currentCanvas.id) {
        case 'blueRedCanvas':
            rect = rgrect;
            if (x >= rect.left && y < rect.top) {
                return rgcanvas;
            }
            break;
        case 'redGreenCanvas':
            rect = rgrect;
            if (x < rect.left && y < rect.top) {
                return brcanvas;
            }

            rect = gbrect;
            if (x > rect.right && y > rect.top) {
                return gbcanvas;
            }

            break;
        case 'greenBlueCanvas':
            rect = rgrect;
            if (x > rect.right && y < rect.bottom) {
                return rgcanvas;
            }
            break;
    }
    return currentCanvas;
}

function updateParagraphColor(colorArray) {
    let red = Math.round(colorArray[0]);
    let green = Math.round(colorArray[1]);
    let blue = Math.round(colorArray[2]);
    let alpha = Math.round(colorArray[3] * 255); // Convert alpha to a 0-255 range

    let rgbaString = `${red}, ${green}, ${blue}, ${alpha}`;
    let paragraph = document.getElementById("colorParagraph");
    paragraph.textContent = rgbaString;
}

function updateGrayColorParagraph() {
    let paragraph = document.getElementById("grayColorPara");
    let grayColorString = `${grayColor}`;
    paragraph.textContent = grayColorString;
}

function parseHexColor(colorString) {
    // Normalize the input by removing the '#' character if present
    const normalizedColor = colorString.replace(/^#/, '');

    // Check if the color is in the valid 3-digit or 6-digit hexadecimal format
    if (/^[0-9A-F]{3}$|^[0-9A-F]{6}$/i.test(normalizedColor)) {
        // Parse the hexadecimal color into RGB components
        let r, g, b;
        if (normalizedColor.length === 3) {
            r = parseInt(normalizedColor[0] + normalizedColor[0], 16);
            g = parseInt(normalizedColor[1] + normalizedColor[1], 16);
            b = parseInt(normalizedColor[2] + normalizedColor[2], 16);
        } else {
            r = parseInt(normalizedColor.substring(0, 2), 16);
            g = parseInt(normalizedColor.substring(2, 4), 16);
            b = parseInt(normalizedColor.substring(4, 6), 16);
        }
        return [ r, g, b ];
    } else {
        console.error('Invalid color format');
    }
}

function parseHexaColor(colorString) {
    // Normalize the input by removing the '#' character if present
    const normalizedColor = colorString.replace(/^#/, '');

    // Check if the color is in the valid 3-digit or 6-digit hexadecimal format
    if (/^[0-9A-F]{4}$|^[0-9A-F]{8}$/i.test(normalizedColor)) {
        // Parse the hexadecimal color into RGB components
        let r, g, b, a;
        if (normalizedColor.length === 4) {
            r = parseInt(normalizedColor[0] + normalizedColor[0], 16);
            g = parseInt(normalizedColor[1] + normalizedColor[1], 16);
            b = parseInt(normalizedColor[2] + normalizedColor[2], 16);
            a = parseInt(normalizedColor[3] + normalizedColor[3], 16);
        } else {
            r = parseInt(normalizedColor.substring(0, 2), 16);
            g = parseInt(normalizedColor.substring(2, 4), 16);
            b = parseInt(normalizedColor.substring(4, 6), 16);
            a = parseInt(normalizedColor.substring(6, 8), 16);
        }
        return [ r, g, b, a];
    } else {
        console.error('Invalid color format');
    }
}

function parseColor(colorString, e) {
    // Regular expressions to match different color formats
    // const hexRegex = /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/;
    const hexRegex = /^#?([a-f0-9]{6}|[a-f0-9]{3})$/;
    const hexaRegex = /^#?([a-f0-9]{8}|[a-f0-9]{4})$/;
    // const hexaRegex = /^#?([a-fA-F0-9]{8}|[a-fA-F0-9]{4})$/;
    const rgbRegex = /^rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)$/;
    const rgbaRegex = /^rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-1]?\.?[0-9]+)\s*\)$/;

    if (hexRegex.test(colorString)) {
        let hexColor = parseHexColor(colorString);
        currentColor = [hexColor[0], hexColor[1], hexColor[2], 1.0];
        return `rgb(${hexColor[0]}, ${hexColor[1]}, ${hexColor[2]})`;
    } else if (hexaRegex.test(colorString)) {
        let hexColor = parseHexaColor(colorString);
        currentColor = [hexColor[0], hexColor[1], hexColor[2], hexColor[3]/255];
        return `rgba(${hexColor[0]}, ${hexColor[1]}, ${hexColor[2]}, ${Math.round(hexColor[3]/255)})`;
    } else if (rgbRegex.test(colorString)) {
        const match = colorString.match(rgbRegex);
        currentColor = [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10), 1.0];
        return `rgb(${match[1]}, ${match[2]}, ${match[3]})`;
    } else if (rgbaRegex.test(colorString)) {
        const match = colorString.match(rgbaRegex);
        const alpha = parseInt(match[4], 10) / 255.0;
        currentColor = [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10), alpha];
        return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
    } else {
        return null;
    }

}

function getXRG(rgb) {
    return rgb[0] - rgb[2];
}
function getYRG(rgb) {
    return (255 - (rgb[1] - rgb[2]));
}
function getXGB(rgb) {
    return 255-(rgb[1] - rgb[0]);
}
function getYGB(rgb) {
    return 255 - ((rgb[2] - rgb[0]));
}
function getXBR(rgb) {
    return (rgb[2] - rgb[1]);
}
function getYBR(rgb) {
    return ((rgb[0] - rgb[1]));
}

function getGrayValueFromRGB(rgb) {
    width = 256;
    height = 256;
    // Assuming rgb is an array [red, green, blue]
    const blue = rgb[2];

    // Get x and y values using external functions
    const x = getXRG(rgb); // Implement this function to return the x-coordinate
    const y = getYRG(rgb); // Implement this function to return the y-coordinate
    pastedX = x;
    pastedY = y;

    // Calculate the blend factors
    const horizontal_blend = x / (width - 1);
    const vertical_blend = 1 - (y / (height - 1));

    // Determine the blend factor based on the position
    let blend_factor;
    if (x > (height - 1 - y)) {
        // Right of the anti-diagonal
        blend_factor = 1 - horizontal_blend;
    } else {
        // Left of or on the anti-diagonal
        blend_factor = 1 - vertical_blend;
    }

    // Calculate grayValue using blue and blend_factor
    const grayValue = blue / blend_factor;

    return Math.round(grayValue);
}

function getGrayValueFromBR(rgb) {
    width = 256;
    height = 256;
    const green = rgb[1];

    const x = getXBR(rgb);
    const y = getYBR(rgb);
    pastedX = x;
    pastedY = y;

    const horizontal_blend = (255-x) / (width - 1);
    const vertical_blend = 1 - ((255-y) / (height - 1));

    let blend_factor;
    if ((255-x) < (255-y)) {
        blend_factor = 1 - horizontal_blend;
    } else {
        blend_factor = 1 - vertical_blend;
    }

    const grayValue = green / (1 - blend_factor);

    return Math.round(grayValue);
}

function getGrayValueFromGB(rgb) {
    width = 256;
    height = 256;
    const red = rgb[0];

    let x = getXGB(rgb); 
    let y = getYGB(rgb);
    pastedX = x;
    pastedY = y;

    x = 255-x;
    y = 255-y;


    const horizontal_blend = x / (width - 1);
    const vertical_blend = (y / (height - 1));


    let blend_factor;
    if (x > y) {

        blend_factor = 1 - horizontal_blend;
    } else {

        blend_factor = 1 - vertical_blend;
    }


    const grayValue = red / blend_factor;

    return Math.round(grayValue);
}

let pastedGrayColor = 0;
let pastedAlphaColor = 0;
let pastedX = 0;
let pastedY = 0;

function getPastedColorCanvas(pastedColor){
    if (pastedColor[0] === pastedColor[1] === pastedColor[2]) {
        pastedGrayColor = pastedColor[0];
        pastedX = 0;
        pastedY = 0;
        return rgcanvas;
    }


    if (pastedColor[0] >= pastedColor[2] && pastedColor[1] > pastedColor[2]) {
        pastedGrayColor = getGrayValueFromRGB(pastedColor);

        if (Number.isNaN(pastedGrayColor)) {
            pastedGrayColor = 0;
        }
        previousX = 255 - pastedY;
        previousY = 255 - pastedX;

        return rgcanvas;
    } else if (pastedColor[2] >= pastedColor[0] && pastedColor[1] > pastedColor[0]) {
        pastedGrayColor = getGrayValueFromGB(pastedColor);
        if (Number.isNaN(pastedGrayColor)) {
            pastedGrayColor = 0;
        }
        previousX = 255 - pastedX;
        previousY = 255 - pastedY;
        return gbcanvas;
    } else if (pastedColor[0] >= pastedColor[1] && pastedColor[2] > pastedColor[1]) {
        pastedGrayColor = getGrayValueFromBR(pastedColor);
        if (Number.isNaN(pastedGrayColor)) {
            pastedGrayColor = 0;
        }
        previousX = 255 - pastedX;
        previousY = 255 - pastedY;
        return brcanvas;
    }
    return rgcanvas;
}

document.addEventListener("paste", function(e) {
    e.preventDefault(); // Prevent the default paste action


    const clipboardData = (e.clipboardData || window.clipboardData).getData("text");
    const parsedColor = parseColor(clipboardData, e);
    console.log(parsedColor);
    console.log(currentColor);
    pastedAlphaColor = Math.round(255 * currentColor[3]);

    currentCanvas = getPastedColorCanvas(currentColor);
    previousCanvas = currentCanvas;
    fillCurrentColorBitmap(cccanvas, grayColors);
    const ctx = currentCanvas.getContext('2d', { willReadFrequently: true });
    let alpha = currentColor[3];
    let color = `rgba(${Math.round(currentColor[0] * alpha)}, ${Math.round(currentColor[1] * alpha)}, ${Math.round(currentColor[2] * alpha)}, ${alpha})`;


    grayColor = pastedGrayColor;
    alphaColor = pastedAlphaColor;
    



    fillGrayBitmap(gcanvas, 255);
    updateCanvas(currentCanvas, e, true);

    fillAlphaBitmap(acanvas, grayColors);
    const actx = acanvas.getContext('2d', { willReadFrequently: true });
    drawCirclePicker(acanvas, actx, alphaColor, 16, grayColor);

    drawCirclePicker(currentCanvas, ctx, previousX, previousY, color);

    const prevctx = gcanvas.getContext('2d', { willReadFrequently: true });
    let newGrayColor = `rgba(${grayColor}, ${grayColor}, ${grayColor}, 1.0)`;
    drawCirclePicker(gcanvas, prevctx, grayColor, 16, newGrayColor);



    updateParagraphColor(currentColor);
    updateGrayColorParagraph();

    if (copyCanvas === null) {

    }

    if (parsedColor) {
        // Display or use the parsed color
        e.target.value = parsedColor;
    } else {
        alert("No valid color data found");
    }
});

function isParagraphHighlighted(paragraphId) {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return false; // No selection made

    const range = selection.getRangeAt(0);
    const paragraph = document.getElementById(paragraphId);

    let node = range.commonAncestorContainer;
    do {
        if (node === paragraph) return true;
        node = node.parentNode;
    } while (node !== null);

    return false;
}



document.addEventListener("copy", function(e) {
    // let color = `${currentColor[0]}, ${currentColor[1]}, ${currentColor[2]}`;

    const paragraphHighlighted = isParagraphHighlighted('colorParagraph');

    if (paragraphHighlighted) {

    } else {
        let color = rgbToHex(currentColor[0], currentColor[1], currentColor[2]);
        copyCanvas = currentCanvas;

        navigator.clipboard.writeText(color).then(function() {
            console.log(color);
        }).catch(function(err) {
            console.error("Failed to copy text: ", err);
        });

    }
});

// Document level mouse move to handle dragging across the entire window
document.addEventListener('mousemove', (e) => {
    if (dragging && currentCanvas) {
        const newCanvas = findCanvasNextToCursor(currentCanvas, e.clientX, e.clientY);
        currentCanvas = newCanvas;
        updateCanvas(currentCanvas, e);
    }
    if (gdragging && gcurrentCanvas) {
        const newCanvas = findCanvasNextToCursor(gcurrentCanvas, e.clientX, e.clientY);
        gcurrentCanvas = newCanvas;
        updateCanvas(gcurrentCanvas, e);
    }
    if (adragging && acurrentCanvas) {
        const newCanvas = findCanvasNextToCursor(acurrentCanvas, e.clientX, e.clientY);
        acurrentCanvas = newCanvas;
        updateCanvas(acurrentCanvas, e);
    }

});


// Document level mouse up to handle stopping dragging outside of the canvases
document.addEventListener('mouseup', (e) => {
    dragging = false;
    gdragging = false;
    adragging = false;
    currentCanvas = null;
    gcurrentCanvas = null;
    acurrentCanvas = null;
});

document.getElementById("copyButton").addEventListener("click", function() {
    let color = `rgba(${currentColor[0]}, ${currentColor[1]}, ${currentColor[2]}, ${Math.round(currentColor[3] * 255)})`;
    copyCanvas = currentCanvas;

    navigator.clipboard.writeText(color).then(function() {
        console.log(color);
    }).catch(function(err) {
        console.error("Failed to copy text: ", err);
    });
});

document.getElementById("copyButtonRGB").addEventListener("click", function() {
    let color = `rgb(${currentColor[0]}, ${currentColor[1]}, ${currentColor[2]})`;
    copyCanvas = currentCanvas;

    navigator.clipboard.writeText(color).then(function() {
        console.log(color);
    }).catch(function(err) {
        console.error("Failed to copy text: ", err);
    });
});

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function rgbToHexNoOctothorpe(r, g, b) {
    return componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function rgbToHexA(r, g, b, a) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b) + componentToHex(Math.round(a * 255));
}

function componentToHex(c) {
    let hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

document.getElementById("copyButtonRGBHEX").addEventListener("click", function() {
    let hexColor = rgbToHex(currentColor[0], currentColor[1], currentColor[2]);
    copyCanvas = currentCanvas;

    navigator.clipboard.writeText(hexColor).then(function() {
        console.log(hexColor);
    }).catch(function(err) {
        console.error("Failed to copy text: ", err);
    });
});

document.getElementById("copyButtonRGBAHEX").addEventListener("click", function() {
    let hexColor = rgbToHexA(currentColor[0], currentColor[1], currentColor[2], currentColor[3]);
    copyCanvas = currentCanvas;

    navigator.clipboard.writeText(hexColor).then(function() {
        console.log(hexColor);
    }).catch(function(err) {
        console.error("Failed to copy text: ", err);
    });
});

// Setup events for all canvases
setupCanvasEvents(rgcanvas);
setupCanvasEvents(brcanvas);
setupCanvasEvents(gbcanvas);
setupGCanvasEvents(gcanvas);
setupACanvasEvents(acanvas);

// Usage example:
const grayColors = [128, 196];

fillGrayBitmap(gcanvas, 255);
fillAlphaBitmap(acanvas, grayColors);
fillCurrentColorBitmap(cccanvas, grayColors);
fillTransparentBlockBitmap(trgcanvas, grayColors);
fillTransparentBlockBitmap(tbrcanvas, grayColors);
fillTransparentBlockBitmap(tgbcanvas, grayColors);
fillTransparentBlockBitmapCurrentColor(tcccanvas, grayColors);
calculateRGBitmap(rgcanvas, grayColor, alphaColor);
calculateGBBitmap(gbcanvas, grayColor, alphaColor);
calculateBRBitmap(brcanvas, grayColor, alphaColor);
updateParagraphColor(currentColor);
updateGrayColorParagraph();

setDrawingStyles(rgctx, `rgb(0, 0, 0, 1.0)`, '#FFF', 2);
setDrawingStyles(gbctx, `rgb(0, 0, 0, 1.0)`, '#FFF', 2);
setDrawingStyles(brctx, `rgb(0, 0, 0, 1.0)`, '#FFF', 2);
setDrawingStyles(gctx, `rgb(0, 0, 0, 1.0)`, '#FFF', 1);
setDrawingStyles(actx, `rgb(0, 0, 0, 0.15)`, '#000', 1);
drawCircle(rgctx, 0, 255, pickerRadius, true);
drawCircle(gbctx, 0, 0, pickerRadius, true);
drawCircle(brctx, 255, 255, pickerRadius, true);
drawCircle(gctx, 0, 16, 15, true);
drawCircle(actx, 255, 16, 15, true);
