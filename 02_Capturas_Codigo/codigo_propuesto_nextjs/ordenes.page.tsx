import { prisma } from "./prisma";
import { OrdenList } from "./OrdenList";

export default async function OrdenesPage() {
  const ordenes = await prisma.orden.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <section>
      <h1>Órdenes de servicio</h1>
      <OrdenList ordenes={ordenes} />
    </section>
  );
}