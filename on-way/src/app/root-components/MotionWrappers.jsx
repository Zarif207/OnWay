"use client";

import { motion } from "framer-motion";

export const AnimatedSection = ({ children, className }) => (
    <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={className}
    >
        {children}
    </motion.section>
);

export const AnimatedHeading = ({ children, className }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className={className}
    >
        {children}
    </motion.div>
);

export const StaggerContainer = ({ children, className, delayChildren = 0.15 }) => (
    <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: {
                    staggerChildren: delayChildren,
                },
            },
        }}
        className={className}
    >
        {children}
    </motion.div>
);

export const AnimatedCard = ({ children, className }) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, y: 25 },
            visible: { opacity: 1, y: 0 },
        }}
        whileHover={{
            scale: 1.03,
            y: -4,
            transition: { duration: 0.3 }
        }}
        className={className}
    >
        {children}
    </motion.div>
);
