import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Checkbox } from "@shared/components/ui/checkbox";
import { AuthLayout } from "../components/AuthLayout";
import { PasswordInput } from "@shared/components/ui/password-input";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Adresse e-mail invalide.");
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      navigate("/");
    } catch {
      setError("Identifiants incorrects.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Se connecter"
      description="Profitez de tous les outils fournis par la plateforme."
      imageUrl="https://images.unsplash.com/photo-1552664730-d307ca884978"
      onSubmit={handleSubmit}
      footerText="Vous n'avez pas de compte ?"
      footerLink={{ text: "Créez-en un ici.", href: "/register" }}
    >
      {/* Email */}
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className="text-body-md text-foreground font-semibold"
        >
          Adresse e-mail
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="vous@exemple.com"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          className="h-13 text-body-md"
        />
      </div>

      {/* Mot de passe */}
      <PasswordInput
        id="password"
        label="Mot de passe"
        value={password}
        onChange={setPassword}
        ariaLabel="Mot de passe"
      />

      {/* Se souvenir + Mot de passe oublié */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <Checkbox
            checked={remember}
            onCheckedChange={(v: boolean) => setRemember(v === true)}
          />
          <span className="text-body-md text-muted-foreground">
            Se souvenir de moi
          </span>
        </label>
        <button
          type="button"
          className="text-body-md text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
        >
          Mot de passe oublié ?
        </button>
      </div>

      {/* Erreur */}
      {error && <p className="text-body-md text-rose-dark">{error}</p>}

      {/* Bouton Se connecter */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-13 text-body-lg font-semibold rounded-lg mt-2 dark:bg-foreground dark:text-background dark:hover:bg-foreground/90"
      >
        {isSubmitting ? "Connexion…" : "Se connecter"}
      </Button>
    </AuthLayout>
  );
}
