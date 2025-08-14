import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DentalHeader } from "@/components/DentalHeader";
import { PatientForm } from "@/components/PatientForm";
import { MultipleImageUploader } from "@/components/MultipleImageUploader";
import { ColorSelector } from "@/components/ColorSelector";
import { InteractiveCanvas } from "@/components/InteractiveCanvas";
import { TreatmentSummary } from "@/components/TreatmentSummary";
import { SessionsConfig } from "@/components/SessionsConfig";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTreatments } from "@/hooks/useTreatments";

interface PatientData {
  name: string;
  age: string;
  date: string;
  notes: string;
  xrayImages: string[];
}

interface Treatment {
  id: string;
  x: number;
  y: number;
  color: string;
  name: string;
  imageIndex: number; // Agregar índice de imagen para identificar a qué imagen pertenece
}

const Index = () => {
  const navigate = useNavigate();
  const { user, company } = useAuth();
  const { getTreatmentCost } = useTreatments(user?.companyId || undefined);
  const [currentStep, setCurrentStep] = useState(1);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedTreatment, setSelectedTreatment] = useState<string | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [treatmentsByImage, setTreatmentsByImage] = useState<Record<number, Treatment[]>>({}); // Tratamientos por imagen
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [canvasImages, setCanvasImages] = useState<string[]>([]); // Array de imágenes de canvas
  const [totalSessions, setTotalSessions] = useState<number>(0); // Número de sesiones configuradas

  const handlePatientSubmit = (data: PatientData) => {
    console.log('Datos del paciente recibidos:', data);
    console.log('xrayImages en handlePatientSubmit:', data.xrayImages);
    setPatientData(data);
    setCurrentStep(2);
  };

  const handleImagesUploaded = (images: string[]) => {
    setUploadedImages(images);
    
    // Si se eliminaron imágenes, limpiar los tratamientos asociados
    if (images.length < uploadedImages.length) {
      // Limpiar tratamientos de imágenes que ya no existen
      const newTreatmentsByImage: Record<number, Treatment[]> = {};
      Object.keys(treatmentsByImage).forEach(key => {
        const imageIndex = parseInt(key);
        if (imageIndex < images.length) {
          newTreatmentsByImage[imageIndex] = treatmentsByImage[imageIndex];
        }
      });
      setTreatmentsByImage(newTreatmentsByImage);
      
      // Actualizar lista general de tratamientos
      const remainingTreatments = treatments.filter(treatment => 
        treatment.imageIndex < images.length
      );
      setTreatments(remainingTreatments);
      
      // Ajustar índices de imagen si es necesario
      if (currentImageIndex >= images.length) {
        setCurrentImageIndex(Math.max(0, images.length - 1));
      }
    }
    
    // Actualizar canvas images
    setCanvasImages(prev => {
      const newCanvasImages = new Array(images.length).fill(null);
      prev.forEach((canvasImage, index) => {
        if (index < images.length) {
          newCanvasImages[index] = canvasImage;
        }
      });
      return newCanvasImages;
    });
    
    if (images.length > 0) {
      setCurrentStep(3);
    }
  };

  const handleColorSelect = (color: string, name: string) => {
    console.log("handleColorSelect called with:", color, name);
    setSelectedColor(color);
    setSelectedTreatment(name);
    console.log("State should be updated to:", color, name);
  };

  const handleTreatmentAdded = (treatment: Treatment) => {
    // Agregar tratamiento a la imagen actual
    setTreatmentsByImage(prev => ({
      ...prev,
      [currentImageIndex]: [...(prev[currentImageIndex] || []), treatment]
    }));
    
    // Actualizar lista general de tratamientos
    setTreatments(prev => [...prev, treatment]);
  };

  const handleClearTreatments = () => {
    // Limpiar tratamientos de la imagen actual
    setTreatmentsByImage(prev => ({
      ...prev,
      [currentImageIndex]: []
    }));
    
    // Actualizar lista general de tratamientos
    setTreatments(prev => prev.filter(t => t.imageIndex !== currentImageIndex));
  };

  const handleCanvasUpdate = (canvasDataUrl: string) => {
    setCanvasImages(prev => {
      const newCanvasImages = [...prev];
      newCanvasImages[currentImageIndex] = canvasDataUrl;
      return newCanvasImages;
    });
  };

  const handleSessionsConfigured = (sessions: number) => {
    setTotalSessions(sessions);
  };

  const nextImage = () => {
    if (currentImageIndex < uploadedImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // Obtener tratamientos de la imagen actual
  const currentImageTreatments = treatmentsByImage[currentImageIndex] || [];

  // Calcular el total del tratamiento usando los costos reales
  const treatmentTotals = treatments.reduce((acc, treatment) => {
    const existing = acc.find(item => item.name === treatment.name);
    if (existing) {
      existing.count++;
      existing.total += existing.unitCost;
    } else {
      const treatmentCost = getTreatmentCost(treatment.name);
      acc.push({
        name: treatment.name,
        count: 1,
        unitCost: treatmentCost,
        total: treatmentCost
      });
    }
    return acc;
  }, [] as Array<{ name: string; count: number; unitCost: number; total: number }>);

  const grandTotal = treatmentTotals.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="min-h-screen bg-dental-soft">
      <div className="container mx-auto px-4 py-8">
        <DentalHeader />
        
        {/* Progress indicator and settings button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step <= currentStep
                      ? "bg-dental-pink text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-1 ${
                      step < currentStep ? "bg-dental-pink" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/treatments")}
            className="text-dental-pink border-dental-pink/20 hover:bg-dental-pink/10"
          >
            <Settings className="w-4 h-4 mr-2" />
            Gestionar Tratamientos
          </Button>
        </div>

        <div className="space-y-8">
          {/* Step 1: Patient Form */}
          {currentStep >= 1 && (
            <div className={currentStep === 1 ? "" : "opacity-75"}>
              <PatientForm onSubmit={handlePatientSubmit} />
            </div>
          )}

          {/* Step 2: Image Upload */}
          {currentStep >= 2 && (
            <div className={currentStep === 2 ? "" : "opacity-75"}>
              <MultipleImageUploader 
                images={uploadedImages}
                onImagesUploaded={handleImagesUploaded} 
              />
            </div>
          )}

          {/* Step 3: Diagnosis */}
          {currentStep === 3 && uploadedImages.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Color Selector */}
              <div>
                <ColorSelector
                  selectedColor={selectedColor}
                  selectedTreatment={selectedTreatment}
                  onColorSelect={handleColorSelect}
                />
              </div>

              {/* Interactive Canvas */}
              <div className="space-y-4">
                <InteractiveCanvas
                  image={uploadedImages[currentImageIndex]}
                  selectedColor={selectedColor}
                  selectedTreatment={selectedTreatment}
                  onTreatmentAdded={handleTreatmentAdded}
                  onClearTreatments={handleClearTreatments}
                  onCanvasUpdate={handleCanvasUpdate}
                  imageIndex={currentImageIndex}
                  existingTreatments={currentImageTreatments}
                />
                
                {/* Image Navigation */}
                {uploadedImages.length > 1 && (
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevImage}
                      disabled={currentImageIndex === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {currentImageIndex + 1} de {uploadedImages.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextImage}
                      disabled={currentImageIndex === uploadedImages.length - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Treatment Summary (spanning full width on smaller screens) */}
              <div className="lg:col-span-1">
                {patientData && (
                  <div className="space-y-4">
                    <TreatmentSummary
                      treatments={treatments}
                      patientData={patientData}
                      images={uploadedImages}
                      canvasImage={canvasImages[currentImageIndex]}
                      canvasImages={canvasImages}
                    />
                    
                    {/* Botón para configurar sesiones */}
                    {treatments.length > 0 && (
                      <Button
                        onClick={() => setCurrentStep(4)}
                        className="w-full bg-dental-pink hover:bg-dental-pink/90"
                      >
                        Configurar Sesiones
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Sessions Configuration */}
          {currentStep === 4 && (
            <SessionsConfig
              grandTotal={grandTotal}
              onSessionsConfigured={handleSessionsConfigured}
              onNext={() => setCurrentStep(5)}
              onBack={() => setCurrentStep(3)}
            />
          )}

          {/* Step 5: Treatment Summary */}
          {currentStep === 5 && patientData && (
            <div className="max-w-4xl mx-auto">
              <TreatmentSummary
                treatments={treatments}
                patientData={patientData}
                images={uploadedImages}
                canvasImage={canvasImages[currentImageIndex]}
                canvasImages={canvasImages}
                totalSessions={totalSessions}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
