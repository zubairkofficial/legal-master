import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";

export default function CTA() {
  
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-[#BB8A28]/90 to-[#BB8A28] rounded-2xl p-8 md:p-12 shadow-xl relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-40 -top-40 w-80 h-80 rounded-full bg-white"></div>
            <div className="absolute -left-20 -bottom-20 w-60 h-60 rounded-full bg-white"></div>
          </div>
          
          <div className="relative z-10 text-center text-white max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              The best AI Lawyer software on the planet!
            </h2>
            
            <p className="mb-8 text-white/80">
              Experience the future of legal assistance with our cutting-edge AI technology.
              Get started today with our free plan or upgrade for premium features.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                className={cn(
                  "bg-white text-[#BB8A28] hover:bg-white/90",
                )}
              >
                Try Now
              </Button>
              <Button
                className={cn(
                  "bg-transparent border-2 border-white text-white hover:bg-white/10",
                )}
              >
                Create Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 