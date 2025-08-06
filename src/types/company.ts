export interface Company {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  // Campos adicionales para información profesional
  ownerName?: string; // Nombre de la titular de la empresa
  specialty?: string;
  certifications?: string[];
  licenses?: string[];
  additionalTraining?: string[];
  recommendations?: string[]; // Recomendaciones
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyFormData {
  name: string;
  description?: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  // Campos adicionales para información profesional
  ownerName?: string; // Nombre de la titular de la empresa
  specialty?: string;
  certifications?: string[];
  licenses?: string[];
  additionalTraining?: string[];
  recommendations?: string[]; // Recomendaciones
}

export interface CompanyFilters {
  search: string;
  isActive: boolean | null;
} 