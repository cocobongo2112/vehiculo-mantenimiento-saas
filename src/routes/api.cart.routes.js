const express = require("express");
const router = express.Router();
const { ZodError } = require("zod");
const { CartUpdateSchema } = require("../schemas/cart.schema");

// Ruta vulnerable simulada para explicar el problema
router.post("/update-vulnerable", async (req, res) => {
  const { productId, quantity, price } = req.body;

  const totalCost = quantity * price;

  return res.json({
    success: true,
    message: "Carrito actualizado sin validación",
    data: {
      productId,
      quantity,
      price,
      totalCost
    }
  });
});

// Ruta blindada con Zod
router.post("/update", async (req, res) => {
  try {
    const validatedData = CartUpdateSchema.parse(req.body);

    const { productId, quantity, price } = validatedData;
    const totalCost = quantity * price;

    /*
      Aquí iría la actualización real en base de datos.
      Ejemplo:
      await db.query(
        "UPDATE cart SET quantity=?, totalCost=? WHERE productId=?",
        [quantity, totalCost, productId]
      );
    */

    return res.json({
      success: true,
      message: "Carrito actualizado correctamente",
      data: {
        productId,
        quantity,
        price,
        totalCost
      }
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Datos inválidos en la petición.",
        errors: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message
        }))
      });
    }

    console.error("Error al actualizar carrito:", error);

    return res.status(500).json({
      success: false,
      message: "Ocurrió un error interno en el servidor."
    });
  }
});

module.exports = router;