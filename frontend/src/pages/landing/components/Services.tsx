import { useTheme } from "../../../components/theme/theme-provider";
import { cn } from "../../../lib/utils";
import { Button } from "../../../components/ui/button";

const services = [
  {
    id: 1,
    title: "Legal Database",
    description: "Access comprehensive legal knowledge with our extensive database of cases and precedents.",
    icon: "database"
  },
  {
    id: 2,
    title: "Legal Document",
    description: "Generate and review legal documents with AI-powered assistance for accuracy and compliance.",
    icon: "file-text"
  },
  {
    id: 3,
    title: "Legal Consultancy",
    description: "Get expert advice and consultation on complex legal matters with our AI legal consultants.",
    icon: "users"
  },
  {
    id: 4,
    title: "Voice Recording",
    description: "Record, transcribe, and analyze legal meetings and conversations with our voice recording feature.",
    icon: "mic"
  },
  {
    id: 5,
    title: "Legal Mock Trials",
    description: "Prepare for court with AI-simulated mock trials to strengthen your case strategy.",
    icon: "gavel"
  }
];

function ServiceIcon({ name }: { name: string }) {
  // Use a simple div with an emoji for now, you can replace with icons from a library
  const iconMap: Record<string, string> = {
    database: "🗄️",
    "file-text": "📄",
    users: "👥",
    mic: "🎙️",
    gavel: "⚖️"
  };

  return (
    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#BB8A28]/10 text-[#BB8A28] text-2xl">
      {iconMap[name] || "📋"}
    </div>
  );
}

export default function Services() {
  const { theme } = useTheme();
  
  return (
    <section className="py-16 md:py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">AI SERVICES</h2>
          <div className="w-20 h-1 bg-[#BB8A28] mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {services.map((service) => (
            <div 
              key={service.id} 
              className={cn(
                "p-6 rounded-lg transition-all duration-300 flex flex-col items-center text-center",
                "hover:shadow-md hover:bg-[#BB8A28]/5 cursor-pointer"
              )}
            >
              <ServiceIcon name={service.icon} />
              <h3 className="text-lg font-semibold mt-4 mb-2">{service.title}</h3>
              <p className="text-sm text-muted-foreground">{service.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-bold">
                Legal Queries: Your Gateway to Legal Insight
              </h3>
              <p className="text-muted-foreground">
                Our AI-powered legal query system offers instantaneous, reliable answers to your legal questions, ensuring you're always informed and prepared.
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#BB8A28] flex items-center justify-center text-white">✓</div>
                  <p>Access well-founded legal advice at the click of a button, drawing from a vast repository of legal knowledge.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#BB8A28] flex items-center justify-center text-white">✓</div>
                  <p>Dive into our extensive database for detailed insights into case laws, statutes, and legal precedents.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#BB8A28] flex items-center justify-center text-white">✓</div>
                  <p>Confidentiality is paramount. Your inquiries and the information provided are protected with the highest standards of privacy.</p>
                </li>
              </ul>
              
              <Button>
                Explore Legal Database
              </Button>
            </div>
            
            <div className="relative rounded-xl overflow-hidden shadow-xl">
              <img 
                src="/images/legal-database.webp" 
                alt="Legal Database" 
                className="w-full h-auto"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/600x400/BB8A28/FFF?text=Legal+Database";
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 