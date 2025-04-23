import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import categoryService, { Category } from '@/services/category.service';
import questionService, { Question } from '@/services/question.service';
import chatService, { QuestionResponse as ChatQuestionResponse, LegalQuestionnaireData } from '@/services/chat.service';
import useUserStore from '@/store/useUserStore';
import { useTheme } from '@/components/theme/theme-provider';
import LegalQuestionnaire from '@/components/forms/LegalQuestionnaire';

enum ChatStage {
  CATEGORY_SELECTION = 'category_selection',
  QUESTION_SELECTION = 'question_selection',
  LEGAL_QUESTIONNAIRE = 'legal_questionnaire',
  CHAT_INTERACTION = 'chat_interaction',
}

interface Message {
  id: string;
  message: string;
  sender: 'user' | 'system';
  timestamp: Date;
}

// Mock data for testing if API calls fail
const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q1',
    title: 'What is your legal issue about?',
    content: 'Please describe the nature of your legal concern briefly.',
    category: { id: 'c1', name: 'Default', description: '', status: true, createdAt: '', updatedAt: '' },
    status: true,
    createdAt: '',
    updatedAt: ''
  },
  {
    id: 'q2',
    title: 'Have you consulted with a lawyer before?',
    content: 'Please let us know if you have previously sought legal advice on this matter.',
    category: { id: 'c1', name: 'Default', description: '', status: true, createdAt: '', updatedAt: '' },
    status: true,
    createdAt: '',
    updatedAt: ''
  }
];

