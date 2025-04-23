import api from "./api";
import { Pagination } from "@/types/types";

export interface ChatResponse {
  data: Chat[];
  pagination: Pagination;
}

export interface Chat {
  id: string;
  userId: string;
  categoryId: string;
  questionResponses: QuestionResponse[];
  status: ChatStatus;
  createdAt: string;
  updatedAt: string;
  data?: {
    id: string;
    [key: string]: any;
  };
}

export interface QuestionResponse {
  questionId: string;
  answer: string;
}

export enum ChatStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

export interface LegalQuestionnaireData {
  country: string;
  state: string;
  role: 'plaintiff' | 'defendant' | 'other';
  description: string;
}

interface StartChatData {
  categoryId: string;
  questionResponses: QuestionResponse[];
  legalQuestionnaire?: LegalQuestionnaireData;
}

interface SendMessageData {
  chatId: string;
  message: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  message: string;
  sender: 'user' | 'system';
  createdAt: string;
}

interface ChatApiResponse {
  success: boolean;
  data: Chat;
  message: string;
}

// Chat Service
const chatService = {
  getUserChats: async (): Promise<ChatResponse> => {
    const response = await api.get("/chats");
    return response.data;
  },

  getChatById: async (id: string): Promise<Chat> => {
    const response = await api.get(`/chats/${id}`);
    return response.data;
  },

  startChat: async (chatData: StartChatData): Promise<ChatApiResponse> => {
    const response = await api.post("/chats", chatData);
    return response.data;
  },

  getChatMessages: async (chatId: string): Promise<ChatMessage[]> => {
    const response = await api.get(`/chats/${chatId}/messages`);
    return response.data;
  },

  sendMessage: async (data: SendMessageData): Promise<ChatMessage> => {
    const response = await api.post(`/chats/${data.chatId}/messages`, { message: data.message });
    return response.data;
  },
};

export default chatService; 