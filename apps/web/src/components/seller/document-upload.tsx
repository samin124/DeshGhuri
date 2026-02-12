import * as React from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DocumentUploadProps {
  label: string;
  description?: string;
  accept?: string;
  maxSize?: number; // in MB
  value?: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  required?: boolean;
  className?: string;
}

export function DocumentUpload({
  label,
  description,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSize = 25,
  value,
  onChange,
  error,
  required = false,
  className,
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [preview, setPreview] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (value && value.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(value);
    } else {
      setPreview(null);
    }
  }, [value]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      onChange(null);
      return;
    }

    // Validate file type
    const acceptedTypes = accept.split(',').map((t) => t.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;

    const isValidType = acceptedTypes.some(
      (type) =>
        type === fileExtension ||
        (type.startsWith('.') && fileExtension === type) ||
        (!type.startsWith('.') && mimeType.match(type.replace('*', '.*')))
    );

    if (!isValidType) {
      onChange(null);
      return;
    }

    onChange(file);
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium leading-none">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
      />

      {!value ? (
        <Card
          className={cn(
            'relative border-2 border-dashed p-6 transition-colors cursor-pointer hover:border-primary/50',
            isDragging && 'border-primary bg-primary/5',
            error && 'border-red-500'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="rounded-full bg-muted p-3">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Drop your file here or <span className="text-primary">browse</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Supported formats: {accept.replace(/\./g, '').toUpperCase().split(',').join(', ')}
              </p>
              <p className="text-xs text-muted-foreground">Maximum size: {maxSize}MB</p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4">
          <div className="flex items-start gap-3">
            {preview ? (
              <img src={preview} alt="Preview" className="h-16 w-16 rounded-md object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{value.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(value.size)}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-3 w-3" />
                <span>File ready to upload</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {error && (
        <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
