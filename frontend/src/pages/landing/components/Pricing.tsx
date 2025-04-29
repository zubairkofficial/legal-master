import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Check } from "lucide-react";

const pricingPlans = [
  {
    name: "Basic",
    description: "Essential legal assistance",
    price: 9.99,
    featured: false,
    features: [
      "Basic legal document review",
      "Simple legal questions",
      "24/7 AI assistance",
      "Document templates access"
    ],
  },
  {
    name: "Professional",
    description: "Comprehensive legal solutions",
    price: 29.99,
    featured: true,
    features: [
      "Advanced document analysis",
      "Complex legal consultations",
      "Priority response",
      "Unlimited document templates",
      "Custom legal research",
      "Case precedent search"
    ],
  },
  {
    name: "Enterprise",
    description: "Full-scale legal department",
    price: 99.99,
    featured: false,
    features: [
      "Everything in Professional",
      "Custom legal workflow",
      "Team collaboration tools",
      "Dedicated legal AI training",
      "API integration",
      "Compliance monitoring"
    ],
  },
];

export default function Pricing() {
  
  return (
    <section id="pricing" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-foreground">Transparent </span>
            <span className="text-[#BB8A28]">Legal Pricing</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose the perfect plan for your legal assistance needs, with no hidden fees.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          {pricingPlans.map((plan, index) => (
            <Card key={index} className={`${plan.featured ? 'border-[#BB8A28] shadow-lg' : ''} relative`}>
              {plan.featured && (
                <div className="absolute top-0 right-0 bg-[#BB8A28] text-white px-3 py-1 text-sm rounded-bl-lg">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="mr-2 h-5 w-5 text-[#BB8A28]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full ${plan.featured ? 'bg-[#BB8A28] hover:bg-[#A07923]' : ''}`}
                  variant={plan.featured ? 'default' : 'outline'}
                >
                  Get Started
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
} 