import { useSolidAuth } from "./hooks/useSolidAuth";

export const LoginComponent = () => {
  const { webId, isLoggedIn, isInitializing, authenticate } = useSolidAuth();

  if (isInitializing) return <p>Loading session...</p>;
  if (isLoggedIn) return <p>Logged in as: {webId}</p>;
  
  return <button onClick={() => authenticate()}>Log In</button>;
};
