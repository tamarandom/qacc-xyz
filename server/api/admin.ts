/**
 * Admin API Routes
 * 
 * These routes are used for maintenance operations like refreshing cache data.
 * They have been moved to the main routes.ts file for simplicity.
 */

import { Express } from "express";
import { invalidateAllProjectCaches, invalidateProjectCache } from "../cache";

/**
 * Register admin API routes
 * 
 * @param app - Express application
 */
export function registerAdminRoutes(app: Express): void {
  // Force refresh all project caches
  app.post('/api/admin/refresh-cache', async (req, res) => {
    try {
      console.log('Manual cache refresh requested for all projects');
      // Invalidate all caches to force refresh on next access
      invalidateAllProjectCaches();
      res.json({ success: true, message: 'All project data caches marked for refresh' });
    } catch (error) {
      console.error('Error refreshing caches:', error);
      res.status(500).json({ error: 'Failed to refresh caches' });
    }
  });

  // Force refresh a specific project's cache
  app.post('/api/admin/refresh-cache/:projectId', async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      
      console.log(`Manual cache refresh requested for project ${projectId}`);
      invalidateProjectCache(projectId);
      res.json({ success: true, message: `Project ${projectId} cache marked for refresh` });
    } catch (error) {
      console.error('Error refreshing cache:', error);
      res.status(500).json({ error: 'Failed to refresh cache' });
    }
  });
}