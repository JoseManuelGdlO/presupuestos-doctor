import { Card } from "@/components/ui/card";

export const DentalHeader = () => {
  return (
    <Card className="w-full mb-8">
      <div className="bg-gradient-to-r from-dental-pink to-dental-purple p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold">YGF</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Yomaira García Flores</h1>
              <p className="text-white/90">Especialista en Odontopediatría</p>
              <p className="text-sm text-white/80">Certificada por el Consejo Mexicano de Odontología Pediátrica</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80">Sistema de Diagnóstico Digital</p>
            <p className="text-lg font-semibold">Planeamiento de Tratamiento</p>
          </div>
        </div>
      </div>
    </Card>
  );
};