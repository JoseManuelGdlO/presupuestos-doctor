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

interface PrintableReportProps {
  treatments: Treatment[];
  patientData: PatientData;
  images: string[];
}

const TREATMENT_COSTS = {
  "Pulpotomía": 1200,
  "Corona metálica": 1800,
  "Extracción": 1000,
  "Resina temporal": 1000,
  "Resina permanente": 1200,
};

export const PrintableReport = ({ treatments, patientData, images }: PrintableReportProps) => {
  // Calculate treatment counts and totals
  const treatmentCounts = treatments.reduce((acc, treatment) => {
    acc[treatment.name] = (acc[treatment.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const treatmentTotals = Object.entries(treatmentCounts).map(([name, count]) => ({
    name,
    count,
    unitCost: TREATMENT_COSTS[name as keyof typeof TREATMENT_COSTS] || 0,
    total: (count as number) * (TREATMENT_COSTS[name as keyof typeof TREATMENT_COSTS] || 0)
  }));

  const grandTotal = treatmentTotals.reduce((sum, item) => sum + item.total, 0);
  const totalSessions = Math.ceil(grandTotal / 4300);

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg print:shadow-none">
      {/* Header con información del doctor */}
      <div className="border-2 border-black p-4 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-dental-pink rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">YG</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-dental-pink">Yomaira García Flores</h1>
            <p className="text-sm text-gray-600">Especialista en odontopediatría</p>
            <p className="text-xs text-blue-600">
              Certificado por Colegio Mexicano de Odontología Pediátrica<br/>
              Cédula licenciatura UAEI 9834567 - Cédula especialidad UAT 10584298<br/>
              Formación en psicología infantil - C.E.T.A.P Puebla
            </p>
          </div>
        </div>
      </div>

      {/* Información del paciente */}
      <div className="mb-6">
        <p className="font-semibold">Paciente: {patientData.name}</p>
        <p>Edad: {patientData.age} años</p>
        <p>Doctora: Yomaira García Flores</p>
        <p>Fecha: {new Date(patientData.date).toLocaleDateString('es-MX')}</p>
      </div>

      {/* Imágenes del paciente */}
      {images.length > 0 && (
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4">
            {images.slice(0, 2).map((image, index) => (
              <div key={index} className="border border-gray-300">
                <img 
                  src={image} 
                  alt={`Imagen del paciente ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla de tratamientos */}
      <div className="mb-6">
        <table className="w-full border-collapse border border-black">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 text-left">TRATAMIENTO</th>
              <th className="border border-black p-2 text-left">COSTO UNITARIO</th>
              <th className="border border-black p-2 text-left">COSTO TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {treatmentTotals.map((item, index) => (
              <tr key={index}>
                <td className="border border-black p-2">
                  <span className="inline-block w-3 h-3 mr-2" 
                        style={{ backgroundColor: treatments.find(t => t.name === item.name)?.color || '#000' }}>
                  </span>
                  {item.count} {item.name}{(item.count as number) > 1 ? 's' : ''}
                </td>
                <td className="border border-black p-2">${item.unitCost.toLocaleString('es-MX')}.00</td>
                <td className="border border-black p-2">${item.total.toLocaleString('es-MX')}.00</td>
              </tr>
            ))}
            <tr className="bg-gray-100 font-bold">
              <td className="border border-black p-2" colSpan={2}>TOTAL</td>
              <td className="border border-black p-2">${grandTotal.toLocaleString('es-MX')}.00</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Información adicional */}
      <div className="text-sm text-gray-700 space-y-2">
        <p><strong>{totalSessions} sesiones de ${(grandTotal / totalSessions).toLocaleString('es-MX')}.00</strong></p>
        
        <p>
          Hay que considerar que entre más avance el tiempo el daño avanza y tanto el tratamiento como el 
          presupuesto se pueden ver modificados.
        </p>
        
        {patientData.notes && (
          <div className="mt-4">
            <p><strong>Observaciones:</strong></p>
            <p>{patientData.notes}</p>
          </div>
        )}
      </div>

      {/* Firma */}
      <div className="mt-8 pt-4 border-t border-gray-300">
        <div className="text-center">
          <div className="border-b border-black w-64 mx-auto mb-2"></div>
          <p className="text-sm">Dra. Yomaira García Flores</p>
          <p className="text-xs text-gray-600">Especialista en Odontopediatría</p>
        </div>
      </div>
    </div>
  );
};