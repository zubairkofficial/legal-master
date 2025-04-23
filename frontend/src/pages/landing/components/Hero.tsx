import { useTheme } from "../../../components/theme/theme-provider";
import { Button } from "../../../components/ui/button";

export default function Hero() {
  const { theme } = useTheme();
  
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 flex flex-col-reverse md:flex-row items-center gap-8 md:gap-16">
        {/* Left content */}
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="text-foreground">AI-Powered </span>
            <span className="text-[#BB8A28]">Legal Assistance</span>
            <span className="text-foreground"> at Your Fingertips</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl">
            Navigate complex legal landscapes with ease using our cutting-edge
            AI Lawyer chatbot.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button size="lg">
              Get Started
            </Button>
            <Button size="lg" variant="outline">
              Try Legal Assistant
            </Button>
          </div>
        </div>

        {/* Right content - image */}
        <div className="flex-1 flex justify-center items-center relative">
          <div className="relative w-full max-w-md h-auto">
            <div className="absolute inset-0 bg-[#BB8A28]/10 rounded-xl -z-10 blur-md"></div>
            <img 
              src="/images/ai-lawyer.webp" 
              alt="AI Legal Assistant" 
              className="w-full h-auto object-cover rounded-xl shadow-xl"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/600x400/BB8A28/FFF?text=AI+Legal+Assistant";
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
} 