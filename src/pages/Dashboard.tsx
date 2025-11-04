import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Code2, LogOut, Send, FolderOpen, Download, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState("google/gemini-2.5-flash");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [response, setResponse] = useState("");

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
    loadSessions();
  }, [navigate]);

  const loadSessions = async () => {
    try {
      const res = await fetch("/api/sessions");
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setResponse("");

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
      {/* Navbar */}
      <nav className="glass-panel border-b border-primary/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Code2 className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">RcBuilder</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold">{user.username}</p>
              <p className="text-xs text-muted-foreground">Expires: {user.expired}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-panel border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="w-6 h-6 text-primary" />
                  AI Code Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Model</label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google/gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                      <SelectItem value="google/gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                      <SelectItem value="openai/gpt-5">GPT-5</SelectItem>
                      <SelectItem value="deepseek-ai/DeepSeek-V3.1">DeepSeek V3.1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Your Prompt</label>
                  <Textarea
                    placeholder="e.g., Create a modern login page with React and Tailwind..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={6}
                    className="bg-background/50"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-gradient-primary hover:shadow-glow-primary"
                >
                  {isGenerating ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Generate Code
                    </>
                  )}
                </Button>

                {response && (
                  <div className="mt-4">
                    <label className="text-sm font-medium mb-2 block">Generated Code</label>
                    <pre className="bg-background/50 p-4 rounded-lg overflow-x-auto text-sm border border-primary/20">
                      <code>{response}</code>
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sessions Panel */}
          <div className="space-y-6">
            <Card className="glass-panel border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="w-6 h-6 text-secondary" />
                  My Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {sessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No sessions yet. Generate your first code!
                    </p>
                  ) : (
                    sessions.map((session) => (
                      <div
                        key={session.name}
                        className="glass-panel p-4 rounded-lg border border-primary/20 hover:border-primary/50 transition-all"
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
                            className="flex-1"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteSession(session.name)}
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
