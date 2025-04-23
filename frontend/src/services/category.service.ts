import api from "./api";
import { Pagination } from "@/types/types";


export interface CategoryResponse { 
  data: Category[];
  pagination: Pagination;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateCategoryData {
  name: string;
  description: string;
  isActive: boolean;
}

interface UpdateCategoryData {
  name: string;
  description: string;
  isActive: boolean;
}

// Category Service
const categoryService = {
  getAllCategories: async (): Promise<CategoryResponse> => {
    const response = await api.get("/categories");
    return response.data;
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (categoryData: CreateCategoryData): Promise<Category> => {
    const response = await api.post("/categories", categoryData);
    return response.data;
  },

  updateCategory: async (id: string, categoryData: UpdateCategoryData): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

export default categoryService; 