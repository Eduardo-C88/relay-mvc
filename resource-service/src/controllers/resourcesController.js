const resourceService = require("../services/resourcesService");

exports.createResource = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const { title, categoryId, description, price, imageUrl } = req.body;

    if (!title || !categoryId) {
      return res
        .status(400)
        .json({ error: "Title and Category ID are required" });
    }

    const resourceData = {};
    resourceData.ownerId = ownerId;
    resourceData.title = title;
    resourceData.categoryId = categoryId;

    if (description !== undefined) resourceData.description = description;
    if (price !== undefined) resourceData.price = price;
    if (imageUrl !== undefined) resourceData.imageUrl = imageUrl;

    const newResource = await resourceService.createResource(resourceData);
    res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ error: "Failed to create resource" });
  }
};

exports.editResource = async (req, res) => {
  const resourceId = req.params.id;
  const currentUserId = req.user.id; // Guaranteed by authMiddleware

  // 1. Destructure the request body for clarity
  const { 
      title, 
      categoryId, 
      description, 
      price, 
      imageUrl 
  } = req.body;

  try {
      // --- AUTHORIZATION CHECK ---
      const existingResource = await resourceService.getResourceOwner(resourceId);

      if (!existingResource) {
          return res.status(404).json({ error: 'Resource not found' });
      }

      if (existingResource.ownerId !== currentUserId) {
          // 403 Forbidden: User is authenticated but not allowed to access this resource
          return res.status(403).json({ error: 'Forbidden: You do not own this resource' });
      }

      // --- PREPARE DATA ---
      // Create an object containing only fields present in the request body
      const updateData = {};
      
      // This relies on validationMiddleware ensuring required fields (like title/categoryId) are present.
      if (title !== undefined) updateData.title = title;
      if (categoryId !== undefined) updateData.categoryId = categoryId;
      if (description !== undefined) updateData.description = description;
      if (price !== undefined) updateData.price = price;
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

      // If no fields are provided for update (after validation check), return 400
      if (Object.keys(updateData).length === 0) {
          return res.status(400).json({ error: 'No valid fields provided for update.' });
      }

      // --- SERVICE CALL ---
      const updatedResource = await resourceService.editResource(
          resourceId,
          updateData
      );

      res.status(200).json(updatedResource);

  } catch (error) {
      // Check for the custom statusCode set in the Service layer (e.g., 404)
      if (error.statusCode) {
           return res.status(error.statusCode).json({ error: error.message });
      }
      
      // Log the actual error for server-side debugging
      console.error('Failed to edit resource:', error);
      
      // Generic 500 for all other unexpected errors
      res.status(500).json({ error: 'Failed to edit resource due to server error' });
  }
};

exports.deleteResource = async (req, res) => {
  const resourceId = req.params.id;
  const currentUserId = req.user.id;
  const currentUserRoleId = req.user.roleId; // <--- Assume this is passed by auth middleware

  try {
      const existingResource = await resourceService.getResourceOwner(resourceId);

      if (!existingResource) {
          return res.status(404).json({ error: "Resource not found" });
      }
      
      // --- IMPROVED AUTHORIZATION CHECK ---
      const isOwner = existingResource.ownerId === currentUserId;
      const isAdminOrModerator = 
          currentUserRoleId === 3 || 
          currentUserRoleId === 2;

      // Allow deletion if the user is the owner OR a privileged role
      if (!isOwner && !isAdminOrModerator) {
           return res
              .status(403)
              .json({ error: "Forbidden: You do not have permission to delete this resource" });
      }

      // Proceed to delete the resource
      await resourceService.deleteResource(resourceId);
      
      // Use 204 No Content for a successful deletion
      return res.status(204).send();

  } catch (error) {
      // Log the error for server-side inspection
      console.error('Resource deletion failed:', error); 
      
      // Ensure you also handle the specific 404 error from the Service layer (if applicable)
      if (error.statusCode === 404) {
           return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({ error: "Failed to delete resource due to server error" });
  }
};