
import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas as FabricCanvas, Circle, FabricImage } from "fabric";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Treatment {
  id: string;
  x: number;
  y: number;
  color: string;
  name: string;
}

interface InteractiveCanvasProps {
  image: string;
  selectedColor: string | null;
  selectedTreatment: string | null;
  onTreatmentAdded: (treatment: Treatment) => void;
  onClearTreatments: () => void;
}

export const InteractiveCanvas = ({ 
  image, 
  selectedColor, 
  selectedTreatment,
  onTreatmentAdded,
  onClearTreatments 
}: InteractiveCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [selectedObject, setSelectedObject] = useState<any>(null);

  const handleCanvasClick = useCallback((options: any) => {
    console.log("Canvas clicked - selectedColor:", selectedColor, "selectedTreatment:", selectedTreatment);
    
    // Check if we clicked on an existing object
    const target = fabricCanvas?.findTarget(options.e);
    if (target) {
      console.log("Clicked on existing object, not creating new treatment");
      return; // Don't create new treatment if clicking on existing object
    }
    
    if (!selectedColor || !selectedTreatment) {
      console.log("Missing selection - Color:", selectedColor, "Treatment:", selectedTreatment);
      toast.error("Selecciona un tratamiento primero");
      return;
    }

    if (!fabricCanvas) return;

    const pointer = fabricCanvas.getPointer(options.e);
    const treatmentId = `treatment-${Date.now()}`;
    
    // Create star shape using circle with custom styling
    const star = new Circle({
      left: pointer.x - 8,
      top: pointer.y - 8,
      fill: selectedColor,
      radius: 8,
      stroke: '#ffffff',
      strokeWidth: 2,
      selectable: true,
    });

    // Add custom data using set method
    star.set('treatmentId', treatmentId);
    star.set('treatmentName', selectedTreatment);

    fabricCanvas.add(star);
    
    const newTreatment: Treatment = {
      id: treatmentId,
      x: pointer.x,
      y: pointer.y,
      color: selectedColor,
      name: selectedTreatment
    };
    
    setTreatments(prev => [...prev, newTreatment]);
    onTreatmentAdded(newTreatment);
    toast.success(`${selectedTreatment} agregado`);
  }, [selectedColor, selectedTreatment, fabricCanvas, onTreatmentAdded]);

  const deleteSelectedObject = useCallback(() => {
    if (!fabricCanvas || !selectedObject) return;
    
    const treatmentId = selectedObject.get('treatmentId');
    if (treatmentId) {
      // Remove from canvas
      fabricCanvas.remove(selectedObject);
      
      // Remove from treatments state
      setTreatments(prev => prev.filter(t => t.id !== treatmentId));
      
      // Update parent state
      const updatedTreatments = treatments.filter(t => t.id !== treatmentId);
      // We need to sync with parent by calling onClearTreatments and re-adding remaining treatments
      onClearTreatments();
      updatedTreatments.forEach(treatment => onTreatmentAdded(treatment));
      
      setSelectedObject(null);
      toast.success("Marcador eliminado");
    }
  }, [fabricCanvas, selectedObject, treatments, onTreatmentAdded, onClearTreatments]);

  useEffect(() => {
    if (!canvasRef.current || !image) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 400,
      height: 300,
      backgroundColor: "#ffffff",
    });

    // Load background image
    FabricImage.fromURL(image).then((img) => {
      const imgWidth = img.width || 400;
      const imgHeight = img.height || 300;
      const canvasWidth = 400;
      const canvasHeight = 300;
      
      // Calculate scale to fit image
      const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight);
      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;
      
      canvas.setDimensions({
        width: scaledWidth,
        height: scaledHeight
      });

      img.set({
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false,
      });

      canvas.backgroundImage = img;
      canvas.renderAll();
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [image]);

  // Update canvas click handler when selectedColor or selectedTreatment changes
  useEffect(() => {
    if (!fabricCanvas) return;

    // Remove existing mouse:down listeners
    fabricCanvas.off('mouse:down');
    
    // Add new mouse:down listener with current state
    fabricCanvas.on('mouse:down', handleCanvasClick);

    // Add selection event listeners
    fabricCanvas.on('selection:created', (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    fabricCanvas.on('selection:updated', (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    fabricCanvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    return () => {
      fabricCanvas.off('mouse:down');
      fabricCanvas.off('selection:created');
      fabricCanvas.off('selection:updated');
      fabricCanvas.off('selection:cleared');
    };
  }, [fabricCanvas, handleCanvasClick]);

  const clearCanvas = () => {
    if (!fabricCanvas) return;
    
    fabricCanvas.getObjects().forEach(obj => {
      if (obj.get('treatmentId')) {
        fabricCanvas.remove(obj);
      }
    });
    
    setTreatments([]);
    onClearTreatments(); // Sync with parent state
    toast.info("Todos los tratamientos eliminados");
  };

  if (!image) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            Carga una imagen para comenzar el diagnóstico
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="bg-dental-soft">
        <CardTitle className="text-lg font-bold text-center text-dental-pink">
          Diagnóstico Visual
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="border-2 border-dental-pink/20 rounded-lg overflow-hidden">
            <canvas ref={canvasRef} className="max-w-full" />
          </div>
          
          {selectedObject && selectedObject.get('treatmentId') && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={deleteSelectedObject}
              className="w-full border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar Marcador Seleccionado
            </Button>
          )}
          
          {treatments.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearCanvas}
              className="w-full border-destructive text-destructive hover:bg-destructive hover:text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpiar Todo
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
