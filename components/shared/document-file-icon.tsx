import { File, FileImage, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

function getFileExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

interface DocumentFileIconProps {
  filename: string;
  className?: string;
}

export function DocumentFileIcon({
  filename,
  className,
}: DocumentFileIconProps) {
  const extension = getFileExtension(filename);

  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
    return (
      <FileImage
        className={cn("h-4 w-4 shrink-0 text-emerald-600", className)}
        aria-hidden
      />
    );
  }

  if (extension === "pdf") {
    return (
      <FileText
        className={cn("h-4 w-4 shrink-0 text-red-600", className)}
        aria-hidden
      />
    );
  }

  if (["doc", "docx"].includes(extension)) {
    return (
      <FileText
        className={cn("h-4 w-4 shrink-0 text-blue-600", className)}
        aria-hidden
      />
    );
  }

  return (
    <File
      className={cn("h-4 w-4 shrink-0 text-muted-foreground", className)}
      aria-hidden
    />
  );
}

export function getDocumentFileTypeLabel(filename: string) {
  const extension = getFileExtension(filename);
  if (!extension) return "File";
  return extension.toUpperCase();
}
