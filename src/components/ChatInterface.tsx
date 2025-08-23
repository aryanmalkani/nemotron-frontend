import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, Settings, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm ready to help you test the Mistral-7B-Instruct-v0.2 model. Start chatting to see how it responds!",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedModel] = useState("Mistral-7B-Instruct-v0.2");
  const [isLoading, setIsLoading] = useState(false);


  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      role: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    // Simulate API call - replace with actual Hugging Face API integration
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Response from Mistral-7B-Instruct-v0.2: This is a simulated response. Connect to Supabase to integrate with the actual Hugging Face API and save chat history.`,
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-chat-background">
      {/* Sidebar */}
      <div className="w-80 bg-chat-sidebar border-r border-border p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">HF Model Tester</h1>
            <p className="text-sm text-muted-foreground">Test Hugging Face models</p>
          </div>
        </div>

        {/* Model Info */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Settings className="w-4 h-4" />
            Current Model
          </div>
        </div>

        <Card className="p-4 bg-gradient-subtle">
          <h3 className="font-medium text-foreground mb-2">Mistral-7B-Instruct-v0.2</h3>
          <p className="text-sm text-muted-foreground mb-3">Instruction-tuned language model</p>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Type:</span>
              <span>Chat Model</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-green-400">Ready</span>
            </div>
            <div className="flex justify-between">
              <span>Parameters:</span>
              <span>7B</span>
            </div>
          </div>
        </Card>

        {/* History Feature Info */}
        <Card className="p-4 bg-muted/20 border-dashed">
          <h3 className="font-medium text-foreground mb-2">💾 Save Chat History</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Connect to Supabase to save and manage your chat conversations.
          </p>
          <Button variant="outline" size="sm" className="w-full" disabled>
            Connect Supabase First
          </Button>
        </Card>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 max-w-[80%]",
                message.role === "user" ? "ml-auto" : "mr-auto"
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
                    ? "bg-message-user text-message-user-foreground ml-2"
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
          <div className="flex gap-3">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message to test the model..."
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
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;