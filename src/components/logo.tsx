import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  showText?: boolean;
}

export function Logo({
  className,
  imageClassName,
  textClassName,
  showText = true,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3 sm:gap-4 group cursor-pointer", className)}>
      {/* Icon Container with Hover Glow */}
      <div className="relative flex items-center justify-center transition-transform duration-500 ease-out group-hover:scale-[1.05]">
        {/* Subtle Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-zinc-300 to-zinc-500 dark:from-zinc-600 dark:to-zinc-300 rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-all duration-500 ease-out scale-150" />
        
        {/* Actual Image */}
        <Image
          src="/logo.png"
          alt="AIGen Logo"
          width={44}
          height={44}
          className={cn(
            "relative z-10 w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-sm transition-all duration-500 ease-out group-hover:-translate-y-0.5",
            imageClassName
          )}
          priority
        />
      </div>

      {/* Brand Text */}
      {showText && (
        <span
          className={cn(
            "font-semibold text-2xl sm:text-[1.65rem] tracking-tight text-zinc-900 dark:text-white transition-colors duration-300 group-hover:text-black dark:group-hover:text-zinc-100",
            textClassName
          )}
        >
          AIGen
        </span>
      )}
    </div>
  );
}
