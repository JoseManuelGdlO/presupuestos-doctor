import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Badge
} from "@/components/ui/badge";
import { 
  Plus, 
  ArrowLeft,
  Building2,
  Users,
  Trash2,
  Edit,
  Eye,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Company, CompanyFormData } from "@/types/company";
import { 
  getCompanies, 
  createCompany, 
  updateCompany, 
  deleteCompany, 
  toggleCompanyStatus 
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
});

type CompanyFormData = z.infer<typeof companySchema>;

const CompaniesManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

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
    },
  });

  // Verificar si el usuario actual es admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-dental-soft flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Acceso Denegado
            </h2>
            <p className="text-gray-600 mb-4">
              No tienes permisos para acceder a esta página.
            </p>
            <Button onClick={() => navigate("/")}>
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Cargar empresas
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true);
        const companiesData = await getCompanies();
        setCompanies(companiesData);
      } catch (error) {
        console.error('Error loading companies:', error);
        toast({
          title: "Error",
          description: "Error al cargar las empresas",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, [toast]);

  const onSubmit = async (data: CompanyFormData) => {
    try {
      if (editingCompany) {
        await updateCompany(editingCompany.id, data);
        toast({
          title: "Empresa actualizada",
          description: `${data.name} ha sido actualizada exitosamente.`,
        });
      } else {
        await createCompany(data);
        toast({
          title: "Empresa creada",
          description: `${data.name} ha sido creada exitosamente.`,
        });
      }

      // Recargar empresas
      const companiesData = await getCompanies();
      setCompanies(companiesData);

      setIsFormOpen(false);
      setEditingCompany(null);
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al guardar la empresa",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
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
      certifications: company.certifications || [],
      licenses: company.licenses || [],
      additionalTraining: company.additionalTraining || [],
      recommendations: company.recommendations || [],
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (companyId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta empresa?")) {
      try {
        await deleteCompany(companyId);
        setCompanies(prev => prev.filter(company => company.id !== companyId));
        toast({
          title: "Empresa eliminada",
          description: "La empresa ha sido eliminada del sistema.",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Error al eliminar la empresa",
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleStatus = async (companyId: string, currentStatus: boolean) => {
    try {
      await toggleCompanyStatus(companyId, !currentStatus);
      setCompanies(prev => prev.map(company =>
        company.id === companyId
          ? { ...company, isActive: !currentStatus }
          : company
      ));
      toast({
        title: "Estado actualizado",
        description: `La empresa ha sido ${!currentStatus ? 'activada' : 'desactivada'}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar el estado",
        variant: "destructive",
      });
    }
  };

  const handleViewTreatments = (companyId: string) => {
    navigate(`/treatments?companyId=${companyId}`);
  };

  return (
    <div className="min-h-screen bg-dental-soft">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Empresas</h1>
              <p className="text-gray-600">Administra las empresas del sistema</p>
            </div>
          </div>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-dental-pink hover:bg-dental-pink/90">
                <Plus className="w-4 h-4 mr-2" />
                Crear Empresa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md modal-scroll scrollbar-thin">
              <DialogHeader>
                <DialogTitle>
                  {editingCompany ? "Editar Empresa" : "Crear Nueva Empresa"}
                </DialogTitle>
                <DialogDescription>
                  {editingCompany 
                    ? "Modifica los datos de la empresa" 
                    : "Crea una nueva empresa en el sistema"
                  }
                </DialogDescription>
              </DialogHeader>
                             <Form {...form}>
                 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la empresa</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Clínica Dental ABC"
                          />
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
                          <Input
                            {...field}
                            placeholder="Dr. Yomaira García Flores"
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
                          <Textarea
                            {...field}
                            placeholder="Descripción de la empresa..."
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="contacto@empresa.com"
                          />
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
                          <Input
                            {...field}
                            placeholder="+52 123 456 7890"
                          />
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
                          <Input
                            {...field}
                            placeholder="Calle Principal 123, Ciudad"
                          />
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
                          <Input
                            {...field}
                            placeholder="https://www.empresa.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                                     {/* Campos adicionales para información profesional */}
                   <div className="border-t pt-6">
                     <h3 className="text-lg font-semibold mb-4 text-gray-800">Información Profesional</h3>
                    
                    <FormField
                      control={form.control}
                      name="specialty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Especialidad</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ej: Especialista en odontopediatría"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="certifications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certificaciones</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Ej: Certificado por Colegio Mexicano de Odontología Pediátrica"
                              rows={2}
                              value={field.value?.join('\n') || ''}
                              onChange={(e) => {
                                const lines = e.target.value.split('\n').filter(line => line.trim());
                                field.onChange(lines);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="licenses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cédulas Profesionales</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Ej: Cédula licenciatura UAEI 9834567 - Cédula especialidad UAT 10584298"
                              rows={2}
                              value={field.value?.join('\n') || ''}
                              onChange={(e) => {
                                const lines = e.target.value.split('\n').filter(line => line.trim());
                                field.onChange(lines);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                                         <FormField
                       control={form.control}
                       name="additionalTraining"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Formación Adicional</FormLabel>
                           <FormControl>
                             <Textarea
                               {...field}
                               placeholder="Ej: Formación en psicología infantil - C.E.T.A.P Puebla"
                               rows={2}
                               value={field.value?.join('\n') || ''}
                               onChange={(e) => {
                                 const lines = e.target.value.split('\n').filter(line => line.trim());
                                 field.onChange(lines);
                               }}
                             />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />

                     <FormField
                       control={form.control}
                       name="recommendations"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Recomendaciones</FormLabel>
                           <FormControl>
                             <Textarea
                               {...field}
                               placeholder="Ej: Recomendaciones de pacientes, colegas, etc."
                               rows={2}
                               value={field.value?.join('\n') || ''}
                               onChange={(e) => {
                                 const lines = e.target.value.split('\n').filter(line => line.trim());
                                 field.onChange(lines);
                               }}
                             />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                   </div>

                   {/* Indicador de scroll */}
                   <div className="text-center py-2">
                     <div className="w-8 h-1 bg-gray-300 rounded-full mx-auto"></div>
                   </div>

                   <div className="modal-buttons-fixed flex justify-end gap-2">
                     <Button
                       type="button"
                       variant="outline"
                       onClick={() => {
                         setIsFormOpen(false);
                         setEditingCompany(null);
                         form.reset();
                       }}
                     >
                       Cancelar
                     </Button>
                     <Button 
                       type="submit" 
                       className="bg-dental-pink hover:bg-dental-pink/90"
                     >
                       {editingCompany ? "Actualizar" : "Crear"}
                     </Button>
                   </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Empresas</p>
                  <p className="text-2xl font-bold">{companies.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Building2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Empresas Activas</p>
                  <p className="text-2xl font-bold">{companies.filter(c => c.isActive).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Usuarios Totales</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de empresas */}
        <Card>
          <CardHeader>
            <CardTitle>Empresas Registradas</CardTitle>
            <CardDescription>
              Lista de todas las empresas del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dental-pink mx-auto"></div>
                <p className="text-gray-500 mt-2">Cargando empresas...</p>
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay empresas registradas</p>
                <p className="text-sm text-gray-400">Comienza creando la primera empresa</p>
              </div>
            ) : (
              <Table>
                                 <TableHeader>
                   <TableRow>
                     <TableHead>Empresa</TableHead>
                     <TableHead>Información Profesional</TableHead>
                     <TableHead>Recomendaciones</TableHead>
                     <TableHead>Contacto</TableHead>
                     <TableHead>Estado</TableHead>
                     <TableHead>Fecha de Registro</TableHead>
                     <TableHead className="text-right">Acciones</TableHead>
                   </TableRow>
                 </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{company.name}</div>
                          {company.ownerName && (
                            <p className="text-sm text-blue-600 font-medium">Titular: {company.ownerName}</p>
                          )}
                          {company.description && (
                            <p className="text-sm text-gray-500">{company.description}</p>
                          )}
                        </div>
                      </TableCell>
                                             <TableCell>
                         <div className="text-sm space-y-1">
                           {company.specialty && (
                             <div className="font-medium text-blue-600">{company.specialty}</div>
                           )}
                           {company.certifications && company.certifications.length > 0 && (
                             <div className="text-xs text-gray-600">
                               <strong>Certificaciones:</strong> {company.certifications.join(', ')}
                             </div>
                           )}
                           {company.licenses && company.licenses.length > 0 && (
                             <div className="text-xs text-gray-600">
                               <strong>Cédulas:</strong> {company.licenses.join(', ')}
                             </div>
                           )}
                           {company.additionalTraining && company.additionalTraining.length > 0 && (
                             <div className="text-xs text-gray-600">
                               <strong>Formación:</strong> {company.additionalTraining.join(', ')}
                             </div>
                           )}
                         </div>
                       </TableCell>
                       <TableCell>
                         <div className="text-sm space-y-1">
                           {company.recommendations && company.recommendations.length > 0 ? (
                             company.recommendations.map((recommendation, index) => (
                               <div key={index} className="text-xs text-gray-600 bg-green-50 p-2 rounded">
                                 <span className="text-green-600">★</span> {recommendation}
                               </div>
                             ))
                           ) : (
                             <div className="text-xs text-gray-400 italic">
                               Sin recomendaciones
                             </div>
                           )}
                         </div>
                       </TableCell>
                       <TableCell>
                        <div className="text-sm">
                          {company.email && <div>{company.email}</div>}
                          {company.phone && <div>{company.phone}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={company.isActive ? "default" : "secondary"}>
                          {company.isActive ? "Activa" : "Inactiva"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {company.createdAt.toLocaleDateString('es-MX')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewTreatments(company.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(company)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(company.id, company.isActive)}
                            className={company.isActive ? "text-yellow-600 hover:text-yellow-700" : "text-green-600 hover:text-green-700"}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(company.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompaniesManagement; 