const EVOLUTION_API_URL = (process.env.EVOLUTION_API_URL || "http://178.238.238.158:8080").replace(/\/$/, "");
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";
const DEFAULT_INSTANCE = process.env.EVOLUTION_INSTANCE_NAME || "asfalto-motos";

const headers = {
  "Content-Type": "application/json",
  apikey: EVOLUTION_API_KEY,
};

export async function fetchInstanceStatus(instanceName: string = DEFAULT_INSTANCE) {
  try {
    const res = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404) {
        return { state: "NOT_FOUND", exists: false };
      }
      return { state: "DISCONNECTED", exists: false };
    }

    const data = await res.json();
    return {
      state: data.instance?.state || data.connectionState || "DISCONNECTED",
      exists: true,
      data,
    };
  } catch (error: any) {
    return { state: "ERROR", message: error.message, exists: false };
  }
}

export async function createInstance(instanceName: string = DEFAULT_INSTANCE) {
  try {
    const res = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        instanceName,
        token: "",
        qrcode: true,
        integration: "WHATSAPP-BAILEYS",
      }),
      cache: "no-store",
    });

    const data = await res.json();
    return { success: res.ok, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getQrCode(instanceName: string = DEFAULT_INSTANCE) {
  try {
    const res = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      return { success: false, error: "No se pudo obtener el QR code" };
    }

    const data = await res.json();
    const base64 = data.base64 || data.qrcode?.base64 || data.code;
    return { success: true, base64, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function logoutInstance(instanceName: string = DEFAULT_INSTANCE) {
  try {
    const res = await fetch(`${EVOLUTION_API_URL}/instance/logout/${instanceName}`, {
      method: "DELETE",
      headers,
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    return { success: res.ok, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteInstance(instanceName: string = DEFAULT_INSTANCE) {
  try {
    const res = await fetch(`${EVOLUTION_API_URL}/instance/delete/${instanceName}`, {
      method: "DELETE",
      headers,
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    return { success: res.ok, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function resetAndCreateInstance(instanceName: string = DEFAULT_INSTANCE) {
  try {
    // 1. Try logout and delete existing broken session
    await logoutInstance(instanceName);
    await deleteInstance(instanceName);

    // Wait 1.5 seconds for Evolution API to clean up state
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 2. Create fresh instance
    const created = await createInstance(instanceName);

    // Wait 1 second before fetching QR
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 3. Get fresh QR code
    const qrResult = await getQrCode(instanceName);
    return { success: true, created, qr: qrResult.base64, data: qrResult.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
