import { describe, expect, it } from "vitest";

import { getNextOrderStatus } from "./getNextOrderStatus";

describe("getNextOrderStatus", () => {
  it("devuelve EN_PROCESO cuando el estado actual es RECIBIDO", () => {
    expect(getNextOrderStatus("RECIBIDO")).toBe("EN_PROCESO");
  });

  it("devuelve LISTO cuando el estado actual es EN_PROCESO", () => {
    expect(getNextOrderStatus("EN_PROCESO")).toBe("LISTO");
  });

  it("devuelve ENTREGADO cuando el estado actual es LISTO", () => {
    expect(getNextOrderStatus("LISTO")).toBe("ENTREGADO");
  });
});
