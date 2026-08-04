import { getConversaciones } from "@/lib/dbRepositories";
import ConversacionesClient from "@/components/admin/ConversacionesClient";

export default async function AdminConversaciones() {
  const conversaciones = await getConversaciones();

  return <ConversacionesClient conversaciones={conversaciones} />;
}
