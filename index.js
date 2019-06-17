'use strict';

const LED = require(`rpi-ws281x-native`);

class pixelGrid {
    constructor({width = 1, height = 1, brightness = 100, throttle = false}) {
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

        if (throttle) {
            this.render = throttle(this.render, throttle);
        }

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

    render() {
        LED.render(this.pixelData);
    }
}

function throttle(callback, wait) {
    let timeout = null

    return function () {
        const next = () => {
            callback.apply(this, arguments)
            timeout = null
        }

        if (!timeout) {
            timeout = setTimeout(next, wait)
        }
    }
}

module.exports = (opts = {}) => {
    return new pixelGrid(opts);
}
