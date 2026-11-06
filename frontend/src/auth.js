import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
} from "amazon-cognito-identity-js";

const pool = new CognitoUserPool({
  UserPoolId: import.meta.env.VITE_USER_POOL_ID,
  ClientId: import.meta.env.VITE_CLIENT_ID,
});

function cognitoUser(email) {
  return new CognitoUser({ Username: email, Pool: pool });
}

export function signUp(email, password) {
  const attributes = [new CognitoUserAttribute({ Name: "email", Value: email })];
  return new Promise((resolve, reject) => {
    pool.signUp(email, password, attributes, null, (error) =>
      error ? reject(error) : resolve(),
    );
  });
}

export function confirmSignUp(email, code) {
  return new Promise((resolve, reject) => {
    cognitoUser(email).confirmRegistration(code, true, (error) =>
      error ? reject(error) : resolve(),
    );
  });
}

// SRP: proves the password to Cognito without sending it
export function signIn(email, password) {
  const details = new AuthenticationDetails({ Username: email, Password: password });
  return new Promise((resolve, reject) => {
    cognitoUser(email).authenticateUser(details, {
      onSuccess: () => resolve(),
      onFailure: reject,
    });
  });
}

export function signOut() {
  pool.getCurrentUser()?.signOut();
}

export function isSignedIn() {
  return pool.getCurrentUser() !== null;
}

// getSession refreshes the token when it has expired
export function getAccessToken() {
  return new Promise((resolve, reject) => {
    const user = pool.getCurrentUser();
    if (!user) {
      reject(new Error("Not signed in"));
      return;
    }
    user.getSession((error, session) =>
      error ? reject(error) : resolve(session.getAccessToken().getJwtToken()),
    );
  });
}
