import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names, letting a later Tailwind class win over an earlier one
 * in the same group (`px-2` then `px-4` gives `px-4`, not both).
 *
 * The shadcn convention. This project is not a shadcn app — it has no
 * components.json, no CSS-variable theme and no `ui` primitives beyond what
 * it wrote itself — but `clsx` and `tailwind-merge` were already
 * dependencies, and a component that takes a `className` override needs
 * this to honour it.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
