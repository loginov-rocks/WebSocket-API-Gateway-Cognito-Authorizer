import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { Hash } from '@aws-sdk/hash-node';
import { HttpRequest } from '@aws-sdk/protocol-http';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { URL } from 'url';

export const sign = async (region, url, query = {}, headers = {}) => {
  const urlObject = new URL(url);

  // Add query parameters passed as argument, if any.
  if (Object.keys(query).length > 0) {
    Object.keys(query).forEach((queryKey) => {
      urlObject.searchParams.set(queryKey, query[queryKey]);
    });
  }

  const httpRequest = new HttpRequest({
    headers: {
      ...headers,
      host: urlObject.hostname,
    },
    hostname: urlObject.hostname,
    path: urlObject.pathname,
    protocol: urlObject.protocol,
    query: Object.fromEntries(urlObject.searchParams),
  });

  const signatureV4 = new SignatureV4({
    // Modify `credentials` to use a custom identity.
    credentials: defaultProvider(),
    region,
    service: 'execute-api',
    sha256: Hash.bind(null, 'sha256'),
  });

  const signedHttpRequest = await signatureV4.sign(httpRequest);

  return {
    headers: signedHttpRequest.headers,
    url: urlObject.toString(),
  }
};
