import { useState } from "react";

import { confirmSignUp, signIn, signUp } from "./auth.js";

const TITLES = {
  signIn: "Sign in",
  signUp: "Create account",
  confirm: "Confirm your email",
};

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-slate-500 focus:outline-none";

export default function AuthForm({ onSignedIn }) {
  const [mode, setMode] = useState("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function switchMode(next) {
    setMode(next);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "signUp") {
        await signUp(email, password);
        setMode("confirm");
      } else {
        if (mode === "confirm") {
          await confirmSignUp(email, code);
        }
        await signIn(email, password);
        onSignedIn();
      }
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-1 text-2xl font-semibold">{TITLES[mode]}</h1>
      <p className="mb-6 text-sm text-slate-600">
        {mode === "confirm"
          ? `Enter the code we sent to ${email}.`
          : "Upload photos and let AI tag them for you."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "confirm" ? (
          <label className="block text-sm font-medium">
            Confirmation code
            <input
              className={`${inputClass} mt-1`}
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
          </label>
        ) : (
          <>
            <label className="block text-sm font-medium">
              Email
              <input
                className={`${inputClass} mt-1`}
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input
                className={`${inputClass} mt-1`}
                type="password"
                autoComplete={mode === "signUp" ? "new-password" : "current-password"}
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {mode === "signUp" && (
                <span className="mt-1 block text-xs font-normal text-slate-600">
                  At least 8 characters, with a lowercase letter and a number.
                </span>
              )}
            </label>
          </>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {busy ? "Please wait..." : TITLES[mode]}
        </button>
      </form>

      {mode !== "confirm" && (
        <button
          type="button"
          onClick={() => switchMode(mode === "signIn" ? "signUp" : "signIn")}
          className="mt-4 text-sm text-slate-700 underline"
        >
          {mode === "signIn" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
      )}
    </main>
  );
}
