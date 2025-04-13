/**
 * backend/src/models/ProjectModel.ts
 * Handles project-related database operations
 */
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database';

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

      await db.projects.insertOne(newProject);
      
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
      return await db.projects.findOne({ id: projectId });
    } catch (error) {
      console.error('Error getting project by ID:', error);
      throw error;
    }
  }

  /**
   * Get projects by owner ID
   */
  async getProjectsByOwnerId(ownerId: string): Promise<Project[]> {
    try {
      return await db.projects.find({ ownerId }).toArray();
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
      return await db.projects.find({
        "members.userId": userId
      }).toArray();
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
      // Check if project exists
      const project = await db.projects.findOne({ id: projectId });
      if (!project) {
        throw new Error('Project not found');
      }

      // Update project
      const updates = {
        ...updateData,
        updatedAt: new Date()
      };

      await db.projects.updateOne(
        { id: projectId },
        { $set: updates }
      );

      // Return updated project
      return await this.getProjectById(projectId);
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
      const result = await db.projects.deleteOne({ id: projectId });
      return result.deletedCount === 1;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  /**
   * Add member to project
   */
  async addProjectMember(projectId: string, userId: string, role: ProjectMember['role'] = 'member'): Promise<boolean> {
    try {
      // Check if project exists
      const project = await db.projects.findOne({ id: projectId });
      if (!project) {
        throw new Error('Project not found');
      }

      // Check if user is already a member
      const memberExists = project.members.some(member => member.userId === userId);
      if (memberExists) {
        throw new Error('User is already a member of this project');
      }

      // Add member
      const newMember: ProjectMember = {
        userId,
        role,
        joinedAt: new Date()
      };

      const result = await db.projects.updateOne(
        { id: projectId },
        { 
          $push: { members: newMember },
          $set: { updatedAt: new Date() }
        }
      );

      return result.modifiedCount === 1;
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
      // Check if project exists
      const project = await db.projects.findOne({ id: projectId });
      if (!project) {
        throw new Error('Project not found');
      }

      // Can't remove the owner
      const isOwner = project.members.some(member => 
        member.userId === userId && member.role === 'owner');
      
      if (isOwner) {
        throw new Error('Cannot remove the project owner');
      }

      const result = await db.projects.updateOne(
        { id: projectId },
        { 
          $pull: { members: { userId } },
          $set: { updatedAt: new Date() }
        }
      );

      return result.modifiedCount === 1;
    } catch (error) {
      console.error('Error removing project member:', error);
      throw error;
    }
  }

  /**
   * Update member role
   */
  async updateMemberRole(projectId: string, userId: string, newRole: ProjectMember['role']): Promise<boolean> {
    try {
      // Check if project exists
      const project = await db.projects.findOne({ id: projectId });
      if (!project) {
        throw new Error('Project not found');
      }

      // Check if user is a member
      const memberIndex = project.members.findIndex(member => member.userId === userId);
      if (memberIndex === -1) {
        throw new Error('User is not a member of this project');
      }

      // Can't change owner's role
      if (project.members[memberIndex].role === 'owner' && newRole !== 'owner') {
        throw new Error('Cannot change the role of the project owner');
      }

      // Update role
      const result = await db.projects.updateOne(
        { id: projectId, "members.userId": userId },
        { 
          $set: { 
            "members.$.role": newRole,
            updatedAt: new Date() 
          }
        }
      );

      return result.modifiedCount === 1;
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  }

  /**
   * Archive project
   */
  async archiveProject(projectId: string): Promise<boolean> {
    try {
      const result = await db.projects.updateOne(
        { id: projectId },
        { 
          $set: { 
            status: 'archived',
            updatedAt: new Date() 
          }
        }
      );

      return result.modifiedCount === 1;
    } catch (error) {
      console.error('Error archiving project:', error);
      throw error;
    }
  }

  /**
   * Restore archived project
   */
  async restoreProject(projectId: string): Promise<boolean> {
    try {
      const result = await db.projects.updateOne(
        { id: projectId, status: 'archived' },
        { 
          $set: { 
            status: 'active',
            updatedAt: new Date() 
          }
        }
      );

      return result.modifiedCount === 1;
    } catch (error) {
      console.error('Error restoring project:', error);
      throw error;
    }
  }

  /**
   * Complete project
   */
  async completeProject(projectId: string): Promise<boolean> {
    try {
      const result = await db.projects.updateOne(
        { id: projectId },
        { 
          $set: { 
            status: 'completed',
            updatedAt: new Date(),
            endDate: new Date()
          }
        }
      );

      return result.modifiedCount === 1;
    } catch (error) {
      console.error('Error completing project:', error);
      throw error;
    }
  }

  /**
   * Search projects
   */
  async searchProjects(query: string, limit: number = 10): Promise<Project[]> {
    try {
      return await db.projects.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }).limit(limit).toArray();
    } catch (error) {
      console.error('Error searching projects:', error);
      throw error;
    }
  }
}

export default new ProjectModel(); 