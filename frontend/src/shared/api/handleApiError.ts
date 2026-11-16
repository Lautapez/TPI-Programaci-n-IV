import axios from "axios";

/** Extrae el `detail` de una respuesta de error de la API (string o lista de errores 422). */
export function getDetail(data: unknown): string | null {
  if (typeof data !== "object" || data === null || !("detail" in data)) return null;
  const detail: unknown = data.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const mensajes = detail
      .map((item: unknown) =>
        typeof item === "object" && item !== null && "msg" in item && typeof item.msg === "string"
          ? item.msg
          : null,
      )
      .filter((m): m is string => m !== null);
    return mensajes.length > 0 ? mensajes.join(". ") : "Los datos enviados no son válidos";
  }
  return null;
}

/** Convierte cualquier error en un mensaje legible para la pantalla. */
export function handleApiError(error: unknown, fallback = "Ocurrió un error inesperado"): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return "No se pudo conectar con el servidor";
    return getDetail(error.response.data) ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
