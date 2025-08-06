import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Plus, 
  ArrowLeft,
  Users,
  UserPlus,
  Trash2,
  Eye,
  EyeOff,
  Building2,
  Bug
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { registerUser, createUserDocument, getAllUsers, deleteUserCompletely, disableUser, enableUser, debugUserStatus } from "@/services/authService";
import { getCompanies } from "@/services/companyService";
import { Company } from "@/types/company";
import { LogOut } from "lucide-react";

const userSchema = z.object({
  email: z.string().email("Por favor ingresa un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().min(1, "El nombre es requerido"),
  role: z.enum(["admin", "user"], {
    required_error: "Debes seleccionar un rol",
  }),
  companyId: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface User {
  uid: string;
  email: string;
  name: string;
  role: string;
  companyId?: string | null;
  isActive: boolean;
  createdAt: Date;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      role: "user",
      companyId: "none",
    },
  });

  // Cargar usuarios al montar el componente
  useEffect(() => {
    if (user?.role === "admin") {
      loadUsers();
    }
  }, [user]);

  // Cargar usuarios desde Firestore
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

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

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cerrar sesión",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: UserFormData) => {
    setLoading(true);
    try {
      // Registrar el usuario en Firebase
      const firebaseUser = await registerUser(data.email, data.password);
      
      // Crear documento en Firestore con los datos completos
      await createUserDocument(firebaseUser.uid, {
        uid: firebaseUser.uid,
        email: data.email,
        name: data.name,
        role: data.role,
        companyId: data.companyId === "none" ? null : data.companyId,
      });
      
      // Crear objeto de usuario para la lista
      const newUser: User = {
        uid: firebaseUser.uid,
        email: data.email,
        name: data.name,
        role: data.role,
        companyId: data.companyId === "none" ? null : data.companyId,
        isActive: true,
        createdAt: new Date(),
      };

             toast({
         title: "Usuario creado",
         description: `${data.name} ha sido registrado exitosamente.`,
       });

       setIsFormOpen(false);
       form.reset();
       
       // Recargar la lista de usuarios
       await loadUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al crear el usuario",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.")) {
      try {
        // Verificar que no se esté eliminando al usuario actual
        if (userId === user?.uid) {
          toast({
            title: "Error",
            description: "No puedes eliminar tu propia cuenta.",
            variant: "destructive",
          });
          return;
        }

        // Eliminar usuario de Firestore
        await deleteUserCompletely(userId);
        
        // Actualizar estado local
        setUsers(prev => prev.filter(user => user.uid !== userId));
        
        toast({
          title: "Usuario eliminado",
          description: "El usuario ha sido eliminado del sistema exitosamente.",
        });
      } catch (error: any) {
        console.error('Error deleting user:', error);
        toast({
          title: "Error",
          description: error.message || "Error al eliminar el usuario",
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      // Verificar que no se esté deshabilitando al usuario actual
      if (userId === user?.uid) {
        toast({
          title: "Error",
          description: "No puedes deshabilitar tu propia cuenta.",
          variant: "destructive",
        });
        return;
      }

      if (currentStatus) {
        // Deshabilitar usuario
        await disableUser(userId);
        setUsers(prev => prev.map(user => 
          user.uid === userId ? { ...user, isActive: false } : user
        ));
        toast({
          title: "Usuario deshabilitado",
          description: "El usuario ha sido deshabilitado exitosamente.",
        });
      } else {
        // Habilitar usuario
        await enableUser(userId);
        setUsers(prev => prev.map(user => 
          user.uid === userId ? { ...user, isActive: true } : user
        ));
        toast({
          title: "Usuario habilitado",
          description: "El usuario ha sido habilitado exitosamente.",
        });
      }
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      toast({
        title: "Error",
        description: error.message || "Error al cambiar el estado del usuario",
        variant: "destructive",
      });
    }
  };

  const handleDebugUser = async (userId: string) => {
    try {
      await debugUserStatus(userId);
      toast({
        title: "Debug Info",
        description: "Información del usuario enviada a la consola",
      });
    } catch (error: any) {
      console.error('Error debugging user:', error);
      toast({
        title: "Error",
        description: "Error al obtener información de debug",
        variant: "destructive",
      });
    }
  };

  // Cargar empresas cuando se abre el formulario
  const loadCompanies = async () => {
    try {
      const companiesData = await getCompanies();
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las empresas",
        variant: "destructive",
      });
    }
  };

  // Manejar apertura del formulario
  const handleOpenForm = () => {
    setIsFormOpen(true);
    loadCompanies();
  };

  return (
    <div className="min-h-screen bg-dental-soft">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-gray-600">Gestiona usuarios y empresas del sistema</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/companies")}
              className="border-dental-pink text-dental-pink hover:bg-dental-pink/10"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Gestionar Empresas
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-red-500 text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
               <DialogTrigger asChild>
                 <Button 
                   className="bg-dental-pink hover:bg-dental-pink/90"
                   onClick={handleOpenForm}
                 >
                   <UserPlus className="w-4 h-4 mr-2" />
                   Registrar Usuario
                 </Button>
               </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Usuario</DialogTitle>
                  <DialogDescription>
                    Crea una nueva cuenta de usuario en el sistema
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre completo</FormLabel>
                          <FormControl>
                                                       <Input
                             {...field}
                             placeholder="Juan Pérez"
                             autoComplete="name"
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
                             placeholder="juan@ejemplo.com"
                             autoComplete="email"
                           />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña</FormLabel>
                          <FormControl>
                            <div className="relative">
                                                           <Input
                               {...field}
                               type={showPassword ? "text" : "password"}
                               placeholder="••••••••"
                               className="pr-10"
                               autoComplete="new-password"
                             />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rol</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un rol" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="user">Usuario</SelectItem>
                              <SelectItem value="admin">Administrador</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Empresa</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona una empresa" />
                              </SelectTrigger>
                            </FormControl>
                                                       <SelectContent>
                             <SelectItem value="none">Sin empresa</SelectItem>
                             {companies.map((company) => (
                               <SelectItem key={company.id} value={company.id}>
                                 {company.name}
                               </SelectItem>
                             ))}
                           </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsFormOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-dental-pink hover:bg-dental-pink/90"
                        disabled={loading}
                      >
                        {loading ? "Creando..." : "Crear Usuario"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Usuarios</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <UserPlus className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Usuarios Activos</p>
                  <p className="text-2xl font-bold">{users.filter(u => u.isActive).length}</p>
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
                  <p className="text-sm text-gray-600">Administradores</p>
                  <p className="text-2xl font-bold">{users.filter(u => u.role === "admin").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de usuarios */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios Registrados</CardTitle>
            <CardDescription>
              Lista de todos los usuarios del sistema
            </CardDescription>
          </CardHeader>
                     <CardContent>
             {loadingUsers ? (
               <div className="text-center py-8">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dental-pink mx-auto mb-4"></div>
                 <p className="text-gray-500">Cargando usuarios...</p>
               </div>
             ) : users.length === 0 ? (
               <div className="text-center py-8">
                 <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                 <p className="text-gray-500">No hay usuarios registrados</p>
                 <p className="text-sm text-gray-400">Comienza registrando el primer usuario</p>
               </div>
             ) : (
              <Table>
                                 <TableHeader>
                   <TableRow>
                     <TableHead>Usuario</TableHead>
                     <TableHead>Email</TableHead>
                     <TableHead>Rol</TableHead>
                     <TableHead>Empresa</TableHead>
                     <TableHead>Estado</TableHead>
                     <TableHead>Fecha de Registro</TableHead>
                     <TableHead className="text-right">Acciones</TableHead>
                   </TableRow>
                 </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell>
                        <div className="font-medium">{user.name}</div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                                             <TableCell>
                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                           user.role === "admin" 
                             ? "bg-purple-100 text-purple-800" 
                             : "bg-green-100 text-green-800"
                         }`}>
                           {user.role === "admin" ? "Administrador" : "Usuario"}
                         </span>
                       </TableCell>
                       <TableCell>
                         {user.companyId ? (
                           <span className="text-sm text-gray-600">
                             {companies.find(c => c.id === user.companyId)?.name || 'Empresa no encontrada'}
                           </span>
                         ) : (
                           <span className="text-sm text-gray-400">Sin empresa</span>
                         )}
                       </TableCell>
                       <TableCell>
                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                           user.isActive 
                             ? "bg-green-100 text-green-800" 
                             : "bg-red-100 text-red-800"
                         }`}>
                           {user.isActive ? "Activo" : "Inactivo"}
                         </span>
                       </TableCell>
                       <TableCell>
                         {user.createdAt.toLocaleDateString('es-MX')}
                       </TableCell>
                                             <TableCell className="text-right">
                         <div className="flex justify-end gap-2">
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => handleDebugUser(user.uid)}
                             className="text-blue-600 hover:text-blue-700"
                             title="Debug usuario"
                           >
                             <Bug className="w-4 h-4" />
                           </Button>
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => handleToggleUserStatus(user.uid, user.isActive)}
                             className={user.isActive ? "text-yellow-600 hover:text-yellow-700" : "text-green-600 hover:text-green-700"}
                             title={user.isActive ? "Deshabilitar usuario" : "Habilitar usuario"}
                           >
                             {user.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                           </Button>
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => handleDeleteUser(user.uid)}
                             className="text-red-600 hover:text-red-700"
                             title="Eliminar usuario"
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

export default AdminPanel; 