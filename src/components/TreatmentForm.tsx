import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Treatment, TreatmentFormData } from "@/types/treatment";

const treatmentSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100, "El nombre es muy largo"),
  color: z.string().min(1, "Debes seleccionar un color"),
  cost: z.number().min(0, "El costo debe ser mayor a 0").max(99999, "El costo es muy alto"),
  description: z.string().optional(),
});

interface TreatmentFormProps {
  onSubmit: (data: TreatmentFormData) => void;
  initialData?: Treatment | null;
  predefinedColors: Array<{ name: string; value: string; bgClass: string }>;
}

const TreatmentForm = ({ onSubmit, initialData, predefinedColors }: TreatmentFormProps) => {
  const [useCustomColor, setUseCustomColor] = useState(false);
  const [customColor, setCustomColor] = useState(initialData?.color || "#000000");
  
  // Detectar si el color inicial es personalizado (no está en la lista predefinida)
  useEffect(() => {
    if (initialData?.color) {
      const isPredefined = predefinedColors.some(color => color.value === initialData.color);
      if (!isPredefined) {
        setUseCustomColor(true);
        setCustomColor(initialData.color);
      }
    }
  }, [initialData, predefinedColors]);
  
  const form = useForm<z.infer<typeof treatmentSchema>>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: {
      name: initialData?.name || "",
      color: initialData?.color || "",
      cost: initialData?.cost || 0,
      description: initialData?.description || "",
    },
  });

  const handleSubmit = (data: z.infer<typeof treatmentSchema>) => {
    // Si se está usando color personalizado, usar ese valor
    const finalData = {
      ...data,
      color: useCustomColor ? customColor : data.color
    };
    onSubmit(finalData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Nombre del tratamiento */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del tratamiento *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ej: Pulpotomía, Corona metálica..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Color */}
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color *</FormLabel>
              
              {/* Toggle para color personalizado */}
              <div className="flex items-center space-x-2 mb-3">
                <Switch
                  id="custom-color"
                  checked={useCustomColor}
                  onCheckedChange={setUseCustomColor}
                />
                <Label htmlFor="custom-color" className="text-sm">
                  Usar color personalizado
                </Label>
              </div>

              {useCustomColor ? (
                /* Color personalizado */
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: customColor }}
                    />
                    <Input
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="w-16 h-10 p-1 border rounded cursor-pointer"
                    />
                    <Input
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Selecciona un color personalizado para el tratamiento
                  </p>
                </div>
              ) : (
                /* Colores predefinidos */
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un color" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {predefinedColors.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className={`w-4 h-4 rounded-full ${color.bgClass}`}
                            style={{ backgroundColor: color.value }}
                          />
                          <span>{color.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Costo */}
        <FormField
          control={form.control}
          name="cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Costo (MXN) *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Descripción */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Descripción detallada del tratamiento..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botones */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" className="bg-dental-pink hover:bg-dental-pink/90">
            {initialData ? "Actualizar" : "Crear"} Tratamiento
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TreatmentForm; 