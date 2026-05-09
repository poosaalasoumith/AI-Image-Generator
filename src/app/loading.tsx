"use client";

import { Logo } from "@/components/logo";
import { motion } from "framer-motion";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-50 dark:bg-[#0a0a0c] overflow-hidden">
      {/* Background cinematic glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center opacity-50">
        <div className="absolute w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute w-[400px] h-[400px] bg-violet-500/20 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="relative mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 rounded-full border border-zinc-200/50 dark:border-white/10 border-t-indigo-500 dark:border-t-indigo-500 opacity-50"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-8 rounded-full border border-zinc-200/30 dark:border-white/5 border-b-violet-500 dark:border-b-violet-500 opacity-30"
          />
          <div className="bg-white/50 dark:bg-black/20 p-6 rounded-full backdrop-blur-xl border border-zinc-200 dark:border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent animate-pulse" />
            <Logo />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
            Loading your creative studio
          </h2>
          <div className="flex justify-center gap-1">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              className="w-1.5 h-1.5 rounded-full bg-indigo-500"
            />
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              className="w-1.5 h-1.5 rounded-full bg-violet-500"
            />
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              className="w-1.5 h-1.5 rounded-full bg-sky-500"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
