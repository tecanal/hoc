let _width = 10;
let _height = 10;

let _moz = new Mosaic(_height, _width);

let _fillColor = "#eeeeee";

let _strokeWidth = 1;
let _strokeStyle = "solid";
let _strokeColor = "black";

let _currentLevel = 1;

/**
 * Clears the Mosaic, this should only be called internally on every new runCode() call.
 */
function _reset() {
    // clear mosaic
    _moz.clear();

    // clear all event listeners
    for (let x = 0; x < _width; x++) {
        for (let y = 0; y < _height; y++) {
            onClick(x, y, () => {});
            onMouseOver(x, y, () => {});
        }
    }
}

/**
 * Set the current level that the user is attempting in order to test the code for correctness
 * on runCode().
 * @param {Number} level 
 */
function _setCurrentLevel(level) {
    _currentLevel = level;
}

/**
 * Check the user's code to see if they have correctly completed the lesson.
 */
function _checkCode() {
    // Level 1
    if (_currentLevel == 1) {
        if (_moz.getTile(0, 0).color != "black" || _moz.getTile(0, 0).borderColor != "red")
            throw new Error("The fill or stroke color of tile (0, 0) is not the right color.");
    }

    // mark the lesson as completed
    const lessonSelector = document.getElementById("lessonSelector");
    lessonSelector.children[_currentLevel].children[0].classList.add("completed");
}

/**
 * Resize the Mosaic.
 */
function _resize() {
    _moz = new Mosaic(_height, _width);
}

/**
 * Get the fill color. The default is #eeeeee.
 * @returns {String} fillColor
 */
function getFillColor() {
    return _fillColor;
}

/**
 * Set the fill color.
 * @param {String} color 
 */
function setFillColor(color) {
    _fillColor = color;
}

/**
 * Set the color of a tile in the Mosaic.
 * @param  {...(String | Number)} args 
 */
function fill(...args) {
    // if no arguments are passed, invalid call
    if (!args.length) return;

    // if less than two arguments are passed, invalid call
    if (args.length < 2) return;

    // if more than three arguments are passed, invalid call
    if (args.length > 3) return;

    // get x and y arguments
    const x = args[0];
    const y = args[1];

    // if x or y are not numbers, invalid call
    if (isNaN(x) || isNaN(y)) return;

    // if color argument is defined, use that color, otherwise use fill color
    let color;
    if (args.length == 3) {
        color = args[2];
    }
    else {
        color = _fillColor;
    }

    // set the Mosaic tile color
    _moz.setTileColor(x, y, color);
}

/**
 * Get the stroke width (in pixels). The default is 1.
 * @returns {Number} strokeWidth
 */
function getStrokeWidth() {
    return _strokeWidth;
}

/**
 * Set the stroke width (in pixels). This corresponds to table cell border width styling.
 * @param {Number} width 
 */
function setStrokeWidth(width) {
    _strokeWidth = width;
}

/**
 * Get the border stroke style. The default is solid.
 * @returns {String}
 */
function getStrokeStyle() {
    return _strokeStyle;
}

/**
 * Set the stroke style. This corresponds to a table cell border style styling.
 * @param {String} style 
 */
function setStrokeStyle(style) {
    _strokeStyle = style;
}

/**
 * Get the stroke color. The default is black.
 * @returns {String} strokeColor
 */
function getStrokeColor() {
    return _strokeColor;
}

/**
 * Set the stroke color. This corresponds to table cell border color styling.
 * @param {String} color 
 */
function setStrokeColor(color) {
    _strokeColor = color;
}

/**
 * Set the Mosaic tile border properties.
 * @param {Number} x 
 * @param {Number} y 
 */
function stroke(x, y) {
    _moz.setTileBorderWidth(x, y, _strokeWidth);
    _moz.setTileBorderStyle(x, y, _strokeStyle);
    _moz.setTileBorderColor(x, y, _strokeColor);
}

/**
 * Set the tile color and border of a Mosaic tile.
 * @param {Number} x 
 * @param {Number} y 
 */
function fillAndStroke(x, y) {
    fill(x, y);
    stroke(x, y);
}

/**
 * Get the height of the Mosaic.
 * @returns {Number}
 */
function getWidth() {
    return _width;
}

/**
 * Set the height of the Mosaic.
 * @param {Number} newWidth 
 */
function setWidth(width) {
    _width = width;

    _resize();
}

/**
 * @returns {Number}
 */
function getHeight() {
    return _height;
}

/**
 * Set the height of the Mosaic.
 * @param {Number} height 
 */
function setHeight(height) {
    _height = height;

    _resize();
}

/**
 * Add a click listener to the Mosaic tile.
 * @param {Number} x 
 * @param {Number} y 
 * @param {Function} func 
 */
function onClick(x, y, func) {
    _moz.setTileOnClick(x, y, func);
}

/**
 * Add a mouse over listener to the Mosaic tile.
 * @param {Number} x 
 * @param {Number} y 
 * @param {Function} func 
 */
function onMouseOver(x, y, func) {
    _moz.setTileOnMouseOver(x, y, func);
}