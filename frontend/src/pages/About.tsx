
import { Link } from 'react-router-dom';
import { Users, Heart, Globe, ShieldCheck, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Simple Nav */}
      <nav className="px-8 py-6 max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/home" className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              $
            </div>
            <span className="text-xl font-bold text-gray-900">Safe Spend</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-8 py-20 max-w-4xl mx-auto text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight"
        >
          We're on a mission to <br />
          <span className="text-emerald-500 italic">humanize finance.</span>
        </motion.h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          Expenzo was founded in 2024 with a simple belief: managing money shouldn't feel like a chore. It should feel like a superpower.
        </p>
      </section>

      {/* Story Section */}
      <section className="px-8 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                It started in a small apartment where three friends realized they were all using complex spreadsheets to track their daily coffee runs and rent payments. None of the existing apps felt "right"—they were either too complex or too clinical.
              </p>
              <p>
                We wanted something that felt warm, intuitive, and actually helpful. Something that didn't just tell you that you spent $50 on dining out, but helped you understand <i>why</i> and how to do better next month.
              </p>
              <p>
                Today, Expenzo serves over 500,000 users worldwide, helping them navigate their financial journeys with confidence and clarity.
              </p>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://picsum.photos/seed/team/800/600" 
              alt="Our Team" 
              className="rounded-3xl shadow-xl"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-6 -right-6 bg-emerald-500 text-white p-8 rounded-2xl shadow-lg hidden md:block">
              <p className="text-3xl font-bold">500k+</p>
              <p className="text-sm opacity-90">Happy Users</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-8 py-32 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold text-gray-900">What we stand for</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {[
            {
              icon: Heart,
              title: "Empathy First",
              desc: "We understand that money is personal and emotional. We build with kindness."
            },
            {
              icon: ShieldCheck,
              title: "Privacy by Design",
              desc: "Your data is yours. We never sell it, and we protect it like our own."
            },
            {
              icon: Globe,
              title: "Radical Clarity",
              desc: "No hidden fees, no complex jargon. Just clear, actionable insights."
            },
            {
              icon: Users,
              title: "Community Driven",
              desc: "Our roadmap is built by our users. We listen, we learn, we evolve."
            }
          ].map((value, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6">
                <value.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-20 bg-gray-900 text-white text-center rounded-[3rem] mx-8 mb-20">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to join the family?</h2>
        <p className="text-gray-400 mb-10 max-w-xl mx-auto">Join thousands of others who have simplified their financial life with Expenzo.</p>
        <Link 
          to="/signup" 
          className="bg-emerald-500 text-white px-10 py-4 rounded-full font-bold hover:bg-emerald-600 transition-all inline-block"
        >
          Get Started Now
        </Link>
      </section>
    </div>
  );
}
