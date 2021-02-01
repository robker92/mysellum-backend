
import bodyParser from "body-parser";
import {
    JSON_LIMIT,
    URL_ENCODED_LIMIT
} from '../config';

const parserJsonLimit = bodyParser.json({
    limit: JSON_LIMIT,
});

const parserJson = bodyParser.json();

const urlEncoded = bodyParser.urlencoded({
    parameterLimit: 100000,
    extended: true
});

const parserUrlEncodedLimit = bodyParser.urlencoded({
    parameterLimit: 100000,
    limit: URL_ENCODED_LIMIT,
    extended: true
});

//===================================================================================================
export { parserJsonLimit, parserJson, urlEncoded, parserUrlEncodedLimit };
//===================================================================================================