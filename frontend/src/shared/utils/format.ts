const moneda = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const fecha = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" });

export const formatPrecio = (valor: number): string => moneda.format(valor);
export const formatFecha = (iso: string): string => fecha.format(new Date(iso));
