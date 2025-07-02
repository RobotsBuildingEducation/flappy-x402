export interface PatreonTokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export interface PatreonAuthResult {
  token: PatreonTokenData;
  user: any;
}

/**
 * Open a popup window to begin Patreon OAuth login. Resolves with token
 * and user info when authentication completes.
 */
export function loginWithPatreon(): Promise<PatreonAuthResult> {
  const width = 600;
  const height = 700;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  const popup = window.open(
    '/api/auth/patreon/login',
    'patreon-oauth',
    `width=${width},height=${height},left=${left},top=${top}`
  );

  if (!popup) {
    return Promise.reject(new Error('Failed to open login popup'));
  }

  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        reject(new Error('Popup closed by user'));
      }
    }, 500);

    function handleMessage(event: MessageEvent) {
      if (event.source !== popup) return;
      const data = event.data;
      if (data?.type === 'patreon-auth') {
        clearInterval(timer);
        window.removeEventListener('message', handleMessage);
        popup.close();
        resolve({ token: data.token, user: data.user });
      }
    }

    window.addEventListener('message', handleMessage);
  });
}
