import { useForm } from "@tanstack/react-form";
import { Button } from "../../../shared/ui/Button";
import { Input, Textarea } from "../../../shared/ui/Input";
import { primerError } from "../../../shared/utils/forms";
import type { FormaPago } from "../types";

export interface CheckoutValues {
  direccion_entrega: string;
  forma_pago: FormaPago;
  notas: string;
}

interface CheckoutFormProps {
  enviando: boolean;
  error: string | null;
  onSubmit: (values: CheckoutValues) => void;
}

const opcionesPago: { valor: FormaPago; titulo: string; detalle: string }[] = [
  { valor: "EFECTIVO", titulo: "Efectivo", detalle: "Pagás al recibir el pedido" },
  { valor: "TRANSFERENCIA", titulo: "Transferencia", detalle: "Te pasamos el alias al confirmar" },
];

export function CheckoutForm({ enviando, error, onSubmit }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: {
      direccion_entrega: "",
      forma_pago: "EFECTIVO" as FormaPago,
      notas: "",
    },
    onSubmit: ({ value }) =>
      onSubmit({
        direccion_entrega: value.direccion_entrega.trim(),
        forma_pago: value.forma_pago,
        notas: value.notas.trim(),
      }),
  });

  return (
    <form
      noValidate
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Field
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length;
            if (largo < 5) return "La dirección debe tener al menos 5 caracteres";
            if (largo > 200) return "La dirección admite hasta 200 caracteres";
            return undefined;
          },
        }}
      >
        {(field) => (
          <Input
            id="direccion"
            label="Dirección de entrega"
            autoComplete="street-address"
            placeholder="Calle, número, piso y localidad"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={primerError(field.state.meta.errors)}
          />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <fieldset>
            <legend className="mb-1.5 text-sm font-semibold">Forma de pago</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {opcionesPago.map((op) => {
                const activa = field.state.value === op.valor;
                return (
                  <label
                    key={op.valor}
                    className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 ${
                      activa ? "border-ink bg-ink/5" : "border-line bg-white hover:border-ink/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="forma_pago"
                      value={op.valor}
                      checked={activa}
                      onChange={() => field.handleChange(op.valor)}
                      className="mt-1 accent-pimiento"
                    />
                    <span>
                      <span className="block font-semibold">{op.titulo}</span>
                      <span className="text-sm text-muted">{op.detalle}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}
      </form.Field>

      <form.Field
        name="notas"
        validators={{
          onChange: ({ value }) => (value.length > 500 ? "Las notas admiten hasta 500 caracteres" : undefined),
        }}
      >
        {(field) => (
          <Textarea
            id="notas"
            label="Notas (opcional)"
            placeholder="Timbre, sin cebolla, dejar en portería…"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={primerError(field.state.meta.errors)}
          />
        )}
      </form.Field>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-pimiento-dark">
          {error}
        </p>
      )}

      <form.Subscribe selector={(s) => s.canSubmit}>
        {(canSubmit) => (
          <Button type="submit" disabled={!canSubmit || enviando}>
            {enviando ? "Confirmando…" : "Confirmar pedido"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
