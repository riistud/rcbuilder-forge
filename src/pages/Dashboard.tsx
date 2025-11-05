import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Code2, LogOut, Send, FolderOpen, Download, Trash2, MessageSquare, FileCode, Eye, Save, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Swal from "sweetalert2";

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

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const [models, setModels] = useState<Model[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [response, setResponse] = useState("");
  const [mode, setMode] = useState<"chat" | "code">("code");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [showPreview, setShowPreview] = useState(false);

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

  const handleChat = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a message");
      return;
    }

    const userMessage: Message = { role: "user", content: prompt };
    setChatMessages(prev => [...prev, userMessage]);
    setPrompt("");
    setIsGenerating(true);

    try {
      const messages = [...chatMessages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, model: selectedModel }),
      });

      const data = await res.json();

      if (res.ok) {
        const assistantMessage: Message = { role: "assistant", content: data.response };
        setChatMessages(prev => [...prev, assistantMessage]);
      } else {
        toast.error(data.error || "Chat failed");
      }
    } catch (error) {
      toast.error("Connection error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setResponse("");
    setShowPreview(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          model: selectedModel,
          username: user?.username,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(data.response);
        toast.success("Code generated successfully!");
        loadSessions();
      } else {
        toast.error(data.error || "Generation failed");
      }
    } catch (error) {
      toast.error("Connection error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveProject = async () => {
    if (!response) return;

    const result = await Swal.fire({
      title: "Save Project",
      input: "text",
      inputLabel: "Project Name",
      inputPlaceholder: "my-awesome-project",
      showCancelButton: true,
      background: "hsl(220 20% 12%)",
      color: "hsl(210 100% 98%)",
    });

    if (result.isConfirmed && result.value) {
      toast.success(`Project "${result.value}" saved!`);
      setResponse("");
      setPrompt("");
      loadSessions();
    }
  };

  const handleCancelCode = () => {
    setResponse("");
    setPrompt("");
    setShowPreview(false);
  };

  const isHTMLCode = (code: string) => {
    return code.includes("<html") || (code.includes("<style") && code.includes("<script"));
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
    <div className="min-h-screen bg-gradient-hero">
      <nav className="glass-panel border-b border-primary/20 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Code2 className="w-8 h-8 text-primary animate-glow-pulse" />
            <span className="text-2xl font-bold gradient-text">RcBuilder</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="glass-panel px-4 py-2 rounded-full">
              <p className="text-sm font-semibold">{user.username}</p>
              <p className="text-xs text-muted-foreground">Expires: {user.expired}</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="hover:scale-105 transition-transform">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card border-primary/30 shadow-elevation-high">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary animate-pulse-slow" />
                    AI Workspace
                  </CardTitle>
                  <Tabs value={mode} onValueChange={(v) => setMode(v as "chat" | "code")} className="w-auto">
                    <TabsList className="glass-panel">
                      <TabsTrigger value="chat" className="data-[state=active]:bg-primary/20">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Chat
                      </TabsTrigger>
                      <TabsTrigger value="code" className="data-[state=active]:bg-primary/20">
                        <FileCode className="w-4 h-4 mr-2" />
                        Code Gen
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Model</label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="bg-background/50 border-primary/30 hover:border-primary/50 transition-colors">
                      <SelectValue placeholder="Choose AI Model" />
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
                          No models available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {mode === "chat" && chatMessages.length > 0 && (
                  <div className="glass-panel p-4 rounded-lg max-h-[400px] overflow-y-auto space-y-3 border border-primary/20">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg ${
                          msg.role === "user"
                            ? "bg-primary/20 ml-auto max-w-[80%]"
                            : "bg-secondary/20 mr-auto max-w-[80%]"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {mode === "chat" ? "Your Message" : "Your Prompt"}
                  </label>
                  <Textarea
                    placeholder={
                      mode === "chat"
                        ? "Ask me anything..."
                        : "e.g., Create a modern login page with React and Tailwind..."
                    }
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={6}
                    className="bg-background/50 border-primary/30 focus:border-primary/50 transition-colors"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.ctrlKey) {
                        mode === "chat" ? handleChat() : handleGenerate();
                      }
                    }}
                  />
                </div>

                <Button
                  onClick={mode === "chat" ? handleChat : handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-gradient-primary hover:shadow-glow-primary transition-all hover:scale-105"
                >
                  {isGenerating ? (
                    <><Sparkles className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {mode === "chat" ? "Send Message" : "Generate Code"}
                    </>
                  )}
                </Button>

                {response && mode === "code" && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-primary" />
                        Generated Code
                      </label>
                      <div className="flex gap-2">
                        {isHTMLCode(response) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowPreview(!showPreview)}
                            className="hover:scale-105 transition-transform"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {showPreview ? "Hide" : "Preview"}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="default"
                          onClick={handleSaveProject}
                          className="bg-gradient-secondary hover:shadow-glow-card transition-all"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Project
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={handleCancelCode}
                          className="hover:scale-105 transition-transform"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>

                    <div className="glass-panel p-6 rounded-lg border border-primary/30 overflow-hidden">
                      <pre className="overflow-x-auto text-sm">
                        <code className="text-primary">{response}</code>
                      </pre>
                    </div>

                    {showPreview && isHTMLCode(response) && (
                      <div className="glass-panel p-6 rounded-lg border border-secondary/30">
                        <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                          <Eye className="w-4 h-4 text-secondary" />
                          Live Preview
                        </label>
                        <iframe
                          srcDoc={response}
                          className="w-full h-[500px] bg-background rounded-lg border border-primary/20"
                          title="Code Preview"
                          sandbox="allow-scripts"
                        />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="glass-card border-primary/30 shadow-elevation-high">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="w-6 h-6 text-secondary animate-pulse-slow" />
                  My Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {sessions.length === 0 ? (
                    <div className="text-center py-12">
                      <FileCode className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-sm text-muted-foreground">
                        No sessions yet. Generate your first code!
                      </p>
                    </div>
                  ) : (
                    sessions.map((session) => (
                      <div
                        key={session.name}
                        className="glass-panel p-4 rounded-lg border border-primary/20 hover:border-primary/50 transition-all hover:shadow-glow-card hover:scale-105"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-sm">{session.name}</p>
                            <p className="text-xs text-muted-foreground">{session.fileCount} files</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadSession(session.name)}
                            className="flex-1 hover:scale-105 transition-transform"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteSession(session.name)}
                            className="hover:scale-110 transition-transform"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
