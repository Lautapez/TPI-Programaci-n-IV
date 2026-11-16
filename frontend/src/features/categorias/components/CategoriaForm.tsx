import { useForm } from "@tanstack/react-form";
import { Button } from "../../../shared/ui/Button";
import { Input, Textarea } from "../../../shared/ui/Input";
import { primerError } from "../../../shared/utils/forms";
import type { Categoria, CategoriaCreate } from "../types";

interface CategoriaFormProps {
  inicial?: Categoria;
  enviando: boolean;
  error: string | null;
  onSubmit: (data: CategoriaCreate) => void;
  onCancelar: () => void;
}

export function CategoriaForm({ inicial, enviando, error, onSubmit, onCancelar }: CategoriaFormProps) {
  const form = useForm({
    defaultValues: { nombre: inicial?.nombre ?? "", descripcion: inicial?.descripcion ?? "" },
    onSubmit: ({ value }) =>
      onSubmit({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null }),
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
          onChange: ({ value }) => {
            const largo = value.trim().length;
            if (largo < 2) return "El nombre debe tener al menos 2 caracteres";
            if (largo > 100) return "El nombre admite hasta 100 caracteres";
            return undefined;
          },
        }}
      >
        {(field) => (
          <Input
            id="categoria-nombre"
            label="Nombre"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={primerError(field.state.meta.errors)}
          />
        )}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => (
          <Textarea
            id="categoria-descripcion"
            label="Descripción"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
          />
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
              {enviando ? "Guardando…" : inicial ? "Guardar cambios" : "Crear categoría"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
