import axios from "axios";
import { getDetail } from "./handleApiError";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // el navegador adjunta la cookie HttpOnly en cada petición
});

let onSesionInvalida: (() => void) | null = null;

/** El authStore registra aquí cómo limpiarse (evita un import circular). */
export function setSesionInvalidaHandler(handler: () => void): void {
  onSesionInvalida = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      const url = error.config?.url ?? "";
      const esLoginOMe = url.includes("/auth/token") || url.includes("/auth/me");
      const detail = getDetail(error.response.data);
      const sesionExpirada = error.response.status === 401 && !esLoginOMe;
      const cuentaDesactivada =
        error.response.status === 400 && detail === "Cuenta de usuario desactivada";
      if (sesionExpirada || cuentaDesactivada) onSesionInvalida?.();
    }
    return Promise.reject(error);
  },
);
