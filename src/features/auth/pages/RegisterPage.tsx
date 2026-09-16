import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Button, Field, Input, PasswordInput } from "@shared/ui";
import { AuthLayout } from "../components/AuthLayout";
import { useRegister } from "@/api/queries/auth";
import { ApiError } from "@/api/client";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-z0-9._-]{3,24}$/;

function safeSuiteRedirect(suite: string | null): string {
  return suite && suite.startsWith("/") ? suite : "/";
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const register = useRegister();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!USERNAME_PATTERN.test(username)) {
      setError("3 à 24 caractères, lettres minuscules, chiffres, . _ -");
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      setError("Cette adresse n'a pas le bon format.");
      return;
    }
    if (password.length < 8) {
      setError("8 caractères minimum.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      await register.mutateAsync({ username, email, password });
      navigate(safeSuiteRedirect(searchParams.get("suite")), { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Impossible de créer le compte pour le moment.",
      );
    }
  }

  return (
    <AuthLayout
      title="Créer un compte"
      description="Rejoins la communauté et lance ton premier projet."
      imageUrl="https://images.unsplash.com/photo-1496115965489-21be7e6e59a0"
      onSubmit={handleSubmit}
      footerText="Tu as déjà un compte ?"
      footerLink={{ text: "Se connecter", href: "/connexion" }}
    >
      <Field
        label="Pseudo"
        htmlFor="username"
        description="3 à 24 caractères, lettres minuscules, chiffres, . _ -"
      >
        <Input
          id="username"
          type="text"
          placeholder="toi"
          value={username}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setUsername(e.target.value)
          }
          className="h-13 text-body-md"
        />
      </Field>

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

      <PasswordInput
        id="confirm"
        label="Confirmer le mot de passe"
        value={confirm}
        onChange={setConfirm}
      />

      {error && (
        <p className="text-body-md text-danger-fg" role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={register.isPending}
        className="w-full h-13 text-body-lg font-semibold rounded-lg mt-2"
      >
        {register.isPending ? "Création…" : "Créer mon compte"}
      </Button>
    </AuthLayout>
  );
}
