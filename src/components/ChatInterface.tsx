import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot, User, Settings, Loader2, Save, Database, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import ChatHistory from "./ChatHistory";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
  messages: Message[];
}

const ChatInterface = () => {
  const { toast } = useToast();
  
  // Current conversation state
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedModel] = useState("Mistral-7B-Instruct-v0.2");
  const [isLoading, setIsLoading] = useState(false);
  
  // History management
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>();
  const [isConnected, setIsConnected] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome",
        content: "Hello! I'm ready to help you test the Mistral-7B-Instruct-v0.2 model. Your conversations can be saved to your local database.",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Simulate API connection check
  useEffect(() => {
    const checkConnection = () => {
      // Simulate connection check to your local API
      setIsConnected(Math.random() > 0.2); // 80% connection rate for demo
    };
    
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const generateConversationTitle = (firstMessage: string) => {
    const words = firstMessage.split(' ').slice(0, 6);
    return words.join(' ') + (words.length < firstMessage.split(' ').length ? '...' : '');
  };

  const saveConversation = async (conversationData: Conversation) => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conversationData),
      });
      
      if (response.ok) {
        toast({
          title: "Conversation saved",
          description: "Your chat has been saved to the database.",
        });
        return true;
      }
    } catch (error) {
      console.error('Failed to save conversation:', error);
      toast({
        title: "Save failed",
        description: "Could not save to database. Check your connection.",
        variant: "destructive",
      });
    }
    return false;
  };

  const loadConversations = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      role: "user",
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setCurrentMessage("");
    setIsLoading(true);

    // Create or update conversation
    if (!currentConversationId) {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: generateConversationTitle(currentMessage),
        lastMessage: currentMessage,
        timestamp: new Date(),
        messageCount: 1,
        messages: updatedMessages,
      };
      setCurrentConversationId(newConversation.id);
      setConversations(prev => [newConversation, ...prev]);
    }

    // Simulate API call to your local Mistral endpoint
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          message: currentMessage,
          conversation_id: currentConversationId,
        }),
      });

      let assistantResponse = "I'm a demo response. Connect me to your local Mistral API endpoint to get real responses.";
      
      if (response.ok) {
        const data = await response.json();
        assistantResponse = data.response || data.message || assistantResponse;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: assistantResponse,
        role: "assistant",
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Auto-save if enabled
      if (autoSave && currentConversationId) {
        const updatedConversation = conversations.find(c => c.id === currentConversationId);
        if (updatedConversation) {
          updatedConversation.messages = finalMessages;
          updatedConversation.lastMessage = assistantResponse;
          updatedConversation.messageCount = finalMessages.length;
          updatedConversation.timestamp = new Date();
          
          await saveConversation(updatedConversation);
        }
      }

    } catch (error) {
      console.error('Chat API error:', error);
      toast({
        title: "API Error",
        description: "Failed to get response from Mistral API. Check your local server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(undefined);
    setCurrentMessage("");
  };

  const handleSelectConversation = (id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setMessages(conversation.messages);
      setCurrentConversationId(id);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      // Replace with your actual API endpoint
      await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
      setConversations(prev => prev.filter(c => c.id !== id));
      
      if (currentConversationId === id) {
        handleNewConversation();
      }
      
      toast({
        title: "Conversation deleted",
        description: "The conversation has been removed from your history.",
      });
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleExportHistory = () => {
    const exportData = {
      conversations,
      exportDate: new Date().toISOString(),
      model: selectedModel,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mistral-chat-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "History exported",
      description: "Your chat history has been downloaded as JSON.",
    });
  };

  const handleImportHistory = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (data.conversations && Array.isArray(data.conversations)) {
        setConversations(data.conversations);
        toast({
          title: "History imported",
          description: `Imported ${data.conversations.length} conversations.`,
        });
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Invalid file format. Please select a valid JSON export.",
        variant: "destructive",
      });
    }
  };

  const handleManualSave = async () => {
    if (currentConversationId) {
      const conversation = conversations.find(c => c.id === currentConversationId);
      if (conversation) {
        conversation.messages = messages;
        await saveConversation(conversation);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
  }, []);

  return (
    <div className="flex h-screen bg-chat-background">
      {/* Chat History Sidebar */}
      <ChatHistory
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onExportHistory={handleExportHistory}
        onImportHistory={handleImportHistory}
      />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 max-w-[80%]",
                message.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              
              <div
                className={cn(
                  "px-4 py-3 rounded-2xl",
                  message.role === "user"
                    ? "bg-message-user text-message-user-foreground"
                    : "bg-message-assistant text-message-assistant-foreground"
                )}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 max-w-[80%] mr-auto">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="bg-message-assistant text-message-assistant-foreground px-4 py-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-6">
          <div className="flex gap-3 mb-3">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message to test Mistral-7B..."
              className="flex-1 bg-background border-border"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || isLoading}
              className="bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Press Enter to send, Shift+Enter for new line</span>
            {currentConversationId && (
              <span className="text-primary">
                Conversation ID: {currentConversationId.slice(-8)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;