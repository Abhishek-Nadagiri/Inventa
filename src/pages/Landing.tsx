import { Link } from 'react-router-dom';
import { 
  Shield, 
  FileCheck, 
  Lock, 
  Clock, 
  ArrowRight,
  Fingerprint,
  Eye,
  CheckCircle,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';
import { ShieldSearchIcon } from '../components/ShieldSearchIcon';
import LiquidChrome from '../components/LiquidChrome';

export default function Landing() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white overflow-hidden">
      {/* Hero Section with LiquidChrome Background */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* LiquidChrome Background - Using olive/gold color palette #86862d */}
        <div className="absolute inset-0 z-0">
          <LiquidChrome
            baseColor={[0.525, 0.525, 0.176]} // RGB(134, 134, 45) / #86862d
            speed={0.3}
            amplitude={0.5}
            frequencyX={3}
            frequencyY={2}
            interactive={false}
          />
          {/* Semi-transparent dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/60" />
          {/* Additional gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
          {/* Vignette effect */}
          <div className="absolute inset-0 bg-radial-gradient pointer-events-none" style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)'
          }} />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 text-center">
          {/* Floating Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/30 mb-8 animate-pulse shadow-lg shadow-black/30">
            <Sparkles className="w-4 h-4 text-[#d4d48a] drop-shadow-[0_0_8px_rgba(168,168,53,0.8)]" />
            <span className="text-sm font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Secure Document Protection</span>
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#86862d]/40 via-[#a8a835]/40 to-[#86862d]/40 rounded-full blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-6 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 shadow-2xl shadow-black/50">
                <ShieldSearchIcon className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" />
              </div>
            </div>
          </div>

          {/* Brand Name */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight mb-4">
            <span 
              className="bg-gradient-to-r from-white via-[#d4d48a] to-white bg-clip-text text-transparent"
              style={{ 
                textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.9), 0 0 40px rgba(134,134,45,0.3)',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
              }}
            >
              INVENTA
            </span>
          </h1>

          {/* Tagline */}
          <p 
            className="text-xl sm:text-2xl md:text-3xl font-medium text-white mb-4 tracking-wide"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 4px 20px rgba(0,0,0,0.7)' }}
          >
            Where Ownership Begins
          </p>

          {/* Description */}
          <p 
            className="max-w-2xl mx-auto text-base sm:text-lg text-white/90 mb-12 leading-relaxed font-medium"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.7)' }}
          >
            Protect your intellectual property with military-grade encryption.
            Generate cryptographic proof of ownership for any document.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Link
              to="/register"
              className="group relative px-8 py-4 rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 no-underline shadow-2xl shadow-black/50"
              style={{ textDecoration: 'none' }}
            >
              {/* Button Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#6a6a24] via-[#86862d] to-[#6a6a24] rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#86862d] via-[#a8a835] to-[#86862d] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-[#86862d]/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </div>
              {/* Button Content */}
              <span 
                className="relative flex items-center gap-2 text-white font-bold"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link
              to="/verify"
              className="group px-8 py-4 rounded-2xl font-bold text-lg bg-black/40 backdrop-blur-md border-2 border-white/30 text-white hover:bg-black/50 hover:border-[#a8a835]/60 hover:shadow-[0_0_30px_rgba(134,134,45,0.4)] transition-all duration-300 hover:scale-105 no-underline shadow-2xl shadow-black/50"
              style={{ textDecoration: 'none' }}
            >
              <span 
                className="flex items-center gap-2"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
              >
                <Eye className="w-5 h-5" />
                Verify Document
              </span>
            </Link>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 rounded-full border-2 border-white/50 flex items-start justify-center p-2 shadow-lg shadow-black/30">
              <div className="w-1.5 h-3 bg-white/70 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative pt-32 pb-24 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#86862d]/10 border border-[#86862d]/20 mb-6">
              <Zap className="w-4 h-4 text-[#a8a835]" />
              <span className="text-sm font-medium text-[#a8a835]">Powerful Features</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
              Three simple steps to protect your intellectual property forever
            </p>
          </div>

          {/* Process Steps */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              {
                step: '01',
                icon: Fingerprint,
                title: 'Upload & Hash',
                description: 'Upload your document. We generate a unique SHA-256 fingerprint that identifies your file.',
              },
              {
                step: '02',
                icon: Lock,
                title: 'Encrypt & Sign',
                description: 'Your document is encrypted with AES-256 and digitally signed with your unique ECC key.',
              },
              {
                step: '03',
                icon: Shield,
                title: 'Prove & Verify',
                description: 'Download your ownership certificate. Anyone can verify your ownership without seeing the file.',
              }
            ].map((item, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-3xl bg-gradient-to-b from-neutral-800/50 to-neutral-900/50 border border-neutral-700/50 hover:border-[#86862d]/50 transition-all duration-500 hover:-translate-y-2"
              >
                {/* Step Number */}
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#86862d] to-[#4D4D1A] flex items-center justify-center font-black text-xl text-white shadow-lg shadow-[#86862d]/30">
                  {item.step}
                </div>
                
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#86862d]/20 to-[#4D4D1A]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-8 h-8 text-[#a8a835]" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-neutral-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Security Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, label: 'Military-Grade Encryption', desc: 'AES-256-GCM' },
              { icon: Clock, label: 'Timestamped Proof', desc: 'Immutable Records' },
              { icon: FileCheck, label: 'Instant Verification', desc: 'Real-time Checks' },
              { icon: Globe, label: 'Global Access', desc: 'Anywhere, Anytime' }
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-neutral-800/30 border border-neutral-700/30 hover:border-[#86862d]/30 hover:bg-neutral-800/50 transition-all duration-300"
              >
                <feature.icon className="w-10 h-10 text-[#a8a835] mb-4 group-hover:scale-110 transition-transform" />
                <h4 className="font-semibold text-white mb-1">{feature.label}</h4>
                <p className="text-sm text-neutral-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 bg-gradient-to-r from-[#86862d]/10 via-[#4D4D1A]/10 to-[#86862d]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { value: 'AES-256', label: 'Encryption' },
              { value: 'SHA-256', label: 'Document Hashing' },
              { value: 'ECC + AES', label: 'Digital Signatures' },
              { value: '100%', label: 'Verifiable' }
            ].map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-neutral-900/30 border border-neutral-800/50">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[#a8a835] to-[#86862d] bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-neutral-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-neutral-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Glowing Background */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-96 h-96 bg-[#86862d]/20 rounded-full blur-3xl" />
          </div>

          <div className="relative">
            <CheckCircle className="w-16 h-16 text-[#a8a835] mx-auto mb-6" />
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to Protect Your Work?
            </h2>
            <p className="text-lg text-neutral-400 mb-10 max-w-2xl mx-auto">
              Join thousands of creators who trust Inventa to protect their intellectual property.
              Start securing your documents today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="group px-10 py-5 rounded-2xl font-bold text-lg bg-gradient-to-r from-[#86862d] to-[#4D4D1A] text-white hover:from-[#a8a835] hover:to-[#86862d] transition-all duration-300 hover:scale-105 shadow-lg shadow-[#86862d]/30 no-underline"
                style={{ textDecoration: 'none' }}
              >
                <span className="flex items-center gap-2">
                  Create Free Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <Link
                to="/login"
                className="px-10 py-5 rounded-2xl font-bold text-lg text-white border-2 border-white/20 hover:border-[#86862d]/50 hover:bg-[#86862d]/10 hover:shadow-[0_0_20px_rgba(134,134,45,0.25)] transition-all duration-300 no-underline"
                style={{ textDecoration: 'none' }}
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 border-t border-neutral-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <ShieldSearchIcon className="w-8 h-8" />
              <span className="text-xl font-bold text-white">Inventa</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-8 text-sm text-neutral-400">
              <Link to="/verify" className="hover:text-[#a8a835] transition-colors no-underline" style={{ textDecoration: 'none' }}>Verify</Link>
              <Link to="/login" className="hover:text-[#a8a835] transition-colors no-underline" style={{ textDecoration: 'none' }}>Login</Link>
              <Link to="/register" className="hover:text-[#a8a835] transition-colors no-underline" style={{ textDecoration: 'none' }}>Register</Link>
              <Link to="/database" className="hover:text-[#a8a835] transition-colors no-underline" style={{ textDecoration: 'none' }}>Database</Link>
            </div>

            {/* Copyright */}
            <div className="text-sm text-neutral-500">
              © {new Date().getFullYear()} Inventa. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
