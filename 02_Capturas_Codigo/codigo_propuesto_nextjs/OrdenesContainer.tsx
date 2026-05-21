import { OrdenList } from "./OrdenList";

export function OrdenesContainer() {
  const ordenes = [
    { id: "1", folio: "OS-001", estado: "RECIBIDO" },
    { id: "2", folio: "OS-002", estado: "LISTO" },
  ];

  return <OrdenList ordenes={ordenes} />;
}