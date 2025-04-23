import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LegalQuestionnaireData } from '@/services/chat.service';

interface LegalQuestionnaireProps {
  onSubmit: (formData: LegalQuestionnaireData) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const LegalQuestionnaire = ({ onSubmit, onBack, isLoading = false }: LegalQuestionnaireProps) => {
  const [formData, setFormData] = useState<LegalQuestionnaireData>({
    country: '',
    state: '',
    role: 'plaintiff',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Legal Questionnaire</h1>
        <p className="text-muted-foreground mt-2">
          Please answer these questions to help us better understand your legal situation
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question 1: Country */}
        <div className="border border-border bg-card rounded-lg shadow-md p-6">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#BB8A28] text-white font-medium mb-4">
            1
          </span>
          <h2 className="text-xl font-semibold mb-2">Which country do you live in?</h2>
          <p className="text-muted-foreground mb-4">Please specify your country of residence.</p>
          <input
            type="text"
            name="country"
            className="w-full p-4 border border-input rounded-md bg-background focus:ring-2 focus:ring-[#BB8A28] focus:outline-none transition-all"
            placeholder="Enter your country"
            value={formData.country}
            onChange={handleChange}
            required
          />
        </div>

        {/* Question 2: State */}
        <div className="border border-border bg-card rounded-lg shadow-md p-6">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#BB8A28] text-white font-medium mb-4">
            2
          </span>
          <h2 className="text-xl font-semibold mb-2">Which state do you live in?</h2>
          <p className="text-muted-foreground mb-4">Please specify your state or province.</p>
          <input
            type="text"
            name="state"
            className="w-full p-4 border border-input rounded-md bg-background focus:ring-2 focus:ring-[#BB8A28] focus:outline-none transition-all"
            placeholder="Enter your state"
            value={formData.state}
            onChange={handleChange}
            required
          />
        </div>

        {/* Question 3: Role */}
        <div className="border border-border bg-card rounded-lg shadow-md p-6">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#BB8A28] text-white font-medium mb-4">
            3
          </span>
          <h2 className="text-xl font-semibold mb-2">Are you a plaintiff or defendant?</h2>
          <p className="text-muted-foreground mb-4">Please specify your role in the legal matter.</p>
          <select
            name="role"
            className="w-full p-4 border border-input rounded-md bg-background focus:ring-2 focus:ring-[#BB8A28] focus:outline-none transition-all"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="plaintiff">Plaintiff</option>
            <option value="defendant">Defendant</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Question 4: Description */}
        <div className="border border-border bg-card rounded-lg shadow-md p-6">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#BB8A28] text-white font-medium mb-4">
            4
          </span>
          <h2 className="text-xl font-semibold mb-2">Can you describe what happened?</h2>
          <p className="text-muted-foreground mb-4">Please provide details about the incident, who was involved, and when it happened.</p>
          <textarea
            name="description"
            className="w-full p-4 border border-input rounded-md h-32 bg-background focus:ring-2 focus:ring-[#BB8A28] focus:outline-none transition-all"
            placeholder="Please describe in detail what happened, who did it, and when this happened..."
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            onClick={onBack}
            variant="outline"
            className="px-6"
          >
            Back
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="px-6"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></span>
                <span>Processing...</span>
              </span>
            ) : (
              'Submit and Start Conversation'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LegalQuestionnaire; 