import { NextResponse } from "next/server";
import { saveLead, saveVenta } from "@/lib/dbRepositories";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      orderId,
      nombre,
      cedula,
      telefono,
      email,
      ciudad,
      direccion,
      tipoEntrega,
      metodoPago,
      items,
      subtotal,
    } = body;

    if (!nombre || !telefono) {
      return NextResponse.json(
        { error: "Nombre y teléfono son obligatorios" },
        { status: 400 }
      );
    }

    const leadId = `lead-${orderId || Date.now()}`;
    const ventaId = `venta-${orderId || Date.now()}`;

    const itemsSummary = Array.isArray(items)
      ? items.map((i: any) => `${i.nombre} (x${i.cantidad})`).join(", ")
      : "Compra Web";

    // Save lead in MySQL
    await saveLead({
      id: leadId,
      cliente: nombre,
      telefono: telefono,
      email: email || null,
      origen: "checkout_web",
      motoInteres: `Orden #${orderId}: ${itemsSummary} | Entrega: ${tipoEntrega || "envio"} | Dir: ${ciudad || ""} ${direccion || ""}`,
      presupuesto: Number(subtotal) || 0,
      contactado: false,
    });

    // Save sale/order in MySQL
    await saveVenta({
      id: ventaId,
      cliente: nombre,
      telefono: telefono,
      motoId: items?.[0]?.id || "varias",
      motoNombre: itemsSummary,
      monto: Number(subtotal) || 0,
      origen: "checkout_web",
      estado: "pendiente_transferencia",
      asesor: "Checkout Web Asfalto°",
    });

    console.log(`[Checkout DB] Guardado exitoso de Lead y Venta para orden #${orderId}`);

    return NextResponse.json({
      success: true,
      orderId,
      message: "Pedido guardado exitosamente en la base de datos",
    });
  } catch (error: any) {
    console.error("Error al guardar pedido en la base de datos:", error);
    return NextResponse.json(
      { error: "Error interno al guardar pedido", message: error.message },
      { status: 500 }
    );
  }
}
