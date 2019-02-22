// Load Auth0 SDK
import auth0 from 'auth0-js';

const webAuth = new auth0.WebAuth({
    // Auth0 Domain
    domain: 'auth.density.io',

    // SPA settings
    clientID: 'sisXLEhEmOcPaGToGHF0SQ1qvnCDRmbI',
    redirectUri: `${window.location.protocol}//${window.location.host}`,
    responseType: 'id_token token',
    scope: 'openid profile email',

    // API settings
    audience: 'https://density.io/core-api'
});

export default webAuth;
