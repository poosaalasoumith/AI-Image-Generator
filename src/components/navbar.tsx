"use client"

import Link from "next/link"
import { Logo } from "@/components/logo"
import { SignInButton, UserButton, Show } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 dark:border-white/5 bg-background/40 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_24px_rgba(255,255,255,0.02)] supports-[backdrop-filter]:bg-background/20 transition-all duration-300">
      <div className="container max-w-7xl mx-auto flex h-20 items-center justify-between px-6 md:px-8">
        <Link 
          href="/" 
          className="flex items-center outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
        >
          <Logo />
        </Link>

        <nav className="flex items-center gap-4">
          <ThemeToggle />
          
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="default">Sign In</Button>
            </SignInButton>
          </Show>
          
          <Show when="signed-in">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <UserButton />
          </Show>
        </nav>
      </div>
    </header>
  )
}
