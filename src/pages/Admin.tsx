import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Code2, LogOut, Users, Cpu, Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Swal from "sweetalert2";

interface User {
  username: string;
  role: string;
  expired: string;
}

interface Model {
  name: string;
  id: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [models, setModels] = useState<Model[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    setAdmin(parsedUser);
    loadUsers();
    loadModels();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Failed to load users");
    }
  };

  const loadModels = async () => {
    try {
      const res = await fetch("/api/admin/models");
      const data = await res.json();
      setModels(data.models || []);
    } catch (error) {
      console.error("Failed to load models");
    }
  };

  const handleCreateUser = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Create New User",
      html: `
        <input id="swal-username" class="swal2-input" placeholder="Username">
        <input id="swal-password" type="password" class="swal2-input" placeholder="Password">
        <input id="swal-expired" class="swal2-input" placeholder="Expiry Date (e.g., 2025-12-31)">
      `,
      focusConfirm: false,
      showCancelButton: true,
      background: "hsl(220 20% 12%)",
      color: "hsl(210 100% 98%)",
      preConfirm: () => {
        const username = (document.getElementById("swal-username") as HTMLInputElement).value;
        const password = (document.getElementById("swal-password") as HTMLInputElement).value;
        const expired = (document.getElementById("swal-expired") as HTMLInputElement).value;
        
        if (!username || !password || !expired) {
          Swal.showValidationMessage("All fields are required");
          return null;
        }
        
        return { username, password, expired };
      },
    });

    if (formValues) {
      try {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formValues),
        });

        if (res.ok) {
          toast.success("User created successfully!");
          loadUsers();
        } else {
          toast.error("Failed to create user");
        }
      } catch (error) {
        toast.error("Connection error");
      }
    }
  };

  const handleDeleteUser = async (username: string) => {
    const result = await Swal.fire({
      title: "Delete User?",
      text: `Remove ${username} from the system?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      background: "hsl(220 20% 12%)",
      color: "hsl(210 100% 98%)",
    });

    if (result.isConfirmed) {
      try {
        await fetch(`/api/admin/users/${username}`, { method: "DELETE" });
        toast.success("User deleted!");
        loadUsers();
      } catch (error) {
        toast.error("Delete failed");
      }
    }
  };

  const handleAddModel = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Add New Model",
      html: `
        <input id="swal-model-name" class="swal2-input" placeholder="Model Name (e.g., GPT-5)">
        <input id="swal-model-id" class="swal2-input" placeholder="Model ID (e.g., openai/gpt-5)">
      `,
      focusConfirm: false,
      showCancelButton: true,
      background: "hsl(220 20% 12%)",
      color: "hsl(210 100% 98%)",
      preConfirm: () => {
        const name = (document.getElementById("swal-model-name") as HTMLInputElement).value;
        const id = (document.getElementById("swal-model-id") as HTMLInputElement).value;
        
        if (!name || !id) {
          Swal.showValidationMessage("Both fields are required");
          return null;
        }
        
        return { name, id };
      },
    });

    if (formValues) {
      try {
        const res = await fetch("/api/admin/models", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formValues),
        });

        if (res.ok) {
          toast.success("Model added successfully!");
          loadModels();
        } else {
          toast.error("Failed to add model");
        }
      } catch (error) {
        toast.error("Connection error");
      }
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    const result = await Swal.fire({
      title: "Delete Model?",
      text: `Remove this model from the system?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      background: "hsl(220 20% 12%)",
      color: "hsl(210 100% 98%)",
    });

    if (result.isConfirmed) {
      try {
        await fetch(`/api/admin/models/${encodeURIComponent(modelId)}`, { method: "DELETE" });
        toast.success("Model deleted!");
        loadModels();
      } catch (error) {
        toast.error("Delete failed");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Navbar */}
      <nav className="glass-panel border-b border-primary/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Code2 className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">RcBuilder Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold">{admin.username}</p>
              <p className="text-xs text-accent">Administrator</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="glass-panel">
            <TabsTrigger value="users" className="data-[state=active]:bg-primary/20">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="models" className="data-[state=active]:bg-primary/20">
              <Cpu className="w-4 h-4 mr-2" />
              Models
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="glass-panel border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  User Management
                </CardTitle>
                <Button onClick={handleCreateUser} className="bg-gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create User
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.username}
                      className="glass-panel p-4 rounded-lg border border-primary/20 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold">{user.username}</p>
                        <p className="text-sm text-muted-foreground">
                          Role: {user.role} | Expires: {user.expired}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.username)}
                        disabled={user.role === "admin"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Models Tab */}
          <TabsContent value="models">
            <Card className="glass-panel border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-6 h-6 text-secondary" />
                  AI Models
                </CardTitle>
                <Button onClick={handleAddModel} className="bg-gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Model
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {models.map((model) => (
                    <div
                      key={model.id}
                      className="glass-panel p-4 rounded-lg border border-primary/20"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{model.name}</p>
                          <p className="text-xs text-muted-foreground">{model.id}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteModel(model.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
