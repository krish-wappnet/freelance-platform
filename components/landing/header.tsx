"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Menu, X, Briefcase, Code, Zap } from 'lucide-react';

export default function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md z-50 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Zap className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">WorkWave</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/projects" className="text-muted-foreground hover:text-foreground transition-colors">
            Find Projects
          </Link>
          <Link href="/freelancers" className="text-muted-foreground hover:text-foreground transition-colors">
            Find Talent
          </Link>
          <Link href="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </Link>
        </nav>
        
        <div className="hidden md:flex items-center space-x-4">
          <ModeToggle />
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">Sign Up</Link>
          </Button>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-4 md:hidden">
          <ModeToggle />
          <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle menu">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container mx-auto px-4 py-4 space-y-4 bg-background">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/projects" 
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-secondary"
                onClick={() => setIsMenuOpen(false)}
              >
                <Briefcase className="h-5 w-5" />
                <span>Find Projects</span>
              </Link>
              <Link 
                href="/freelancers" 
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-secondary"
                onClick={() => setIsMenuOpen(false)}
              >
                <Code className="h-5 w-5" />
                <span>Find Talent</span>
              </Link>
              <Link 
                href="/how-it-works" 
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-secondary"
                onClick={() => setIsMenuOpen(false)}
              >
                <Zap className="h-5 w-5" />
                <span>How It Works</span>
              </Link>
            </nav>
            
            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
              <Button asChild variant="outline" className="w-full">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>Log In</Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/register" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}