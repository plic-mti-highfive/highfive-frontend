import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Button, Field, Input, PasswordInput } from "@shared/ui";
import { AuthLayout } from "../components/AuthLayout";
import { useLogin } from "@/api/queries/auth";
import { ApiError } from "@/api/client";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** R-NAV6 : ramene vers la route demandee apres connexion, jamais un lien externe. */
function safeSuiteRedirect(suite: string | null): string {
  return suite && suite.startsWith("/") ? suite : "/";
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!EMAIL_PATTERN.test(email)) {
      setError("Cette adresse n'a pas le bon format.");
      return;
    }

    try {
      await login.mutateAsync({ email, password });
      navigate(safeSuiteRedirect(searchParams.get("suite")), { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "L'adresse ou le mot de passe ne correspondent pas.",
      );
    }
  }

  return (
    <AuthLayout
      title="Se connecter"
      description="Retrouve tes projets et ton équipe."
      imageUrl="https://images.unsplash.com/photo-1552664730-d307ca884978"
      onSubmit={handleSubmit}
      footerText="Tu n'as pas encore de compte ?"
      footerLink={{ text: "Créer un compte", href: "/inscription" }}
    >
      <Field label="Adresse e-mail" htmlFor="email">
        <Input
          id="email"
          type="email"
          placeholder="toi@exemple.com"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          className="h-13 text-body-md"
        />
      </Field>

      <PasswordInput
        id="password"
        label="Mot de passe"
        value={password}
        onChange={setPassword}
      />

      {error && (
        <p className="text-body-md text-danger-fg" role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={login.isPending}
        className="w-full h-13 text-body-lg font-semibold rounded-lg mt-2"
      >
        {login.isPending ? "Connexion…" : "Se connecter"}
      </Button>
    </AuthLayout>
  );
}
