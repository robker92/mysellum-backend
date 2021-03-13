import sharp from 'sharp'

const getImageBuffer = async function (req, res, next) {
    let file = req.file;
    //console.log(image.buffer)
    let bufferString = Buffer.from(file.buffer).toString('base64');
    console.log(bufferString.length)
    // let bytes = new Uint8Array(image.buffer);
    // let binary = bytes.reduce((data, b) => data += String.fromCharCode(b), '');
    let finalBuffer = "data:image/jpeg;base64," + bufferString;
    //console.log(final)
    res.status(200).json({
        buffer: finalBuffer,
        imageDetails: {
            originalname: file.originalname,
            name: file.originalname,
            size: file.size,
            mimetype: file.mimetype
        }
    })
};

const getImageBufferResized = async function (req, res, next) {
    let file = req.file;

    //console.log(image.buffer)
    let metadataIn = await sharp(file.buffer).metadata();
    console.log(`Input Metadata: size ${metadataIn.size}, width ${metadataIn.width}, height ${metadataIn.height}, aspect ratio ${metadataIn.width/metadataIn.height}`);
    let imageResult = await sharp(file.buffer)
        .resize({
            fit: sharp.fit.contain,
            width: parseInt(metadataIn.width / 5),
            //height: 517
        })
        .toBuffer();
    let metadataOut = await sharp(imageResult).metadata();
    console.log(`Output Metadata: size ${metadataOut.size}, width ${metadataOut.width}, height ${metadataOut.height}, aspect ratio ${metadataOut.width/metadataOut.height}`);

    //console.log(imageResult);
    //console.log(bufferString.length())
    let bufferString = Buffer.from(imageResult).toString('base64');
    //console.log(bufferString.length)
    let finalBuffer = "data:image/jpeg;base64," + bufferString;

    res.status(200).json({
        buffer: finalBuffer,
        imageDetails: {
            originalname: file.originalname,
            name: file.originalname,
            size: file.size,
            mimetype: file.mimetype
        }
    })
};

const getImageResized = async function (req, res, next) {
    let file = req.file;
    console.log(req.body.text)

    let metadataIn = await sharp(file.buffer).metadata();
    console.log(`Input Metadata: size ${metadataIn.size}, width ${metadataIn.width}, height ${metadataIn.height}, aspect ratio ${metadataIn.width/metadataIn.height}`);

    let resizedImg = await sharp(file.buffer)
        .resize({
            fit: sharp.fit.contain,
            width: parseInt(metadataIn.width / 5),
            //height: 517
        }).toBuffer();

    let metadataOut = await sharp(resizedImg).metadata()
    console.log(`Output Metadata: size ${metadataOut.size}, width ${metadataOut.width}, height ${metadataOut.height}, aspect ratio ${metadataOut.width/metadataOut.height}`);

    await sharp(resizedImg).toFile('output.jpg')

    res.sendFile('C:\\Users\\i514032\\OneDrive - SAP SE\\p\\prjct\\backend\\output.jpg');
};

//===================================================================================================
export { getImageBuffer, getImageBufferResized, getImageResized };
//===================================================================================================