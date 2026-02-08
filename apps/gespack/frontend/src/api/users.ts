// frontend/src/api/users.ts
import { api } from "../services/axiosConfig";
import type { Site } from "./sites";

export type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
  locale?: string;
  selectedSites?: number[];
  isCustomer?: boolean;
  isAdmin?: boolean;
  isActive?: boolean;
  isCB?: boolean;
  isList?: boolean;
  isDailyOrdersReport?: boolean;
};

export type User = {
  userId: number;
  userName: string;
  name?: string;
  email: string;
  locale: string;
  isCustomer: boolean;
  isAdmin: boolean;
  isActive: boolean;
  isCB: boolean;
  isList: boolean;
  sendDailyOrdersReport: number;
  isDailyOrdersReport: boolean;
  totalSite: number;
  createdAt: string;
  sites?: Site[];
};

export async function fetchUserById(id: number): Promise<User> {
  const { data } = await api.get(`/users/${id}`);
  
  if (data.success === false) {
    throw new Error(data.message || 'Usuario no encontrado');
  }
  
  if (!data.data) {
    throw new Error(`Usuario con ID ${id} no encontrado`);
  }
  
  return data.data as User;
}

export async function createUser(userData: CreateUserRequest): Promise<User> {
  const { data } = await api.post('/users', userData);
  
  if (data.success === false) {
    throw new Error(data.message || 'Error al crear usuario');
  }
  
  return data.data as User;
}

export async function updateUser(id: number, userData: Partial<CreateUserRequest>): Promise<User> {
  const { data } = await api.put(`/users/${id}`, userData);
  
  if (data.success === false) {
    throw new Error(data.message || 'Error al actualizar usuario');
  }
  
  return data.data as User;
}