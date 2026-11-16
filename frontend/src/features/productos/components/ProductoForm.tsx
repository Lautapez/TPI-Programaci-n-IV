import { useForm } from "@tanstack/react-form";
import { Button } from "../../../shared/ui/Button";
import { Input, Select, Textarea } from "../../../shared/ui/Input";
import { primerError } from "../../../shared/utils/forms";
import type { Categoria } from "../../categorias/types";
import type { Producto, ProductoCreate } from "../types";

interface ProductoFormProps {
  categorias: Categoria[];
  inicial?: Producto;
  enviando: boolean;
  error: string | null;
  onSubmit: (data: ProductoCreate) => void;
  onCancelar: () => void;
}

export function ProductoForm({ categorias, inicial, enviando, error, onSubmit, onCancelar }: ProductoFormProps) {
  const form = useForm({
    defaultValues: {
      nombre: inicial?.nombre ?? "",
      descripcion: inicial?.descripcion ?? "",
      precio_base: inicial ? String(inicial.precio_base) : "",
      stock: inicial ? String(inicial.stock) : "0",
      imagen_url: inicial?.imagen_url ?? "",
      categoria_id: inicial ? String(inicial.categoria_id) : "",
      disponible: inicial?.disponible ?? true,
    },
    onSubmit: ({ value }) => {
      onSubmit({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() || null,
        stock: Number(value.stock),
        disponible: value.disponible,
        categoria_id: Number(value.categoria_id),
      });
    },
  });

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Field
        name="nombre"
        validators={{
          onChange: ({ value }) =>
            value.trim().length < 2 ? "El nombre debe tener al menos 2 caracteres" : undefined,
        }}
      >
        {(field) => (
          <Input
            id="producto-nombre"
            label="Nombre"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={primerError(field.state.meta.errors)}
          />
        )}
      </form.Field>

      <form.Field
        name="categoria_id"
        validators={{ onChange: ({ value }) => (value === "" ? "Elegí una categoría" : undefined) }}
      >
        {(field) => (
          <Select
            id="producto-categoria"
            label="Categoría"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={primerError(field.state.meta.errors)}
          >
            <option value="">Elegir…</option>
            {categorias.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.nombre}
              </option>
            ))}
          </Select>
        )}
      </form.Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field
          name="precio_base"
          validators={{
            onChange: ({ value }) =>
              value.trim() === "" || Number.isNaN(Number(value)) || Number(value) < 0
                ? "Ingresá un precio igual o mayor a 0"
                : undefined,
          }}
        >
          {(field) => (
            <Input
              id="producto-precio"
              label="Precio"
              type="number"
              min={0}
              step="0.01"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={primerError(field.state.meta.errors)}
            />
          )}
        </form.Field>

        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) =>
              !Number.isInteger(Number(value)) || value.trim() === "" || Number(value) < 0
                ? "El stock debe ser un entero igual o mayor a 0"
                : undefined,
          }}
        >
          {(field) => (
            <Input
              id="producto-stock"
              label="Stock"
              type="number"
              min={0}
              step="1"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={primerError(field.state.meta.errors)}
            />
          )}
        </form.Field>
      </div>

      <form.Field name="descripcion">
        {(field) => (
          <Textarea
            id="producto-descripcion"
            label="Descripción"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>

      <form.Field
        name="imagen_url"
        validators={{
          onChange: ({ value }) =>
            value.trim() !== "" && !/^https?:\/\//i.test(value.trim())
              ? "Debe empezar con http:// o https://"
              : undefined,
        }}
      >
        {(field) => (
          <Input
            id="producto-imagen"
            label="URL de la imagen"
            ayuda="Opcional. Sin imagen se muestra una baldosa de color."
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={primerError(field.state.meta.errors)}
          />
        )}
      </form.Field>

      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 font-medium">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
              className="size-4 accent-pimiento"
            />
            Disponible para la venta
          </label>
        )}
      </form.Field>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-pimiento-dark">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancelar}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => s.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit || enviando}>
              {enviando ? "Guardando…" : inicial ? "Guardar cambios" : "Crear producto"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
