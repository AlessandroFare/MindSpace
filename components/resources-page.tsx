'use client'

import { Button } from "@/components/ui/button"
import { Search, PlayCircle, BookOpen, Users, HelpCircle, ArrowRight, Brain, Menu, X } from 'lucide-react'
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"

export function ResourcesPageComponent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isSignedIn, user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");

  const documentationLinks = [
    {
      title: 'Getting Started',
      description: 'Learn about getting started in MindSpace',
      action: () => window.open('https://github.com/AlessandroFare/MindSpace/wiki/Getting-Started', '_blank')
    },
    {
      title: 'Advanced Features',
      description: 'Learn about advanced features in MindSpace',
      action: () => window.open('https://github.com/AlessandroFare/MindSpace/wiki/Advanced-Features', '_blank')
    },
    {
      title: 'API Reference',
      description: 'Learn about API reference in MindSpace',
      action: () => window.open('https://github.com/AlessandroFare/MindSpace/wiki/API-Reference', '_blank')
    }
  ];

  const videoTutorials = [
    {
      title: 'Basics of Project Management',
      description: 'Video tutorial on basics of project management',
      videoUrl: 'https://www.youtube.com/watch?v=4C5LYI1DLR4',
      action: () => window.open('https://www.youtube.com/watch?v=4C5LYI1DLR4', '_blank')
    },
    {
      title: 'Team Collaboration',
      description: 'Video tutorial on team collaboration',
      videoUrl: 'https://www.youtube.com/watch?v=Uszj_k0DGsg',
      action: () => window.open('https://www.youtube.com/watch?v=Uszj_k0DGsg', '_blank')
    },
    {
      title: 'Advanced Reporting',
      description: 'Video tutorial on advanced reporting',
      videoUrl: 'https://www.youtube.com/watch?v=bZ6s7etUMwg',
      action: () => window.open('https://www.youtube.com/watch?v=bZ6s7etUMwg', '_blank')
    }
  ];

  const blogPosts = [
    {
      title: '10 Tips for Effective Project Management',
      description: 'Read an article about effective project management',
      action: () => window.open('https://medium.com/@oakstreetechnologies/10-best-project-management-practices-c4215374adc0', '_blank')
    },
    {
      title: 'The Future of Remote Work',
      description: 'Read an article about the evolution and future of remote work',
      action: () => window.open('https://medium.com/were-writers/evolution-and-future-of-remote-work-from-home-an-all-inclusive-overview-26b3da4c4668', '_blank')
    },
    {
      title: 'Agile vs. Waterfall',
      description: 'Read an article about choosing between Agile and Waterfall methodologies',
      action: () => window.open('https://transforminguxwitharpit.medium.com/agile-vs-waterfall-a-comprehensive-guide-for-digital-transformation-75fec406f609', '_blank')
    }
  ];

  const helpCenterLinks = [
    {
      title: 'FAQs',
      description: 'Frequently Asked Questions',
      url: 'https://github.com/AlessandroFare/MindSpace/wiki/FAQ',
      content: [
        {
          question: "Come posso iniziare con MindSpace?",
          answer: "Registrati, crea il tuo primo progetto e inizia ad aggiungere note e task."
        },
        {
          question: "Come funziona la gestione dei task?",
          answer: "Puoi creare task all'interno delle note, assegnare loro uno stato e spostarli tra le colonne."
        },
        {
          question: "Posso collaborare con altri utenti?",
          answer: "Al momento MindSpace è pensato per uso personale, ma la collaborazione è una feature in sviluppo."
        },
        {
          question: "Come funziona il sistema di storage?",
          answer: "Puoi caricare immagini nei task, che verranno salvate in modo sicuro su Supabase."
        }
      ]
    }
  ];

  // Funzione per filtrare i link della documentazione
  const filteredDocs = documentationLinks.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <main className="flex-grow container mx-auto px-4 py-12">
        <motion.section 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-bold mb-4">Resources</h1>
          <p className="text-xl text-gray-400">Everything you need to master MindSpace</p>
        </motion.section>

        <motion.section 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold mb-6">Documentation</h2>
          <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#333333]">
            <div className="flex items-center mb-4">
              <Search className="w-5 h-5 text-[#00FFFF] mr-2" />
              <input
                type="text"
                placeholder="Search guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#252525] text-white px-4 py-2 rounded border border-[#333333] focus:outline-none focus:border-[#00FFFF] transition-colors"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc, index) => (
                  <motion.div 
                    key={doc.title} 
                    className="bg-[#252525] p-4 rounded border border-[#333333] hover:bg-[#2a2a2a] transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                  >
                    <h3 className="text-xl font-semibold mb-2">{doc.title}</h3>
                    <p className="text-gray-400 mb-4">{doc.description}</p>
                    <button 
                      onClick={doc.action}
                      className="text-[#00FFFF] hover:underline inline-flex items-center group"
                    >
                      Learn More 
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-gray-400">
                  No documentation found matching your search.
                </div>
              )}
            </div>
          </div>
        </motion.section>

        <motion.section 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold mb-6">Video Tutorials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoTutorials.map((tutorial, index) => (
              <motion.div 
                key={tutorial.title} 
                className="bg-[#1A1A1A] p-4 rounded border border-[#333333] hover:bg-[#252525] transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
              >
                <PlayCircle className="w-12 h-12 text-[#00FFFF] mb-4" />
                <h3 className="text-xl font-semibold mb-2">{tutorial.title}</h3>
                <p className="text-gray-400 mb-4">{tutorial.description}</p>
                <button 
                  onClick={tutorial.action}
                  className="text-[#00FFFF] hover:underline inline-flex items-center group"
                >
                  Watch Now <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-6">Blog Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post, index) => (
              <motion.div 
                key={post.title} 
                className="bg-[#1A1A1A] p-4 rounded border border-[#333333] hover:bg-[#252525] transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 + index * 0.1 }}
              >
                <BookOpen className="w-12 h-12 text-[#00FFFF] mb-4" />
                <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                <p className="text-gray-400 mb-4">{post.description}</p>
                <button 
                  onClick={post.action}
                  className="text-[#00FFFF] hover:underline inline-flex items-center group"
                >
                  Read More 
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Uniamo Community e Help Center in un grid container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.section 
            className="mb-16 lg:mb-0"  // Rimuoviamo il margin bottom su schermi grandi
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-6">Community</h2>
            <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#333333] h-full"> {/* Aggiungiamo h-full */}
              <Users className="w-12 h-12 text-[#00FFFF] mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Join the MindSpace Community</h3>
              <p className="text-gray-400 mb-4">Connect with other MindSpace users, share ideas, and get help</p>
              <div className="flex space-x-4">
                <Link 
                  href="https://github.com/AlessandroFare/MindSpace/discussions" 
                  target="_blank"
                  className="bg-[#00FFFF] text-black px-4 py-2 rounded hover:bg-[#00FFFF]/80"
                >
                  Join Forum
                </Link>
                <Link 
                  href="https://github.com/AlessandroFare/MindSpace" 
                  target="_blank"
                  className="border border-[#00FFFF] text-[#00FFFF] px-4 py-2 rounded hover:bg-[#00FFFF]/20"
                >
                  GitHub Repository
                </Link>
              </div>
            </div>
          </motion.section>

          <motion.section 
            className="mb-16 lg:mb-0"  // Rimuoviamo il margin bottom su schermi grandi
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.10 }}
          >
            <h2 className="text-3xl font-bold mb-6">Help Center</h2>
            <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#333333] h-full"> {/* Aggiungiamo h-full */}
              <div className="flex items-center mb-4">
                <HelpCircle className="w-8 h-8 text-[#00FFFF] mr-4" />
                <h3 className="text-2xl font-semibold">Need more help?</h3>
              </div>
              <p className="text-gray-400 mb-4">Our support team is here to assist you</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link 
                  href="https://github.com/AlessandroFare/MindSpace/wiki/FAQ" 
                  target="_blank"
                  className="text-[#00FFFF] hover:underline inline-flex items-center group"
                >
                  FAQs <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link 
                  href="mailto:support@mindspace.com?subject=Support Request"
                  className="text-[#00FFFF] hover:underline inline-flex items-center group"
                >
                  Contact Support <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link 
                  href="https://github.com/AlessandroFare/MindSpace/issues/new" 
                  target="_blank"
                  className="text-[#00FFFF] hover:underline inline-flex items-center group"
                >
                  Submit Issue <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </motion.section>
        </div>
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
