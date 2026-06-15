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

interface CustomerDocumentsEditorProps {
  value: RegistrationDocument[];
  onChange: (value: RegistrationDocument[]) => void;
  description?: string;
}

export function CustomerDocumentsEditor({
  value,
  onChange,
  description = "Vendor registration and compliance files.",
}: CustomerDocumentsEditorProps) {
  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const accepted = files.filter((file) =>
      /\.(pdf|doc|docx|jpg|jpeg)$/i.test(file.name)
    );

    onChange([
      ...value,
      ...accepted.map((file) => ({
        id: `doc-${Date.now()}-${file.name}`,
        name: file.name,
        size: file.size,
      })),
    ]);

    event.target.value = "";
  };

  const removeDocument = (id: string) => {
    onChange(value.filter((doc) => doc.id !== id));
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{description}</p>

      <div className="space-y-2">
        <Label htmlFor="registrationDocuments">Documents</Label>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <label htmlFor="registrationDocuments" className="cursor-pointer">
              <Upload className="h-4 w-4" />
              Upload files
            </label>
          </Button>
          <Input
            id="registrationDocuments"
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg"
            multiple
            className="hidden"
            onChange={handleFilesChange}
          />
          <span className="text-xs text-muted-foreground">
            PDF, DOC, JPG
          </span>
        </div>
      </div>

      {value.length === 0 ? (
        <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          No documents uploaded yet.
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
