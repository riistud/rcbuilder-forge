import { useState } from "react";
import { FileCode, ChevronDown, ChevronRight, Eye, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface FileData {
  filename: string;
  code: string;
}

interface FileManagerProps {
  files: FileData[];
  onDeleteFile: (filename: string) => void;
}

export const FileManager = ({ files, onDeleteFile }: FileManagerProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);

  const getLanguage = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    const langMap: { [key: string]: string } = {
      js: "javascript",
      jsx: "jsx",
      ts: "typescript",
      tsx: "tsx",
      py: "python",
      html: "html",
      css: "css",
      json: "json",
      md: "markdown",
    };
    return langMap[ext || ""] || "text";
  };

  const handleDownloadFile = (file: FileData) => {
    const blob = new Blob([file.code], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="border-t border-border">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors group"
        >
          <div className="flex items-center gap-2">
            {isExpanded ? <ChevronDown className="w-4 h-4 transition-transform" /> : <ChevronRight className="w-4 h-4 transition-transform" />}
            <FileCode className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider">Files</span>
            {files.length > 0 && (
              <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">
                {files.length}
              </span>
            )}
          </div>
        </button>

        {isExpanded && (
          <ScrollArea className="max-h-48 sm:max-h-64">
            <div className="px-3 pb-3 space-y-1.5">
              {files.length === 0 ? (
                <div className="text-center py-6">
                  <FileCode className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-muted-foreground">No files saved yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Save code blocks to see them here</p>
                </div>
              ) : (
                files.map((file, idx) => (
                  <div
                    key={idx}
                    className="group p-2 rounded-lg bg-muted/30 hover:bg-muted/60 transition-all duration-200 border border-border/30 hover:border-border/60"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono truncate font-medium">{file.filename}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {file.code.split("\n").length} lines • {(file.code.length / 1024).toFixed(1)}KB
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setSelectedFile(file)}
                          className="h-7 w-7"
                          title="View code"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDownloadFile(file)}
                          className="h-7 w-7"
                          title="Download file"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onDeleteFile(file.filename)}
                          className="h-7 w-7 hover:text-destructive"
                          title="Delete file"
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
        )}
      </div>

      <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm">{selectedFile?.filename}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 rounded-lg overflow-hidden">
            {selectedFile && (
              <SyntaxHighlighter
                language={getLanguage(selectedFile.filename)}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                }}
              >
                {selectedFile.code}
              </SyntaxHighlighter>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};