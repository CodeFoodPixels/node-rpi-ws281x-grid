'use strict';

const LED = require(`rpi-ws281x-native`);

class pixelGrid {
    constructor({width = 1, height = 1, brightness = 100}) {
        this.pixelTranslation = [];

        for (let x = 0; x < width; x++) {
            this.pixelTranslation[x] = [];
            for (let y = 0; y < height; y++) {
                let pixel = y * width;

                if (y % 2) {
                    pixel += (width - 1) - x;
                } else {
                    pixel += x;
                }

                this.pixelTranslation[x][y] = pixel;
            }
        }

        const numPixels = width * height;

        this.pixelData = new Uint32Array(numPixels);

        LED.init(numPixels, {
            brightness: Math.floor((255 / 100) * brightness)
        });

        LED.render(this.pixelData);

        process.on('SIGINT', function () {
            LED.reset();
            process.nextTick(function () {
                process.exit(0);
            });
        });
    }

    fillPixel(x, y, color) {
        this.pixelData[this.pixelTranslation[x][y]] = parseInt(color, 16);
        LED.render(this.pixelData);
    }

    clear() {
        this.pixelData = this.pixelData.map(() => {
            return 0;
        });

        LED.render(this.pixelData);
    }
}

module.exports = (opts = {}) => {
    return new pixelGrid(opts);
}
