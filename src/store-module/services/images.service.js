'use strict';

import sharp from 'sharp';

export {
    getImageBufferService,
    getImageBufferResizedService,
    getImageResizedService,
};

/**
 * The function returns the buffer of an image
 * @param {object} file
 * @returns {imageDetails, buffer} the resulting object which contains details to the image and the buffer
 */
function getImageBufferService(file) {
    //console.log(image.buffer)
    const bufferString = Buffer.from(file.buffer).toString('base64');
    console.log(bufferString.length);
    // let bytes = new Uint8Array(image.buffer);
    // let binary = bytes.reduce((data, b) => data += String.fromCharCode(b), '');
    const buffer = 'data:image/jpeg;base64,' + bufferString;
    //console.log(final)

    const imageDetails = {
        originalname: file.originalname,
        name: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
    };

    return { imageDetails, buffer };
}

/**
 * The function resizes an image and returns its buffer
 * @param {object} file
 * @returns
 */
async function getImageBufferResizedService(file) {
    const metadataIn = await sharp(file.buffer).metadata();
    console.log(
        `Input Metadata: size ${metadataIn.size}, width ${
            metadataIn.width
        }, height ${metadataIn.height}, aspect ratio ${
            metadataIn.width / metadataIn.height
        }`
    );

    const imageResult = await sharp(file.buffer)
        .resize({
            fit: sharp.fit.contain,
            width: parseInt(metadataIn.width / 5),
            //height: 517
        })
        .toBuffer();

    const metadataOut = await sharp(imageResult).metadata();
    console.log(
        `Output Metadata: size ${metadataOut.size}, width ${
            metadataOut.width
        }, height ${metadataOut.height}, aspect ratio ${
            metadataOut.width / metadataOut.height
        }`
    );

    //console.log(imageResult);
    //console.log(bufferString.length())
    const bufferString = Buffer.from(imageResult).toString('base64');
    //console.log(bufferString.length)
    const buffer = 'data:image/jpeg;base64,' + bufferString;

    const imageDetails = {
        originalname: file.originalname,
        name: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
    };

    return { imageDetails, buffer };
}

/**
 * The function saves an image as file
 * @param {object} file
 */
async function getImageResizedService(file) {
    const metadataIn = await sharp(file.buffer).metadata();
    console.log(
        `Input Metadata: size ${metadataIn.size}, width ${
            metadataIn.width
        }, height ${metadataIn.height}, aspect ratio ${
            metadataIn.width / metadataIn.height
        }`
    );

    const resizedImg = await sharp(file.buffer)
        .resize({
            fit: sharp.fit.contain,
            width: parseInt(metadataIn.width / 5),
            //height: 517
        })
        .toBuffer();

    const metadataOut = await sharp(resizedImg).metadata();
    console.log(
        `Output Metadata: size ${metadataOut.size}, width ${
            metadataOut.width
        }, height ${metadataOut.height}, aspect ratio ${
            metadataOut.width / metadataOut.height
        }`
    );

    await sharp(resizedImg).toFile('output.jpg');

    return;
}
