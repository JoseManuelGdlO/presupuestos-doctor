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
  canvasImage?: string; // Imagen del canvas actual
  canvasImages?: string[]; // Array de todas las imágenes de canvas
  totalSessions?: number; // Número de sesiones configuradas
}

import { useTreatments } from "@/hooks/useTreatments";
import { useAuth } from "@/contexts/AuthContext";
import { getDoctorInfo, getImportantObservations, getCompanyById } from "@/services/companyService";
import { useState, useEffect } from "react";

export const TreatmentSummary = ({ treatments, patientData, images = [], canvasImage, canvasImages = [], totalSessions }: TreatmentSummaryProps) => {
  const { user } = useAuth();
  const { getTreatmentCost } = useTreatments(user?.companyId || undefined);
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  const [importantObservations, setImportantObservations] = useState<string>('');
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
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

  // Cargar información del doctor y observaciones
  useEffect(() => {
    const loadDoctorInfo = async () => {
      if (!user?.companyId) {
        setLoading(false);
        return;
      }

      try {
        const [doctorData, observations, companyData] = await Promise.all([
          getDoctorInfo(user.companyId),
          getImportantObservations(user.companyId),
          getCompanyById(user.companyId)
        ]);
        
        setDoctorInfo(doctorData);
        setImportantObservations(observations);
        setCompany(companyData);
      } catch (error) {
        console.error('Error loading doctor info:', error);
        // Usar valores por defecto en caso de error
        setDoctorInfo({
          name: 'Yomaira García Flores',
          specialty: 'Especialista en Odontopediatría',
          certifications: [
            'Certificado por Colegio Mexicano de Odontología Pediátrica',
            'Cédula licenciatura UAEI 9834567 - Cédula especialidad UAT 10584298',
            'Formación en psicología infantil - C.E.T.A.P Puebla'
          ],
          initials: 'YG'
        });
        setImportantObservations('Hay que considerar que entre más avance el tiempo el daño avanza y tanto el tratamiento como el presupuesto se pueden ver modificados.');
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };

    loadDoctorInfo();
  }, [user?.companyId]);

  const generateReport = () => {
    if (loading) {
      toast.error("Cargando información del doctor...");
      return;
    }

    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      toast.error("No se pudo abrir la ventana del reporte");
      return;
    }

    // Filtrar imágenes de canvas que no sean null
    const validCanvasImages = canvasImages.filter(img => img !== null);

    // Create the report content
    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reporte de Presupuesto - ${patientData.name}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            @media print {
              body { margin: 0; }
              .print\\:shadow-none { box-shadow: none !important; }
              .grid { display: grid; }
              .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
              .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
              .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
              .gap-3 { gap: 0.75rem; }
              .h-32 { height: 8rem; }
              .object-contain { object-fit: contain; }
              .object-cover { object-fit: cover; }
            }
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #374151;
            }
            .dental-pink { color: #D946EF; }
            .bg-dental-pink { background-color: #D946EF; }
            .dental-gradient { background: linear-gradient(135deg, #D946EF 0%, #A855F7 100%); }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
            .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
            .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
            .gap-3 { gap: 0.75rem; }
            .h-32 { height: 8rem; }
            .object-contain { object-fit: contain; }
            .object-cover { object-fit: cover; }
            .header-gradient { background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%); }
            .card-shadow { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
            .table-header { background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%); }
            .treatment-badge { 
              display: inline-flex; 
              align-items: center; 
              padding: 0.25rem 0.75rem; 
              border-radius: 9999px; 
              font-size: 0.75rem; 
              font-weight: 500; 
              margin: 0.125rem;
            }
          </style>
        </head>
        <body class="bg-gray-50">
          <div class="max-w-5xl mx-auto bg-white card-shadow my-4">
            <!-- Header con información del doctor -->
            <div class="dental-gradient text-white p-6">
              <div class="flex items-center gap-6 mb-4">
                ${company?.logo ? `
                  <div class="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm overflow-hidden">
                    <img src="${company.logo}" alt="Logo de la empresa" class="w-full h-full object-contain p-3" />
                  </div>
                ` : `
                  <div class="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <span class="text-white font-bold text-3xl">${doctorInfo?.initials || 'YG'}</span>
                  </div>
                `}
                <div class="flex-1">
                  <h1 class="text-2xl font-bold mb-1">${doctorInfo?.name || 'Yomaira García Flores'}</h1>
                  <p class="text-base text-white/90 mb-1">${doctorInfo?.specialty || 'Especialista en Odontopediatría'}</p>
                  <div class="text-xs text-white/80 space-y-0.5">
                    ${doctorInfo?.certifications?.map((cert: string) => `<p>${cert}</p>`).join('') || `
                      <p>Certificado por Colegio Mexicano de Odontología Pediátrica</p>
                      <p>Cédula licenciatura UAEI 9834567 - Cédula especialidad UAT 10584298</p>
                      <p>Formación en psicología infantil - C.E.T.A.P Puebla</p>
                    `}
                  </div>
                </div>
              </div>
            </div>

            <!-- Información del paciente compacta -->
            <div class="p-6 header-gradient border-b border-gray-200">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white p-3 rounded-lg card-shadow">
                  <p class="text-xs text-gray-500 font-medium mb-1">PACIENTE</p>
                  <p class="text-base font-semibold text-gray-900">${patientData.name}</p>
                </div>
                <div class="bg-white p-3 rounded-lg card-shadow">
                  <p class="text-xs text-gray-500 font-medium mb-1">EDAD</p>
                  <p class="text-base font-semibold text-gray-900">${patientData.age} años</p>
                </div>
                <div class="bg-white p-3 rounded-lg card-shadow">
                  <p class="text-xs text-gray-500 font-medium mb-1">DOCTORA</p>
                  <p class="text-base font-semibold text-gray-900">${doctorInfo?.name || 'Yomaira García Flores'}</p>
                </div>
                <div class="bg-white p-3 rounded-lg card-shadow">
                  <p class="text-xs text-gray-500 font-medium mb-1">FECHA</p>
                  <p class="text-base font-semibold text-gray-900">${new Date(patientData.date).toLocaleDateString('es-MX', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}</p>
                </div>
              </div>
            </div>

            <!-- Canvas Images with Treatments -->
            ${validCanvasImages.length > 0 ? `
            <div class="p-6">
              <div class="mb-4">
                <h2 class="text-xl font-bold text-gray-900 mb-1">Presupuesto Visual con Tratamientos</h2>
                <p class="text-sm text-gray-600">Análisis detallado de las áreas que requieren tratamiento</p>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                ${validCanvasImages.map((canvasImg, index) => `
                  <div class="bg-white rounded-lg overflow-hidden card-shadow border border-gray-100">
                    <div class="bg-gradient-to-r from-dental-pink to-purple-600 p-2 text-center">
                      <span class="text-white font-semibold text-xs">Imagen ${index + 1}</span>
                    </div>
                    <div class="p-1">
                      <img src="${canvasImg}" alt="Presupuesto con tratamientos marcados - Imagen ${index + 1}" class="w-full h-28 object-contain rounded"/>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}

            <!-- Original Images (if no canvas images) -->
            ${validCanvasImages.length === 0 && images.length > 0 ? `
            <div class="p-6">
              <div class="mb-4">
                <h2 class="text-xl font-bold text-gray-900 mb-1">Imágenes del Paciente</h2>
                <p class="text-sm text-gray-600">Documentación fotográfica del paciente</p>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                ${images.slice(0, 4).map((image, index) => `
                  <div class="bg-white rounded-lg overflow-hidden card-shadow border border-gray-100">
                    <div class="bg-gray-100 p-2 text-center">
                      <span class="text-gray-700 font-semibold text-xs">Imagen ${index + 1}</span>
                    </div>
                    <div class="p-1">
                      <img src="${image}" alt="Imagen del paciente ${index + 1}" class="w-full h-28 object-cover rounded"/>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}

            <!-- Treatment table -->
            <div class="p-6">
              <div class="mb-4">
                <h2 class="text-xl font-bold text-gray-900 mb-1">Plan de Tratamiento</h2>
                <p class="text-sm text-gray-600">Detalle de procedimientos y costos</p>
              </div>
              <div class="bg-white rounded-lg overflow-hidden card-shadow">
                <table class="w-full">
                  <thead class="table-header">
                    <tr>
                      <th class="text-left p-3 font-semibold text-gray-700 border-b border-gray-200 text-sm">TRATAMIENTO</th>
                      <th class="text-center p-3 font-semibold text-gray-700 border-b border-gray-200 text-sm">CANTIDAD</th>
                      <th class="text-right p-3 font-semibold text-gray-700 border-b border-gray-200 text-sm">COSTO UNITARIO</th>
                      <th class="text-right p-3 font-semibold text-gray-700 border-b border-gray-200 text-sm">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${treatmentTotals.map((item, index) => `
                      <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
                        <td class="p-3 border-b border-gray-100">
                          <div class="flex items-center gap-2">
                            <span class="treatment-badge" style="background-color: ${treatments.find(t => t.name === item.name)?.color || '#000'}; color: white;">&nbsp;</span>
                            <span class="font-medium text-gray-900 text-sm">${item.name}</span>
                          </div>
                        </td>
                        <td class="p-3 text-center border-b border-gray-100">
                          <span class="bg-dental-pink/10 text-dental-pink px-2 py-1 rounded-full text-xs font-semibold">${item.count}</span>
                        </td>
                        <td class="p-3 text-right border-b border-gray-100">
                          <span class="font-medium text-gray-900 text-sm">$${item.unitCost.toLocaleString('es-MX')}.00</span>
                        </td>
                        <td class="p-3 text-right border-b border-gray-100">
                          <span class="font-bold text-gray-900 text-sm">$${item.total.toLocaleString('es-MX')}.00</span>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                  <tfoot class="bg-gradient-to-r from-dental-pink to-purple-600 text-white">
                    <tr>
                      <td class="p-3 font-bold text-base" colspan="3">TOTAL DEL TRATAMIENTO</td>
                      <td class="p-3 text-right font-bold text-base">$${grandTotal.toLocaleString('es-MX')}.00</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <!-- Additional info compacta -->
            <div class="p-6 bg-gray-50">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-white p-4 rounded-lg card-shadow">
                  <h3 class="text-base font-semibold text-gray-900 mb-2">Información de Sesiones</h3>
                  <div class="bg-dental-pink/10 p-3 rounded-lg">
                    <p class="text-dental-pink font-bold text-base">
                      ${totalSessions || Math.ceil(grandTotal / 4300)} sesiones de $${(grandTotal / (totalSessions || Math.ceil(grandTotal / 4300))).toLocaleString('es-MX')}
                    </p>
                  </div>
                </div>
                
                <div class="bg-white p-4 rounded-lg card-shadow">
                  <h3 class="text-base font-semibold text-gray-900 mb-2">Observaciones Importantes</h3>
                  <div class="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-400">
                    <p class="text-amber-800 text-xs">
                      ${importantObservations}
                    </p>
                  </div>
                </div>
              </div>
              
              ${patientData.notes ? `
                <div class="mt-4 bg-white p-4 rounded-lg card-shadow">
                  <h3 class="text-base font-semibold text-gray-900 mb-2">Notas Adicionales</h3>
                  <div class="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <p class="text-blue-800 text-sm">${patientData.notes}</p>
                  </div>
                </div>
              ` : ''}
            </div>

            <!-- Signature compacta -->
            <div class="p-6 bg-white">
              <div class="text-center">
                <div class="border-b-2 border-dental-pink w-48 mx-auto mb-3"></div>
                <p class="text-base font-semibold text-gray-900">Dra. ${doctorInfo?.name || 'Yomaira García Flores'}</p>
                <p class="text-sm text-gray-600">${doctorInfo?.specialty || 'Especialista en Odontopediatría'}</p>
                <p class="text-xs text-gray-500 mt-1">Este documento es válido por 30 días</p>
              </div>
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
              }, 1000);
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
          Resumen de Presupuesto
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