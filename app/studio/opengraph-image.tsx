import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Ian Silva — AI that earns its place in your workflow";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const mark = await readFile(join(process.cwd(), "public/brand/aa-mark.png"));
  return new ImageResponse(<div style={{ display: "flex", width: "100%", height: "100%", padding: 64, background: "#F1EFE7", color: "#0A0B0A", alignItems: "center", gap: 40 }}>
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div style={{ fontSize: 20, letterSpacing: 3, color: "#3F5B2B" }}>IAN SILVA / INDEPENDENT AI CONSULTANT</div>
      <div style={{ fontSize: 76, fontWeight: 800, lineHeight: .98, marginTop: 40, letterSpacing: -4 }}>AI that earns its place.</div>
      <div style={{ fontSize: 26, marginTop: 32 }}>Strategy. Systems. Handover.</div>
      <div style={{ fontSize: 20, marginTop: 48, color: "#3047E8" }}>iamnsilva.me/studio</div>
    </div>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img alt="" src={`data:image/png;base64,${mark.toString("base64")}`} width={320} height={285} />
  </div>, size);
}
