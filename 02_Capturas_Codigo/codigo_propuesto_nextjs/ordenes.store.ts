import { create } from "zustand";

type EstadoOrden = "RECIBIDO" | "EN_PROCESO" | "LISTO" | "ENTREGADO";

type Orden = {
  id: string;
  folio: string;
  estado: EstadoOrden;
};

type OrdenesStore = {
  ordenes: Orden[];
  setOrdenes: (ordenes: Orden[]) => void;
  actualizarEstado: (id: string, estado: EstadoOrden) => void;
};

export const useOrdenesStore = create<OrdenesStore>((set) => ({
  ordenes: [],

  setOrdenes: (ordenes) => set({ ordenes }),

  actualizarEstado: (id, estado) =>
    set((state) => ({
      ordenes: state.ordenes.map((orden) =>
        orden.id === id ? { ...orden, estado } : orden
      ),
    })),
}));