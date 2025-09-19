import React, { createContext, useContext, useState, ReactNode } from "react";
import { ChatMessage } from "../types";

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

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content:
        "Здравейте! Аз съм вашият AI асистент за лекарства. Как мога да ви помогна днес?",
      isUser: false,
      timestamp: new Date(),
    },
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
    setMessages((prev) => [...prev, newMessage]);
  };

  const askAssistant = async (question: string, productId?: number) => {
    setIsLoading(true);
    addMessage(question, true, productId);

    try {
      const res = await fetch("/api/assistant/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, productId }),
      });

      if (!res.ok) throw new Error("Failed to contact AI service");

      const data = await res.json();

      addMessage(data.answer ?? "⚠️ AI did not return an answer.", false, productId);
    } catch (err) {
      console.error("Assistant error:", err);
      addMessage("⚠️ Error: Could not connect to assistant.", false, productId);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <ChatContext.Provider
      value={{
        messages,
        isOpen,
        isLoading,
        addMessage,
        toggleChat,
        setIsOpen,
        askAssistant,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
