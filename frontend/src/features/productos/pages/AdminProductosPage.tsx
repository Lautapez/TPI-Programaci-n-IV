import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { handleApiError } from "../../../shared/api/handleApiError";
import { DataTable } from "../../../shared/components/DataTable";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Skeleton } from "../../../shared/components/Skeleton";
import { Button } from "../../../shared/ui/Button";
import { Modal } from "../../../shared/ui/Modal";
import { formatPrecio } from "../../../shared/utils/format";
import { useCategorias } from "../../categorias/hooks/useCategorias";
import { ProductoForm } from "../components/ProductoForm";
import { StockForm } from "../components/StockForm";
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from "../hooks/useProductos";
import type { Producto } from "../types";

type ModalState =
  | { tipo: "crear" }
  | { tipo: "editar"; producto: Producto }
  | { tipo: "stock"; producto: Producto }
  | { tipo: "eliminar"; producto: Producto };

export function AdminProductosPage() {
  const [modal, setModal] = useState<ModalState | null>(null);
  const productos = useProductos({ skip: 0, limit: 100 });
  const categorias = useCategorias();
  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();
  const stock = useActualizarStock();
  const eliminar = useEliminarProducto();

  const cerrar = () => {
    setModal(null);
    crear.reset();
    actualizar.reset();
    stock.reset();
    eliminar.reset();
  };

  const columnas = useMemo<ColumnDef<Producto>[]>(
    () => [
      {
        accessorKey: "nombre",
        header: "Producto",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold">{row.original.nombre}</p>
            <p className="text-sm text-muted">{row.original.categoria?.nombre ?? "Sin categoría"}</p>
          </div>
        ),
      },
      {
        accessorKey: "precio_base",
        header: "Precio",
        cell: (info) => formatPrecio(info.getValue<number>()),
      },
      { accessorKey: "stock", header: "Stock" },
      {
        accessorKey: "disponible",
        header: "Estado",
        cell: ({ row }) =>
          row.original.disponible && row.original.stock > 0 ? (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-sm font-semibold text-emerald-900">
              A la venta
            </span>
          ) : (
            <span className="rounded-full bg-ink/10 px-2.5 py-0.5 text-sm font-semibold">
              {row.original.disponible ? "Sin stock" : "No disponible"}
            </span>
          ),
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => setModal({ tipo: "editar", producto: row.original })}>
              Editar
            </Button>
            <Button size="sm" variant="outline" onClick={() => setModal({ tipo: "stock", producto: row.original })}>
              Stock
            </Button>
            <Button size="sm" variant="danger" onClick={() => setModal({ tipo: "eliminar", producto: row.original })}>
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
        <h1 className="text-4xl font-extrabold">Productos</h1>
        <Button onClick={() => setModal({ tipo: "crear" })}>Nuevo producto</Button>
      </div>

      {productos.isPending ? (
        <Skeleton className="h-64 w-full" />
      ) : productos.isError ? (
        <EstadoError
          mensaje={handleApiError(productos.error, "No pudimos cargar los productos")}
          onReintentar={() => void productos.refetch()}
        />
      ) : productos.data.items.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no cargaste productos"
          descripcion="Creá el primero para que aparezca en el catálogo."
          accion={<Button onClick={() => setModal({ tipo: "crear" })}>Nuevo producto</Button>}
        />
      ) : (
        <DataTable data={productos.data.items} columns={columnas} />
      )}

      {modal?.tipo === "crear" && (
        <Modal titulo="Nuevo producto" onClose={cerrar}>
          <ProductoForm
            categorias={categorias.data ?? []}
            enviando={crear.isPending}
            error={crear.isError ? handleApiError(crear.error) : null}
            onCancelar={cerrar}
            onSubmit={(data) => crear.mutate(data, { onSuccess: cerrar })}
          />
        </Modal>
      )}

      {modal?.tipo === "editar" && (
        <Modal titulo="Editar producto" onClose={cerrar}>
          <ProductoForm
            categorias={categorias.data ?? []}
            inicial={modal.producto}
            enviando={actualizar.isPending}
            error={actualizar.isError ? handleApiError(actualizar.error) : null}
            onCancelar={cerrar}
            onSubmit={(data) =>
              actualizar.mutate({ id: modal.producto.id, data }, { onSuccess: cerrar })
            }
          />
        </Modal>
      )}

      {modal?.tipo === "stock" && (
        <Modal titulo="Stock y disponibilidad" ancho="sm" onClose={cerrar}>
          <StockForm
            producto={modal.producto}
            enviando={stock.isPending}
            error={stock.isError ? handleApiError(stock.error) : null}
            onCancelar={cerrar}
            onSubmit={(data) => stock.mutate({ id: modal.producto.id, data }, { onSuccess: cerrar })}
          />
        </Modal>
      )}

      {modal?.tipo === "eliminar" && (
        <Modal titulo="Eliminar producto" ancho="sm" onClose={cerrar}>
          <p>
            Vas a retirar <strong>{modal.producto.nombre}</strong> del catálogo. Los pedidos que ya lo incluyen
            conservan su nombre y precio.
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
              onClick={() => eliminar.mutate(modal.producto.id, { onSuccess: cerrar })}
            >
              {eliminar.isPending ? "Eliminando…" : "Eliminar producto"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
