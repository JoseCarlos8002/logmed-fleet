
export enum VehicleStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  ATTENTION = 'ATTENTION'
}

export interface Vehicle {
  id: string;
  model: string;
  plate: string;
  status: VehicleStatus;
  image: string;
  avgConsumption: number;
  costPerKm: number;
  currentKm: number;
  lastRefill: string;
  driver?: string;
  year?: number;
  maintenanceNote?: string;
}

export interface Driver {
  id: string;
  name: string;
  plate: string;
  photo: string;
  status: 'active' | 'inactive' | 'maintenance';
  revenue: number;
  dailyRoutes: number;
  monthlyRoutes: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  responsible: string;
  responsiblePhoto?: string;
  time?: string;
  status: 'todo' | 'doing' | 'done';
}

export interface CityCost {
  id: string;
  name: string;
  region: string;
  state: string;
  type: 'fixed' | 'perKm';
  value: number;
  updatedAt: string;
}
