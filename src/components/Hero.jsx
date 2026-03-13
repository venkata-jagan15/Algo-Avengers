
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Hero = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('innotrack_user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        // Handle invalid parse
      }
    }
  }, []);

  const getDashboardRoute = () => {
    if (user?.role === 'Admin') return '/institution/dashboard';
    return '/browse';
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/20 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="container px-4 mx-auto text-center z-10">
        <div
          data-aos="fade-up"
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6 glass"
        >
          <Sparkles className="w-4 h-4 text-accent" />
          <span>The Next Generation of Innovation</span>
        </div>

        <h1
          data-aos="fade-up"
          data-aos-delay="100"
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
        >
          {user ? (
            <>Welcome back, <br /><span className="text-gradient-accent">{user.name}</span></>
          ) : (
            <>Elevate Your <span className="text-gradient-accent">Vision</span> <br />
              with Precision</>
          )}
        </h1>

        <p
          data-aos="fade-up"
          data-aos-delay="200"
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Experience the pinnacle of modern web design. Built with React,
          powered by Vite, and animated with AOS for a seamless user journey.
        </p>

        <div
          data-aos="fade-up"
          data-aos-delay="300"
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {user ? (
            <Link to={getDashboardRoute()}>
              <Button size="lg" className="h-12 px-8 rounded-full text-lg font-medium group transition-all duration-300 hover:scale-105">
                {user.role === 'Admin' ? 'Admin Dashboard' : 'Explore Projects'}
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button size="lg" className="h-12 px-8 rounded-full text-lg font-medium group transition-all duration-300 hover:scale-105">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          )}
          <Link to="/graph">
            <Button size="lg" variant="outline" className="h-12 px-8 rounded-full text-lg font-medium glass hover:bg-secondary/50 transition-all duration-300">
              View Projects
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
