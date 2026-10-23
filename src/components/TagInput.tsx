import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function TagInput({ value, onChange, suggestions = [], placeholder }: { value: string[]; onChange: (v: string[]) => void; suggestions?: string[]; placeholder?: string }) {
  const [text, setText] = useState("");
  const add = (t: string) => {
    const v = t.trim().slice(0, 40);
    if (!v || value.some((x) => x.toLowerCase() === v.toLowerCase()) || value.length >= 25) return;
    onChange([...value, v]);
  };
  const rest = suggestions.filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()));
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
            {t}
            <button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(value.filter((x) => x !== t))}><X className="size-3" /></button>
          </span>
        ))}
      </div>
      <Input
        value={text}
        placeholder={placeholder ?? "Type and press Enter"}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(text); setText(""); }
        }}
        onBlur={() => { if (text) { add(text); setText(""); } }}
      />
      {rest.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {rest.slice(0, 12).map((s) => (
            <button key={s} type="button" onClick={() => add(s)} className="rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground hover:border-primary hover:text-primary">+ {s}</button>
          ))}
        </div>
      )}
    </div>
  );
}
