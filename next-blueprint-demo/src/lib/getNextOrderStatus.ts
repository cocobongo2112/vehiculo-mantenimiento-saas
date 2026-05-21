export type OrdenEstado =
  | "RECIBIDO"
  | "EN_PROCESO"
  | "LISTO"
  | "ENTREGADO";

export function getNextOrderStatus(estado: OrdenEstado): OrdenEstado {
  switch (estado) {
    case "RECIBIDO":
      return "EN_PROCESO";
    case "EN_PROCESO":
      return "LISTO";
    case "LISTO":
      return "ENTREGADO";
    case "ENTREGADO":
      return "ENTREGADO";
  }
}
