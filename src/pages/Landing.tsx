import { useNavigate } from "react-router-dom";
import { Code2, Sparkles, Zap, Lock, Database, Rocket } from "lucide-react";
import { HeroButton, GlassButton } from "@/components/ui/button-variants";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b border-primary/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Code2 className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">RcBuilder</span>
          </div>
          <div className="flex gap-4">
            <GlassButton onClick={() => navigate("/login")}>
              Login
            </GlassButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 glass-panel rounded-full">
            <span className="text-primary text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Advanced AI Code Generation
            </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-fade-in">
            Build Faster with{" "}
            <span className="gradient-text">AI Power</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            RcBuilder is your ultimate AI-powered code generation platform. 
            Create production-ready code instantly with multi-model support and intelligent session management.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <HeroButton 
              onClick={() => navigate("/login")}
              className="animate-pulse-glow"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Getting Started
            </HeroButton>
            <GlassButton>
              <Sparkles className="w-5 h-5 mr-2" />
              View Demo
            </GlassButton>
          </div>

          {/* Floating Code Preview */}
          <div className="mt-20 relative">
            <div className="glass-panel p-8 rounded-2xl max-w-4xl mx-auto border border-primary/30 animate-float">
              <pre className="text-left text-sm overflow-x-auto">
                <code className="text-primary">
{`// AI-Generated React Component
import { useState } from 'react';

export const Dashboard = () => {
  const [data, setData] = useState([]);
  
  return (
    <div className="p-6">
      <h1>Modern Dashboard</h1>
      {/* Beautiful UI Components */}
    </div>
  );
};`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Powerful Features
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-12 h-12 text-primary" />}
              title="Multi-Model AI"
              description="Choose from multiple AI models including Qwen, DeepSeek, and more for optimal code generation."
            />
            <FeatureCard
              icon={<Database className="w-12 h-12 text-secondary" />}
              title="Session Management"
              description="Organize your projects with intelligent session and file management. Download and track all your code."
            />
            <FeatureCard
              icon={<Lock className="w-12 h-12 text-accent" />}
              title="Secure & Private"
              description="Your code and data are secure with enterprise-grade authentication and encryption."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="glass-panel p-12 rounded-3xl text-center border border-primary/30">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Build Something Amazing?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join developers using RcBuilder to create production-ready code faster than ever.
            </p>
            <HeroButton onClick={() => navigate("/login")}>
              Start Building Now
            </HeroButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2025 RcBuilder. Created with 💜 by RiiCODE</p>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="glass-panel p-8 rounded-2xl border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-glow-primary">
      <div className="mb-4">{icon}</div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Landing;
