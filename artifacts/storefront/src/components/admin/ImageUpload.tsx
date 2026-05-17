import { useRef, useState } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

async function uploadImageFile(file: File): Promise<string> {
  const res = await fetch("/api/storage/uploads/request-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
  });
  if (!res.ok) throw new Error("Failed to get upload URL");
  const { uploadURL, objectPath } = await res.json();
  const uploadRes = await fetch(uploadURL, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!uploadRes.ok) throw new Error("Upload failed");
  return `/api/storage${objectPath}`;
}

interface MultiImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
  maxImages?: number;
}

export function MultiImageUpload({ images, onChange, label = "Images", maxImages }: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setProgress(0);
    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadImageFile(files[i]);
        newUrls.push(url);
        setProgress(Math.round(((i + 1) / files.length) * 100));
      } catch {
        toast.error(`Failed to upload ${files[i].name}`);
      }
    }
    if (newUrls.length > 0) {
      onChange([...images, ...newUrls]);
      toast.success(`${newUrls.length} image${newUrls.length > 1 ? "s" : ""} uploaded`);
    }
    setUploading(false);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const remove = (index: number) => onChange(images.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      {label && <p className="text-sm font-semibold">{label}</p>}
      <div
        className={cn(
          "border-2 border-dashed rounded-2xl p-5 text-center transition-all",
          uploading ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-primary/50 hover:bg-primary/3"
        )}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); if (!uploading) handleFiles(e.dataTransfer.files); }}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} disabled={uploading} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Uploading… {progress}%</p>
            <div className="w-full max-w-xs h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <>
            <Upload className="h-7 w-7 text-muted-foreground/40 mx-auto mb-1.5" />
            <p className="text-sm font-medium">Click or drag to upload</p>
            <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WebP — multiple allowed</p>
          </>
        )}
      </div>
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-muted border hover:border-primary/40 transition-all">
              <img src={img} alt="" className="w-full h-full object-cover" />
              {i === 0 && <Badge className="absolute top-1 left-1 text-[9px] px-1 py-0 bg-primary/90 text-white">Main</Badge>}
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 bg-destructive/90 text-white rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface SingleImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspectClass?: string;
  placeholder?: string;
}

export function SingleImageUpload({ value, onChange, label = "Image", aspectClass = "aspect-video", placeholder = "Banner image" }: SingleImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setProgress(0);
    try {
      const url = await uploadImageFile(file);
      onChange(url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed");
    }
    setUploading(false);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFiles = (files: FileList | null) => {
    if (files && files[0]) handleFile(files[0]);
  };

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-semibold">{label}</p>}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-2xl overflow-hidden transition-all",
          aspectClass,
          uploading ? "cursor-not-allowed" : "cursor-pointer hover:border-primary/50"
        )}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); if (!uploading) handleFiles(e.dataTransfer.files); }}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFiles(e.target.files)} disabled={uploading} />
        {value ? (
          <>
            <img src={value} alt={placeholder} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-white text-center">
                <Upload className="h-6 w-6 mx-auto mb-1" />
                <p className="text-xs font-medium">Click to replace</p>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground/50 min-h-[120px]">
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Uploading… {progress}%</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8" />
                <p className="text-sm">{placeholder}</p>
                <p className="text-xs">Click or drag to upload</p>
              </>
            )}
          </div>
        )}
        {uploading && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
        {value && !uploading && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onChange(""); }}
            className="absolute top-2 right-2 bg-destructive/90 text-white rounded-full h-6 w-6 flex items-center justify-center shadow-lg hover:bg-destructive"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
