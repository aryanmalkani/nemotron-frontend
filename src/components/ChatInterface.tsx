import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
      content: "Hello! I'm your Hugging Face model testing assistant. Select a model and start chatting to test its capabilities.",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt2");
  const [isLoading, setIsLoading] = useState(false);

  const models = [
    { value: "gpt2", label: "GPT-2" },
    { value: "distilbert-base-uncased", label: "DistilBERT" },
    { value: "t5-small", label: "T5 Small" },
    { value: "microsoft/DialoGPT-medium", label: "DialoGPT" },
    { value: "facebook/blenderbot-400M-distill", label: "BlenderBot" },
  ];

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
        content: `Response from ${selectedModel}: ${currentMessage}`,
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

        {/* Model Selection */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Settings className="w-4 h-4" />
            Model Configuration
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Select Model</label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Model Info */}
        <Card className="p-4 bg-gradient-subtle">
          <h3 className="font-medium text-foreground mb-2">Current Model</h3>
          <p className="text-sm text-muted-foreground mb-3">{selectedModel}</p>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Type:</span>
              <span>Language Model</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-green-400">Ready</span>
            </div>
          </div>
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