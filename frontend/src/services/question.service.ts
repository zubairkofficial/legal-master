import api from "./api";
import { Category } from "./category.service";
import { Pagination } from "@/types/types";

export interface QuestionResponse {
  data: Question[];
  pagination: Pagination;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  category: Category;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateQuestionData {
  title: string;
  content: string;
  categoryId: string;
  isActive: boolean;
}

interface UpdateQuestionData {
  title: string;
  content: string;
  categoryId: string;
  isActive: boolean;
}

// Question Service
const questionService = {
  getAllQuestions: async (): Promise<QuestionResponse> => {
    const response = await api.get("/questions");
    return response.data;
  },

  getQuestionById: async (id: string): Promise<Question> => {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },

  createQuestion: async (questionData: CreateQuestionData): Promise<Question> => {
    const response = await api.post("/questions", questionData);
    return response.data;
  },

  updateQuestion: async (id: string, questionData: UpdateQuestionData): Promise<Question> => {
    const response = await api.put(`/questions/${id}`, questionData);
    return response.data;
  },

  deleteQuestion: async (id: string): Promise<void> => {
    await api.delete(`/questions/${id}`);
  },

  getQuestionsByCategory: async (categoryId: string): Promise<QuestionResponse> => {
    const response = await api.get(`/categories/${categoryId}/questions`);
    return response.data;
  },
};

export default questionService; 