import { FRONTEND_BASE_URL_PROD } from '../../config';

export function getAuthTokenCookieOptions() {
    // Cookie options
    let authTokenCookieOptions = {
        maxAge: 1000 * 60 * 60, // 60mins
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    };
    // if (process.env.NODE_ENV === 'production') {
    //     // authTokenCookieOptions.domain = `${FRONTEND_BASE_URL_PROD.substr(8)}`;
    //     authTokenCookieOptions.domain = `${FRONTEND_BASE_URL_PROD}`;
    // }
    return authTokenCookieOptions;
}

export function getAuthControlCookieOptions() {
    let controlCookieOptions = {
        maxAge: 1000 * 60 * 60, // 60mins
        httpOnly: false,
        secure: true,
        sameSite: 'none',
    };
    // if (process.env.NODE_ENV === 'production') {
    //     // controlCookieOptions.domain = `${FRONTEND_BASE_URL_PROD.substr(8)}`;
    //     controlCookieOptions.domain = `${FRONTEND_BASE_URL_PROD}`;
    // }
    return controlCookieOptions;
}
