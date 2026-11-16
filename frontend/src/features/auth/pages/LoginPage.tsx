import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { handleApiError } from "../../../shared/api/handleApiError";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { Input } from "../../../shared/ui/Input";
import { primerError } from "../../../shared/utils/forms";
import { origenDe } from "../../../shared/utils/navigation";
import { useAuthStore } from "../../../store/authStore";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = useAuthStore((s) => s.usuario);
  const login = useAuthStore((s) => s.login);
  const [error, setError] = useState<string | null>(null);
  const destino = origenDe(location.state) ?? "/";

  const form = useForm({
    defaultValues: { username: "", password: "" },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await login(value.username.trim(), value.password);
        navigate(destino, { replace: true });
      } catch (e) {
        setError(handleApiError(e, "No se pudo iniciar sesión"));
      }
    },
  });

  if (usuario) return <Navigate to={destino} replace />;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-1 text-4xl font-extrabold">Ingresar</h1>
      <p className="mb-6 text-muted">Entrá para confirmar tu pedido y seguirlo.</p>
      <Card className="p-6">
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
            name="username"
            validators={{
              onChange: ({ value }) => (value.trim() === "" ? "Ingresá tu usuario" : undefined),
            }}
          >
            {(field) => (
              <Input
                id="username"
                label="Usuario"
                autoComplete="username"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={primerError(field.state.meta.errors)}
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => (value === "" ? "Ingresá tu contraseña" : undefined),
            }}
          >
            {(field) => (
              <Input
                id="password"
                label="Contraseña"
                type="password"
                autoComplete="current-password"
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

          <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "Ingresando…" : "Ingresar"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </Card>
      <p className="mt-5 text-center text-muted">
        ¿Primera vez?{" "}
        <Link to="/register" className="font-semibold text-pimiento underline">
          Creá tu cuenta
        </Link>
      </p>
    </div>
  );
}
