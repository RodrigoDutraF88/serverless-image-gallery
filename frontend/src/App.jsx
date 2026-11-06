import { useState } from "react";

import AuthForm from "./AuthForm.jsx";
import Gallery from "./Gallery.jsx";
import { isSignedIn, signOut } from "./auth.js";

export default function App() {
  const [signedIn, setSignedIn] = useState(isSignedIn());

  function handleSignOut() {
    signOut();
    setSignedIn(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {signedIn ? (
        <Gallery onSignOut={handleSignOut} />
      ) : (
        <AuthForm onSignedIn={() => setSignedIn(true)} />
      )}
    </div>
  );
}
