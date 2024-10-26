"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Brain, Zap, Users, Target, Menu, X } from "lucide-react"
import Link from "next/link"
import { Card as UICard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { ReactNode } from 'react'
import { SignInButton, SignUpButton, UserButton, useUser, SignIn } from "@clerk/nextjs";
import { createClient } from '@/utils/supabase/client'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useRouter } from 'next/navigation'
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { ProjectsOverviewChart } from "@/components/projects-overview-chart"

interface MindspaceLandingProps {
  title: string;
  description: string;
  signInHref?: string;
  signUpHref?: string;
  kpiComponent?: React.ReactNode;
}

interface ProjectStats {
  month: string;
  completed: number;
  ongoing: number;
}

export function MindspaceLanding({
  title,
  description,
  signInHref,
  signUpHref,
  kpiComponent
}: MindspaceLandingProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isSignedIn, user } = useUser();
  const [projectStats, setProjectStats] = useState<ProjectStats[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Aggiungiamo gli stati per i KPI
  const [totalProjects, setTotalProjects] = useState(0)
  const [completedProjects, setCompletedProjects] = useState(0)
  const [ongoingProjects, setOngoingProjects] = useState(0)

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showSignIn, setShowSignIn] = useState(false);
  const [runTour, setRunTour] = useState(false);

  const router = useRouter()

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Aggiungiamo un effetto per gestire il popup di Clerk
  useEffect(() => {
    // Funzione per gestire il popup di Clerk
    const handleClerkLoaded = () => {
      const savedEmail = localStorage.getItem('pendingSignInEmail');
      if (savedEmail) {
        // Troviamo l'input dell'email nel popup di Clerk
        const emailInput = document.querySelector('input[name="emailAddress"]') as HTMLInputElement;
        if (emailInput) {
          emailInput.value = savedEmail;
          // Puliamo l'email salvata dopo averla usata
          localStorage.removeItem('pendingSignInEmail');
        }
      }
    };

    // Osserviamo le mutazioni del DOM per intercettare quando il popup viene aggiunto
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement && node.classList.contains('cl-modalContent')) {
              handleClerkLoaded();
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, []);

  const initTour = () => {
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        scrollTo: true,
        cancelIcon: {
          enabled: true
        }
      }
    });

    tour.addStep({
      id: 'projects-overview',
      title: 'Project Analytics',
      text: 'Track your project progress with our intuitive analytics dashboard',
      attachTo: {
        element: '.projects-overview',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Skip',
          action: () => {
            tour.complete();
            // Apriamo il modal di sign-up
            const signUpButtons = document.querySelectorAll('button');
            const signUpButton = Array.from(signUpButtons).find(button => 
              button.textContent?.toLowerCase().includes('sign up')
            );
            if (signUpButton) {
              setTimeout(() => signUpButton.click(), 100);
            }
          }
        },
        {
          text: 'Next',
          action: () => tour.next()
        }
      ]
    });

    tour.addStep({
      id: 'productivity',
      title: 'Enhanced Productivity',
      text: 'Boost your team\'s productivity with our powerful tools',
      attachTo: {
        element: '.productivity-circle',
        on: 'right'
      },
      buttons: [
        {
          text: 'Back',
          action: () => tour.back()
        },
        {
          text: 'Next',
          action: () => tour.next()
        }
      ]
    });

    tour.addStep({
      id: 'collaboration',
      title: 'Team Collaboration',
      text: 'Collaborate seamlessly with your team members',
      attachTo: {
        element: '.collaboration-circle',
        on: 'top'
      },
      buttons: [
        {
          text: 'Back',
          action: () => tour.back()
        },
        {
          text: 'Next',
          action: () => tour.next()
        }
      ]
    });

    tour.addStep({
      id: 'achievement',
      title: 'Goal Achievement',
      text: 'Set and achieve your goals with our project management features',
      attachTo: {
        element: '.achievement-circle',
        on: 'left'
      },
      buttons: [
        {
          text: 'Back',
          action: () => tour.back()
        },
        {
          text: 'Get Started',
          action: () => {
            tour.complete();
            // Apriamo il modal di sign-up
            const signUpButtons = document.querySelectorAll('button');
            const signUpButton = Array.from(signUpButtons).find(button => 
              button.textContent?.toLowerCase().includes('sign up')
            );
            if (signUpButton) {
              setTimeout(() => signUpButton.click(), 100);
            }
          }
        }
      ]
    });

    return tour;
  };

  const handleGetStarted = () => {
    if (isSignedIn) {
      // Se l'utente è già loggato, reindirizza alla pagina dei progetti
      router.push('/projects');
    } else {
      // Se l'utente non è loggato, avvia il tour guidato
      const tour = initTour();
      tour.start();
    }
  };

  useEffect(() => {
    async function fetchProjectStats() {
      setIsLoading(true)
      try {
        const supabase = createClient()
        
        const { data: projects, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: true })

        if (error) throw error

        // Creiamo un array degli ultimi 12 mesi con date fisse
        const months = [
          'gen', 'feb', 'mar', 'apr', 'mag', 'giu',
          'lug', 'ago', 'set', 'ott', 'nov', 'dic'
        ];

        const monthlyStats = months.map(month => ({
          month,
          completed: 0,
          ongoing: 0
        }));

        // Aggiorniamo i conteggi per ogni mese
        projects?.forEach(project => {
          const projectDate = new Date(project.created_at);
          const monthIndex = projectDate.getMonth();
          
          if (project.progress === 100) {
            monthlyStats[monthIndex].completed++;
          } else {
            monthlyStats[monthIndex].ongoing++;
          }
        });

        setProjectStats(monthlyStats)
      } catch (error) {
        console.error('Error fetching project stats:', error)
        setProjectStats([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjectStats()
  }, [isSignedIn])

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      <header className="container mx-auto px-4 py-6 relative z-50">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-[#00FFFF]" />
            <span className="text-2xl font-bold tracking-tight">{title}</span>
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

      <main className="flex-grow">
        <section className="container mx-auto px-4 py-12 md:py-24 text-center">
          <motion.h1 
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Organize<br />your mind
          </motion.h1>
          <motion.p 
            className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto text-gray-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Mindspace helps teams plan, track, and manage projects with unparalleled clarity and efficiency.
          </motion.p>
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button 
              onClick={handleGetStarted}
              className="bg-[#00FFFF] text-black hover:bg-[#00FFFF]/90 font-medium px-8 sm:px-12 py-2 sm:py-6 text-sm sm:text-base"
            >
              Get Started
            </Button>
          </motion.div>
        </section>

        <section className="container mx-auto px-4 py-12 md:py-16">
          <motion.div
            className="w-full projects-overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <ProjectsOverviewChart />
          </motion.div>

          {/* KPI spostati sotto il grafico */}
          <div className="grid grid-cols-2 gap-8 mt-8 max-w-2xl mx-auto">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h3 className="text-5xl font-bold mb-2 text-[#00FFFF]">1M+</h3>
              <p className="text-gray-400">Projects completed</p>
            </motion.div>
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h3 className="text-5xl font-bold mb-2 text-[#00FFFF]">99%</h3>
              <p className="text-gray-400">Customer satisfaction</p>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 md:py-24 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left" // Aggiunto per centrare su mobile
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight">Streamline your workflow</h2>
              <p className="text-lg sm:text-xl mb-8 text-gray-400">
                Mindspace provides powerful tools to help you manage tasks, collaborate with your team, and meet deadlines with ease.
              </p>
              <div className="mb-12 lg:mb-0"> {/* Aggiunto margin bottom su mobile */}
                <Link href="/features">
                  <Button className="bg-white text-black hover:bg-white/90 font-medium px-8">
                    Learn More
                  </Button>
                </Link>
              </div>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              <motion.div 
                className="productivity-circle bg-gradient-to-br from-[#00FFFF] to-[#0080FF] rounded-full w-40 h-40 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ 
                  rotate: 10,
                  transition: { duration: 0.3, ease: "easeInOut" }
                }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="text-black text-center">
                  <Zap size={32} className="mx-auto mb-2" />
                  <h3 className="text-xl font-bold mb-1">88%</h3>
                  <p className="text-sm">Productivity</p>
                </div>
              </motion.div>
              <motion.div 
                className="collaboration-circle bg-gradient-to-br from-[#FF00FF] to-[#FF8000] rounded-full w-40 h-40 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ 
                  rotate: -10,
                  transition: { duration: 0.3, ease: "easeInOut" }
                }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="text-white text-center">
                  <Users size={32} className="mx-auto mb-2" />
                  <h3 className="text-xl font-bold mb-1">95%</h3>
                  <p className="text-sm">Collaboration</p>
                </div>
              </motion.div>
              <motion.div 
                className="achievement-circle bg-gradient-to-br from-[#00FF00] to-[#00FFFF] rounded-full w-40 h-40 flex items-center justify-center sm:col-span-2 lg:col-span-1"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ 
                  rotate: 10,
                  transition: { duration: 0.3, ease: "easeInOut" }
                }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <div className="text-black text-center">
                  <Target size={32} className="mx-auto mb-2" />
                  <h3 className="text-xl font-bold mb-1">92%</h3>
                  <p className="text-sm">Goal Achievement</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

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
