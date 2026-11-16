/** Lee la ruta de origen que ProtectedRoute guarda en el `state` de la navegación. */
export function origenDe(state: unknown): string | undefined {
  if (typeof state === "object" && state !== null && "from" in state) {
    const from: unknown = state.from;
    if (typeof from === "string") return from;
  }
  return undefined;
}
