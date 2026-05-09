"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Image as ImageIcon, History, Settings, CreditCard } from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-zinc-700 dark:text-zinc-300",
  },
  {
    label: "Generate",
    icon: ImageIcon,
    href: "/dashboard/generate",
    color: "text-zinc-700 dark:text-zinc-300",
  },
  {
    label: "History",
    icon: History,
    href: "/dashboard/history",
    color: "text-zinc-700 dark:text-zinc-300",
  },
  {
    label: "Billing",
    icon: CreditCard,
    href: "/dashboard/billing",
    color: "text-zinc-700 dark:text-zinc-300",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    color: "text-zinc-700 dark:text-zinc-300",
  },
];

export function Sidebar({ credits, isPro, isAuthorized, lastCreditReset }: { credits: number, isPro: boolean, isAuthorized?: boolean, lastCreditReset?: Date }) {
  const pathname = usePathname();
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!lastCreditReset || isPro || isAuthorized) return;

    const calculateTimeLeft = () => {
      const resetTime = new Date(lastCreditReset).getTime() + 24 * 60 * 60 * 1000;
      const now = new Date().getTime();
      const difference = resetTime - now;

      if (difference <= 0) {
        return "Ready for reset (refresh page)";
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      return `Resets in ${hours}h ${minutes}m`;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000);

    return () => clearInterval(timer);
  }, [lastCreditReset, isPro, isAuthorized]);

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-card border-r w-64 hidden md:flex">
      <div className="px-3 py-2 flex-1">
        <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight uppercase text-muted-foreground">
          Menu
        </h2>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-lg transition-colors",
                pathname === route.href ? "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100" : "text-muted-foreground"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3 group-hover:scale-110 transition-transform", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-6 py-4 border-t">
        <div className="bg-muted/50 p-4 rounded-xl text-center">
          <h3 className="font-semibold text-sm mb-1">
            {isAuthorized ? "Developer Mode" : isPro ? "Pro Plan" : "Free Plan"}
          </h3>
          <p className="text-xs text-muted-foreground mb-1">
            {isAuthorized ? "Unlimited Credits" : isPro ? "Unlimited generations" : `${credits} credits remaining today`}
          </p>
          {!isPro && !isAuthorized && timeLeft && (
            <p className="text-[10px] text-primary/80 font-medium mb-3">
              {timeLeft}
            </p>
          )}
          {!isPro && !isAuthorized && (
            <Link href="/dashboard/billing" className="text-xs font-medium text-primary hover:underline">
              Upgrade to Pro
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
