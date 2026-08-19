import { OSLoading } from "@/components/os/OSLoading";
import { routes } from "@/lib/routes";

export default function Loading() {
  return <OSLoading label={routes.admin.root} lines={5} />;
}
