import api from "./api";
import { Pagination } from "@/types/types";
import axios from "axios";

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

export const fetchUserCredits = async () => {
  try {
    const response = await axios.get('/user/credits');
    return response.data.credits;
  } catch (error) {
    console.error('Error fetching user credits:', error);
    throw error;
  }
};

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

  // Create a chat in the database (without streaming)
  createChat: async (chatData: StartChatData): Promise<{ id: string; title: string }> => {
    const response = await api.post("/chats", chatData);
    return response.data.data;
  },
  
  // Stream the initial message for a newly created chat
  streamInitialMessage: async (
    chatId: string, 
    onChunk: (chunk: string) => void
  ): Promise<void> => {
    try {
      const response = await fetch(`${api.defaults.baseURL}/chats/${chatId}/initial-message`, {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body reader could not be obtained');
      }

      const decoder = new TextDecoder();
      
      // Process the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        console.log('Raw chunk received:', chunk);
        
        // Each SSE message is formatted as "data: {...}\n\n"
        const messages = chunk.split('\n\n').filter(msg => msg.trim() !== '');
        
        for (const message of messages) {
          if (message.startsWith('data: ')) {
            try {
              const jsonStr = message.substring(6); // Remove 'data: ' prefix
              const data = JSON.parse(jsonStr);
              
              if (data.content) {
                console.log('Parsed content from chunk:', data.content);
                onChunk(data.content);
              } else if (data.error) {
                console.error('Error in stream:', data.error);
                throw new Error(data.error);
              }
            } catch (e) {
              console.error('Error parsing SSE message:', e, message);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in streamInitialMessage:', error);
      throw error;
    }
  },

  getChatMessages: async (chatId: string): Promise<ChatMessage[]> => {
    const response = await api.get(`/chats/${chatId}/messages`);
    return response.data;
  },

  sendMessage: async (data: SendMessageData): Promise<ChatMessage> => {
    const response = await api.post(`/chats/${data.chatId}/messages`, { message: data.message });
    return response.data;
  },

  sendStreamMessage: async (
    data: SendMessageData, 
    onChunk: (chunk: string) => void
  ): Promise<ChatMessage> => {
    console.log('Sending stream message:', data);
    
    try {
      const response = await fetch(`${api.defaults.baseURL}/chats/${data.chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: data.message })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body reader could not be obtained');
      }

      const decoder = new TextDecoder();
      let finalMessage = '';
      
      // Process the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        console.log('Raw chunk received:', chunk);
        
        // Each SSE message is formatted as "data: {...}\n\n"
        const messages = chunk.split('\n\n').filter(msg => msg.trim() !== '');
        
        for (const message of messages) {
          if (message.startsWith('data: ')) {
            try {
              const jsonStr = message.substring(6); // Remove 'data: ' prefix
              const data = JSON.parse(jsonStr);
              
              if (data.content) {
                console.log('Parsed content from chunk:', data.content);
                finalMessage += data.content;
                onChunk(data.content);
              } else if (data.error) {
                console.error('Error in stream:', data.error);
                throw new Error(data.error);
              }
            } catch (e) {
              console.error('Error parsing SSE message:', e, message);
            }
          }
        }
      }

      // Return the final message as a ChatMessage object
      return {
        id: Date.now().toString(),
        chatId: data.chatId,
        message: finalMessage,
        sender: 'system',
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error in sendStreamMessage:', error);
      throw error;
    }
  },

  deleteChat: async (chatId: string): Promise<void> => {
    await api.delete(`/chats/${chatId}`);
  },

  fetchUserCredits: async (): Promise<number> => {
    try {
      const response = await api.get('/credits');
      return response.data.credits;
    } catch (error) {
      console.error('Error fetching user credits:', error);
      throw error;
    }
  }
};

export default chatService; 