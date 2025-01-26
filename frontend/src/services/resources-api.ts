import { apiInstance } from '@/lib/axios';
import { Resource, CreateResourceDto, ProjectStatus } from '@/types/resource';

export const resourcesApi = {
  /**
   * Create a new resource for a project
   */
  async create(projectId: string, dto: CreateResourceDto): Promise<Resource> {
    const { data } = await apiInstance.post(`/projects/${projectId}/resources`, dto);
    return data;
  },

  /**
   * Get all resources for a project
   */
  async findAll(projectId: string): Promise<Resource[]> {
    const { data } = await apiInstance.get(`/projects/${projectId}/resources`);
    return data;
  },

  /**
   * Get a specific resource by ID
   */
  async findOne(projectId: string, resourceId: string): Promise<Resource> {
    const { data } = await apiInstance.get(`/projects/${projectId}/resources/${resourceId}`);
    return data;
  },

  /**
   * Delete a resource
   */
  async remove(projectId: string, resourceId: string): Promise<void> {
    await apiInstance.delete(`/projects/${projectId}/resources/${resourceId}`);
  },

  /**
   * Get deployment status for a resource
   */
  async getDeploymentStatus(projectId: string, resourceId: string): Promise<Resource> {
    const { data } = await apiInstance.get(`/projects/${projectId}/resources/${resourceId}/status`);
    return data;
  },

  /**
   * Trigger a deployment for a resource
   */
  async deploy(projectId: string, resourceId: string): Promise<Resource> {
    const { data } = await apiInstance.post(`/projects/${projectId}/resources/${resourceId}/deploy`);
    return data;
  },

  /**
   * Stop a deployment
   */
  async stop(projectId: string, resourceId: string): Promise<Resource> {
    const { data } = await apiInstance.post(`/projects/${projectId}/resources/${resourceId}/stop`);
    return data;
  },

  async getLogs(projectId: string, resourceId: string): Promise<string> {
    const { data } = await apiInstance.get(`/projects/${projectId}/resources/${resourceId}/logs`);
    return data;
  },

  getStatus(projectId: string, resourceId: string): Promise<{ status: ProjectStatus }> {
    return apiInstance.get(`/projects/${projectId}/resources/${resourceId}/status`).then(res => res.data);
  }
}; 