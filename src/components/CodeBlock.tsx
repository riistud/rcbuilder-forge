import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
  onSave?: (code: string, filename: string) => void;
}

export const CodeBlock = ({ code, language, filename, onSave }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (onSave && filename) {
      onSave(code, filename);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "code.txt";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-card my-4">
      {filename && (
        <div className="flex items-center justify-between px-3 py-2 bg-muted border-b border-border">
          <span className="text-xs sm:text-sm font-mono text-muted-foreground truncate">{filename}</span>
        </div>
      )}
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "0.75rem",
          background: "hsl(var(--card))",
          fontSize: "0.75rem",
        }}
        showLineNumbers
      >
        {code}
      </SyntaxHighlighter>
      <div className="flex items-center justify-end gap-2 px-3 py-2 bg-muted border-t border-border">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          className="h-8 px-3 text-xs"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 mr-1.5" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 mr-1.5" />
              <span>Copy</span>
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDownload}
          className="h-8 px-3 text-xs"
        >
          <Save className="w-3 h-3 mr-1.5" />
          <span>Download</span>
        </Button>
        {onSave && filename && (
          <Button
            size="sm"
            variant="default"
            onClick={handleSave}
            className="h-8 px-3 text-xs bg-primary hover:bg-primary/90"
          >
            <Save className="w-3 h-3 mr-1.5" />
            <span>Save to Project</span>
          </Button>
        )}
      </div>
    </div>
  );
};
