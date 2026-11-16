import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as authApi from "../features/auth/api/auth";
import type { Usuario } from "../features/auth/types";
import { setSesionInvalidaHandler } from "../shared/api/axiosInstance";
import { queryClient } from "../shared/api/queryClient";

interface AuthState {
  usuario: Usuario | null;
  cargando: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  limpiar: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,
      login: async (username, password) => {
        await authApi.login(username, password); // el JWT queda en la cookie HttpOnly
        const usuario = await authApi.getMe();
        set({ usuario });
      },
      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          queryClient.clear();
          set({ usuario: null });
        }
      },
      checkSession: async () => {
        set({ cargando: true });
        try {
          const usuario = await authApi.getMe();
          set({ usuario });
        } catch {
          set({ usuario: null });
        } finally {
          set({ cargando: false });
        }
      },
      limpiar: () => {
        queryClient.clear();
        set({ usuario: null });
      },
    }),
    {
      name: "foodstore-auth",
      // Solo se guarda el usuario (nombre, email y rol); nunca el token.
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
);

setSesionInvalidaHandler(() => useAuthStore.getState().limpiar());
