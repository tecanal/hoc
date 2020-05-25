let _keyMap = {};

let _width = 10;
let _height = 10;

let _moz = new Mosaic(_height, _width);

let _fillColor = "#eeeeee";

let _strokeWidth = 1;
let _strokeStyle = "solid";
let _strokeColor = "black";

let _currentLevel = 0;

/**
 * Bind the onkeydown event to our handler function that allows for the onKey() function.
 */
document.onkeydown = e => _handleKeyDown(e);

/**
 * Handles onkeydown events with the keyMap that the user can define with their onKey() declarations.
 * @param {Event} e 
 */
function _handleKeyDown(e) {
    // if the key has a function mapped to it
    if (e.key in _keyMap) {
        // call the function that is mapped to the key
        _keyMap[e.key]();
    }
}

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

    // reset keymap
    _keyMap = {};

    // clear all intervals
    for (let i = 1; i < 999999; i++)
        window.clearInterval(i);
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
async function _checkCode() {
    // if the user hasn't clicked on a level yet
    if (_currentLevel === 0) return;
    
    // Level 1: What is Code?
    if (_currentLevel == 1) {
        if (_moz.getTile(0, 0).color != "black" || _moz.getTile(0, 0).borderColor != "red") {
            throw new Error("The fill or stroke color of tile (0, 0) is not the right color.");
        }
    }
    // Level 2: Variables
    else if (_currentLevel == 2) {
        if (!["red", "green", "blue", "yellow", "purple"].includes(_moz.getTile(0, 1).color)) {
            throw new Error("You did not fill the tile (0, 1) with a correct color.");
        }
    }
    // Level 3: Conditionals and Loops
    else if (_currentLevel == 3) {
        for (let x = 0; x < getWidth(); x++) {
            for (let y = 0; y < getHeight(); y++) {
                if (x % 2 == 0) {
                    if (y % 2 == 0) {
                        if (_moz.getTile(x, y).color == "#eeeeee") {
                            throw new Error("You did not color a tile with even x and even y coordinate.");
                        }
                    }
                    else {
                        if (_moz.getTile(x, y).color != "#eeeeee") {
                            throw new Error("You incorrecly colored a tile with an odd y coordinate.");
                        }
                    }
                }
                else {
                    if (_moz.getTile(x, y).color != "#eeeeee") {
                        throw new Error("You incorrecly colored a tile with an odd x coordinate.");
                    }
                }
            }
        }
    }
    // Level 4: Creating Functions
    else if (_currentLevel == 4) {
        // rectangle dimensions as defined in the level task
        const length = 5;
        const height = 3;

        for (let x = 0; x < _width; x++) {
            for (let y = 0; y < _height; y++) {
                // if inside of the rectangle, make sure it is all colored
                if (x < length && y < height) {
                    if (_moz.getTile(x, y).color == "#eeeeee") {
                        throw new Error("You did not color the full region of the rectangle that was described in the task.");
                    }
                }
                // if outside the rectangle, make sure it is not colored
                else {
                    if (_moz.getTile(x, y).color != "#eeeeee") {
                        throw new Error("You colored outside the region of the rectangle that was described in the task.");
                    }
                }
            }
        }
    }
    // Level 5: Setting Intervals
    else if (_currentLevel == 5) {
        const middle = [[4, 4], [4, 5], [5, 4], [5, 5]];

        for (const tile of middle) {
            if (_moz.getTile(tile[0], tile[1]).color != "blue") {
                stopRunning();

                throw new Error("You did not set the middle tiles to blue initially.");
            }
        }

        const sleep = m => new Promise(r => setTimeout(r, m));

        await sleep(500);

        for (const tile of middle) {
            if (_moz.getTile(tile[0], tile[1]).color != "orange") {
                stopRunning();

                throw new Error("The tiles did not change to orange on interval.");
            }
        }
    }
    // Level 6: Handling User Interaction Events
    else if (_currentLevel == 6) {
        for (let x = 0; x < _width; x++) {
            for (let y = 0; y < _height; y++) {
                if (_moz.getTile(x, y).color != "blue") {
                    throw new Error("You did not initially set all tiles to blue");
                }
            }
        }

        const x = Math.floor(Math.random() * _width);
        const y = Math.floor(Math.random() * _height);

        _moz.getTile(x, y).cellRef.click();

        if (_moz.getTile(x, y).color != "red") {
            throw new Error("You did not set the color to red on click.");
        }

        _moz.getTile(x, y).cellRef.click();

        if (_moz.getTile(x, y).color != "blue") {
            throw new Error("You did not set the color back to blue on click.");
        }
    }
    // If not a valid level number, exit before trying to mark as complete
    else {
        return;
    }

    // mark the lesson as completed
    const lessonSelector = document.getElementById("lessonSelector");
    lessonSelector.children[_currentLevel].children[0].classList.add("completed");

    // if user has completed all levels
    if (document.getElementsByClassName("completed").length == 6) {
        document.getElementById("finishedCourse").onclick = () => {};
        document.getElementById("finishedCourse").href = "https://code.org/api/hour/finish";
        document.getElementById("finishedCourse").classList.add("button-glow");

        console.log("Congratulations, you have completed all of the levels!");
    }
    else {
        console.log("Congratulations, you beat the level!");
    }
}

/**
 * Resize the Mosaic.
 */
function _resize() {
    _moz = new Mosaic(_height, _width);
}

/**
 * Gets the global fill color. The default is #eeeeee.
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
 * Gets the fill color of a specific tile.
 * @param {Number} x 
 * @param {Number} y 
 * @returns {String} fillColor
 */
function getFill(x, y) {
    return _moz.getTile(x, y).color;
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
 * Clear the Mosaic.
 */
function clear() {
    _moz.clear();
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

/**
 * A wrapper that allows seperate declarations of key listener functions.
 * @param {String} key
 * @param {Function} func
 */
function onKey(key, func) {
    let keyEvent;
	
    // if is a letter key
    if (key.length === 1) {
        // key letters are lowercase in events
        keyEvent = key.toLowerCase();
    }
    // if is some other key
    else {
        // other keys are in proper captalization in events
        keyEvent = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
    }
	
    // if the func is defined and is a function
    if (func && typeof func == "function") {
        // map the key to the function
        _keyMap[keyEvent] = func;
    }
}