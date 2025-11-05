import { useState } from "react";
import { MessageSquarePlus, Download, Trash2, Menu, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileManager } from "@/components/FileManager";
import { useIsMobile } from "@/hooks/use-mobile";

interface Session {
  name: string;
  created: string;
  fileCount: number;
}

interface FileData {
  filename: string;
  code: string;
}

interface SessionSidebarProps {
  sessions: Session[];
  files: FileData[];
  onNewChat: () => void;
  onDownloadSession: (name: string) => void;
  onDeleteSession: (name: string) => void;
  onDeleteFile: (filename: string) => void;
}

export const SessionSidebar = ({
  sessions,
  files,
  onNewChat,
  onDownloadSession,
  onDeleteSession,
  onDeleteFile,
}: SessionSidebarProps) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);

  return (
    <>
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="fixed top-3 left-3 z-50 bg-card border border-border shadow-lg"
        >
          <Menu className="w-4 h-4" />
        </Button>
      )}

      <div
        className={`
          ${isMobile ? "fixed inset-y-0 left-0 z-50" : "relative"}
          ${isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"}
          w-64 sm:w-72 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out
        `}
      >
        {isMobile && (
          <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
            <h2 className="font-semibold text-sm">Menu</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="p-3 border-b border-border">
          <Button onClick={onNewChat} className="w-full bg-gradient-primary hover:shadow-glow-primary text-sm">
            <MessageSquarePlus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sessions</h3>
            </div>
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquarePlus className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-xs text-muted-foreground">No sessions yet</p>
                <p className="text-xs text-muted-foreground mt-1">Start chatting to create one</p>
              </div>
            ) : (
              sessions.map((session, idx) => (
                <div
                  key={idx}
                  className="group p-2.5 rounded-lg bg-muted/30 hover:bg-muted/60 transition-all duration-200 border border-border/30 hover:border-border/60"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{session.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{session.created}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-muted-foreground">{session.fileCount} files</span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDownloadSession(session.name)}
                        className="h-7 w-7"
                        title="Download session"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDeleteSession(session.name)}
                        className="h-7 w-7 hover:text-destructive"
                        title="Delete session"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <FileManager files={files} onDeleteFile={onDeleteFile} />
      </div>

      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
