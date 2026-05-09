import { SignUp } from "@clerk/nextjs";
import { Logo } from "@/components/logo";

export default function Page() {
  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-background w-full min-h-[calc(100vh-4rem)]">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-zinc-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-zinc-400/10 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>
      
      {/* Glassmorphism auth card wrapper */}
      <div className="relative z-10 w-full max-w-[420px] p-4 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-700">
        <div className="mb-8">
          <Logo className="scale-125" />
        </div>
        <div className="w-full backdrop-blur-xl bg-card/50 border border-white/10 dark:border-white/5 shadow-2xl rounded-2xl p-1 md:p-2 flex justify-center">
          <SignUp forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard" appearance={{
            elements: {
              card: "shadow-none bg-transparent w-full m-0",
              rootBox: "w-full flex justify-center",
            }
          }} />
        </div>
      </div>
    </div>
  );
}
