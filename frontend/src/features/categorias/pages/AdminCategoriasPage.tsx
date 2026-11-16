import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { handleApiError } from "../../../shared/api/handleApiError";
import { DataTable } from "../../../shared/components/DataTable";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Skeleton } from "../../../shared/components/Skeleton";
import { Button } from "../../../shared/ui/Button";
import { Modal } from "../../../shared/ui/Modal";
import { CategoriaForm } from "../components/CategoriaForm";
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from "../hooks/useCategorias";
import type { Categoria } from "../types";

type ModalState =
  | { tipo: "crear" }
  | { tipo: "editar"; categoria: Categoria }
  | { tipo: "eliminar"; categoria: Categoria };

export function AdminCategoriasPage() {
  const [modal, setModal] = useState<ModalState | null>(null);
  const categorias = useCategorias();
  const crear = useCrearCategoria();
  const actualizar = useActualizarCategoria();
  const eliminar = useEliminarCategoria();

  const cerrar = () => {
    setModal(null);
    crear.reset();
    actualizar.reset();
    eliminar.reset();
  };

  const columnas = useMemo<ColumnDef<Categoria>[]>(
    () => [
      { accessorKey: "nombre", header: "Nombre", cell: (info) => <strong>{info.getValue<string>()}</strong> },
      {
        accessorKey: "descripcion",
        header: "Descripción",
        cell: (info) => info.getValue<string | null>() ?? <span className="text-muted">—</span>,
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setModal({ tipo: "editar", categoria: row.original })}>
              Editar
            </Button>
            <Button size="sm" variant="danger" onClick={() => setModal({ tipo: "eliminar", categoria: row.original })}>
              Eliminar
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-extrabold">Categorías</h1>
        <Button onClick={() => setModal({ tipo: "crear" })}>Nueva categoría</Button>
      </div>

      {categorias.isPending ? (
        <Skeleton className="h-48 w-full" />
      ) : categorias.isError ? (
        <EstadoError
          mensaje={handleApiError(categorias.error, "No pudimos cargar las categorías")}
          onReintentar={() => void categorias.refetch()}
        />
      ) : categorias.data.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no hay categorías"
          descripcion="Creá una para poder cargar productos."
          accion={<Button onClick={() => setModal({ tipo: "crear" })}>Nueva categoría</Button>}
        />
      ) : (
        <DataTable data={categorias.data} columns={columnas} />
      )}

      {modal?.tipo === "crear" && (
        <Modal titulo="Nueva categoría" onClose={cerrar}>
          <CategoriaForm
            enviando={crear.isPending}
            error={crear.isError ? handleApiError(crear.error) : null}
            onCancelar={cerrar}
            onSubmit={(data) => crear.mutate(data, { onSuccess: cerrar })}
          />
        </Modal>
      )}

      {modal?.tipo === "editar" && (
        <Modal titulo="Editar categoría" onClose={cerrar}>
          <CategoriaForm
            inicial={modal.categoria}
            enviando={actualizar.isPending}
            error={actualizar.isError ? handleApiError(actualizar.error) : null}
            onCancelar={cerrar}
            onSubmit={(data) =>
              actualizar.mutate({ id: modal.categoria.id, data }, { onSuccess: cerrar })
            }
          />
        </Modal>
      )}

      {modal?.tipo === "eliminar" && (
        <Modal titulo="Eliminar categoría" ancho="sm" onClose={cerrar}>
          <p>
            Vas a dar de baja <strong>{modal.categoria.nombre}</strong>. Su nombre sigue reservado y sus
            productos no se ocultan: para retirarlos del catálogo, eliminalos también.
          </p>
          {eliminar.isError && (
            <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-pimiento-dark">
              {handleApiError(eliminar.error)}
            </p>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={cerrar}>
              Cancelar
            </Button>
            <Button
              disabled={eliminar.isPending}
              onClick={() => eliminar.mutate(modal.categoria.id, { onSuccess: cerrar })}
            >
              {eliminar.isPending ? "Eliminando…" : "Eliminar categoría"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
