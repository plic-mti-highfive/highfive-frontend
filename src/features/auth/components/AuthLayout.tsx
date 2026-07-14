import { Link } from "react-router-dom";
import { Logo } from "@features/layout";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footerText: string;
  footerLink: { text: string; href: string };
  imageUrl?: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function AuthLayout({
  title,
  description,
  children,
  footerText,
  footerLink,
  imageUrl = "https://images.unsplash.com/photo-1552664730-d307ca884978",
  onSubmit,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex p-6 gap-6">
      {/* Gauche : image */}
      <div className="hidden md:block relative w-1/2 rounded-xl overflow-hidden">
        <img
          src={imageUrl}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Droite : formulaire */}
      <div className="w-full md:w-1/2 flex flex-col items-center px-4">
        {/* Logo */}
        <div className="flex pt-4 w-full max-w-md justify-center">
          <Logo className="text-3xl" textColor="text-foreground" />
        </div>

        {/* Formulaire centré verticalement */}
        <div className="flex-1 flex flex-col justify-center w-full max-w-md">
          {/* En-tête */}
          <div className="mb-10 text-center">
            <h1 className="font-heading text-display-lg text-foreground mb-3">
              {title}
            </h1>
            <p className="text-body-lg text-muted-foreground">{description}</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} noValidate className="space-y-6">
            {children}
          </form>
        </div>

        {/* Bas : lien */}
        <div className="pb-4 text-center">
          <p className="text-body-md text-muted-foreground">
            {footerText}{" "}
            <Link
              to={footerLink.href}
              className="text-foreground font-semibold underline-offset-4 hover:underline"
            >
              {footerLink.text}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
