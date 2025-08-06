import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";

interface Treatment {
  id: string;
  x: number;
  y: number;
  color: string;
  name: string;
}

interface PatientData {
  name: string;
  age: string;
  date: string;
  notes: string;
}

interface TreatmentSummaryProps {
  treatments: Treatment[];
  patientData: PatientData;
  images?: string[];
}

import { useTreatments } from "@/hooks/useTreatments";
import { useAuth } from "@/contexts/AuthContext";

export const TreatmentSummary = ({ treatments, patientData, images = [] }: TreatmentSummaryProps) => {
  const { user } = useAuth();
  const { getTreatmentCost } = useTreatments(user?.companyId || undefined);
  
  // Group treatments by type and count them
  const treatmentCounts = treatments.reduce((acc, treatment) => {
    acc[treatment.name] = (acc[treatment.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate totals
  const treatmentTotals = Object.entries(treatmentCounts).map(([name, count]) => {
    const unitCost = getTreatmentCost(name);
    return {
      name,
      count,
      unitCost,
      total: count * unitCost
    };
  });

  const grandTotal = treatmentTotals.reduce((sum, item) => sum + item.total, 0);

  const generateReport = () => {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      toast.error("No se pudo abrir la ventana del reporte");
      return;
    }

    // Create the report content
    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reporte Dental - ${patientData.name}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { margin: 0; }
              .print\\:shadow-none { box-shadow: none !important; }
            }
            .dental-pink { color: #D946EF; }
            .bg-dental-pink { background-color: #D946EF; }
          </style>
        </head>
        <body>
          <div class="max-w-4xl mx-auto bg-white p-8">
            <!-- Header -->
            <div class="border-2 border-black p-4 mb-6">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-16 h-16 bg-dental-pink rounded-full flex items-center justify-center">
                  <span class="text-white font-bold text-xl">YG</span>
                </div>
                <div>
                  <h1 class="text-xl font-bold dental-pink">Yomaira García Flores</h1>
                  <p class="text-sm text-gray-600">Especialista en odontopediatría</p>
                  <p class="text-xs text-blue-600">
                    Certificado por Colegio Mexicano de Odontología Pediátrica<br/>
                    Cédula licenciatura UAEI 9834567 - Cédula especialidad UAT 10584298<br/>
                    Formación en psicología infantil - C.E.T.A.P Puebla
                  </p>
                </div>
              </div>
            </div>

            <!-- Patient info -->
            <div class="mb-6">
              <p class="font-semibold">Paciente: ${patientData.name}</p>
              <p>Edad: ${patientData.age} años</p>
              <p>Doctora: Yomaira García Flores</p>
              <p>Fecha: ${new Date(patientData.date).toLocaleDateString('es-MX')}</p>
            </div>

            <!-- Images -->
            ${images.length > 0 ? `
            <div class="mb-6">
              <div class="grid grid-cols-2 gap-4">
                ${images.slice(0, 2).map((image, index) => `
                  <div class="border border-gray-300">
                    <img src="${image}" alt="Imagen dental ${index + 1}" class="w-full h-48 object-cover"/>
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}

            <!-- Treatment table -->
            <div class="mb-6">
              <table class="w-full border-collapse border border-black">
                <thead>
                  <tr class="bg-gray-100">
                    <th class="border border-black p-2 text-left">TRATAMIENTO</th>
                    <th class="border border-black p-2 text-left">COSTO UNITARIO</th>
                    <th class="border border-black p-2 text-left">COSTO TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  ${treatmentTotals.map(item => `
                    <tr>
                      <td class="border border-black p-2">
                         <span class="inline-block w-3 h-3 mr-2 rounded-full" 
                               style="background-color: ${treatments.find(t => t.name === item.name)?.color || '#000'}; display: inline-block; border: 1px solid #000;">&nbsp;</span>
                        ${item.count} ${item.name}${item.count > 1 ? 's' : ''}
                      </td>
                      <td class="border border-black p-2">$${item.unitCost.toLocaleString('es-MX')}.00</td>
                      <td class="border border-black p-2">$${item.total.toLocaleString('es-MX')}.00</td>
                    </tr>
                  `).join('')}
                  <tr class="bg-gray-100 font-bold">
                    <td class="border border-black p-2" colspan="2">TOTAL</td>
                    <td class="border border-black p-2">$${grandTotal.toLocaleString('es-MX')}.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Additional info -->
            <div class="text-sm text-gray-700 space-y-2">
              <p><strong>${Math.ceil(grandTotal / 4300)} sesiones de $${(grandTotal / Math.ceil(grandTotal / 4300)).toLocaleString('es-MX')}.00</strong></p>
              
              <p>
                Hay que considerar que entre más avance el tiempo el daño avanza y tanto el tratamiento como el 
                presupuesto se pueden ver modificados.
              </p>
              
              ${patientData.notes ? `
                <div class="mt-4">
                  <p><strong>Observaciones:</strong></p>
                  <p>${patientData.notes}</p>
                </div>
              ` : ''}
            </div>

            <!-- Signature -->
            <div class="mt-8 pt-4 border-t border-gray-300">
              <div class="text-center">
                <div class="border-b border-black w-64 mx-auto mb-2"></div>
                <p class="text-sm">Dra. Yomaira García Flores</p>
                <p class="text-xs text-gray-600">Especialista en Odontopediatría</p>
              </div>
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    reportWindow.document.write(reportContent);
    reportWindow.document.close();
    
    toast.success("Reporte generado correctamente");
  };

  if (treatments.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            El resumen aparecerá cuando agregues tratamientos
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-primary text-primary-foreground">
        <CardTitle className="text-xl font-bold text-center">
          Resumen de Tratamiento
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Patient Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-dental-soft rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Paciente:</p>
              <p className="font-semibold">{patientData.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Edad:</p>
              <p className="font-semibold">{patientData.age} años</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha:</p>
              <p className="font-semibold">{new Date(patientData.date).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Treatment Table */}
          <div className="overflow-hidden border border-dental-pink/20 rounded-lg">
            <table className="w-full">
              <thead className="bg-dental-light">
                <tr>
                  <th className="text-left p-3 font-semibold text-dental-pink">Tratamiento</th>
                  <th className="text-center p-3 font-semibold text-dental-pink">Cantidad</th>
                  <th className="text-right p-3 font-semibold text-dental-pink">Costo Unitario</th>
                  <th className="text-right p-3 font-semibold text-dental-pink">Total</th>
                </tr>
              </thead>
              <tbody>
                {treatmentTotals.map((item, index) => (
                  <tr key={item.name} className={index % 2 === 0 ? "bg-background" : "bg-dental-soft/30"}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ 
                            backgroundColor: treatments.find(t => t.name === item.name)?.color 
                          }}
                        />
                        {item.name}
                      </div>
                    </td>
                    <td className="p-3 text-center font-medium">{item.count}</td>
                    <td className="p-3 text-right">${item.unitCost.toLocaleString()}</td>
                    <td className="p-3 text-right font-semibold">${item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between items-center text-lg font-bold bg-dental-light p-4 rounded-lg">
            <span className="text-dental-pink">TOTAL:</span>
            <span className="text-dental-pink">${grandTotal.toLocaleString()}</span>
          </div>

          {/* Notes */}
          {patientData.notes && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Notas:</p>
              <p className="text-sm">{patientData.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button 
              onClick={generateReport}
              className="flex-1 bg-dental-pink hover:bg-dental-pink/90"
            >
              <Download className="w-4 h-4 mr-2" />
              Generar Reporte
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};