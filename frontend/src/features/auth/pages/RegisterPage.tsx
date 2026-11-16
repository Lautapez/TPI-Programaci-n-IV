import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { handleApiError } from "../../../shared/api/handleApiError";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { Input } from "../../../shared/ui/Input";
import { primerError } from "../../../shared/utils/forms";
import { useAuthStore } from "../../../store/authStore";
import { register } from "../api/auth";
import type { UserCreate } from "../types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterPage() {
  const navigate = useNavigate();
  const usuario = useAuthStore((s) => s.usuario);
  const login = useAuthStore((s) => s.login);

  const registrar = useMutation({
    mutationFn: async (data: UserCreate) => {
      await register(data);
      await login(data.username, data.password); // entra directo tras registrarse
    },
    onSuccess: () => navigate("/", { replace: true }),
  });

  const form = useForm({
    defaultValues: { username: "", full_name: "", email: "", password: "", confirmar: "" },
    onSubmit: async ({ value }) => {
      await registrar.mutateAsync({
        username: value.username.trim(),
        full_name: value.full_name.trim(),
        email: value.email.trim(),
        password: value.password,
      }).catch(() => undefined); // el error se muestra con registrar.error
    },
  });

  if (usuario && !registrar.isPending) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-1 text-4xl font-extrabold">Crear cuenta</h1>
      <p className="mb-6 text-muted">Con tu cuenta podés pedir y ver el estado de tus pedidos.</p>
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
              onChange: ({ value }) =>
                value.trim().length < 3
                  ? "El usuario debe tener al menos 3 caracteres"
                  : value.trim().length > 50
                    ? "Máximo 50 caracteres"
                    : undefined,
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
            name="full_name"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 2 ? "Ingresá tu nombre completo" : undefined,
            }}
          >
            {(field) => (
              <Input
                id="full_name"
                label="Nombre completo"
                autoComplete="name"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={primerError(field.state.meta.errors)}
              />
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => (EMAIL_RE.test(value.trim()) ? undefined : "Ingresá un email válido"),
            }}
          >
            {(field) => (
              <Input
                id="email"
                label="Email"
                type="email"
                autoComplete="email"
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
              onChange: ({ value }) =>
                value.length < 8
                  ? "La contraseña debe tener al menos 8 caracteres"
                  : value.length > 72
                    ? "Máximo 72 caracteres"
                    : undefined,
            }}
          >
            {(field) => (
              <Input
                id="password"
                label="Contraseña"
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={primerError(field.state.meta.errors)}
              />
            )}
          </form.Field>

          <form.Field
            name="confirmar"
            validators={{
              onChangeListenTo: ["password"],
              onChange: ({ value, fieldApi }) =>
                value !== fieldApi.form.getFieldValue("password")
                  ? "Las contraseñas no coinciden"
                  : undefined,
            }}
          >
            {(field) => (
              <Input
                id="confirmar"
                label="Repetí la contraseña"
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={primerError(field.state.meta.errors)}
              />
            )}
          </form.Field>

          {registrar.isError && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-pimiento-dark">
              {handleApiError(registrar.error, "No se pudo crear la cuenta")}
            </p>
          )}

          <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </Card>
      <p className="mt-5 text-center text-muted">
        ¿Ya tenés cuenta?{" "}
        <Link to="/login" className="font-semibold text-pimiento underline">
          Ingresá
        </Link>
      </p>
    </div>
  );
}
