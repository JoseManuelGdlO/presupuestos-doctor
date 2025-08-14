import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  ArrowLeft,
  DollarSign,
  Building2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Treatment, TreatmentFormData, TreatmentFilters } from "@/types/treatment";
import TreatmentForm from "@/components/TreatmentForm";
import { CompanyEditForm } from "@/components/CompanyEditForm";
import { useAuth } from "@/contexts/AuthContext";
import { useTreatments } from "@/hooks/useTreatments";

// Colores predefinidos para tratamientos
const PREDEFINED_COLORS = [
  { name: "Rojo", value: "#DC2626", bgClass: "bg-treatment-red" },
  { name: "Amarillo", value: "#EAB308", bgClass: "bg-treatment-yellow" },
  { name: "Azul", value: "#2563EB", bgClass: "bg-treatment-blue" },
  { name: "Verde", value: "#16A34A", bgClass: "bg-treatment-green" },
  { name: "Naranja", value: "#EA580C", bgClass: "bg-treatment-orange" },
  { name: "Púrpura", value: "#9333EA", bgClass: "bg-purple-500" },
  { name: "Rosa", value: "#EC4899", bgClass: "bg-pink-500" },
  { name: "Cian", value: "#06B6D4", bgClass: "bg-cyan-500" },
  { name: "Marrón", value: "#A16207", bgClass: "bg-amber-700" },
  { name: "Gris", value: "#6B7280", bgClass: "bg-gray-500" },
  { name: "Verde Azulado", value: "#0D9488", bgClass: "bg-teal-600" },
  { name: "Violeta", value: "#7C3AED", bgClass: "bg-violet-600" },
  { name: "Indigo", value: "#4F46E5", bgClass: "bg-indigo-600" },
  { name: "Verde Lima", value: "#84CC16", bgClass: "bg-lime-500" },
  { name: "Azul Marino", value: "#1E40AF", bgClass: "bg-blue-800" },
  { name: "Rojo Oscuro", value: "#991B1B", bgClass: "bg-red-800" },
];

const TreatmentsManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    treatments, 
    loading, 
    addTreatment, 
    updateTreatment, 
    deleteTreatment, 
    toggleTreatmentStatus 
  } = useTreatments(user?.companyId || undefined);
  const [filteredTreatments, setFilteredTreatments] = useState<Treatment[]>([]);
  const [filters, setFilters] = useState<TreatmentFilters>({
    search: "",
    isActive: null,
    minCost: null,
    maxCost: null,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showCompanyEdit, setShowCompanyEdit] = useState(false);

  // Filtrar tratamientos cuando cambien los filtros
  useEffect(() => {
    filterTreatments();
  }, [treatments, filters]);



  const filterTreatments = () => {
    let filtered = treatments;

    // Filtro por búsqueda
    if (filters.search) {
      filtered = filtered.filter(treatment =>
        treatment.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        treatment.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filtro por estado activo
    if (filters.isActive !== null) {
      filtered = filtered.filter(treatment => treatment.isActive === filters.isActive);
    }

    // Filtro por costo mínimo
    if (filters.minCost !== null) {
      filtered = filtered.filter(treatment => treatment.cost >= filters.minCost!);
    }

    // Filtro por costo máximo
    if (filters.maxCost !== null) {
      filtered = filtered.filter(treatment => treatment.cost <= filters.maxCost!);
    }

    setFilteredTreatments(filtered);
  };

  const handleAddTreatment = async (formData: TreatmentFormData) => {
    if (!user?.companyId) {
      toast({
        title: "Error",
        description: "No tienes una empresa asignada. Contacta al administrador.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addTreatment(formData);
      toast({
        title: "Tratamiento agregado",
        description: `${formData.name} ha sido agregado exitosamente`,
      });
      setIsFormOpen(false);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "No se pudo agregar el tratamiento",
        variant: "destructive",
      });
    }
  };

  const handleEditTreatment = async (formData: TreatmentFormData) => {
    if (!editingTreatment) return;

    if (!user?.companyId) {
      toast({
        title: "Error",
        description: "No tienes una empresa asignada. Contacta al administrador.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateTreatment(editingTreatment.id, formData);
      toast({
        title: "Tratamiento actualizado",
        description: `${formData.name} ha sido actualizado exitosamente`,
      });
      setEditingTreatment(null);
      setIsFormOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el tratamiento",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTreatment = async (treatment: Treatment) => {
    try {
      await deleteTreatment(treatment.id);
      toast({
        title: "Tratamiento eliminado",
        description: `${treatment.name} ha sido eliminado`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el tratamiento",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (treatment: Treatment) => {
    try {
      await toggleTreatmentStatus(treatment.id);
      toast({
        title: "Estado actualizado",
        description: `${treatment.name} ha sido ${!treatment.isActive ? 'activado' : 'desactivado'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del tratamiento",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      isActive: null,
      minCost: null,
      maxCost: null,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
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
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Tratamientos</h1>
              <p className="text-gray-600">Administra los tratamientos y sus costos</p>
              {!user?.companyId && (
                <p className="text-sm text-red-600 mt-1">
                  ⚠️ No tienes una empresa asignada. Contacta al administrador.
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCompanyEdit(true)}
              disabled={!user?.companyId}
            >
              <Building2 className="w-4 h-4 mr-2" />
              Editar Empresa
            </Button>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-dental-pink hover:bg-dental-pink/90"
                  disabled={!user?.companyId}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Tratamiento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingTreatment ? "Editar Tratamiento" : "Nuevo Tratamiento"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingTreatment 
                      ? "Modifica los datos del tratamiento seleccionado"
                      : "Agrega un nuevo tratamiento al sistema"
                    }
                  </DialogDescription>
                </DialogHeader>
                <TreatmentForm
                  onSubmit={editingTreatment ? handleEditTreatment : handleAddTreatment}
                  initialData={editingTreatment}
                  predefinedColors={PREDEFINED_COLORS}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filtros</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? "Ocultar" : "Mostrar"} Filtros
              </Button>
            </div>
          </CardHeader>
          
          {showFilters && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Búsqueda */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Nombre o descripción..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Estado */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Estado</label>
                  <Select
                    value={filters.isActive?.toString() || ""}
                    onValueChange={(value) => 
                      setFilters(prev => ({ 
                        ...prev, 
                        isActive: value === "" ? null : value === "true" 
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="true">Activos</SelectItem>
                      <SelectItem value="false">Inactivos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Costo mínimo */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Costo mínimo</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={filters.minCost || ""}
                    onChange={(e) => 
                      setFilters(prev => ({ 
                        ...prev, 
                        minCost: e.target.value ? Number(e.target.value) : null 
                      }))
                    }
                  />
                </div>

                {/* Costo máximo */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Costo máximo</label>
                  <Input
                    type="number"
                    placeholder="9999.99"
                    value={filters.maxCost || ""}
                    onChange={(e) => 
                      setFilters(prev => ({ 
                        ...prev, 
                        maxCost: e.target.value ? Number(e.target.value) : null 
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={clearFilters}>
                  Limpiar Filtros
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Tabla de tratamientos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tratamientos ({filteredTreatments.length})</CardTitle>
                <CardDescription>
                  Lista de todos los tratamientos disponibles en el sistema
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dental-pink mx-auto mb-4"></div>
                <p className="text-gray-500">Cargando tratamientos...</p>
              </div>
            ) : !user?.companyId ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <p className="text-red-600 font-medium mb-2">No tienes empresa asignada</p>
                <p className="text-gray-500 mb-4">Para poder gestionar tratamientos, necesitas tener una empresa asignada.</p>
                <p className="text-sm text-gray-400">Contacta al administrador para que te asigne una empresa.</p>
              </div>
            ) : filteredTreatments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No se encontraron tratamientos</p>
                <p className="text-sm text-gray-400 mt-2">Comienza agregando el primer tratamiento</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tratamiento</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Costo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Última actualización</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTreatments.map((treatment) => (
                    <TableRow key={treatment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{treatment.name}</div>
                          {treatment.description && (
                            <div className="text-sm text-gray-500">{treatment.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className={`w-4 h-4 rounded-full ${treatment.bgClass}`}
                            style={{ backgroundColor: treatment.color }}
                          />
                          <span className="text-sm">{treatment.color}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-medium">{formatCurrency(treatment.cost)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={treatment.isActive ? "default" : "secondary"}>
                          {treatment.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {treatment.updatedAt.toLocaleDateString('es-MX')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingTreatment(treatment);
                                setIsFormOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(treatment)}
                            >
                              {treatment.isActive ? (
                                <>
                                  <EyeOff className="w-4 h-4 mr-2" />
                                  Desactivar
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Activar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteTreatment(treatment)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de edición de empresa */}
      {showCompanyEdit && (
        <CompanyEditForm onClose={() => setShowCompanyEdit(false)} />
      )}
    </div>
  );
};

export default TreatmentsManagement; 