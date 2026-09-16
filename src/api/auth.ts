import { apiFetch } from "./client";
import {
  currentUserSchema,
  sessionSchema,
  type CurrentUser,
  type LoginInput,
  type PasswordResetInput,
  type PasswordResetRequestInput,
  type RegisterInput,
  type Session,
} from "@/domain";

export function login(input: LoginInput): Promise<Session> {
  return apiFetch("/auth/login", {
    method: "POST",
    body: input,
    schema: sessionSchema,
  });
}

export function register(input: RegisterInput): Promise<Session> {
  return apiFetch("/auth/register", {
    method: "POST",
    body: input,
    schema: sessionSchema,
  });
}

export function logout(): Promise<void> {
  return apiFetch("/auth/logout", { method: "POST" });
}

export function getCurrentUser(): Promise<CurrentUser> {
  return apiFetch("/me", { schema: currentUserSchema });
}

export function requestPasswordReset(
  input: PasswordResetRequestInput,
): Promise<void> {
  return apiFetch("/auth/password-reset-request", {
    method: "POST",
    body: input,
  });
}

export function resetPassword(input: PasswordResetInput): Promise<void> {
  return apiFetch("/auth/password-reset", { method: "POST", body: input });
}
