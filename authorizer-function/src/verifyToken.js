import { decode, verify } from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';

// TODO: Refactor, add caching.
const getPemEncodedPublicKey = async (region, userPoolId, keyId) => {
  const response = await fetch(`https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`);
  const json = await response.json();

  const pemEncodedPublicKeys = {};

  json.keys.forEach(({ kid, kty, n, e }) => {
    pemEncodedPublicKeys[kid] = jwkToPem({
      kty: kty,
      e: e,
      n: n,
    });
  });

  return pemEncodedPublicKeys[keyId] || null;
}

export const verifyToken = async (region, userPoolId, token) => {
  var decodedJwt = decode(token, { complete: true });

  if (!decodedJwt) {
    return null;
  }

  const { kid } = decodedJwt.header;
  const pemEncodedPublicKey = await getPemEncodedPublicKey(region, userPoolId, kid);

  if (!pemEncodedPublicKey) {
    return null;
  }

  return verify(token, pemEncodedPublicKey);
};
