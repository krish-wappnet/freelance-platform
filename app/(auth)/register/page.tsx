import Image from 'next/image';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import AuthForm from '@/components/auth/auth-form';

export default function RegisterPage() {
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
          
          <AuthForm initialTab="register" />
          
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
          src="https://images.pexels.com/photos/4226242/pexels-photo-4226242.jpeg"
          fill
          alt="Remote Work"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center p-10 z-20">
          <div className="bg-card/90 backdrop-blur-sm p-8 rounded-lg max-w-md text-center shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Join our community</h2>
            <p className="text-muted-foreground">
              Create an account to start finding projects or hiring talented freelancers for your business needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}