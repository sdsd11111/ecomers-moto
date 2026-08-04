import { NextResponse } from "next/server";
import {
  fetchInstanceStatus,
  createInstance,
  getQrCode,
  logoutInstance,
  deleteInstance,
  resetAndCreateInstance,
} from "@/lib/evolution";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "status";
  const instance = searchParams.get("instance") || "asfalto-motos";

  if (action === "qr") {
    const qrResult = await getQrCode(instance);
    return NextResponse.json(qrResult);
  }

  if (action === "reset") {
    const resetResult = await resetAndCreateInstance(instance);
    return NextResponse.json(resetResult);
  }

  const status = await fetchInstanceStatus(instance);
  return NextResponse.json(status);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const instance = body.instance || "asfalto-motos";
    const forceReset = body.reset || false;

    if (forceReset) {
      const resetResult = await resetAndCreateInstance(instance);
      return NextResponse.json(resetResult);
    }

    // First check status
    const status = await fetchInstanceStatus(instance);

    if (!status.exists) {
      const created = await createInstance(instance);
      if (!created.success) {
        return NextResponse.json({ success: false, error: "Error al crear la instancia" }, { status: 500 });
      }
    }

    const qrResult = await getQrCode(instance);
    return NextResponse.json({ success: true, qr: qrResult.base64, raw: qrResult.data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const instance = searchParams.get("instance") || "asfalto-motos";

  await logoutInstance(instance);
  const deleted = await deleteInstance(instance);

  return NextResponse.json({ success: true, deleted });
}
