import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ChatMessage, Product } from '../types';

interface ChatContextType {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  addMessage: (content: string, isUser: boolean, productId?: number) => void;
  toggleChat: () => void;
  setIsOpen: (open: boolean) => void;
  askAssistant: (question: string, productId?: number) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const generateAIResponse = async (question: string, productId?: number): Promise<string> => {
  // Симулиран AI response
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  const responses = [
    "Според медицинската информация, която разполагам, ",
    "Базирано на активните съставки, мога да кажа, че ",
    "От фармакологична гледна точка, ",
    "Според клиничните данни, "
  ];
  
  const advice = [
    "този продукт се използва безопасно при спазване на указанията за дозиране.",
    "препоръчвам да се консултирате с лекар или фармацевт преди употреба.",
    "важно е да прочетете внимателно листовката в опаковката.",
    "може да има взаимодействия с други лекарства, които приемате."
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  const randomAdvice = advice[Math.floor(Math.random() * advice.length)];
  
  if (question.toLowerCase().includes('парацетамол')) {
    return "Парацетамолът е безопасно и ефективно обезболяващо средство. Препоръчваната доза за възрастни е 500-1000мг на 4-6 часа, максимум 4г дневно. Не трябва да се комбинира с алкохол и други лекарства съдържащи парацетамол.";
  }
  
  if (question.toLowerCase().includes('ибупрофен')) {
    return "Ибупрофенът е нестероидно противовъзпалително средство (НПВС). Препоръчва се прием с храна за предпазване на стомаха. Не се препоръчва при язва, бъбречни проблеми или алергия към НПВС.";
  }
  
  if (question.toLowerCase().includes('витамин')) {
    return "Витамините са важни за поддържане на здравето. Препоръчвам да се приемат според указанията на опаковката. При балансирано хранене, допълнителният прием може да не е необходим.";
  }
  
  return randomResponse + randomAdvice + " Винаги се консултирайте с медицински специалист за персонализиран съвет.";
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Здравейте! Аз съм вашият AI асистент за лекарства. Как мога да ви помогна днес?',
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = (content: string, isUser: boolean, productId?: number) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      isUser,
      timestamp: new Date(),
      productId,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const askAssistant = async (question: string, productId?: number) => {
    setIsLoading(true);
    addMessage(question, true, productId);
    
    try {
      const response = await generateAIResponse(question, productId);
      addMessage(response, false, productId);
    } catch (error) {
      addMessage('Съжалявам, възникна грешка при обработката на вашия въпрос. Моля, опитайте отново.', false);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <ChatContext.Provider value={{
      messages,
      isOpen,
      isLoading,
      addMessage,
      toggleChat,
      setIsOpen,
      askAssistant,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};