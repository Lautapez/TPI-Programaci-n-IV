import { useForm } from "@tanstack/react-form";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { primerError } from "../../../shared/utils/forms";
import type { Producto, ProductoStockUpdate } from "../types";

interface StockFormProps {
  producto: Producto;
  enviando: boolean;
  error: string | null;
  onSubmit: (data: ProductoStockUpdate) => void;
  onCancelar: () => void;
}

export function StockForm({ producto, enviando, error, onSubmit, onCancelar }: StockFormProps) {
  const form = useForm({
    defaultValues: { stock: String(producto.stock), disponible: producto.disponible },
    onSubmit: ({ value }) => onSubmit({ stock: Number(value.stock), disponible: value.disponible }),
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
      <p className="text-muted">
        Producto: <strong className="text-ink">{producto.nombre}</strong>
      </p>

      <form.Field
        name="stock"
        validators={{
          onChange: ({ value }) =>
            value.trim() === "" || !Number.isInteger(Number(value)) || Number(value) < 0
              ? "El stock debe ser un entero igual o mayor a 0"
              : undefined,
        }}
      >
        {(field) => (
          <Input
            id="stock-valor"
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
              {enviando ? "Guardando…" : "Actualizar stock"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
