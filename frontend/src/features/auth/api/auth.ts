import { api } from "../../../shared/api/axiosInstance";
import type { UserCreate, Usuario } from "../types";

export async function login(username: string, password: string): Promise<void> {
  const form = new URLSearchParams();
  form.set("username", username);
  form.set("password", password);
  await api.post("/auth/token", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
}

export async function register(data: UserCreate): Promise<Usuario> {
  const res = await api.post<Usuario>("/auth/register", data);
  return res.data;
}

export async function getMe(): Promise<Usuario> {
  const res = await api.get<Usuario>("/auth/me");
  return res.data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
