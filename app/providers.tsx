"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { MouseProvider } from "@/components/context/MouseContext";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <MouseProvider>
                {children}
            </MouseProvider>
        </ThemeProvider>
    );
}
