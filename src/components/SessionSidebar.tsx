import { useState } from "react";
import { PlusCircle, MessageSquare, Download, Trash2, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Session {
  name: string;
  created: string;
  fileCount: number;
}

interface SessionSidebarProps {
  sessions: Session[];
  onNewChat: () => void;
  onDownloadSession: (name: string) => void;
  onDeleteSession: (name: string) => void;
}

export const SessionSidebar = ({
  sessions,
  onNewChat,
  onDownloadSession,
  onDeleteSession,
}: SessionSidebarProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-card border-r border-border transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } w-64 flex flex-col`}
      >
        <div className="p-4 border-b border-border">
          <Button
            onClick={onNewChat}
            className="w-full bg-gradient-primary hover:shadow-glow-primary"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">No sessions yet</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.name}
                  className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-border/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{session.name}</p>
                      <p className="text-xs text-muted-foreground">{session.fileCount} files</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDownloadSession(session.name)}
                      className="h-7 px-2 flex-1"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteSession(session.name)}
                      className="h-7 px-2"
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
};
