'use strict';

import sharp from 'sharp';

const JPEG_URI_PATTERN = 'data:image/jpeg;base64,';
const PNG_URI_PATTERN = 'data:image/jpeg;base64,';

export {
    getImageBufferService,
    getImageBufferResizedService,
    getImageBase64Resized,
    getImageResizedService,
    uploadBlobService,
    getFromBlobService,
    deleteBlobService,
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
    console.log(file.buffer);
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
 * The function resizes an image and returns its buffer
 * @param {string} base64String
 * @returns {string} a base64String
 */
async function getImageBase64Resized(base64String) {
    // remove the JPEG_URI_PATTERN part when its present
    if (base64String.startsWith(JPEG_URI_PATTERN)) {
        base64String = base64String.substr(JPEG_URI_PATTERN.length);
    }

    const inputBuffer = Buffer.from(base64String, 'base64');

    const metadataIn = await sharp(inputBuffer).metadata();
    const resizedBuffer = await sharp(inputBuffer)
        .resize({
            fit: sharp.fit.contain,
            width: parseInt(
                metadataIn.width / resizeFactorCalculation(metadataIn.size)
            ),
        })
        .toBuffer();

    let resultBase64String = Buffer.from(resizedBuffer).toString('base64');

    const metadataOut = await sharp(resizedBuffer).metadata();

    //append data pattern
    resultBase64String = JPEG_URI_PATTERN + resultBase64String;

    return { metadata: metadataOut, base64String: resultBase64String };
}

/**
 * The function takes an image size as parameter and returns the factor to resize the image
 * @param {number} imgSize size of the image in byte
 * @returns the factor
 */
function resizeFactorCalculation(imgSize) {
    const MB_2 = 2000000;
    const MB_3 = 3000000;
    // const MB_4 = 4000000;
    const MB_5 = 5000000;

    let factor;
    if (imgSize > MB_2 && imgSize < MB_3) {
        factor = 2;
    }
    if (imgSize > MB_3 && imgSize < MB_5) {
        factor = 3;
    } else if (imgSize > MB_5) {
        factor = 4;
    } else {
        factor = 1;
    }

    return factor;
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

import {
    BlobServiceClient,
    StorageSharedKeyCredential,
    newPipeline,
} from '@azure/storage-blob';
// import { Readable } from 'stream';
import streamifier from 'streamifier';
import { nanoid } from 'nanoid';
import {
    AZURE_STORAGE_ACCOUNT_NAME,
    AZURE_STORAGE_ACCOUNT_ACCESS_KEY,
    AZURE_STORAGE_CONTAINER_NAME,
} from '../../config';
const sharedKeyCredential = new StorageSharedKeyCredential(
    AZURE_STORAGE_ACCOUNT_NAME,
    AZURE_STORAGE_ACCOUNT_ACCESS_KEY
);
const pipeline = newPipeline(sharedKeyCredential);
const blobServiceClient = new BlobServiceClient(
    `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
    pipeline
);
const ONE_MEGABYTE = 1024 * 1024;
const uploadOptions = { bufferSize: 4 * ONE_MEGABYTE, maxBuffers: 20 };
const containerName = AZURE_STORAGE_CONTAINER_NAME;

function getNewBlobName(fileName) {
    const name = `${nanoid()}~${fileName}`;
    return name;
}

function getBlobContainerClient() {
    return blobServiceClient.getContainerClient(containerName);
}

function getBlobUrl(blobName) {
    const blobUrl = `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${containerName}/${blobName}`;
    return blobUrl;
}

/**
 * The function uploads an image to azure blob storage
 * @param {object} file
 */
async function uploadBlobService(file) {
    let blobUrl;
    try {
        // the store image has title, a file has originalName
        const name = file.originalname ?? file.name;
        console.log(`Blob name: ${name}`);
        const blobName = getNewBlobName(name);

        console.log(`Base64:`);
        console.log(file.buffer.substring(0, 50));

        // const uri = file.buffer.substr('data:image/jpeg;base64,'.length);
        let base64;
        if (file.buffer.includes('base64')) {
            base64 = file.buffer.substr(file.buffer.indexOf('base64') + 7);
        } else {
            base64 = file.buffer;
        }

        console.log(`Base64:`);
        console.log(base64.substring(0, 50));

        const buffer = Buffer.from(base64, 'base64');
        console.log(buffer);

        // const stream = Readable.from(buffer);
        const stream = streamifier.createReadStream(buffer);

        // console.log(`Stream:`);
        // console.log(stream);
        const blockBlobClient =
            getBlobContainerClient().getBlockBlobClient(blobName);

        await blockBlobClient.uploadStream(
            stream,
            uploadOptions.bufferSize,
            uploadOptions.maxBuffers,
            { blobHTTPHeaders: { blobContentType: 'image/jpeg' } }
        );
        blobUrl = getBlobUrl(blobName);
    } catch (err) {
        console.log(err);
        throw err;
    }
    return blobUrl;
}

/**
 * The function reads an image from azure blob storage
 * @param {string} blobName
 */
async function getFromBlobService(blobName) {
    const listBlobsResponse =
        await getBlobContainerClient().listBlobFlatSegment();

    for await (const blob of listBlobsResponse.segment.blobItems) {
        console.log(`Blob: ${blob.name}`);
    }

    return listBlobsResponse;
}

/**
 * The function deletes a blob from azure blob storage
 * @param {string} blobName
 */
async function deleteBlobService(blobName) {
    const blockBlobClient =
        getBlobContainerClient().getBlockBlobClient(blobName);

    const deleteResponse = await blockBlobClient.deleteIfExists();
    // console.log(deleteResponse);
    if (!deleteResponse.succeeded) {
        throw new Error(
            `The blob with the name ${blobName} could not be deleted.`
        );
    }

    return;
}

// {
//     succeeded: true,
//     clientRequestId: 'd8e85847-b8b3-418f-bc86-01b1571b32df',
//     requestId: '8897c796-401e-00f8-65dd-aade1a000000',
//     version: '2020-10-02',
//     date: 2021-09-16T09:31:59.000Z,
//     errorCode: undefined,
//     'content-length': '0',
//     server: 'Windows-Azure-Blob/1.0 Microsoft-HTTPAPI/2.0',
//     'x-ms-delete-type-permanent': 'false',
//     body: undefined,
//     _response: {
//       headers: HttpHeaders { _headersMap: [Object] },
//       request: WebResource {
//         streamResponseBody: undefined,
//         streamResponseStatusCodes: Set(0) {},
//         url: 'https://prjctstorageaccount.blob.core.windows.net/prjct-dev-images/Id6OmdIlprvc-5q8pJQ8C~product2.jpg',
//         method: 'DELETE',
//         headers: [HttpHeaders],
//         body: undefined,
//         query: undefined,
//         formData: undefined,
//         withCredentials: false,
//         abortSignal: undefined,
//         timeout: 0,
//         onUploadProgress: undefined,
//         onDownloadProgress: undefined,
//         proxySettings: undefined,
//         keepAlive: true,
//         decompressResponse: false,
//         requestId: 'd8e85847-b8b3-418f-bc86-01b1571b32df',
//         operationSpec: [Object]
//       },
//       status: 202,
//       readableStreamBody: undefined,
//       bodyAsText: '',
//       parsedHeaders: {
//         clientRequestId: 'd8e85847-b8b3-418f-bc86-01b1571b32df',
//         requestId: '8897c796-401e-00f8-65dd-aade1a000000',
//         version: '2020-10-02',
//         date: 2021-09-16T09:31:59.000Z,
//         errorCode: undefined,
//         'content-length': '0',
//         server: 'Windows-Azure-Blob/1.0 Microsoft-HTTPAPI/2.0',
//         'x-ms-delete-type-permanent': 'false'
//       }
//     }
//   }
