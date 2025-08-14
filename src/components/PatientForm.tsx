import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MultipleImageUploader } from "@/components/MultipleImageUploader";

interface PatientData {
  name: string;
  age: string;
  date: string;
  notes: string;
  xrayImages: string[];
}

interface PatientFormProps {
  onSubmit: (data: PatientData) => void;
}

export const PatientForm = ({ onSubmit }: PatientFormProps) => {
  const [formData, setFormData] = useState<PatientData>({
    name: "",
    age: "",
    date: new Date().toISOString().split('T')[0],
    notes: "",
    xrayImages: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof PatientData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleXrayImagesChange = (images: string[]) => {
    console.log('Imágenes de rayos X actualizadas:', images);
    setFormData(prev => ({ ...prev, xrayImages: images }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-primary text-primary-foreground">
        <CardTitle className="text-xl font-bold text-center">
          Datos del Paciente
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Paciente</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ingrese el nombre completo"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Edad</Label>
              <Input
                id="age"
                value={formData.age}
                onChange={(e) => handleChange("age", e.target.value)}
                placeholder="Edad del paciente"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notas Adicionales</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Observaciones, alergias, etc."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Imágenes de Rayos X (Opcional)</Label>
            <MultipleImageUploader
              images={formData.xrayImages}
              onImagesUploaded={handleXrayImagesChange}
              maxImages={5}
              maxSize={5}
              title="Imágenes de Rayos X"
              placeholder="Subir imágenes de rayos X"
              description="Arrastra o haz clic para subir imágenes de rayos X"
            />
          </div>
          
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
            Continuar con el Diagnóstico
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};