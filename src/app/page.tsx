import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Image as ImageIcon, Zap, Shield, Wand2, Layers, Cpu } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Cinematic noise overlay for premium texture
const Noise = () => (
  <div className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.04] z-0 pointer-events-none mix-blend-overlay">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" />
    </svg>
  </div>
);

// Animated background with glows and grid
const BackgroundEffects = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[1000px] h-[600px] opacity-30 dark:opacity-20 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 to-transparent blur-[100px]" />
    </div>
    
    <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-violet-600/10 dark:bg-violet-500/10 rounded-full blur-[120px] mix-blend-screen animate-blob" style={{ animationDelay: '0s' }} />
    <div className="absolute top-[30%] left-[5%] w-[600px] h-[600px] bg-sky-600/10 dark:bg-sky-500/10 rounded-full blur-[120px] mix-blend-screen animate-blob" style={{ animationDelay: '2s' }} />
    <div className="absolute bottom-[-10%] right-[20%] w-[600px] h-[600px] bg-indigo-600/10 dark:bg-indigo-500/10 rounded-full blur-[120px] mix-blend-screen animate-blob" style={{ animationDelay: '4s' }} />
    
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
  </div>
);

// Floating decorative cards for the hero
const FloatingCards = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 hidden lg:block">
    <div className="absolute top-[20%] left-[10%] animate-float" style={{ animationDelay: '0s' }}>
      <div className="w-32 h-32 rounded-2xl bg-white/5 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200/50 dark:border-white/5 p-4 shadow-2xl flex flex-col items-center justify-center gap-2 transform -rotate-6">
        <ImageIcon className="w-8 h-8 text-indigo-500" />
        <div className="w-16 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
        <div className="w-12 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
      </div>
    </div>
    <div className="absolute top-[40%] right-[10%] animate-float" style={{ animationDelay: '1.5s' }}>
      <div className="w-40 h-40 rounded-2xl bg-white/5 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200/50 dark:border-white/5 p-4 shadow-2xl flex flex-col items-center justify-center gap-3 transform rotate-6">
        <Cpu className="w-10 h-10 text-sky-500" />
        <div className="w-20 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
        <div className="w-16 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
      </div>
    </div>
    <div className="absolute bottom-[20%] left-[20%] animate-float" style={{ animationDelay: '3s' }}>
      <div className="w-24 h-24 rounded-2xl bg-white/5 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200/50 dark:border-white/5 p-4 shadow-2xl flex items-center justify-center transform -rotate-12">
        <Wand2 className="w-8 h-8 text-violet-500" />
      </div>
    </div>
  </div>
);

export default async function LandingPage() {
  const { userId } = await auth();
  
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-[#0a0a0c] text-zinc-900 dark:text-zinc-50 selection:bg-indigo-500/30">
      <Noise />
      
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden">
        <BackgroundEffects />
        <FloatingCards />
        
        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out flex flex-col items-center">
          <div className="inline-flex items-center rounded-full border border-zinc-200/50 dark:border-white/10 px-3 py-1 text-xs sm:text-sm font-medium bg-white/50 dark:bg-white/5 backdrop-blur-md shadow-sm mb-8 transition-colors hover:bg-white/80 dark:hover:bg-white/10 cursor-pointer group">
            <Sparkles className="h-4 w-4 mr-2 text-indigo-500 group-hover:animate-pulse-glow" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">
              AIGen 2.0 Engine is Live
            </span>
            <div className="ml-2 pl-2 border-l border-zinc-200 dark:border-white/10 flex items-center">
              Explore now <span className="ml-1 group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter max-w-5xl mb-6 leading-[1.1]">
            <span className="block text-zinc-900 dark:text-white">Imagine it.</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-zinc-700 to-zinc-400 dark:from-zinc-300 dark:to-zinc-600">
              We'll generate it.
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mb-10 font-medium leading-relaxed">
            Transform your ideas into cinematic masterpieces in seconds. 
            Powered by next-generation neural networks for unparalleled photorealism and artistic control.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md sm:max-w-none justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 h-14 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] dark:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                Start Generating for Free
                <Wand2 className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 h-14 rounded-full border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                Explore Architecture
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-4 z-10 border-t border-zinc-200/50 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-lg">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6 text-zinc-900 dark:text-white">
              Engineered for Creators
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              A studio-grade toolkit designed to bridge the gap between human imagination and artificial intelligence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="group relative flex flex-col items-start p-8 bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-sm hover:shadow-xl dark:hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.05)] transition-all duration-500 hover:-translate-y-1 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-8 border border-indigo-500/20">
                <Zap className="h-7 w-7 text-indigo-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Zero Latency Inference</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed relative z-10">
                Generate 4K resolution images in under 3 seconds. Our highly optimized inference engine ensures your workflow is never interrupted.
              </p>
            </div>
            
            <div className="group relative flex flex-col items-start p-8 bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-sm hover:shadow-xl dark:hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.05)] transition-all duration-500 hover:-translate-y-1 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="h-14 w-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-8 border border-violet-500/20">
                <Layers className="h-7 w-7 text-violet-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Infinite Modalities</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed relative z-10">
                Seamlessly transition between photorealism, vector illustration, cinematic 3D, and conceptual art using our unified latent space.
              </p>
            </div>
            
            <div className="group relative flex flex-col items-start p-8 bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-sm hover:shadow-xl dark:hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.05)] transition-all duration-500 hover:-translate-y-1 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="h-14 w-14 rounded-2xl bg-sky-500/10 flex items-center justify-center mb-8 border border-sky-500/20">
                <Shield className="h-7 w-7 text-sky-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Enterprise Security</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed relative z-10">
                Your prompts and generations are fully encrypted. Pro users retain 100% intellectual property rights for commercial distribution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-zinc-200/50 dark:border-white/5 bg-white dark:bg-[#0a0a0c] text-center text-zinc-500 dark:text-zinc-500">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-100">AIGen</span>
            <span className="text-sm">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Twitter</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
