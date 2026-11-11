import { plain } from "@/lib/accent";

/** Renders copy with any *markers* removed. Headlines carry no coloured words. */
export default function Accent({ text }: { text: string }) {
  return <>{plain(text)}</>;
}
