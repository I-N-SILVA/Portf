"use client";

import { motion } from "framer-motion";
import ContactCard from "@/components/cards/ContactCard";

export default function ContactSection() {
    return (
        <section className="py-12">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <ContactCard />
                </motion.div>

                <footer className="mt-24 pt-8 border-t border-border/50 text-muted-foreground text-sm text-center">
                    <p>© {new Date().getFullYear()} Ian N. Silva. All rights reserved.</p>
                </footer>
            </div>
        </section>
    );
}

