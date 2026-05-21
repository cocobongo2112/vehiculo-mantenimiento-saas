import { NextResponse } from "next/server";

export type OrdenEstado =
  | "RECIBIDO"
  | "EN_PROCESO"
  | "LISTO"
  | "ENTREGADO";

export type OrdenServicio = {
  id: number;
  folio: string;
  cliente: string;
  vehiculo: string;
  estado: OrdenEstado;
};

const ordenesEjemplo: OrdenServicio[] = [
  {
    id: 1,
    folio: "OS-662126",
    cliente: "Felipe García",
    vehiculo: "Nissan Sentra 2018 · NCE345J",
    estado: "EN_PROCESO",
  },
  {
    id: 2,
    folio: "OS-662127",
    cliente: "María López",
    vehiculo: "Volkswagen Jetta 2020 · ABC1234",
    estado: "RECIBIDO",
  },
  {
    id: 3,
    folio: "OS-662128",
    cliente: "Carlos Mendoza",
    vehiculo: "Toyota Corolla 2019 · XYZ9876",
    estado: "LISTO",
  },
  {
    id: 4,
    folio: "OS-662129",
    cliente: "Ana Torres",
    vehiculo: "Honda Civic 2021 · HND5521",
    estado: "ENTREGADO",
  },
];

export async function GET() {
  return NextResponse.json(ordenesEjemplo);
}
