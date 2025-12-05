const resourceService = require('../services/resourcesService');

exports.createResource = async (req, res) => {
    try {
        const ownerId = req.user.id;

        const { title, categoryId, description, price, imageUrl } = req.body;

        if(!title || !categoryId) {
            return res.status(400).json({ error: 'Title and Category ID are required' });
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
        res.status(500).json({ error: 'Failed to create resource' });
    }   
};