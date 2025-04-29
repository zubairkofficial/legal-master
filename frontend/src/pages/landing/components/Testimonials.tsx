import { cn } from "../../../lib/utils";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { useNavigate } from "react-router-dom";
const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    position: "Small Business Owner",
    content: "Legal Master AI has been a game-changer for my small business. The legal document generation tool saved me thousands in legal fees and countless hours of work.",
    avatarUrl: "/images/avatars/avatar-1.webp"
  },
  {
    id: 2,
    name: "Michael Chen",
    position: "Family Law Attorney",
    content: "As a practicing attorney, I was skeptical about AI legal assistance. But Legal Master's database has become an invaluable tool in my practice, providing quick and accurate research that improves my efficiency.",
    avatarUrl: "/images/avatars/avatar-2.webp"
  },
  {
    id: 3,
    name: "Jennifer Roberts",
    position: "Non-profit Director",
    content: "Our organization serves underprivileged communities with limited access to legal help. Legal Master AI has empowered us to assist more people with their legal questions and document preparation.",
    avatarUrl: "/images/avatars/avatar-3.webp"
  },
  {
    id: 4,
    name: "David Williams",
    position: "Real Estate Developer",
    content: "The contract review feature caught several potential issues in our agreements that even our legal team missed. This technology is truly advancing the legal field.",
    avatarUrl: "/images/avatars/avatar-4.webp"
  },
  {
    id: 5,
    name: "Lisa Martinez",
    position: "Paralegal",
    content: "Legal Master AI has streamlined our document preparation process. What used to take hours now takes minutes, allowing us to serve more clients and reduce costs.",
    avatarUrl: "/images/avatars/avatar-5.webp"
  }
];

export default function Testimonials() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  
  return (
    <section className="py-16 md:py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Trusted by Industry Leaders
          </h2>
          <div className="w-20 h-1 bg-[#BB8A28] mx-auto"></div>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Join the ranks of top legal firms and businesses that leverage our AI Lawyer for efficient, accurate legal support.
          </p>
        </div>
        
        <div className="relative">
          {/* Desktop testimonials display */}
          <div className="hidden md:grid grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
          
          {/* Mobile testimonials carousel */}
          <div className="md:hidden">
            <TestimonialCard testimonial={testimonials[activeIndex]} />
            
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all",
                    index === activeIndex ? "bg-[#BB8A28]" : "bg-gray-300"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-20 text-center">
          <div className="inline-flex items-center justify-center p-1 rounded-full bg-card shadow-lg mb-10">
            {[...Array(5)].map((_, index) => (
              <div 
                key={index}
                className="w-10 h-10 rounded-full bg-gray-200 mx-2 overflow-hidden"
              >
                <img 
                  src={testimonials[index % testimonials.length].avatarUrl} 
                  alt="Client" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://placehold.co/100x100/BB8A28/FFF?text=${index + 1}`;
                  }}
                />
              </div>
            ))}
          </div>
          
          <h3 className="text-2xl md:text-3xl font-bold mb-6">
            Next-Generation <span className="text-[#BB8A28]">Legal</span> Support with AI
          </h3>
          
          <p className="text-muted-foreground mb-8">
            Sign Up or Experience AI Consultation Today!
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button>
              Try AI Consultation
            </Button>
            <Button variant="outline" onClick={() => navigate("/sign-up")}>
              Create Free Account
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
  return (
    <div className="bg-background p-6 rounded-xl shadow-md">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
          <img 
            src={testimonial.avatarUrl} 
            alt={testimonial.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = `https://placehold.co/100x100/BB8A28/FFF?text=${testimonial.name.charAt(0)}`;
            }}
          />
        </div>
        <div>
          <h4 className="font-semibold">{testimonial.name}</h4>
          <p className="text-sm text-muted-foreground">{testimonial.position}</p>
        </div>
      </div>
      <p className="text-muted-foreground">"{testimonial.content}"</p>
      <div className="mt-4 flex text-[#BB8A28]">
        {"★★★★★".split("").map((star, i) => (
          <span key={i}>{star}</span>
        ))}
      </div>
    </div>
  );
} 