import { useState } from "react";
import Hero from "../landing/components/Hero";
import Services from "../landing/components/Services";
import About from "../landing/components/About";
import Testimonials from "../landing/components/Testimonials";
import CTA from "../landing/components/CTA";
import { useTheme } from "../../components/theme/theme-provider";
import { Layout } from "../../components/layout";

export default function LandingPage() {
  const { theme } = useTheme();
  
  return (
    <Layout>
      <div className="min-h-screen">
        <Hero />
        <Services />
        <About />
        <Testimonials />
        <CTA />
      </div>
    </Layout>
  );
} 