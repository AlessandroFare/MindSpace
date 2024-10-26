'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, Brain, Menu, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"

export function PricingPageComponent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isSignedIn, user } = useUser();

  const plans = [
    {
      name: 'Free',
      price: '$0',
      features: ['Basic task management', '5 projects', 'Up to 10 team members', 'Basic reporting'],
      cta: 'Get Started',
      action: () => {
        // Reindirizza alla landing page
        window.location.href = '/';
      }
    },
    {
      name: 'Pro',
      price: '$10',
      period: '/month',
      features: ['Advanced task management', 'Unlimited projects', 'Unlimited team members', 'Advanced reporting', '10GB storage'],
      cta: 'Upgrade to Pro',
      action: () => {
        // Cerca il pulsante di sign-up di Clerk e lo clicca
        const signUpButtons = document.querySelectorAll('button');
        const signUpButton = Array.from(signUpButtons).find(button => 
          button.textContent?.toLowerCase().includes('sign up')
        );
        if (signUpButton) {
          signUpButton.click();
        }
      }
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: ['Custom solutions', 'Dedicated support', 'On-premise deployment', 'Advanced security features', 'Unlimited storage'],
      cta: 'Contact Sales',
      action: () => {
        // Apre il client email con un indirizzo predefinito
        window.location.href = 'mailto:sales@mindspace.com?subject=Enterprise Plan Inquiry';
      }
    },
  ]

  const faqs = [
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers for annual plans.',
    },
    {
      question: 'Can I upgrade or downgrade my plan at any time?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
    },
    {
      question: 'Is there a free trial available?',
      answer: 'Yes, we offer a 14-day free trial for our Pro plan. No credit card required.',
    },
  ]

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

      <main className="flex-grow container mx-auto px-4 py-16">
        <motion.h1 
          className="text-4xl md:text-5xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Choose Your Plan
        </motion.h1>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className="bg-[#1A1A1A] rounded-lg p-8 flex flex-col justify-between border border-[#333333]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div>
                <h2 className="text-2xl font-bold mb-4">{plan.name}</h2>
                <div className="text-3xl font-bold mb-4 text-[#00FFFF]">
                  {plan.price}
                  {plan.period && <span className="text-xl font-normal">{plan.period}</span>}
                </div>
                <ul className="mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center mb-2">
                      <Check className="w-5 h-5 mr-2 text-[#00FFFF]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Button 
                onClick={plan.action}
                className="w-full bg-[#00FFFF] text-black hover:bg-[#00FFFF]/90"
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        <section className="mt-16">
          <motion.h2 
            className="text-3xl font-bold text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="max-w-2xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index} 
                className="mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
              >
                <button
                  className="flex justify-between items-center w-full text-left p-4 bg-[#1A1A1A] rounded-lg hover:bg-[#252525] transition-colors border border-[#333333]"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-semibold">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === index ? 'transform rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 bg-[#252525] rounded-b-lg border-x border-b border-[#333333]"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </section>
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
