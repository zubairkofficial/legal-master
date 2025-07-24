import React, { useState } from "react";
import { LegalQuestionnaireData } from "@/services/chat.service";
import { ArrowLeft } from "lucide-react";

interface LegalQuestionnaireProps {
  onSubmit: (formData: LegalQuestionnaireData) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const LegalQuestionnaire = ({
  onSubmit,
  onBack,
  isLoading = false,
}: LegalQuestionnaireProps) => {
  const [formData, setFormData] = useState<LegalQuestionnaireData>({
    country: "",
    state: "",
    role: "plaintiff",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FAF9F7]">
      <div className="bg-white rounded-3xl shadow-md p-6 md:p-10 w-full max-w-3xl">
        <div className="text-center mb-6">
          <h1 className="text-[20px] md:text-[22px] font-semibold text-[#1C1C1C]">
            Legal Questionnaire
          </h1>
          <p className="text-[#707070] text-sm mt-1">
            Help us understand your legal situation
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#F9F6F2] rounded-xl p-6 space-y-3"
        >
          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-[#1C1C1C] mb-1"
            >
              Country
            </label>
            <input
              id="country"
              name="country"
              type="text"
              placeholder="Your Country of residence"
              value={formData.country}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-3 rounded-md border border-transparent bg-white placeholder-[#B4B4B4] focus:outline-none focus:ring-2 focus:ring-[#D3B063]"
            />
          </div>

          <div>
            <label
              htmlFor="state"
              className="block text-sm font-medium text-[#1C1C1C] mb-1"
            >
              State/Province
            </label>
            <input
              id="state"
              name="state"
              type="text"
              placeholder="Your State/Province"
              value={formData.state}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-3 rounded-md border border-transparent bg-white placeholder-[#B4B4B4] focus:outline-none focus:ring-2 focus:ring-[#D3B063]"
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-[#1C1C1C] mb-1"
            >
              Your Role
            </label>
            <div className="relative">
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full text-sm px-4 py-3 rounded-md border border-gray-300 bg-white text-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#D3B063] appearance-none"
              >
                <option value="plaintiff">Plaintiff</option>
                <option value="defendant">Defendant</option>
                <option value="other">Other</option>
              </select>
              <svg
                className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-[#1C1C1C] mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Description what happened, who was involved, and when"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-3 rounded-md h-28 resize-none border border-transparent bg-white placeholder-[#B4B4B4] focus:outline-none focus:ring-2 focus:ring-[#D3B063]"
            />
          </div>
        </form>

        <div className="flex justify-between mt-6 px-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 px-5 py-2 border border-[#BB8A28] text-[#BB8A28] text-sm font-medium rounded-lg hover:bg-[#F1E6D3] transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-[#BB8A28] hover:bg-[#a97a22] text-white px-5 py-3 text-sm font-medium rounded-lg transition disabled:opacity-60"
          >
            {isLoading ? "Processing..." : "Next: Legal Questionnaire"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalQuestionnaire;
