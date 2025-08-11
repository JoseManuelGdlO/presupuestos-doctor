import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  accept?: string;
  maxSize?: number; // en MB
  className?: string;
}

export const ImageUploader = ({
  value,
  onChange,
  label = "Subir imagen",
  placeholder = "Selecciona una imagen",
  accept = "image/*",
  maxSize = 5, // 5MB por defecto
  className = ""
}: ImageUploaderProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor selecciona un archivo de imagen válido");
      return;
    }

    // Validar tamaño
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`El archivo es demasiado grande. Máximo ${maxSize}MB`);
      return;
    }

    setIsLoading(true);
    try {
      // Convertir a base64
      const base64 = await fileToBase64(file);
      onChange(base64);
      toast.success("Imagen cargada correctamente");
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      toast.error("Error al procesar la imagen");
    } finally {
      setIsLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]); // Solo tomar la primera imagen
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]); // Solo tomar la primera imagen
    }
    // Reset input para permitir seleccionar el mismo archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Imagen removida");
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {!value ? (
        <Card 
          className={`border-2 border-dashed cursor-pointer transition-colors ${
            isDragOver 
              ? 'border-dental-pink bg-dental-pink/5' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-gray-100 rounded-full">
                <Upload className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {isLoading ? "Procesando imagen..." : placeholder}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF hasta {maxSize}MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="relative group">
          <CardContent className="p-4">
            <div className="relative">
              <img
                src={value}
                alt="Imagen cargada"
                className="w-full h-32 object-contain rounded-lg border border-gray-200"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleRemoveImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="mt-2 flex justify-between items-center">
              <p className="text-xs text-gray-500">
                Imagen cargada correctamente
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClick}
              >
                Cambiar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};