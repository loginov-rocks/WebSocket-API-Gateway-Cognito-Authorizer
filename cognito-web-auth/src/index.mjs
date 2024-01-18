import { UserPool } from './userPool.mjs';

const interceptAuthCode = (callback) => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const authCode = urlSearchParams.get('code');

  if (authCode) {
    callback(authCode);
  }
};

const renderAuthData = (authData) => {
  Object.keys(authData).forEach((key) => {
    const element = document.getElementById(key);

    element.value = authData[key];
    element.disabled = false;
  });
};

window.addEventListener('load', () => {
  const userPool = new UserPool({
    clientCallbackUrl: USER_POOL_CLIENT_CALLBACK_URL,
    clientId: USER_POOL_CLIENT_ID,
    domain: USER_POOL_DOMAIN,
  });

  document.getElementById('login').addEventListener('click', () => {
    userPool.loginRedirect();
  });

  interceptAuthCode(async (authCode) => {
    let authData;
    try {
      authData = await userPool.auth(authCode);
    } catch (error) {
      alert(error);

      return;
    }

    renderAuthData(authData);
  });
});
