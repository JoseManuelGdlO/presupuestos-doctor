import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LogoutButton from "./LogoutButton";
import { Building2, User, Award, FileText, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const DentalHeader = () => {
  const navigate = useNavigate();
  const { user, company } = useAuth();

  return (
    <Card className="w-full mb-8">
      <div className="bg-gradient-to-r from-dental-pink to-dental-purple p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                <Building2 className="w-8 h-8" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">
                  {company?.name || "Empresa"}
                </h1>
                {company && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/20"
                        >
                          <Info className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <div className="space-y-2">
                          <h3 className="font-semibold">{company.name}</h3>
                          {company.specialty && (
                            <p><strong>Especialidad:</strong> {company.specialty}</p>
                          )}
                          {company.ownerName && (
                            <p><strong>Titular:</strong> {company.ownerName}</p>
                          )}
                          {company.certifications && company.certifications.length > 0 && (
                            <div>
                              <strong>Certificaciones:</strong>
                              <ul className="list-disc list-inside mt-1">
                                {company.certifications.map((cert, index) => (
                                  <li key={index} className="text-sm">{cert}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {company.licenses && company.licenses.length > 0 && (
                            <div>
                              <strong>Licencias:</strong>
                              <ul className="list-disc list-inside mt-1">
                                {company.licenses.map((license, index) => (
                                  <li key={index} className="text-sm">{license}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {company.additionalTraining && company.additionalTraining.length > 0 && (
                            <div>
                              <strong>Formación Adicional:</strong>
                              <ul className="list-disc list-inside mt-1">
                                {company.additionalTraining.map((training, index) => (
                                  <li key={index} className="text-sm">{training}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              
              <div className="space-y-1">
                {/* Especialidad */}
                {company?.specialty && (
                  <p className="text-white/90 flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{company.specialty}</span>
                  </p>
                )}
                
                {/* Titular de la empresa */}
                {company?.ownerName && (
                  <p className="text-white/90 flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span>Titular: {company.ownerName}</span>
                  </p>
                )}
                
                {/* Certificaciones - máximo 2 para no saturar */}
                {company?.certifications && company.certifications.length > 0 && (
                  <div className="space-y-1">
                    {company.certifications.slice(0, 2).map((cert, index) => (
                      <p key={index} className="text-white/80 flex items-center gap-2 text-xs">
                        <FileText className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{cert}</span>
                      </p>
                    ))}
                    {company.certifications.length > 2 && (
                      <p className="text-white/70 text-xs">
                        +{company.certifications.length - 2} certificaciones más
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 flex-shrink-0 ml-4">
            <div className="text-right">
              <p className="text-sm text-white/80">Plataforma de Presupuestos</p>
              <p className="text-lg font-semibold">Gestión de Tratamientos</p>
            </div>

            <LogoutButton />
          </div>
        </div>
      </div>
    </Card>
  );
};