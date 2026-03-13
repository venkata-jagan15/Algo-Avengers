
import { Shield, Zap, Globe, Cpu } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Ultra Fast",
    description: "Built on Vite for lightning-fast development and production performance.",
    delay: 100
  },
  {
    icon: Shield,
    title: "Secure by Design",
    description: "Enterprise-grade security standards integrated into every layer.",
    delay: 200
  },
  {
    icon: Globe,
    title: "Scale Anywhere",
    description: "Cloud-native architecture designed to grow with your ambitions.",
    delay: 300
  },
  {
    icon: Cpu,
    title: "AI Powered",
    description: "Leverage the power of integrated AI components for smarter workflows.",
    delay: 400
  }
];

const Features = () => {
  return (
    <section className="py-24 bg-secondary/30 relative">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Powerful Features</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Our platform provides the tools you need to build stunning experiences
            without compromise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              data-aos="fade-up"
              data-aos-delay={feature.delay}
              className="p-8 rounded-2xl bg-card border border-border glass hover:border-accent/30 transition-all duration-500 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors duration-500">
                <feature.icon className="w-6 h-4 text-primary group-hover:text-accent transition-colors duration-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
