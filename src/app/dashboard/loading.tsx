import { LayoutDashboard, Image as ImageIcon, History, Settings, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const routes = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Generate", icon: ImageIcon },
  { label: "History", icon: History },
  { label: "Billing", icon: CreditCard },
  { label: "Settings", icon: Settings },
];

export default function DashboardLoading() {
  return (
    <div className="flex flex-1 h-full overflow-hidden w-full">
      {/* Sidebar Skeleton */}
      <div className="space-y-4 py-4 flex flex-col h-full bg-card border-r w-64 hidden md:flex">
        <div className="px-3 py-2 flex-1">
          <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-6 px-4 ml-4" />
          <div className="space-y-2 px-2">
            {routes.map((route) => (
              <div
                key={route.label}
                className="flex items-center p-3 w-full justify-start rounded-lg bg-zinc-100/50 dark:bg-zinc-800/30 animate-pulse"
              >
                <div className="h-5 w-5 bg-zinc-200 dark:bg-zinc-700 rounded mr-3" />
                <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 py-4 border-t">
          <div className="bg-muted/50 p-4 rounded-xl flex flex-col gap-2 animate-pulse">
            <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-700 rounded" />
            <div className="h-3 w-32 bg-zinc-200 dark:bg-zinc-700 rounded" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/10 w-full relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
          <div className="space-y-2">
            <div className="h-10 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
            <div className="h-5 w-96 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col h-[300px] animate-pulse">
                <div className="flex-1 bg-zinc-200/50 dark:bg-zinc-800/50 relative overflow-hidden">
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent" />
                </div>
                <div className="p-6 space-y-3">
                  <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded" />
                  <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
