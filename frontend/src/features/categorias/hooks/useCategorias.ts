import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/categorias";
import type { CategoriaCreate, CategoriaUpdate } from "../types";

export function useCategorias() {
  return useQuery({ queryKey: ["categorias"], queryFn: api.listarCategorias });
}

function useInvalidarCatalogo() {
  const qc = useQueryClient();
  return async () => {
    // Los productos incluyen su categoría: también se refrescan.
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["categorias"] }),
      qc.invalidateQueries({ queryKey: ["productos"] }),
    ]);
  };
}

export function useCrearCategoria() {
  const invalidar = useInvalidarCatalogo();
  return useMutation({
    mutationFn: (data: CategoriaCreate) => api.crearCategoria(data),
    onSuccess: invalidar,
  });
}

export function useActualizarCategoria() {
  const invalidar = useInvalidarCatalogo();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoriaUpdate }) =>
      api.actualizarCategoria(id, data),
    onSuccess: invalidar,
  });
}

export function useEliminarCategoria() {
  const invalidar = useInvalidarCatalogo();
  return useMutation({
    mutationFn: (id: number) => api.eliminarCategoria(id),
    onSuccess: invalidar,
  });
}
