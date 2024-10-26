'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Brain, KanbanSquare, Users, CheckSquare, BarChart2, Paperclip, MessageCircle, Menu, X } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"

export function FeaturesPageComponent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isSignedIn, user } = useUser();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      {/* Header from MindspaceLanding */}
      <header className="container mx-auto px-4 py-6 relative z-50">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-[#00FFFF]" />
            <span className="text-2xl font-bold tracking-tight">MindSpace</span>
          </Link>
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/features" className="hover:text-[#00FFFF] transition-colors">Features</Link>
            <Link href="/pricing" className="hover:text-[#00FFFF] transition-colors">Pricing</Link>
            <Link href="/resources" className="hover:text-[#00FFFF] transition-colors">Resources</Link>
            {isSignedIn && (
              <Link href="/projects" className="hover:text-[#00FFFF] transition-colors">Projects</Link>
            )}
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost" className="text-white hover:text-[#00FFFF] hover:bg-transparent">
                    Log in
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="bg-[#00FFFF] text-black hover:bg-[#00FFFF]/90">
                    Sign up
                  </Button>
                </SignUpButton>
              </>
            )}
          </nav>
        </div>
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              className="absolute top-full left-0 right-0 bg-[#0A0A0A] shadow-lg py-4 px-4 md:hidden"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col space-y-4">
                <Link href="/features" className="hover:text-[#00FFFF] transition-colors">Features</Link>
                <Link href="/pricing" className="hover:text-[#00FFFF] transition-colors">Pricing</Link>
                <Link href="/resources" className="hover:text-[#00FFFF] transition-colors">Resources</Link>
                {isSignedIn && (
                  <Link href="/projects" className="hover:text-[#00FFFF] transition-colors">Projects</Link>
                )}
                {isSignedIn ? (
                  <UserButton afterSignOutUrl="/" />
                ) : (
                  <>
                    <SignInButton mode="modal">
                      <Button variant="ghost" className="text-white hover:text-[#00FFFF] hover:bg-transparent justify-start">
                        Log in
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button className="bg-[#00FFFF] text-black hover:bg-[#00FFFF]/90">
                        Sign up
                      </Button>
                    </SignUpButton>
                  </>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Features Content */}
      <main className="flex-grow container mx-auto px-6 py-12">
        <motion.section 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl font-bold mb-4">Features</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover the powerful tools that make MindSpace the ultimate project management solution.
          </p>
        </motion.section>

        <motion.section 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {[
            { icon: KanbanSquare, title: "Kanban Board", description: "Visualize your workflow and optimize your process with customizable boards." },
            { icon: Users, title: "Real-time Collaboration", description: "Work together seamlessly with your team, no matter where they are." },
            { icon: CheckSquare, title: "Task Management", description: "Create, assign, and track tasks with ease to ensure nothing falls through the cracks." },
            { icon: BarChart2, title: "Project Analytics", description: "Gain insights into your team's performance and project progress with detailed analytics." },
            { icon: Paperclip, title: "File Attachments", description: "Keep all your project files in one place, easily accessible to your entire team." },
            { icon: MessageCircle, title: "Team Communication", description: "Foster collaboration with built-in messaging and discussion threads." },
          ].map((feature, index) => (
            <motion.div 
              key={index} 
              className="bg-[#1A1A1A] p-6 rounded-lg hover:bg-[#252525] transition-colors border border-[#333333]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
            >
              <feature.icon className="h-12 w-12 text-[#00FFFF] mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.section>

        <motion.section 
          className="text-center bg-[#1A1A1A] p-12 rounded-lg border border-[#333333]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h2 className="text-4xl font-bold mb-4">Ready to transform your project management?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of teams already using MindSpace to boost their productivity.
          </p>
          <Link href="/">
            <Button className="bg-[#00FFFF] text-black hover:bg-[#00FFFF]/90 px-8">
              Get Started
            </Button>
          </Link>
        </motion.section>
      </main>

      {/* Footer from MindspaceLanding */}
      <footer className="container mx-auto px-4 py-8 border-t border-white/10 text-center text-gray-400">
  <div className="flex flex-wrap justify-center space-x-4 mb-4">
    <Link 
      href="https://x.com/aif_vision" 
      target="_blank" 
      className="hover:text-[#00FFFF]"
    >
      Twitter
    </Link>
    <Link 
      href="https://www.linkedin.com/in/alessandro-farè-987b42164" 
      target="_blank" 
      className="hover:text-[#00FFFF]"
    >
      LinkedIn
    </Link>
    <Link 
      href="https://github.com/AlessandroFare" 
      target="_blank" 
      className="hover:text-[#00FFFF]"
    >
      GitHub
    </Link>
  </div>
  <p>&copy; 2024 Mindspace. All rights reserved.</p>
</footer>
    </div>
  )
}
