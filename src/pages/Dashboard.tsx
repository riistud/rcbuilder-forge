import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Code2, LogOut, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { ChatMessage } from "@/components/ChatMessage";
import { SessionSidebar } from "@/components/SessionSidebar";

interface User {
  username: string;
  role: string;
  expired: string;
}

interface Session {
  name: string;
  created: string;
  fileCount: number;
}

interface Model {
  name: string;
  id: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface FileData {
  filename: string;
  code: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const [models, setModels] = useState<Model[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [savedFiles, setSavedFiles] = useState<FileData[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role === "admin") {
      navigate("/admin");
      return;
    }
    
    setUser(parsedUser);
    loadModels();
    loadSessions();
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadModels = async () => {
    try {
      const res = await fetch("/api/admin/models");
      const data = await res.json();
      if (data.models && data.models.length > 0) {
        setModels(data.models);
        if (!selectedModel) {
          setSelectedModel(data.models[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load models:", error);
      toast.error("Failed to load AI models");
    }
  };

  const loadSessions = async () => {
    try {
      const res = await fetch("/api/sessions");
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) {
      toast.error("Please enter a message");
      return;
    }

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);

    try {
      const conversationMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationMessages, model: selectedModel }),
      });

      const data = await res.json();

      if (res.ok) {
        const assistantMessage: Message = { role: "assistant", content: data.response };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        toast.error(data.error || "Failed to get response");
      }
    } catch (error) {
      toast.error("Connection error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setSavedFiles([]);
    setInput("");
  };

  const handleSaveCode = async (code: string, filename: string) => {
    const result = await Swal.fire({
      title: "Save Code",
      text: `Save ${filename} to project?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Save",
      background: "hsl(222 47% 14%)",
      color: "hsl(210 40% 98%)",
    });

    if (result.isConfirmed) {
      setSavedFiles(prev => {
        const existing = prev.findIndex(f => f.filename === filename);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { filename, code };
          return updated;
        }
        return [...prev, { filename, code }];
      });
      toast.success(`${filename} saved to project!`);
    }
  };

  const handleDownloadSession = async (sessionName: string) => {
    try {
      const res = await fetch(`/api/sessions/${sessionName}/download`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sessionName}.zip`;
      a.click();
      toast.success("Session downloaded!");
    } catch (error) {
      toast.error("Download failed");
    }
  };

  const handleDeleteSession = async (sessionName: string) => {
    const result = await Swal.fire({
      title: "Delete Session?",
      text: `Are you sure you want to delete ${sessionName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      background: "hsl(220 20% 12%)",
      color: "hsl(210 100% 98%)",
    });

    if (result.isConfirmed) {
      try {
        await fetch(`/api/sessions/${sessionName}`, { method: "DELETE" });
        toast.success("Session deleted!");
        loadSessions();
      } catch (error) {
        toast.error("Delete failed");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
    toast.info("Logged out successfully");
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <SessionSidebar
        sessions={sessions}
        onNewChat={handleNewChat}
        onDownloadSession={handleDownloadSession}
        onDeleteSession={handleDeleteSession}
      />

      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Code2 className="w-7 h-7 text-primary" />
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              RcBuilder AI
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[200px] bg-background border-border">
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent>
                {models.length > 0 ? (
                  models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No models
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
              <span className="text-sm font-medium">{user.username}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{user.expired}</span>
            </div>

            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        <ScrollArea className="flex-1">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md px-6">
                <div className="w-16 h-16 rounded-full bg-gradient-primary mx-auto mb-4 flex items-center justify-center">
                  <Code2 className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Welcome to RcBuilder AI</h2>
                <p className="text-muted-foreground mb-6">
                  Your intelligent coding assistant. Chat naturally and I'll help you build anything.
                </p>
                <div className="grid gap-2 text-left">
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm">💬 Natural conversation about code</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm">⚡ Automatic code generation with syntax highlighting</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm">💾 Save code blocks directly to your project</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {messages.map((msg, idx) => (
                <ChatMessage
                  key={idx}
                  role={msg.role}
                  content={msg.content}
                  onSaveCode={handleSaveCode}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-border bg-card p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything or describe what you want to build..."
                className="resize-none bg-background border-border"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button
                onClick={handleSend}
                disabled={isGenerating || !input.trim()}
                className="bg-gradient-primary hover:shadow-glow-primary self-end"
                size="lg"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            {savedFiles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {savedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-xs font-mono"
                  >
                    {file.filename}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
