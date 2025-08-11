import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  DollarSign,
  Calculator,
  Info
} from "lucide-react";

interface SessionsConfigProps {
  grandTotal: number;
  onSessionsConfigured: (sessions: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export const SessionsConfig = ({ 
  grandTotal, 
  onSessionsConfigured, 
  onNext, 
  onBack 
}: SessionsConfigProps) => {
  const [sessions, setSessions] = useState<number>(Math.ceil(grandTotal / 4300));
  const [customSessions, setCustomSessions] = useState<number>(Math.ceil(grandTotal / 4300));

  const handleSessionsChange = (value: number) => {
    setSessions(value);
    setCustomSessions(value);
  };

  const handleCustomSessionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setCustomSessions(Math.max(1, value));
  };

  const handleApplyCustom = () => {
    setSessions(customSessions);
  };

  const handleContinue = () => {
    onSessionsConfigured(sessions);
    onNext();
  };

  const sessionAmount = grandTotal / sessions;
  const suggestedSessions = Math.ceil(grandTotal / 4300);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Configuración de Sesiones
          </CardTitle>
          <CardDescription>
            Define cuántas sesiones necesitarás para completar el tratamiento
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Información del total */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Total del Tratamiento</h3>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              ${grandTotal.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Monto total a distribuir entre las sesiones
            </p>
          </div>

          {/* Opciones de sesiones */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Opciones de Sesiones</h3>
            
            {/* Sesiones sugeridas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card 
                className={`cursor-pointer transition-all ${
                  sessions === suggestedSessions 
                    ? 'ring-2 ring-dental-pink bg-dental-pink/5' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleSessionsChange(suggestedSessions)}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Calculator className="w-5 h-5 text-dental-pink" />
                    <span className="font-semibold">Sugeridas</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {suggestedSessions}
                  </div>
                  <div className="text-sm text-gray-600">
                    ${(grandTotal / suggestedSessions).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} por sesión
                  </div>
                </CardContent>
              </Card>

              {/* 3 sesiones */}
              <Card 
                className={`cursor-pointer transition-all ${
                  sessions === 3 
                    ? 'ring-2 ring-dental-pink bg-dental-pink/5' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleSessionsChange(3)}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <span className="font-semibold">3 Sesiones</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    3
                  </div>
                  <div className="text-sm text-gray-600">
                    ${(grandTotal / 3).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} por sesión
                  </div>
                </CardContent>
              </Card>

              {/* 6 sesiones */}
              <Card 
                className={`cursor-pointer transition-all ${
                  sessions === 6 
                    ? 'ring-2 ring-dental-pink bg-dental-pink/5' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleSessionsChange(6)}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold">6 Sesiones</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    6
                  </div>
                  <div className="text-sm text-gray-600">
                    ${(grandTotal / 6).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} por sesión
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sesiones personalizadas */}
            <div className="border-t pt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Sesiones Personalizadas</h4>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="custom-sessions">Número de sesiones</Label>
                  <Input
                    id="custom-sessions"
                    type="number"
                    min="1"
                    max="20"
                    value={customSessions}
                    onChange={handleCustomSessionsChange}
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <Label>Monto por sesión</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                    <span className="text-lg font-semibold text-gray-900">
                      ${(grandTotal / customSessions).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleApplyCustom}
                    variant="outline"
                    className="h-10"
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen de la configuración actual */}
          <div className="bg-gradient-to-r from-dental-pink/10 to-purple-100 p-4 rounded-lg border border-dental-pink/20">
            <div className="flex items-center gap-3 mb-3">
              <Info className="w-5 h-5 text-dental-pink" />
              <h3 className="text-lg font-semibold text-gray-900">Configuración Actual</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-dental-pink">{sessions}</div>
                <div className="text-sm text-gray-600">Sesiones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  ${sessionAmount.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <div className="text-sm text-gray-600">Por sesión</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${grandTotal.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </div>

          {/* Botones de navegación */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={onBack}
              className="px-6"
            >
              Atrás
            </Button>
            <Button
              onClick={handleContinue}
              className="bg-dental-pink hover:bg-dental-pink/90 px-6"
            >
              Continuar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
