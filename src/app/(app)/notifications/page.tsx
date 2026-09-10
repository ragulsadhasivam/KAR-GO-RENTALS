import { getNotifications } from "@/lib/services/notifications";
import { NotificationsPageClient } from "./NotificationsPageClient";

export default async function NotificationsPage() {
  const notifications = await getNotifications();
  return <NotificationsPageClient notifications={notifications} />;
}