const Chat = () => {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const { user } = useUserStore();
  const { theme } = useTheme();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // State for the chat flow
  const [stage, setStage] = useState<ChatStage>(ChatStage.CATEGORY_SELECTION);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [questionResponses, setQuestionResponses] = useState<ChatQuestionResponse[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  
  // Legal questionnaire data
  const [legalQuestionnaireData, setLegalQuestionnaireData] = useState<LegalQuestionnaireData>({
    country: '',
    state: '',
    role: 'plaintiff',
    description: '',
  });
  
  // Debug state
  const [apiError, setApiError] = useState<string | null>(null);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const response = await categoryService.getAllCategories();
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // If chatId is provided, load existing chat
    if (chatId) {
      loadExistingChat(chatId);
    } else {
      loadCategories();
    }
  }, [chatId]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Debug logging for stage changes
  useEffect(() => {
    console.log('Stage changed to:', stage);
    
    // If we're in question selection stage but have no questions, use mock data
    if (stage === ChatStage.QUESTION_SELECTION && questions.length === 0) {
      console.log('No questions found, using mock data');
      setQuestions(MOCK_QUESTIONS);
    }
  }, [stage, questions.length]);

  const loadExistingChat = async (id: string) => {
    try {
      setIsLoading(true);
      const chatData = await chatService.getChatById(id);
      setCurrentChatId(id);
      setStage(ChatStage.CHAT_INTERACTION);

      // Load messages for the chat
      const messagesData = await chatService.getChatMessages(id);
      setMessages(
        messagesData.map((msg) => ({
          id: msg.id,
          message: msg.message,
          sender: msg.sender,
          timestamp: new Date(msg.createdAt),
        }))
      );
    } catch (error) {
      console.error('Failed to load chat:', error);
      // Redirect to new chat if chat loading fails
      navigate('/chat/new');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = async (categoryId: string) => {
    try {
      setIsLoading(true);
      setSelectedCategory(categoryId);
      setApiError(null);
      
      console.log('Fetching questions for category:', categoryId);
      
      // Load questions for the selected category
      const response = await questionService.getQuestionsByCategory(categoryId);
      const questionsData = response.data;
      console.log('Received questions:', questionsData);
      
      if (Array.isArray(questionsData) && questionsData.length > 0) {
        setQuestions(questionsData);
        setSelectedQuestions([]);
      } else {
        console.warn('No questions returned or invalid format, using mock data');
        setQuestions(MOCK_QUESTIONS);
        setSelectedQuestions([]);
        setApiError('Could not load questions from server. Using sample questions instead.');
      }
      
      // Force stage change
      setTimeout(() => {
        setStage(ChatStage.QUESTION_SELECTION);
        console.log('Changed stage to:', ChatStage.QUESTION_SELECTION);
      }, 0);
    } catch (error) {
      console.error('Failed to load questions:', error);
      setApiError('Error loading questions. Using sample questions instead.');
      
      // Use mock data on error
      setQuestions(MOCK_QUESTIONS);
      setSelectedQuestions([]);
      
      // Still proceed to question selection
      setTimeout(() => {
        setStage(ChatStage.QUESTION_SELECTION);
      }, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  const handleQuestionSubmit = () => {
    // Create empty responses for selected questions
    const responses = selectedQuestions.map(qId => ({
      questionId: qId,
      answer: '',
    }));
    
    setQuestionResponses(responses);
    
    // Move to legal questionnaire
    setStage(ChatStage.LEGAL_QUESTIONNAIRE);
  };

  const handleLegalQuestionnaireSubmit = async (formData: LegalQuestionnaireData) => {
    if (!selectedCategory) return;
    
    try {
      setIsLoading(true);
      setLegalQuestionnaireData(formData);
      
      // Start a new chat with the question responses and legal questionnaire data
      const chatData = await chatService.startChat({
        categoryId: selectedCategory,
        questionResponses,
        legalQuestionnaire: formData, // You'll need to update your API to accept this
      });
      
      // Extract chat ID from response - backend returns {success, data, message}
      const newChatId = chatData.data.id;
      setCurrentChatId(newChatId);
      
      // Set stage to chat interaction
      setStage(ChatStage.CHAT_INTERACTION);
      
      // Update URL to include the chat ID and navigate to it
      navigate(`/chat/${newChatId}`);
      
      // Fetch messages for the newly created chat
      try {
        const messagesData = await chatService.getChatMessages(newChatId);
        if (Array.isArray(messagesData)) {
          setMessages(
            messagesData.map((msg) => ({
              id: msg.id,
              message: msg.message,
              sender: msg.sender,
              timestamp: new Date(msg.createdAt),
            }))
          );
        } else {
          console.error('Unexpected message data format:', messagesData);
          setMessages([]);
        }
      } catch (error) {
        console.error('Failed to load initial messages:', error);
        // Fallback to an empty messages list
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to start chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentChatId) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      message: newMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');
    
    try {
      // Send message to API
      const response = await chatService.sendMessage({
        chatId: currentChatId,
        message: newMessage,
      });
      
      // Add system response
      const systemMessage: Message = {
        id: response.id,
        message: response.message,
        sender: 'system',
        timestamp: new Date(response.createdAt),
      };
      
      setMessages((prev) => [...prev, systemMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        message: 'Sorry, there was an error sending your message. Please try again.',
        sender: 'system',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  // Helper to format category cards
  const CategoryCard = ({ category }: { category: Category }) => (
    <div
      className="border border-border rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={() => {
        console.log('Category clicked:', category.id);
        handleCategorySelect(category.id);
      }}
    >
      <div className="h-2 bg-[#BB8A28]" />
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
        <p className="text-muted-foreground">{category.description}</p>
      </div>
    </div>
  );

  // Render different UI based on the current stage
  const renderContent = () => {
    console.log('Current stage:', stage);
    
    switch (stage) {
      case ChatStage.CATEGORY_SELECTION:
        return (
          <div key="category-selection" className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold">Select a Category</h1>
              <p className="text-muted-foreground mt-2">Choose a topic to start your conversation</p>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin h-12 w-12 border-4 border-[#BB8A28] border-opacity-50 rounded-full border-t-[#BB8A28]"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            )}
          </div>
        );
        
      case ChatStage.QUESTION_SELECTION:
        console.log('Rendering questions for selection:', questions);
        return (
          <div key="question-selection" className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold">Select Questions</h1>
              <p className="text-muted-foreground mt-2">
                Choose the questions relevant to your case
              </p>
              
              {apiError && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                  {apiError}
                </div>
              )}
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin h-12 w-12 border-4 border-[#BB8A28] border-opacity-50 rounded-full border-t-[#BB8A28]"></div>
              </div>
            ) : questions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {questions.map((question) => (
                  <div 
                    key={question.id} 
                    className={`border border-border rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden ${
                      selectedQuestions.includes(question.id) 
                        ? 'bg-[#BB8A28] bg-opacity-10 border-[#BB8A28]' 
                        : 'bg-card'
                    }`}
                    onClick={() => toggleQuestionSelection(question.id)}
                  >
                    <div className="h-2 bg-[#BB8A28]" />
                    <div className="p-6">
                      <div className="flex items-start">
                        <div className={`w-6 h-6 rounded-full border mr-4 flex-shrink-0 flex items-center justify-center ${
                          selectedQuestions.includes(question.id)
                            ? 'bg-[#BB8A28] border-[#BB8A28]'
                            : 'border-input'
                        }`}>
                          {selectedQuestions.includes(question.id) && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold mb-2">{question.title}</h2>
                          <p className="text-muted-foreground">{question.content}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="col-span-1 md:col-span-2 flex justify-between pt-4">
                  <Button
                    type="button"
                    onClick={() => setStage(ChatStage.CATEGORY_SELECTION)}
                    variant="outline"
                    className="px-6"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleQuestionSubmit}
                    disabled={isLoading || selectedQuestions.length === 0}
                    className="px-6"
                  >
                    Next: Legal Questionnaire
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-lg text-muted-foreground">No questions found for this category.</p>
                <Button
                  onClick={() => setStage(ChatStage.CATEGORY_SELECTION)}
                  className="mt-4"
                >
                  Go Back to Categories
                </Button>
              </div>
            )}
          </div>
        );

      case ChatStage.LEGAL_QUESTIONNAIRE:
        return (
          <LegalQuestionnaire
            onSubmit={handleLegalQuestionnaireSubmit}
            onBack={() => setStage(ChatStage.QUESTION_SELECTION)}
            isLoading={isLoading}
          />
        );
        
      case ChatStage.CHAT_INTERACTION:
        return (
          <div key="chat-interaction" className="flex flex-col h-full bg-background rounded-lg shadow-lg overflow-hidden" ref={chatContainerRef}>
            {/* Chat header */}
            <div className="px-6 py-4 border-b border-border bg-card">
              <h2 className="text-xl font-semibold text-foreground">Live Assistance</h2>
            </div>
            
            {/* Messages area */}
            <div className="flex-1 overflow-auto p-6 space-y-6" style={{ scrollbarWidth: 'thin' }}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-[#BB8A28] text-white'
                        : theme === 'dark' 
                          ? 'bg-secondary text-secondary-foreground' 
                          : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.message}</p>
                    <p className="text-xs mt-1 opacity-70 text-right">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messageEndRef} />
            </div>
            
            {/* Message input */}
            <div className="border-t border-border p-4 bg-card">
              <form onSubmit={sendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 p-3 rounded-full border border-input bg-background focus:ring-2 focus:ring-[#BB8A28] focus:outline-none"
                  placeholder="Type your message..."
                />
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim()} 
                  className="rounded-full h-12 w-12 p-0 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 3 3 9-3 9 19-9Z"></path>
                    <path d="M6 12h16"></path>
                  </svg>
                </Button>
              </form>
            </div>
          </div>
        );
    }
  };

  // Debugging helper component
  const DebugInfo = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div className="fixed bottom-0 left-0 bg-black bg-opacity-70 text-white p-2 text-xs z-50 max-w-xs overflow-auto">
        <div>Stage: {stage}</div>
        <div>Questions: {questions.length}</div>
        <div>Selected Questions: {selectedQuestions.length}</div>
        <div>Selected Category: {selectedCategory}</div>
      </div>
    );
  };

  return (
    <div className="h-full">
      {renderContent()}
      <DebugInfo />
    </div>
  );
};

export default Chat;
