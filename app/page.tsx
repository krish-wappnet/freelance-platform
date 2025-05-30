import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight, Briefcase, Shield, Clock, Award, Search, Users, BarChart } from 'lucide-react';
import LandingHeader from '@/components/landing/header';
import Footer from '@/components/landing/footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      
      {/* Hero section */}
      <section className="relative bg-gradient-to-r from-primary/5 to-primary/10 pt-20 pb-32">
        <div className="container px-4 mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-primary">
                Connecting talent with opportunity
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Find projects, showcase your skills, and build your freelance career all in one place. WorkWave makes freelancing simple, secure, and rewarding.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg" className="font-semibold">
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="font-semibold">
                  <Link href="/projects" className="flex items-center gap-2">
                    Browse Projects <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative w-full h-[400px] rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src="https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg"
                  alt="Freelance collaboration"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-card p-4 rounded-lg shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">10,000+</p>
                    <p className="text-sm text-muted-foreground">Skilled Freelancers</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white dark:bg-card p-4 rounded-lg shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">5,000+</p>
                    <p className="text-sm text-muted-foreground">Active Projects</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How it works */}
      <section className="py-20 bg-secondary/50">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How WorkWave Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform makes it easy to connect, collaborate, and get paid with our innovative contract system.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card shadow-md rounded-lg p-6 transition-all hover:shadow-lg">
              <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Search className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Discover</h3>
              <p className="text-muted-foreground">Clients post projects with detailed requirements, budgets, and timelines.</p>
            </div>
            
            <div className="bg-card shadow-md rounded-lg p-6 transition-all hover:shadow-lg">
              <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect</h3>
              <p className="text-muted-foreground">Freelancers submit proposals, clients shortlist and select the best match.</p>
            </div>
            
            <div className="bg-card shadow-md rounded-lg p-6 transition-all hover:shadow-lg">
              <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <BarChart className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Collaborate</h3>
              <p className="text-muted-foreground">Work together with milestone tracking, secure payments, and built-in messaging.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need in One Platform</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From project discovery to final payment, we&apos;ve designed a seamless experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 border rounded-lg transition-all hover:shadow-md">
              <Briefcase className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Project Marketplace</h3>
              <p className="text-muted-foreground text-sm">Browse thousands of projects across various categories and skill requirements.</p>
            </div>
            
            <div className="p-6 border rounded-lg transition-all hover:shadow-md">
              <Shield className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Secure Contracts</h3>
              <p className="text-muted-foreground text-sm">Clear terms, milestone-based payments, and dispute resolution to protect both parties.</p>
            </div>
            
            <div className="p-6 border rounded-lg transition-all hover:shadow-md">
              <Clock className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Milestone Tracking</h3>
              <p className="text-muted-foreground text-sm">Break projects into manageable milestones with clear deliverables and deadlines.</p>
            </div>
            
            <div className="p-6 border rounded-lg transition-all hover:shadow-md">
              <Award className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Reviews & Ratings</h3>
              <p className="text-muted-foreground text-sm">Build your reputation with client reviews and showcase your expertise to win more work.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to start your freelance journey?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of freelancers and clients already using WorkWave to connect, collaborate, and succeed together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="font-semibold">
              <Link href="/register">Create an Account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}