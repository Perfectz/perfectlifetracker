/**
 * backend/src/routes/projectRoutes.ts
 * API routes for project management
 */
import express from 'express';
import projectModel from '../models/ProjectModel';
import userModel from '../models/UserModel';
import { expressjwt, Request as JWTRequest } from 'express-jwt';
import jwksRsa from 'jwks-rsa';

const router = express.Router();

// JWT validation middleware
const checkJwt = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.AZURE_AUTHORITY}/discovery/v2.0/keys`
  }),
  audience: process.env.AZURE_CLIENT_ID,
  issuer: process.env.AZURE_AUTHORITY,
  algorithms: ['RS256']
});

// Middleware to get user ID from JWT token
const getUserId = async (req: JWTRequest, res, next) => {
  try {
    const email = req.auth?.email || req.auth?.preferred_username;
    
    if (!email) {
      return res.status(400).json({ error: 'Missing email in token' });
    }
    
    const user = await userModel.getUserByEmail(email as string);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    req.body.currentUserId = user.id;
    next();
  } catch (error) {
    console.error('Error in getUserId middleware:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all projects for the current user
router.get('/', checkJwt, getUserId, async (req: JWTRequest, res) => {
  try {
    const userId = req.body.currentUserId;
    const projects = await projectModel.getProjectsByMemberId(userId);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get active projects for the current user
router.get('/active', checkJwt, getUserId, async (req: JWTRequest, res) => {
  try {
    const userId = req.body.currentUserId;
    const projects = (await projectModel.getProjectsByMemberId(userId)).filter(p => p.status === 'active');
    res.json(projects);
  } catch (error) {
    console.error('Error fetching active projects:', error);
    res.status(500).json({ error: 'Failed to fetch active projects' });
  }
});

// Get projects owned by the current user
router.get('/owned', checkJwt, getUserId, async (req: JWTRequest, res) => {
  try {
    const userId = req.body.currentUserId;
    const projects = await projectModel.getProjectsByOwnerId(userId);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching owned projects:', error);
    res.status(500).json({ error: 'Failed to fetch owned projects' });
  }
});

// Create a new project
router.post('/', checkJwt, getUserId, async (req: JWTRequest, res) => {
  try {
    const { name, description, startDate, endDate, currentUserId } = req.body;
    
    if (!name) {
      res.status(400).json({ error: 'Project name is required' });
      return;
    }
    
    const project = await projectModel.createProject({
      name,
      description,
      ownerId: currentUserId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    });
    
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get a specific project
router.get('/:id', checkJwt, getUserId, async (req: JWTRequest, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.body.currentUserId;
    
    const project = await projectModel.getProjectById(projectId);
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    // Check if user is a member of the project
    const isMember = project.members.some(member => member.userId === userId);
    if (!isMember) {
      res.status(403).json({ error: 'You do not have access to this project' });
      return;
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Update a project
router.put('/:id', checkJwt, getUserId, async (req: JWTRequest, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.body.currentUserId;
    const { name, description, startDate, endDate } = req.body;
    
    const project = await projectModel.getProjectById(projectId);
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    // Check if user has permission to update (owner or admin)
    const userRole = project.members.find(member => member.userId === userId)?.role;
    if (!userRole || (userRole !== 'owner' && userRole !== 'admin')) {
      res.status(403).json({ error: 'You do not have permission to update this project' });
      return;
    }
    
    const updatedProject = await projectModel.updateProject(projectId, {
      name,
      description,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    });
    
    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Add a member to a project
router.post('/:id/members', checkJwt, getUserId, async (req: JWTRequest, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.body.currentUserId;
    const { memberEmail, role } = req.body;
    
    if (!memberEmail || !role) {
      res.status(400).json({ error: 'Member email and role are required' });
      return;
    }
    
    const project = await projectModel.getProjectById(projectId);
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    // Check if user has permission to add members (owner or admin)
    const userRole = project.members.find(member => member.userId === userId)?.role;
    if (!userRole || (userRole !== 'owner' && userRole !== 'admin')) {
      res.status(403).json({ error: 'You do not have permission to add members to this project' });
      return;
    }
    
    // Get the user ID for the member email
    const member = await userModel.getUserByEmail(memberEmail);
    if (!member) {
      res.status(404).json({ error: 'User with this email not found' });
      return;
    }
    
    const success = await projectModel.addProjectMember(projectId, member.id, role);
    
    if (success) {
      const updatedProject = await projectModel.getProjectById(projectId);
      res.json(updatedProject);
    } else {
      res.status(500).json({ error: 'Failed to add member to project' });
    }
  } catch (error) {
    console.error('Error adding member to project:', error);
    res.status(500).json({ error: 'Failed to add member to project' });
  }
});

// Remove a member from a project
router.delete('/:id/members/:memberId', checkJwt, getUserId, async (req: JWTRequest, res) => {
  try {
    const projectId = req.params.id;
    const memberId = req.params.memberId;
    const userId = req.body.currentUserId;
    
    const project = await projectModel.getProjectById(projectId);
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    // Check if user has permission to remove members (owner or admin)
    const userRole = project.members.find(member => member.userId === userId)?.role;
    if (!userRole || (userRole !== 'owner' && userRole !== 'admin')) {
      res.status(403).json({ error: 'You do not have permission to remove members from this project' });
      return;
    }
    
    // Cannot remove the owner
    if (project.ownerId === memberId) {
      res.status(400).json({ error: 'Cannot remove the project owner' });
      return;
    }
    
    const success = await projectModel.removeProjectMember(projectId, memberId);
    
    if (success) {
      const updatedProject = await projectModel.getProjectById(projectId);
      res.json(updatedProject);
    } else {
      res.status(500).json({ error: 'Failed to remove member from project' });
    }
  } catch (error) {
    console.error('Error removing member from project:', error);
    res.status(500).json({ error: 'Failed to remove member from project' });
  }
});

// Update a member's role in a project
router.put('/:id/members/:memberId', checkJwt, getUserId, async (req: JWTRequest, res) => {
  try {
    const projectId = req.params.id;
    const memberId = req.params.memberId;
    const userId = req.body.currentUserId;
    const { role } = req.body;
    
    if (!role) {
      res.status(400).json({ error: 'Role is required' });
      return;
    }
    
    const project = await projectModel.getProjectById(projectId);
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    // Only the owner can change roles
    if (project.ownerId !== userId) {
      res.status(403).json({ error: 'Only the project owner can change member roles' });
      return;
    }
    
    // Cannot change the owner's role
    if (project.ownerId === memberId && role !== 'owner') {
      res.status(400).json({ error: 'Cannot change the role of the project owner' });
      return;
    }
    
    const updatedProject = await projectModel.updateMemberRole(projectId, memberId, role);
    
    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({ error: 'Failed to update member role' });
  }
});

// Archive a project
router.post('/:id/archive', checkJwt, getUserId, async (req: JWTRequest, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.body.currentUserId;
    
    const project = await projectModel.getProjectById(projectId);
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    // Only owner or admin can archive a project
    const userRole = project.members.find(member => member.userId === userId)?.role;
    if (!userRole || (userRole !== 'owner' && userRole !== 'admin')) {
      res.status(403).json({ error: 'You do not have permission to archive this project' });
      return;
    }
    
    const updatedProject = await projectModel.archiveProject(projectId);
    
    res.json(updatedProject);
  } catch (error) {
    console.error('Error archiving project:', error);
    res.status(500).json({ error: 'Failed to archive project' });
  }
});

// Complete a project
router.post('/:id/complete', checkJwt, getUserId, async (req: JWTRequest, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.body.currentUserId;
    
    const project = await projectModel.getProjectById(projectId);
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    // Only owner or admin can complete a project
    const userRole = project.members.find(member => member.userId === userId)?.role;
    if (!userRole || (userRole !== 'owner' && userRole !== 'admin')) {
      res.status(403).json({ error: 'You do not have permission to complete this project' });
      return;
    }
    
    const updatedProject = await projectModel.completeProject(projectId);
    
    res.json(updatedProject);
  } catch (error) {
    console.error('Error completing project:', error);
    res.status(500).json({ error: 'Failed to complete project' });
  }
});

// Reactivate a project
router.post('/:id/reactivate', checkJwt, getUserId, async (req: JWTRequest, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.body.currentUserId;
    
    const project = await projectModel.getProjectById(projectId);
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    // Check if user has permission to reactivate project (owner or admin)
    const userRole = project.members.find(member => member.userId === userId)?.role;
    if (!userRole || (userRole !== 'owner' && userRole !== 'admin')) {
      res.status(403).json({ error: 'You do not have permission to reactivate this project' });
      return;
    }

    const success = await projectModel.restoreProject(projectId);
    
    if (success) {
      const updatedProject = await projectModel.getProjectById(projectId);
      res.json(updatedProject);
    } else {
      res.status(500).json({ error: 'Failed to reactivate project' });
    }
  } catch (error) {
    console.error('Error reactivating project:', error);
    res.status(500).json({ error: 'Failed to reactivate project' });
  }
});

// Restore an archived project
router.post('/:id/restore', checkJwt, getUserId, async (req: JWTRequest, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.body.currentUserId;
    
    const project = await projectModel.getProjectById(projectId);
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    // Check if project is already active
    if (project.status === 'active') {
      res.status(400).json({ error: 'Project is already active' });
      return;
    }
    
    // Check if user has permission to restore the project (owner only)
    if (project.ownerId !== userId) {
      res.status(403).json({ error: 'Only the project owner can restore this project' });
      return;
    }
    
    const success = await projectModel.restoreProject(projectId);
    
    if (success) {
      const updatedProject = await projectModel.getProjectById(projectId);
      res.json(updatedProject);
    } else {
      res.status(500).json({ error: 'Failed to restore project' });
    }
  } catch (error) {
    console.error('Error restoring project:', error);
    res.status(500).json({ error: 'Failed to restore project' });
  }
});

// Delete a project
router.delete('/:id', checkJwt, getUserId, async (req: JWTRequest, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.body.currentUserId;
    
    const project = await projectModel.getProjectById(projectId);
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    // Only the owner can delete a project
    if (project.ownerId !== userId) {
      res.status(403).json({ error: 'Only the project owner can delete the project' });
      return;
    }
    
    await projectModel.deleteProject(projectId);
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router; 