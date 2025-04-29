import { useState } from "react";
import { cn } from "../../../lib/utils";
import { Button } from "../../../components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "../../../components/ui/tabs";
import { 
  Database, 
  FileText, 
  Users, 
  Mic, 
  Scale,
  ArrowRight,
  CheckCircle 
} from "lucide-react";

const services = [
  {
    id: 1,
    title: "Legal Database",
    description: "Access comprehensive legal knowledge with our extensive database of cases and precedents.",
    icon: "database",
    detailedDescription: "Our AI-powered legal query system offers instantaneous, reliable answers to your legal questions, ensuring you're always informed and prepared.",
    benefits: [
      "Access well-founded legal advice at the click of a button, drawing from a vast repository of legal knowledge.",
      "Dive into our extensive database for detailed insights into case laws, statutes, and legal precedents.",
      "Confidentiality is paramount. Your inquiries and the information provided are protected with the highest standards of privacy."
    ],
    image: "/images/legal-database.webp",
    fallbackImage: "https://placehold.co/600x400/BB8A28/FFF?text=Legal+Database",
    ctaText: "Explore Legal Database"
  },
  {
    id: 2,
    title: "Legal Document",
    description: "Generate and review legal documents with AI-powered assistance for accuracy and compliance.",
    icon: "file-text",
    detailedDescription: "Our document generation system helps you create legally sound documents with ease and precision.",
    benefits: [
      "Generate contracts, agreements, and legal forms tailored to your specific needs.",
      "Review existing documents for legal compliance and potential issues.",
      "Track document versions and changes with our comprehensive history system."
    ],
    image: "/images/legal-document.webp",
    fallbackImage: "https://placehold.co/600x400/BB8A28/FFF?text=Legal+Documents",
    ctaText: "Create Documents"
  },
  {
    id: 3,
    title: "Legal Consultancy",
    description: "Get expert advice and consultation on complex legal matters with our AI legal consultants.",
    icon: "users",
    detailedDescription: "Connect with our AI consultants for personalized legal advice on your most complex matters.",
    benefits: [
      "Receive tailored advice for your specific legal situation from our trained AI system.",
      "Get answers to complex legal questions with supporting case citations and statutes.",
      "Available 24/7 to assist with urgent legal inquiries when you need guidance most."
    ],
    image: "/images/legal-consultancy.webp",
    fallbackImage: "https://placehold.co/600x400/BB8A28/FFF?text=Legal+Consultancy",
    ctaText: "Consult Now"
  },
  {
    id: 4,
    title: "Voice Recording",
    description: "Record, transcribe, and analyze legal meetings and conversations with our voice recording feature.",
    icon: "mic",
    detailedDescription: "Capture, transcribe, and analyze important legal conversations with our advanced voice recording system.",
    benefits: [
      "Automatically transcribe meetings and consultations for accurate record-keeping.",
      "Extract key insights and action items from recorded conversations.",
      "Secure storage with end-to-end encryption to protect sensitive legal discussions."
    ],
    image: "/images/voice-recording.webp",
    fallbackImage: "https://placehold.co/600x400/BB8A28/FFF?text=Voice+Recording",
    ctaText: "Start Recording"
  },
  {
    id: 5,
    title: "Legal Mock Trials",
    description: "Prepare for court with AI-simulated mock trials to strengthen your case strategy.",
    icon: "gavel",
    detailedDescription: "Test and refine your case strategies with our AI-powered mock trial simulation system.",
    benefits: [
      "Practice your case presentation with realistic AI-generated responses from judges and opposing counsel.",
      "Identify potential weaknesses in your arguments before entering the actual courtroom.",
      "Receive detailed feedback and improvement suggestions based on legal precedent and best practices."
    ],
    image: "/images/mock-trials.webp",
    fallbackImage: "https://placehold.co/600x400/BB8A28/FFF?text=Mock+Trials",
    ctaText: "Simulate Trial"
  }
];

function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const iconProps = { 
    className: cn("w-full h-full", className),
    size: 24
  };
  
  switch(name) {
    case "database":
      return <Database {...iconProps} />;
    case "file-text":
      return <FileText {...iconProps} />;
    case "users":
      return <Users {...iconProps} />;
    case "mic":
      return <Mic {...iconProps} />;
    case "gavel":
      return <Scale {...iconProps} />;
    default:
      return <FileText {...iconProps} />;
  }
}

export default function Services() {
  const [activeTab, setActiveTab] = useState("1");
  
  return (
    <section className="py-16 md:py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">AI SERVICES</h2>
          <div className="w-20 h-1 bg-[#BB8A28] mx-auto mb-6"></div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our range of AI-powered legal services designed to streamline your legal work and provide expert assistance.
          </p>
        </div>
        
        <Tabs 
          defaultValue="1" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex justify-center mb-12">
            <TabsList className="bg-background/80 backdrop-blur-sm border p-1 gap-1">
              {services.map(service => (
                <TabsTrigger 
                  key={service.id} 
                  value={service.id.toString()}
                  className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-[#BB8A28] data-[state=active]:text-white"
                >
                  <span className="hidden md:inline-flex w-5 h-5 text-current">
                    <ServiceIcon name={service.icon} />
                  </span>
                  {service.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {services.map(service => (
            <TabsContent 
              key={service.id} 
              value={service.id.toString()} 
              className="mt-2 focus-visible:outline-none focus-visible:ring-0"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="space-y-6 order-2 md:order-1">
                  <h3 className="text-2xl md:text-3xl font-bold text-[#BB8A28]">
                    {service.title}: <span className="text-foreground font-medium">Your Gateway to Legal Excellence</span>
                  </h3>
                  <p className="text-muted-foreground">
                    {service.detailedDescription}
                  </p>
                  
                  <ul className="space-y-4">
                    {service.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#BB8A28] flex items-center justify-center text-white">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <p>{benefit}</p>
                      </li>
                    ))}
                  </ul>
                  
                  <Button className="bg-[#BB8A28] hover:bg-[#BB8A28]/90 gap-2 mt-4">
                    {service.ctaText}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="relative rounded-xl overflow-hidden shadow-xl order-1 md:order-2 transform transition-transform duration-500 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#BB8A28]/20 to-transparent z-10"></div>
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-full h-auto object-cover aspect-video"
                    onError={(e) => {
                      e.currentTarget.src = service.fallbackImage;
                    }}
                  />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
} 