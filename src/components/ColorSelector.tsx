import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TREATMENT_COLORS = [
  { name: "Pulpotomías", color: "#DC2626", bgClass: "bg-treatment-red" },
  { name: "Coronas metálicas", color: "#EAB308", bgClass: "bg-treatment-yellow" },
  { name: "Extracciones", color: "#2563EB", bgClass: "bg-treatment-blue" },
  { name: "Resinas en diente temporal", color: "#16A34A", bgClass: "bg-treatment-green" },
  { name: "Resina en diente permanente", color: "#EA580C", bgClass: "bg-treatment-orange" }
];

interface ColorSelectorProps {
  selectedColor: string | null;
  onColorSelect: (color: string, name: string) => void;
}

export const ColorSelector = ({ selectedColor, onColorSelect }: ColorSelectorProps) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="bg-dental-soft">
        <CardTitle className="text-lg font-bold text-center text-dental-pink">
          Seleccionar Tratamiento
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          {TREATMENT_COLORS.map((treatment) => (
            <Button
              key={treatment.name}
              variant={selectedColor === treatment.color ? "default" : "outline"}
              className={`w-full justify-start text-left h-auto py-3 px-4 ${
                selectedColor === treatment.color 
                  ? `${treatment.bgClass} text-white hover:opacity-90` 
                  : "hover:bg-dental-soft border-dental-pink/20"
              }`}
              onClick={() => {
                console.log("Color selected:", treatment.color, treatment.name);
                onColorSelect(treatment.color, treatment.name);
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className={`w-4 h-4 rounded-full ${treatment.bgClass} flex-shrink-0`}
                />
                <span className="text-sm">{treatment.name}</span>
              </div>
            </Button>
          ))}
        </div>
        
        {selectedColor && (
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