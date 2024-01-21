import { decode, verify } from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';

// Simple in-memory cache, optional. In this Lambda it will always have a single promise stored because Region and User
// Pool ID are taken from the environment variables and remain unchanged within the life cycle of the Lambda, but I
// still kept this flexible in case someone will copy the code. Subject for improvement.
const getPemEncodedPublicKeysPromisesCache = new Map();

const getPemEncodedPublicKeysImplementation = async (jwksUrl) => {
  console.log('jwksUrl', jwksUrl);

  const response = await fetch(jwksUrl);

  if (!response.ok) {
    throw new Error(`Unable to fetch JWKS using URL ${jwksUrl}!`);
  }

  const json = await response.json();
  const pemEncodedPublicKeys = new Map();

  json.keys.forEach(({ kid, kty, n, e }) => {
    pemEncodedPublicKeys.set(kid, jwkToPem({ kty, e, n }));
  });

  return pemEncodedPublicKeys;
};

const getPemEncodedPublicKeys = (region, userPoolId) => {
  const jwksUrl = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;

  if (!getPemEncodedPublicKeysPromisesCache.has(jwksUrl)) {
    // The implementation is executed and set as the map element immediately to decrease the chances of the race
    // conditions' impact (the same function triggered in parallel, but not yet resolved). Subject for improvement.
    getPemEncodedPublicKeysPromisesCache.set(jwksUrl, getPemEncodedPublicKeysImplementation(jwksUrl));
  }

  return getPemEncodedPublicKeysPromisesCache.get(jwksUrl);
};

export const verifyToken = async (region, userPoolId, token) => {
  var decodedJwt = decode(token, { complete: true });

  if (!decodedJwt || !decodedJwt.header || !decodedJwt.header.kid) {
    return null;
  }

  const pemEncodedPublicKeys = await getPemEncodedPublicKeys(region, userPoolId);
  const pemEncodedPublicKey = pemEncodedPublicKeys.get(decodedJwt.header.kid);

  if (!pemEncodedPublicKey) {
    throw new Error(
      `Public key ID "${decodedJwt.header.kid}" not found for User Pool ID "${userPoolId}" in "${region}" region!`,
    );
  }

  return verify(token, pemEncodedPublicKey);
};
