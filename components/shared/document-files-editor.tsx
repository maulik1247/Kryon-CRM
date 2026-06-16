"use client";

import { Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DocumentFileIcon,
  getDocumentFileTypeLabel,
} from "@/components/shared/document-file-icon";
import type { RegistrationDocument } from "@/lib/types";

interface DocumentFilesEditorProps {
  value: RegistrationDocument[];
  onChange: (value: RegistrationDocument[]) => void;
  description?: string;
  label?: string;
  inputId?: string;
  accept?: string;
  multiple?: boolean;
  helperText?: string;
  emptyMessage?: string;
}

export function DocumentFilesEditor({
  value,
  onChange,
  description,
  label = "Documents",
  inputId = "document-files",
  accept = ".pdf,.doc,.docx,.jpg,.jpeg",
  multiple = true,
  helperText = "PDF, DOC, JPG",
  emptyMessage = "No documents uploaded yet.",
}: DocumentFilesEditorProps) {
  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const accepted = files.filter((file) =>
      /\.(pdf|doc|docx|jpg|jpeg|png)$/i.test(file.name)
    );

    const nextFiles = accepted.map((file) => ({
      id: `doc-${Date.now()}-${file.name}`,
      name: file.name,
      size: file.size,
    }));

    onChange(multiple ? [...value, ...nextFiles] : nextFiles.slice(0, 1));
    event.target.value = "";
  };

  const removeDocument = (id: string) => {
    onChange(value.filter((doc) => doc.id !== id));
  };

  return (
    <div className="space-y-3">
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor={inputId}>{label}</Label>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <label htmlFor={inputId} className="cursor-pointer">
              <Upload className="h-4 w-4" />
              {multiple ? "Upload files" : "Upload file"}
            </label>
          </Button>
          <Input
            id={inputId}
            type="file"
            accept={accept}
            multiple={multiple}
            className="hidden"
            onChange={handleFilesChange}
          />
          {helperText ? (
            <span className="text-xs text-muted-foreground">{helperText}</span>
          ) : null}
        </div>
      </div>

      {value.length === 0 ? (
        <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <ul className="space-y-2">
          {value.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm"
            >
              <DocumentFileIcon filename={doc.name} className="h-5 w-5" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium leading-snug">{doc.name}</p>
                <p className="text-xs text-muted-foreground">
                  {getDocumentFileTypeLabel(doc.name)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeDocument(doc.id)}
                aria-label={`Remove ${doc.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
