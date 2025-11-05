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
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const [user, setUser] = useState<User | null>(null);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const [models, setModels] = useState<Model[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [savedFiles, setSavedFiles] = useState<FileData[]>([]);
  const [currentSession, setCurrentSession] = useState<string>("");
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

  const handleNewChat = async () => {
    if (messages.length > 0 || savedFiles.length > 0) {
      const result = await Swal.fire({
        title: "Start New Chat?",
        text: "Current chat will be saved as a session",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, create new",
        cancelButtonText: "Cancel",
        background: "hsl(222 47% 14%)",
        color: "hsl(210 40% 98%)",
      });

      if (!result.isConfirmed) return;

      const sessionName = `Session ${new Date().toLocaleString()}`;
      try {
        const response = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            name: sessionName,
            files: savedFiles,
            messages: messages
          }),
        });

        if (response.ok) {
          setCurrentSession(sessionName);
          await loadSessions();
          toast.success("Session saved!");
        } else {
          throw new Error("Failed to save session");
        }
      } catch (error) {
        console.error("Session save error:", error);
        toast.error("Failed to save session");
      }
    }
    
    setMessages([]);
    setSavedFiles([]);
    setInput("");
    setCurrentSession("");
  };

  const handleDeleteFile = (filename: string) => {
    setSavedFiles(prev => prev.filter(f => f.filename !== filename));
    toast.success(`${filename} deleted`);
  };

  const handleSaveCode = (code: string, filename: string) => {
    setSavedFiles(prev => {
      const existing = prev.findIndex(f => f.filename === filename);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { filename, code };
        toast.success(`${filename} updated!`);
        return updated;
      }
      toast.success(`${filename} saved to project!`);
      return [...prev, { filename, code }];
    });
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
        files={savedFiles}
        onNewChat={handleNewChat}
        onDownloadSession={handleDownloadSession}
        onDeleteSession={handleDeleteSession}
        onDeleteFile={handleDeleteFile}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 sm:h-16 border-b border-border bg-card flex items-center justify-between px-3 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Code2 className="w-5 h-5 sm:w-7 sm:h-7 text-primary flex-shrink-0" />
            <h1 className="text-base sm:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent truncate">
              RcBuilder AI
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {!isMobile && (
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-[140px] sm:w-[200px] bg-background border-border">
                  <SelectValue placeholder="Model" />
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
            )}

            {!isMobile && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                <span className="text-sm font-medium">{user.username}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{user.expired}</span>
              </div>
            )}

            <Button variant="outline" size={isMobile ? "sm" : "sm"} onClick={handleLogout}>
              <LogOut className="w-4 h-4 sm:mr-2" />
              {!isMobile && <span>Logout</span>}
            </Button>
          </div>
        </header>

        <ScrollArea className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center min-h-full p-4">
              <div className="text-center max-w-md w-full">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-primary mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg shadow-primary/20">
                  <Code2 className="w-7 h-7 sm:w-10 sm:h-10 text-primary-foreground" />
                </div>
                <h2 className="text-xl sm:text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">Welcome to RcBuilder AI</h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
                  Your intelligent coding assistant powered by advanced AI
                </p>
                <div className="grid gap-2.5 text-left">
                  <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border hover:border-primary/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💬</span>
                      <div>
                        <p className="text-sm sm:text-base font-semibold mb-1">Natural Conversation</p>
                        <p className="text-xs text-muted-foreground">Chat naturally and get intelligent code suggestions</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border hover:border-primary/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">⚡</span>
                      <div>
                        <p className="text-sm sm:text-base font-semibold mb-1">Smart Code Generation</p>
                        <p className="text-xs text-muted-foreground">Automatic syntax highlighting and file detection</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border hover:border-primary/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💾</span>
                      <div>
                        <p className="text-sm sm:text-base font-semibold mb-1">Project Management</p>
                        <p className="text-xs text-muted-foreground">Save code blocks and manage sessions easily</p>
                      </div>
                    </div>
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

        <div className="border-t border-border bg-card p-2 sm:p-4 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            {isMobile && (
              <div className="mb-2">
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="w-full bg-background border-border">
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
              </div>
            )}
            <div className="flex gap-2 sm:gap-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything or describe what you want to build..."
                className="resize-none bg-background border-border text-sm sm:text-base"
                rows={isMobile ? 2 : 3}
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
                size={isMobile ? "default" : "lg"}
              >
                <Send className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
              </Button>
            </div>
            {savedFiles.length > 0 && (
              <div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                {savedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-primary/20 border border-primary/30 text-xs font-mono"
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
