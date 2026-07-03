type Orden = {
  id: string;
  folio: string;
  estado: string;
};

export function OrdenList({ ordenes }: { ordenes: Orden[] }) {
  return (
    <section>
      <h2>Órdenes de servicio</h2>

      {ordenes.map((orden) => (
        <article key={orden.id}>
          <strong>{orden.folio}</strong>
          <p>Estado: {orden.estado}</p>
        </article>
      ))}
    </section>
  );
}