import { UserModel } from './_model';
import axiosInstance from './axiosInstance'
import { handleAxiosError } from './axiosInstance'

export interface UserRead extends UserModel {
  id: string;
  is_active: boolean;
}

export const adminAPI = {
  // Fetch all users
  getUsers: async (): Promise<UserRead[]> => {
    try {
      const response = await axiosInstance.get<UserRead[]>('/user/all')
      return response.data
    } catch (error) {
      handleAxiosError('Failed to fetch users', error)
      throw error
    }
  },

  // Delete a user
  deleteUser: async (userId: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/auth/users/${userId}`)
    } catch (error) {
      handleAxiosError('Failed to delete user', error)
      throw error
    }
  },

  // Update user status (activate/deactivate)
  updateUserStatus: async (userId: string, isActive: boolean): Promise<void> => {
    try {
      await axiosInstance.patch(`/user/${userId}/status`, { is_active: isActive })
    } catch (error) {
      handleAxiosError('Failed to update user status', error)
      throw error
    }
  },

  // Get user statistics
  getUserStats: async (): Promise<{
    total_users: number;
    active_users: number;
  }> => {
    try {
      const response = await axiosInstance.get('/user/stats')
      return response.data
    } catch (error) {
      handleAxiosError('Failed to fetch user statistics', error)
      throw error
    }
  }
}
