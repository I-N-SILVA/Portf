import { OSLoading } from "@/components/os/OSLoading";

/**
 * Covers the whole client space, including the public pitch page — which is
 * force-dynamic too, and whose visitor is a prospect who has never seen this
 * site before and has no reason to wait through a blank click.
 */
export default function Loading() {
  return <OSLoading label="loading" lines={3} />;
}
