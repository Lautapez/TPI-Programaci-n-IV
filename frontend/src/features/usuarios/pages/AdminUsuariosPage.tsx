import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { handleApiError } from "../../../shared/api/handleApiError";
import { DataTable } from "../../../shared/components/DataTable";
import { EstadoError } from "../../../shared/components/EstadoError";
import { Skeleton } from "../../../shared/components/Skeleton";
import { Button } from "../../../shared/ui/Button";
import { useAuthStore } from "../../../store/authStore";
import type { Usuario } from "../../auth/types";
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from "../hooks/useUsuarios";

export function AdminUsuariosPage() {
  const sesion = useAuthStore((s) => s.usuario);
  const usuarios = useUsuarios();
  const activar = useActivarUsuario();
  const desactivar = useDesactivarUsuario();
  const errorMutacion = activar.error ?? desactivar.error;

  const columnas = useMemo<ColumnDef<Usuario>[]>(
    () => [
      { accessorKey: "username", header: "Usuario", cell: (i) => <strong>{i.getValue<string>()}</strong> },
      { accessorKey: "full_name", header: "Nombre" },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "role",
        header: "Rol",
        cell: (i) => (i.getValue<string>() === "admin" ? "Administrador" : "Cliente"),
      },
      {
        accessorKey: "disabled",
        header: "Estado",
        cell: (i) =>
          i.getValue<boolean>() ? (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-sm font-semibold text-red-900">
              Desactivado
            </span>
          ) : (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-sm font-semibold text-emerald-900">
              Activo
            </span>
          ),
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const u = row.original;
          if (u.disabled) {
            return (
              <Button
                size="sm"
                variant="outline"
                disabled={activar.isPending}
                onClick={() => activar.mutate(u.id)}
              >
                Activar
              </Button>
            );
          }
          // El admin no puede desactivarse a sí mismo: el botón no se muestra en su fila.
          if (u.id === sesion?.id) return <span className="text-sm text-muted">Tu cuenta</span>;
          return (
            <Button
              size="sm"
              variant="danger"
              disabled={desactivar.isPending}
              onClick={() => desactivar.mutate(u.id)}
            >
              Desactivar
            </Button>
          );
        },
      },
    ],
    [sesion?.id, activar, desactivar],
  );

  return (
    <div>
      <h1 className="mb-6 text-4xl font-extrabold">Usuarios</h1>

      {errorMutacion && (
        <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-pimiento-dark">
          {handleApiError(errorMutacion)}
        </p>
      )}

      {usuarios.isPending ? (
        <Skeleton className="h-64 w-full" />
      ) : usuarios.isError ? (
        <EstadoError
          mensaje={handleApiError(usuarios.error, "No pudimos cargar los usuarios")}
          onReintentar={() => void usuarios.refetch()}
        />
      ) : (
        <DataTable data={usuarios.data} columns={columnas} />
      )}
    </div>
  );
}
