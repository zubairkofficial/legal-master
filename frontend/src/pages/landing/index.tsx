import Hero from "../landing/components/Hero";
import Services from "../landing/components/Services";
import About from "../landing/components/About";
import Testimonials from "../landing/components/Testimonials";
import Pricing from "../landing/components/Pricing";
import CTA from "../landing/components/CTA";
import { Layout } from "../../components/layout";

export default function LandingPage() {
  
  return (
    <Layout>
      <div className="min-h-screen mx-20">
        <Hero />
        <Services />
        <About />
        <Pricing />
        <Testimonials />
        <CTA />
      </div>
    </Layout>
  );
} 