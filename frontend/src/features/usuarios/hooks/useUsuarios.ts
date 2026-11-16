import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/usuarios";

export function useUsuarios() {
  return useQuery({ queryKey: ["usuarios"], queryFn: api.listarUsuarios });
}

export function useActivarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.activarUsuario(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["usuarios"] }),
  });
}

export function useDesactivarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.desactivarUsuario(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["usuarios"] }),
  });
}
