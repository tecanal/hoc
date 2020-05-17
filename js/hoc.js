let width = 10;
let height = 10;

class HoC {}

HoC.prototype.mosaic = new Mosaic(height, width);

function setTileColor(x, y, color) {
    HoC.prototype.mosaic.setTileColor(x, y, color);
}

function resizeMosaic() {
    HoC.prototype.mosaic = new Mosaic(height, width);
}

function setWidth(newWidth) {
    width = newWidth;

    resizeMosaic();
}

function setHeight(newHeight) {
    height = newHeight;

    resizeMosaic();
}