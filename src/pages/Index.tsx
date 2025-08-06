import { useState } from "react";
import { DentalHeader } from "@/components/DentalHeader";
import { PatientForm } from "@/components/PatientForm";
import { ImageUploader } from "@/components/ImageUploader";
import { ColorSelector } from "@/components/ColorSelector";
import { InteractiveCanvas } from "@/components/InteractiveCanvas";
import { TreatmentSummary } from "@/components/TreatmentSummary";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface PatientData {
  name: string;
  age: string;
  date: string;
  notes: string;
}

interface Treatment {
  id: string;
  x: number;
  y: number;
  color: string;
  name: string;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedTreatment, setSelectedTreatment] = useState<string | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePatientSubmit = (data: PatientData) => {
    setPatientData(data);
    setCurrentStep(2);
  };

  const handleImagesUploaded = (images: string[]) => {
    setUploadedImages(images);
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
    setTreatments(prev => [...prev, treatment]);
  };

  const handleClearTreatments = () => {
    setTreatments([]);
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

  return (
    <div className="min-h-screen bg-dental-soft">
      <div className="container mx-auto px-4 py-8">
        <DentalHeader />
        
        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
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
              <ImageUploader onImagesUploaded={handleImagesUploaded} />
            </div>
          )}

          {/* Step 3: Diagnosis */}
          {currentStep >= 3 && uploadedImages.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Color Selector */}
              <div>
                <ColorSelector
                  selectedColor={selectedColor}
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
                  <TreatmentSummary
                    treatments={treatments}
                    patientData={patientData}
                    images={uploadedImages}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
