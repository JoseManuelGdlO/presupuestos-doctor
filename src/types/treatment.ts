export interface Treatment {
  id: string;
  companyId: string; // ID de la empresa a la que pertenece
  name: string;
  color: string;
  bgClass: string;
  cost: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TreatmentFormData {
  name: string;
  color: string;
  cost: number;
  description?: string;
}

export interface TreatmentFilters {
  search: string;
  isActive: boolean | null;
  minCost: number | null;
  maxCost: number | null;
} 