import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTreatments } from "@/hooks/useTreatments";
import { useAuth } from "@/contexts/AuthContext";

interface ColorSelectorProps {
  selectedColor: string | null;
  selectedTreatment: string | null;
  onColorSelect: (color: string, name: string) => void;
}

export const ColorSelector = ({ selectedColor, selectedTreatment, onColorSelect }: ColorSelectorProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getActiveTreatments } = useTreatments(user?.companyId || undefined);
  const treatments = getActiveTreatments();

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="bg-dental-soft">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-center text-dental-pink">
            Seleccionar Tratamiento
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/treatments")}
            className="text-dental-pink hover:bg-dental-pink/10"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {treatments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No hay tratamientos disponibles</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/treatments")}
            >
              Gestionar Tratamientos
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {treatments.map((treatment) => (
              <Button
                key={treatment.id}
                variant={selectedTreatment === treatment.name ? "default" : "outline"}
                className={`w-full justify-start text-left h-auto py-3 px-4 ${
                  selectedTreatment === treatment.name 
                    ? `${treatment.bgClass} text-white hover:opacity-90` 
                    : "hover:bg-dental-soft border-dental-pink/20"
                }`}
                onClick={() => {
                  console.log("Treatment selected:", treatment.color, treatment.name);
                  onColorSelect(treatment.color, treatment.name);
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-4 h-4 rounded-full ${treatment.bgClass} flex-shrink-0`}
                    style={{ backgroundColor: treatment.color }}
                  />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{treatment.name}</span>
                    <span className="text-xs opacity-75">
                      ${treatment.cost.toLocaleString('es-MX')}
                    </span>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
        
        {selectedTreatment && (
          <div className="mt-4 p-3 bg-dental-light rounded-lg">
            <p className="text-sm text-center text-dental-pink font-medium">
              Haz clic en la imagen para marcar el diente
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};