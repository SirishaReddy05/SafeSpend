
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, BarChart3, PieChart, Wallet, MessageSquareText } from 'lucide-react';
import { motion } from 'framer-motion';

export function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            $
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Safe Spend</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link to="/about" className="hover:text-emerald-600 transition-colors">About Us</Link>
          <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Log in</Link>
          <Link 
            to="/signup" 
            className="bg-emerald-500 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 pt-20 pb-32 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-wider text-emerald-600 uppercase bg-emerald-50 rounded-full">
            The Future of Finance
          </span>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 tracking-tight leading-[1.1]">
            Take control of your <br />
            <span className="text-emerald-500">financial destiny.</span>
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Safe Spend combines AI-powered insights with intuitive tracking to help you save more, spend smarter, and reach your goals faster.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/signup" 
              className="w-full sm:w-auto bg-gray-900 text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group"
            >
              Start for free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/about" 
              className="w-full sm:w-auto bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-full font-medium hover:bg-gray-50 transition-all"
            >
              Learn how it works
            </Link>
          </div>
        </motion.div>

        {/* App Preview Mockup */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-20 relative"
        >
          <div className="absolute inset-0 bg-emerald-500/10 blur-[120px] rounded-full -z-10" />
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 overflow-hidden">
            <img 
              src="https://picsum.photos/seed/dashboard/1200/800" 
              alt="Safe Spend Dashboard" 
              className="rounded-2xl w-full object-cover shadow-inner"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-8 py-32 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need to thrive</h2>
            <p className="text-gray-600 max-w-xl mx-auto text-lg">Powerful tools designed to simplify your financial life without the complexity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart3,
                title: "Smart Analytics",
                desc: "Visualize your spending patterns with beautiful, interactive charts that tell a story."
              },
              {
                icon: MessageSquareText,
                title: "AI Financial Agent",
                desc: "Get personalized advice and answers to complex financial questions from our Gemini-powered agent."
              },
              {
                icon: Shield,
                title: "Bank-Grade Security",
                desc: "Your data is encrypted and protected with the highest security standards in the industry."
              },
              {
                icon: Wallet,
                title: "Multi-Wallet Sync",
                desc: "Manage all your accounts, from cash to crypto, in one unified and clean interface."
              },
              {
                icon: PieChart,
                title: "Intuitive Budgeting",
                desc: "Set limits that actually work. Get notified before you overspend, not after."
              },
              {
                icon: Zap,
                title: "Real-time Alerts",
                desc: "Stay on top of your money with instant notifications for every transaction and bill."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-emerald-200 transition-colors group">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center text-white font-bold text-sm">
              $
            </div>
            <span className="text-lg font-bold text-gray-900">Safe Spend</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-500">
            <Link to="/about" className="hover:text-emerald-600">About</Link>
          </div>
          <p className="text-sm text-gray-400">Copyright 2026 Safe Spend Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

