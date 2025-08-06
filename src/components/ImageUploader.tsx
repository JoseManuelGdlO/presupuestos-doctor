import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  onImagesUploaded: (images: string[]) => void;
}

export const ImageUploader = ({ onImagesUploaded }: ImageUploaderProps) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: string[] = [];
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          newImages.push(imageUrl);
          
          if (newImages.length === files.length) {
            const updatedImages = [...uploadedImages, ...newImages];
            setUploadedImages(updatedImages);
            onImagesUploaded(updatedImages);
            toast.success(`${files.length} imagen(es) cargada(s) exitosamente`);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    const updatedImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(updatedImages);
    onImagesUploaded(updatedImages);
    toast.info("Imagen eliminada");
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-dental-light">
        <CardTitle className="text-xl font-bold text-center text-dental-pink">
          Cargar Imágenes Dentales
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-dental-pink/30 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-dental-pink mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Arrastra y suelta las imágenes aquí o haz clic para seleccionar
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <Button asChild className="bg-dental-pink hover:bg-dental-pink/90">
              <label htmlFor="file-upload" className="cursor-pointer">
                Seleccionar Imágenes
              </label>
            </Button>
          </div>

          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Imagen dental ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg border-2 border-dental-light"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};