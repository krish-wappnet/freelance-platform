import Image from 'next/image';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import AuthForm from '@/components/auth/auth-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center space-x-2">
              <Zap className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">WorkWave</span>
            </Link>
          </div>
          
          <AuthForm initialTab="login" />
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
      
      {/* Right Side - Image */}
      <div className="hidden md:block relative bg-muted">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 z-10" />
        <Image
          src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg"
          fill
          alt="Collaboration"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center p-10 z-20">
          <div className="bg-card/90 backdrop-blur-sm p-8 rounded-lg max-w-md text-center shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Connect with top talent</h2>
            <p className="text-muted-foreground">
              WorkWave connects you with skilled professionals around the world to get your projects done efficiently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}