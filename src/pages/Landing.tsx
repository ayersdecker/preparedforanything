import { Link } from 'react-router-dom';
import { Shield, MapPin, Package, Map, FileText, ArrowRight, CheckCircle } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-surface to-background pt-20 pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,107,53,0.15),_transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 border border-primary/30 rounded-full p-5">
              <Shield className="w-14 h-14 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-4 leading-tight">
            Prepared For <span className="text-primary">Anything</span>
          </h1>
          <p className="text-xl sm:text-2xl font-semibold text-text-secondary mb-4">
            Know your risks. Build your kit. Stay safe.
          </p>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-text-secondary mb-10">
            Get a personalized disaster preparedness plan based on your location and household —
            complete with emergency kits, evacuation routes, and printable checklists.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-btn transition-colors text-lg"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 border border-surface-2 hover:border-primary/50 text-text-primary font-semibold px-8 py-3 rounded-btn transition-colors text-lg"
            >
              Learn More
            </a>
          </div>
          <div className="mt-12 flex flex-wrap gap-6 justify-center text-sm text-text-secondary">
            {['Free to use', 'No credit card required', 'Personalized for your location', 'Printable checklists'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">Everything You Need to Be Prepared</h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Our platform gives you the tools to understand your risks and take action — tailored specifically to where you live.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <MapPin className="w-8 h-8 text-primary" />,
                title: 'Location-Based Risk Assessment',
                desc: 'Get a detailed risk profile for your specific state and region — covering hurricanes, wildfires, earthquakes, and more.',
              },
              {
                icon: <Package className="w-8 h-8 text-primary" />,
                title: 'Custom Emergency Kits',
                desc: 'Build a personalized 72-hour emergency kit based on your household size, pets, and special needs.',
              },
              {
                icon: <Map className="w-8 h-8 text-primary" />,
                title: 'Evacuation Planning',
                desc: 'Plan your evacuation routes, identify meeting points, and know where to go before disaster strikes.',
              },
              {
                icon: <FileText className="w-8 h-8 text-primary" />,
                title: 'Printable Guides',
                desc: 'Download and print your personalized emergency plan and kit checklist — no internet required in a crisis.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-background rounded-card border border-surface-2 p-6 hover:border-primary/50 transition-colors"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="font-bold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-text-secondary">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">How It Works</h2>
            <p className="text-text-secondary">Get prepared in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              {
                step: '01',
                title: 'Tell Us About Yourself',
                desc: 'Enter your location and household details — how many people, any special needs, pets, and more.',
                icon: '👤',
              },
              {
                step: '02',
                title: 'Get Your Risk Profile',
                desc: 'We\'ll show you the specific disasters that threaten your area, their severity, and when they\'re most likely.',
                icon: '📊',
              },
              {
                step: '03',
                title: 'Build Your Plan',
                desc: 'Generate your custom emergency kit list and evacuation plan. Download printable checklists.',
                icon: '📋',
              },
            ].map((item, i) => (
              <div key={item.step} className="relative flex flex-col items-center text-center">
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
                <div className="w-20 h-20 bg-primary/10 border-2 border-primary/30 rounded-full flex items-center justify-center text-4xl mb-4">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-primary mb-2 tracking-widest">STEP {item.step}</div>
                <h3 className="font-bold text-text-primary text-lg mb-2">{item.title}</h3>
                <p className="text-text-secondary text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/20 via-surface to-primary/10 border-t border-surface-2">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-4">Ready to Get Prepared?</h2>
          <p className="text-text-secondary mb-8">
            Don't wait for disaster to strike. Start building your personalized emergency plan today — it's free.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-10 py-4 rounded-btn transition-colors text-lg"
          >
            Create Your Free Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer disclaimer */}
      <div className="bg-surface border-t border-surface-2 py-6 px-4">
        <p className="max-w-4xl mx-auto text-xs text-text-secondary text-center">
          <strong className="text-warning">Disclaimer:</strong> The information provided is for general educational purposes only
          and is not a substitute for professional emergency management advice. Always follow guidance from local authorities
          during an emergency.
        </p>
      </div>
    </div>
  );
}
