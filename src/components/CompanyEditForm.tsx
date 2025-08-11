import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/ImageUploader";
import { 
  Plus, 
  Building2,
  Save,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Company } from "@/types/company";
import { 
  getCompanyById, 
  updateCompany 
} from "@/services/companyService";

const companySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  logo: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  // Campos adicionales para información profesional
  ownerName: z.string().optional(),
  specialty: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  licenses: z.array(z.string()).optional(),
  additionalTraining: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
  // Campos específicos para información del doctor
  doctorName: z.string().optional(),
  doctorSpecialty: z.string().optional(),
  doctorCertifications: z.array(z.string()).optional(),
  doctorInitials: z.string().optional(),
  importantObservations: z.string().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyEditFormProps {
  onClose: () => void;
}

export const CompanyEditForm = ({ onClose }: CompanyEditFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tempCertifications, setTempCertifications] = useState<string[]>([]);
  const [tempLicenses, setTempLicenses] = useState<string[]>([]);
  const [tempAdditionalTraining, setTempAdditionalTraining] = useState<string[]>([]);
  const [tempRecommendations, setTempRecommendations] = useState<string[]>([]);
  const [tempDoctorCertifications, setTempDoctorCertifications] = useState<string[]>([]);
  const [newCertification, setNewCertification] = useState("");
  const [newLicense, setNewLicense] = useState("");
  const [newTraining, setNewTraining] = useState("");
  const [newRecommendation, setNewRecommendation] = useState("");
  const [newDoctorCertification, setNewDoctorCertification] = useState("");

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      description: "",
      logo: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      ownerName: "",
      specialty: "",
      certifications: [],
      licenses: [],
      additionalTraining: [],
      recommendations: [],
      doctorName: "",
      doctorSpecialty: "",
      doctorCertifications: [],
      doctorInitials: "",
      importantObservations: "",
    },
  });

  // Cargar datos de la empresa
  useEffect(() => {
    const loadCompanyData = async () => {
      if (!user?.companyId) {
        toast({
          title: "Error",
          description: "No tienes una empresa asignada",
          variant: "destructive",
        });
        return;
      }

      try {
        setLoading(true);
        const company = await getCompanyById(user.companyId);
        
        if (company) {
          form.reset({
            name: company.name,
            description: company.description || "",
            logo: company.logo || "",
            address: company.address || "",
            phone: company.phone || "",
            email: company.email || "",
            website: company.website || "",
            ownerName: company.ownerName || "",
            specialty: company.specialty || "",
            doctorName: company.doctorName || "",
            doctorSpecialty: company.doctorSpecialty || "",
            doctorInitials: company.doctorInitials || "",
            importantObservations: company.importantObservations || "",
          });

          setTempCertifications(company.certifications || []);
          setTempLicenses(company.licenses || []);
          setTempAdditionalTraining(company.additionalTraining || []);
          setTempRecommendations(company.recommendations || []);
          setTempDoctorCertifications(company.doctorCertifications || []);
        }
      } catch (error) {
        console.error('Error loading company:', error);
        toast({
          title: "Error",
          description: "Error al cargar los datos de la empresa",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadCompanyData();
  }, [user?.companyId, form, toast]);

  const onSubmit = async (data: CompanyFormData) => {
    if (!user?.companyId) {
      toast({
        title: "Error",
        description: "No tienes una empresa asignada",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const companyData = {
        ...data,
        name: data.name,
        certifications: tempCertifications,
        licenses: tempLicenses,
        additionalTraining: tempAdditionalTraining,
        recommendations: tempRecommendations,
        doctorCertifications: tempDoctorCertifications,
      };

      await updateCompany(user.companyId, companyData);
      toast({
        title: "Empresa actualizada",
        description: "Los datos de la empresa han sido actualizados exitosamente.",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar la empresa",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetTempArrays = () => {
    setTempCertifications([]);
    setTempLicenses([]);
    setTempAdditionalTraining([]);
    setTempRecommendations([]);
    setTempDoctorCertifications([]);
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setTempCertifications([...tempCertifications, newCertification.trim()]);
      setNewCertification("");
    }
  };

  const removeCertification = (index: number) => {
    setTempCertifications(tempCertifications.filter((_, i) => i !== index));
  };

  const addLicense = () => {
    if (newLicense.trim()) {
      setTempLicenses([...tempLicenses, newLicense.trim()]);
      setNewLicense("");
    }
  };

  const removeLicense = (index: number) => {
    setTempLicenses(tempLicenses.filter((_, i) => i !== index));
  };

  const addTraining = () => {
    if (newTraining.trim()) {
      setTempAdditionalTraining([...tempAdditionalTraining, newTraining.trim()]);
      setNewTraining("");
    }
  };

  const removeTraining = (index: number) => {
    setTempAdditionalTraining(tempAdditionalTraining.filter((_, i) => i !== index));
  };

  const addRecommendation = () => {
    if (newRecommendation.trim()) {
      setTempRecommendations([...tempRecommendations, newRecommendation.trim()]);
      setNewRecommendation("");
    }
  };

  const removeRecommendation = (index: number) => {
    setTempRecommendations(tempRecommendations.filter((_, i) => i !== index));
  };

  const addDoctorCertification = () => {
    if (newDoctorCertification.trim()) {
      setTempDoctorCertifications([...tempDoctorCertifications, newDoctorCertification.trim()]);
      setNewDoctorCertification("");
    }
  };

  const removeDoctorCertification = (index: number) => {
    setTempDoctorCertifications(tempDoctorCertifications.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dental-soft flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dental-pink mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando datos de la empresa...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dental-soft p-4">
      <div className="container mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">Editar Información de la Empresa</CardTitle>
                <CardDescription>
                  Actualiza los datos de tu empresa y la información profesional
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4 mr-2" />
                Cerrar
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Información Básica */}
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Información Básica</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de la empresa</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Clínica Dental ABC" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ownerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de la titular</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Dr. Yomaira García Flores" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="logo"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ImageUploader
                              value={field.value}
                              onChange={field.onChange}
                              label="Logotipo de la empresa"
                              placeholder="Arrastra o haz clic para subir el logotipo"
                              maxSize={2}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Descripción de la empresa..." rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Información de Contacto */}
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Información de Contacto</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="contacto@empresa.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+52 123 456 7890" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dirección</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Calle Principal 123, Ciudad" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sitio web</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://www.empresa.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Información Profesional */}
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Información Profesional</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="specialty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Especialidad</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ej: Especialista en odontopediatría" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <Label>Certificaciones</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={newCertification}
                          onChange={(e) => setNewCertification(e.target.value)}
                          placeholder="Nueva certificación"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                        />
                        <Button type="button" onClick={addCertification} variant="outline">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tempCertifications.map((cert, index) => (
                          <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeCertification(index)}>
                            {cert} ×
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Cédulas Profesionales</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={newLicense}
                          onChange={(e) => setNewLicense(e.target.value)}
                          placeholder="Nueva cédula"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLicense())}
                        />
                        <Button type="button" onClick={addLicense} variant="outline">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tempLicenses.map((license, index) => (
                          <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeLicense(index)}>
                            {license} ×
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Formación Adicional</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={newTraining}
                          onChange={(e) => setNewTraining(e.target.value)}
                          placeholder="Nueva formación"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTraining())}
                        />
                        <Button type="button" onClick={addTraining} variant="outline">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tempAdditionalTraining.map((training, index) => (
                          <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTraining(index)}>
                            {training} ×
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Recomendaciones</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={newRecommendation}
                          onChange={(e) => setNewRecommendation(e.target.value)}
                          placeholder="Nueva recomendación"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRecommendation())}
                        />
                        <Button type="button" onClick={addRecommendation} variant="outline">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tempRecommendations.map((recommendation, index) => (
                          <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeRecommendation(index)}>
                            {recommendation} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información del Doctor (PDF) */}
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Información del Doctor (PDF)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="doctorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Doctor</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nombre completo del doctor" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="doctorSpecialty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Especialidad</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Especialidad del doctor" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="doctorInitials"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Iniciales</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Iniciales" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="importantObservations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observaciones Importantes</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Observaciones importantes que aparecerán en el PDF" rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="md:col-span-2">
                      <Label>Certificaciones del Doctor</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={newDoctorCertification}
                          onChange={(e) => setNewDoctorCertification(e.target.value)}
                          placeholder="Nueva certificación"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDoctorCertification())}
                        />
                        <Button type="button" onClick={addDoctorCertification} variant="outline">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tempDoctorCertifications.map((cert, index) => (
                          <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeDoctorCertification(index)}>
                            {cert} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-dental-pink hover:bg-dental-pink/90"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
