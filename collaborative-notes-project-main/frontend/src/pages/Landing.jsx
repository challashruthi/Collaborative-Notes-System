import { Link } from 'react-router-dom';
import { PenSquare, Share2, Sparkles, Clock } from 'lucide-react';
import Navbar from '../components/layout/Navbar';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <Navbar />
      
      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-20 text-center">
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-1000">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6">
            Collaborative Notes <span className="text-primary-600">Made Simple</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-10">
            Create, share, and collaborate on notes in real-time. Boost your productivity with AI-powered summarization and seamless teamwork.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-primary-500/30 transform hover:-translate-y-1">
              Get Started for Free
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-surface hover:bg-surface-hover text-foreground border border-border rounded-xl font-medium transition-all">
              Login to Account
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 text-left pb-20">
          <FeatureCard 
            icon={<Share2 className="w-8 h-8 text-primary-500" />}
            title="Real-time Collaboration"
            description="Work together with your team synchronously. See cursors and changes as they happen."
          />
          <FeatureCard 
            icon={<Sparkles className="w-8 h-8 text-primary-500" />}
            title="AI Summarization"
            description="Automatically generate concise summaries of long notes using embedded AI features."
          />
          <FeatureCard 
            icon={<Clock className="w-8 h-8 text-primary-500" />}
            title="Version History"
            description="Never lose a thought. Access and restore previous versions of your notes infinitely."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-8 rounded-2xl bg-surface border border-border hover:shadow-xl hover:border-primary-200 transition-all duration-300">
      <div className="mb-4 p-3 bg-primary-50 w-fit rounded-xl">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}
