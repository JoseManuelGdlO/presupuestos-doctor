import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

interface MultipleImageUploaderProps {
  images: string[];
  onImagesUploaded: (images: string[]) => void;
  maxImages?: number;
  maxSize?: number; // en MB
  className?: string;
  title?: string;
  description?: string;
  placeholder?: string;
}

export const MultipleImageUploader = ({
  images,
  onImagesUploaded,
  maxImages = 10,
  maxSize = 5, // 5MB por defecto
  className = "",
  title = "Imágenes del Paciente",
  description = "Arrastra y suelta las imágenes aquí o haz clic para seleccionar",
  placeholder = "Subir Imágenes del Paciente"
}: MultipleImageUploaderProps) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>(images);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar con las imágenes del padre
  useEffect(() => {
    setUploadedImages(images);
  }, [images]);

  const handleFileSelect = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Validar número máximo de imágenes
    if (uploadedImages.length + fileArray.length > maxImages) {
      toast.error(`Puedes subir máximo ${maxImages} imágenes`);
      return;
    }

    setIsLoading(true);
    const newImages: string[] = [];

    try {
      for (const file of fileArray) {
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} no es una imagen válida`);
          continue;
        }

        // Validar tamaño
        if (file.size > maxSize * 1024 * 1024) {
          toast.error(`${file.name} es demasiado grande. Máximo ${maxSize}MB`);
          continue;
        }

        // Convertir a base64
        const base64 = await fileToBase64(file);
        newImages.push(base64);
      }

      if (newImages.length > 0) {
        const updatedImages = [...uploadedImages, ...newImages];
        setUploadedImages(updatedImages);
        onImagesUploaded(updatedImages);
        toast.success(`${newImages.length} imagen(es) cargada(s) exitosamente`);
      }
    } catch (error) {
      console.error('Error al procesar las imágenes:', error);
      toast.error("Error al procesar las imágenes");
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
      handleFileSelect(files);
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
      handleFileSelect(files);
    }
    // Reset input para permitir seleccionar el mismo archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(updatedImages);
    onImagesUploaded(updatedImages);
    toast.info("Imagen eliminada");
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-500">
          {uploadedImages.length}/{maxImages} imágenes
        </p>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Área de drag & drop */}
      {uploadedImages.length < maxImages && (
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
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <Upload className="w-8 h-8 text-gray-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {isLoading ? "Procesando imágenes..." : placeholder}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  {description}
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF hasta {maxSize}MB cada una
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid de imágenes cargadas */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uploadedImages.map((image, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <div className="relative">
                  <img
                    src={image}
                                         alt={`Imagen del paciente ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-xs text-gray-500">Imagen {index + 1}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
