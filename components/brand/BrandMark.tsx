import Image from "next/image";
import styles from "./Brand.module.css";

export default function BrandMark({ size = 42 }: { size?: number }) {
  return <span className={styles.mark} style={{ width: size, height: size }} aria-hidden="true">
    <Image src="/brand/aa-mark.webp" alt="" width={size} height={size} sizes={`${size}px`} />
  </span>;
}
