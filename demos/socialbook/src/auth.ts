import { Session, getDefaultSession, login, handleIncomingRedirect } from '@inrupt/solid-client-authn-browser';

const session = getDefaultSession();

export async function handleAuth() {
  await handleIncomingRedirect({
    restorePreviousSession: true
  });
  return session;
}

export async function initiateLogin(idpUrl: string) {
  if (!session.info.isLoggedIn) {
    await login({
      oidcIssuer: idpUrl,
      redirectUrl: window.location.href,
      clientName: "Episteme Social Book",
    });
  }
}

export async function initiateLogout() {
  await session.logout();
  window.location.reload();
}
