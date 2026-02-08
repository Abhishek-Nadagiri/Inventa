/**
 * Inventa - Landing Page
 * Hero section with branding, features, and call-to-action
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldSearchIcon } from '../components/ShieldSearchIcon';
import {
  Lock,
  FileCheck,
  Key,
  ArrowRight,
  CheckCircle2,
  Fingerprint,
  Clock,
  FileText
} from 'lucide-react';

export function Landing() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Lock,
      title: 'AES-256 Encryption',
      description: 'Military-grade encryption protects your documents using AES-GCM symmetric encryption.'
    },
    {
      icon: Fingerprint,
      title: 'SHA-256 Hashing',
      description: 'Cryptographic fingerprinting ensures document integrity and unique identification.'
    },
    {
      icon: Key,
      title: 'ECC Ownership Binding',
      description: 'Elliptic Curve Cryptography digitally signs your ownership claim.'
    },
    {
      icon: Clock,
      title: 'Secure Timestamping',
      description: 'Immutable timestamps prove when you first registered your intellectual property.'
    },
    {
      icon: FileCheck,
      title: 'Instant Verification',
      description: 'Verify document ownership in seconds by uploading a file or entering its hash.'
    },
    {
      icon: FileText,
      title: 'Ownership Proofs',
      description: 'Generate and download cryptographic proofs of your intellectual property rights.'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Create Account',
      description: 'Register securely with automatic ECC key pair generation for ownership binding.'
    },
    {
      number: '02',
      title: 'Upload Document',
      description: 'Upload your intellectual property. We hash, encrypt, and sign it cryptographically.'
    },
    {
      number: '03',
      title: 'Get Proof',
      description: 'Receive verifiable ownership proof with timestamp and digital signature.'
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent" />
        
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo - Shield viewed through magnifying glass */}
            <div className="inline-flex items-center justify-center mb-8">
              <div className="relative">
                {/* Glow effect behind logo */}
                <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full scale-150" />
                {/* Main logo */}
                <div className="relative bg-neutral-900/80 backdrop-blur-sm p-6 rounded-3xl border border-neutral-700/50 shadow-2xl">
                  <ShieldSearchIcon size={80} variant="default" />
                </div>
              </div>
            </div>

            {/* Tagline */}
            <div className="inline-block px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-sm font-medium mb-6">
              Where Ownership Begins
            </div>

            {/* Main headline */}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Protect Your{' '}
              <span className="bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent">
                Intellectual Property
              </span>{' '}
              with Cryptographic Proof
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto">
              Inventa provides secure document registration, encryption, and ownership verification
              using industry-standard cryptographic algorithms. Prove your work is yours.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/25 no-underline"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/upload"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-semibold transition-all border border-neutral-700 no-underline"
                  >
                    Upload Document
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/25 no-underline"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/verify"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-semibold transition-all border border-neutral-700 no-underline"
                  >
                    Verify a Document
                  </Link>
                </>
              )}
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-neutral-500 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-500" />
                No blockchain required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-500" />
                Client-side encryption
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-500" />
                Open verification
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-neutral-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Enterprise-Grade Security
            </h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              Built with cryptographic best practices to ensure your intellectual property
              is protected and verifiable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 hover:border-orange-500/30 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl mb-4">
                  <feature.icon className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-neutral-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              Three simple steps to secure your intellectual property ownership.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-orange-500/50 to-transparent -translate-x-1/2" />
                )}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl mb-6">
                    <span className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-neutral-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-900/20 to-red-900/20 border-t border-b border-neutral-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Protect Your Work?
          </h2>
          <p className="text-neutral-400 text-lg mb-8 max-w-xl mx-auto">
            Join creators and innovators who trust Inventa to prove their intellectual property ownership.
          </p>
          {isAuthenticated ? (
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/25 no-underline"
            >
              Upload Your First Document
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/25 no-underline"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-neutral-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-neutral-400">
              <ShieldSearchIcon size={32} variant="default" />
              <span className="font-semibold text-white">Inventa</span>
              <span>— Where Ownership Begins</span>
            </div>
            <div className="text-neutral-500 text-sm">
              © {new Date().getFullYear()} Inventa. Secure IP Protection.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
