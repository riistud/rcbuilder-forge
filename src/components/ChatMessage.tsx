import { CodeBlock } from "./CodeBlock";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  onSaveCode?: (code: string, filename: string) => void;
}

export const ChatMessage = ({ role, content, onSaveCode }: ChatMessageProps) => {
  const parseContent = () => {
    const codeBlockRegex = /```(\w+)?\s*(?:\[(.+?)\])?\n([\s\S]*?)```/g;
    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        const textBefore = content.substring(lastIndex, match.index);
        parts.push(
          <div key={`text-${lastIndex}`} className="whitespace-pre-wrap">
            {textBefore}
          </div>
        );
      }

      const language = match[1] || "text";
      const filename = match[2];
      const code = match[3].trim();

      parts.push(
        <CodeBlock
          key={`code-${match.index}`}
          code={code}
          language={language}
          filename={filename}
          onSave={onSaveCode}
        />
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      const textAfter = content.substring(lastIndex);
      parts.push(
        <div key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {textAfter}
        </div>
      );
    }

    return parts.length > 0 ? parts : <div className="whitespace-pre-wrap">{content}</div>;
  };

  return (
    <div className={`flex gap-4 p-6 ${role === "assistant" ? "bg-muted/30" : ""}`}>
      <div className="flex-shrink-0">
        {role === "user" ? (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold mb-2">
          {role === "user" ? "You" : "RcBuilder AI"}
        </div>
        <div className="text-sm text-foreground/90">{parseContent()}</div>
      </div>
    </div>
  );
};
