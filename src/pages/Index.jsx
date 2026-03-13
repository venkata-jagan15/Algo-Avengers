import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import ProjectCard from '@/components/ProjectCard';
import { mockProjects } from '@/lib/mockData';

const Index = () => {
  const featuredProjects = mockProjects.slice(0, 3);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Hero />

      <Features />

      {/* Featured Projects */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-4" data-aos="fade-up">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground">Featured Projects</h2>
              <p className="mt-2 text-muted-foreground">Recent notable contributions from students</p>
            </div>
            <Link
              to="/browse"
              className="hidden items-center gap-2 font-display text-sm font-semibold text-accent hover:underline md:flex group"
            >
              View all projects <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project, index) => (
              <div key={project.id} data-aos="fade-up" data-aos-delay={index * 100}>
                <ProjectCard project={project} />
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-12 md:hidden" data-aos="fade-up">
            <Link
              to="/browse"
              className="flex items-center gap-2 font-display text-sm font-semibold text-accent hover:underline"
            >
              View all projects <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="container mx-auto px-4 text-center">
          <div 
            data-aos="zoom-in"
            className="mx-auto max-w-3xl rounded-3xl bg-hero p-12 md:p-16 shadow-hero relative overflow-hidden"
          >
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full -mr-16 -mt-16 blur-2xl" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
                Ready to Join the Community?
              </h2>
              <p className="text-xl text-primary-foreground/80 mb-10 max-w-xl mx-auto">
                Help future students learn from your experience. Submit your project today and make an impact.
              </p>
              <Link
                to="/submit"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-10 py-4 font-semibold text-accent-foreground transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Submit a Project <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">© 2026 Inno Track — Preserving Academic Knowledge Across Semesters</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
