export class UserPool {
  constructor({ clientCallbackUrl, clientId, domain }) {
    this.clientCallbackUrl = clientCallbackUrl;
    this.clientId = clientId;
    this.domain = domain;
  }

  async auth(code) {
    const url = `https://${this.domain}/oauth2/token`;

    const params = {
      client_id: this.clientId,
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.clientCallbackUrl,
    };

    const body = new URLSearchParams(params).toString();

    const response = await fetch(url, {
      body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'post',
    });

    const json = await response.json();

    if (json.error) {
      throw json.error;
    }

    return json;
  }

  loginRedirect() {
    const scopes = ['email', 'openid', 'profile'];

    const urlSearchParams = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.clientCallbackUrl,
      response_type: 'code',
      scope: scopes.join(' '),
    });

    const url = `https://${this.domain}/login?${urlSearchParams.toString()}`;

    window.location.href = url;
  }
}
