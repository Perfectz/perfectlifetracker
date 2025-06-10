/**
 * backend/src/models/ProjectModel.ts
 * Handles project-related database operations using Cosmos DB
 */
import { v4 as uuidv4 } from 'uuid';
import databaseService from '../services/DatabaseService';

// Project Interfaces
export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: ProjectMember[];
  status: 'active' | 'archived' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
}

export interface ProjectMember {
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
}

export interface ProjectInput {
  name: string;
  description: string;
  ownerId: string;
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
}

class ProjectModel {
  /**
   * Create a new project
   */
  async createProject(projectData: ProjectInput): Promise<Project> {
    try {
      const newProject: Project = {
        id: uuidv4(),
        name: projectData.name,
        description: projectData.description,
        ownerId: projectData.ownerId,
        members: [
          {
            userId: projectData.ownerId,
            role: 'owner',
            joinedAt: new Date()
          }
        ],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        tags: projectData.tags || []
      };

      const container = databaseService.getContainer('tasks'); // Using tasks container for projects
      if (!container) {
        throw new Error('Tasks container not available');
      }

      await container.items.create(newProject);
      
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  /**
   * Get project by ID
   */
  async getProjectById(projectId: string): Promise<Project | null> {
    try {
      const container = databaseService.getContainer('tasks');
      if (!container) {
        throw new Error('Tasks container not available');
      }
      
      const { resource } = await container.item(projectId, projectId).read();
      return resource || null;
    } catch (error) {
      console.error('Error getting project by ID:', error);
      return null;
    }
  }

  /**
   * Get projects by owner ID
   */
  async getProjectsByOwnerId(ownerId: string): Promise<Project[]> {
    try {
      const container = databaseService.getContainer('tasks');
      if (!container) {
        throw new Error('Tasks container not available');
      }
      
      const querySpec = {
        query: 'SELECT * FROM c WHERE c.ownerId = @ownerId',
        parameters: [{ name: '@ownerId', value: ownerId }]
      };
      
      const { resources } = await container.items.query(querySpec).fetchAll();
      return resources;
    } catch (error) {
      console.error('Error getting projects by owner ID:', error);
      throw error;
    }
  }

  /**
   * Get projects by member ID
   */
  async getProjectsByMemberId(userId: string): Promise<Project[]> {
    try {
      const container = databaseService.getContainer('tasks');
      if (!container) {
        throw new Error('Tasks container not available');
      }
      
      const querySpec = {
        query: 'SELECT * FROM c JOIN m IN c.members WHERE m.userId = @userId',
        parameters: [{ name: '@userId', value: userId }]
      };
      
      const { resources } = await container.items.query(querySpec).fetchAll();
      return resources;
    } catch (error) {
      console.error('Error getting projects by member ID:', error);
      throw error;
    }
  }

  /**
   * Update project
   */
  async updateProject(projectId: string, updateData: Partial<ProjectInput>): Promise<Project | null> {
    try {
      const container = databaseService.getContainer('tasks');
      if (!container) {
        throw new Error('Tasks container not available');
      }
      
      // First get the existing project
      const { resource: existingProject } = await container.item(projectId, projectId).read();
      if (!existingProject) {
        throw new Error('Project not found');
      }

      // Update project
      const updates = {
        ...existingProject,
        ...updateData,
        updatedAt: new Date()
      };

      const { resource } = await container.item(projectId, projectId).replace(updates);
      return resource;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string): Promise<boolean> {
    try {
      const container = databaseService.getContainer('tasks');
      if (!container) {
        throw new Error('Tasks container not available');
      }
      
      await container.item(projectId, projectId).delete();
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }

  /**
   * Add member to project
   */
  async addProjectMember(projectId: string, userId: string, role: ProjectMember['role'] = 'member'): Promise<boolean> {
    try {
      const container = databaseService.getContainer('tasks');
      if (!container) {
        throw new Error('Tasks container not available');
      }
      
      // Get existing project
      const { resource: project } = await container.item(projectId, projectId).read();
      if (!project) {
        throw new Error('Project not found');
      }

      // Check if user is already a member
      const memberExists = project.members.some((member: ProjectMember) => member.userId === userId);
      if (memberExists) {
        throw new Error('User is already a member of this project');
      }

      // Add member
      const newMember: ProjectMember = {
        userId,
        role,
        joinedAt: new Date()
      };

      project.members.push(newMember);
      project.updatedAt = new Date();

      await container.item(projectId, projectId).replace(project);
      return true;
    } catch (error) {
      console.error('Error adding project member:', error);
      throw error;
    }
  }

  /**
   * Remove member from project
   */
  async removeProjectMember(projectId: string, userId: string): Promise<boolean> {
    try {
      const container = databaseService.getContainer('tasks');
      if (!container) {
        throw new Error('Tasks container not available');
      }
      
      // Get existing project
      const { resource: project } = await container.item(projectId, projectId).read();
      if (!project) {
        throw new Error('Project not found');
      }

      // Remove member
      project.members = project.members.filter((member: ProjectMember) => member.userId !== userId);
      project.updatedAt = new Date();

      await container.item(projectId, projectId).replace(project);
      return true;
    } catch (error) {
      console.error('Error removing project member:', error);
      return false;
    }
  }

  /**
   * Update member role
   */
  async updateMemberRole(projectId: string, userId: string, newRole: ProjectMember['role']): Promise<boolean> {
    try {
      const container = databaseService.getContainer('tasks');
      if (!container) {
        throw new Error('Tasks container not available');
      }
      
      // Get existing project
      const { resource: project } = await container.item(projectId, projectId).read();
      if (!project) {
        throw new Error('Project not found');
      }

      // Update member role
      const memberIndex = project.members.findIndex((member: ProjectMember) => member.userId === userId);
      if (memberIndex === -1) {
        throw new Error('Member not found in project');
      }

      project.members[memberIndex].role = newRole;
      project.updatedAt = new Date();

      await container.item(projectId, projectId).replace(project);
      return true;
    } catch (error) {
      console.error('Error updating member role:', error);
      return false;
    }
  }

  /**
   * Archive project
   */
  async archiveProject(projectId: string): Promise<boolean> {
    try {
      return await this.updateProjectStatus(projectId, 'archived');
    } catch (error) {
      console.error('Error archiving project:', error);
      return false;
    }
  }

  /**
   * Restore project
   */
  async restoreProject(projectId: string): Promise<boolean> {
    try {
      return await this.updateProjectStatus(projectId, 'active');
    } catch (error) {
      console.error('Error restoring project:', error);
      return false;
    }
  }

  /**
   * Complete project
   */
  async completeProject(projectId: string): Promise<boolean> {
    try {
      return await this.updateProjectStatus(projectId, 'completed');
    } catch (error) {
      console.error('Error completing project:', error);
      return false;
    }
  }

  /**
   * Update project status
   */
  private async updateProjectStatus(projectId: string, status: Project['status']): Promise<boolean> {
    try {
      const container = databaseService.getContainer('tasks');
      if (!container) {
        throw new Error('Tasks container not available');
      }
      
      // Get existing project
      const { resource: project } = await container.item(projectId, projectId).read();
      if (!project) {
        throw new Error('Project not found');
      }

      project.status = status;
      project.updatedAt = new Date();

      await container.item(projectId, projectId).replace(project);
      return true;
    } catch (error) {
      console.error('Error updating project status:', error);
      return false;
    }
  }

  /**
   * Search projects
   */
  async searchProjects(query: string, limit: number = 10): Promise<Project[]> {
    try {
      const container = databaseService.getContainer('tasks');
      if (!container) {
        throw new Error('Tasks container not available');
      }
      
      const querySpec = {
        query: 'SELECT TOP @limit * FROM c WHERE CONTAINS(c.name, @query) OR CONTAINS(c.description, @query)',
        parameters: [
          { name: '@query', value: query },
          { name: '@limit', value: limit }
        ]
      };
      
      const { resources } = await container.items.query(querySpec).fetchAll();
      return resources;
    } catch (error) {
      console.error('Error searching projects:', error);
      throw error;
    }
  }
}

export default new ProjectModel(); 