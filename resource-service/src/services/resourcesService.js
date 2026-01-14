const { db } = require('../db/db');

// Helper: Get resource owner
exports.getResourceOwner = async (resourceId) => {
  const result = await db.selectFrom('resource')
    .select('owner_id')
    .where('id', '=', parseInt(resourceId))
    .executeTakeFirst();
  return result ? result.owner_id : null;
};

// Create Resource
exports.createResource = async (data) => {
    return await db.insertInto('resource')
        .values(data)
        .returningAll()
        .executeTakeFirst();
};

// Edit Resource
exports.editResource = async (resourceId, data) => {
    const updated = await db.updateTable('resource')
        .set(data)
        .where('id', '=', parseInt(resourceId))
        .returningAll()
        .executeTakeFirst();

    if (!updated) {
        const error = new Error('Resource not found');
        error.statusCode = 404;
        throw error;
    }
    return updated;
};

// Delete Resource
exports.deleteResource = async (resourceId) => {
    const deleted = await db.deleteFrom('resource')
        .where('id', '=', parseInt(resourceId))
        .returningAll()
        .executeTakeFirst();

    if (!deleted) {
        const error = new Error('Resource not found');
        error.statusCode = 404;
        throw error;
    }
};

// Get all available resources (with category & status names)
exports.getAllResources = async () => {
    return await db.selectFrom('resource as r')
        .leftJoin('category as c', 'r.category_id', 'c.id')
        .leftJoin('status as s', 'r.status_id', 's.id')
        .select([
            'r.id',
            'r.title',
            'r.price',
            'r.image_url',
            'r.owner_id',
            'c.name as category_name',
            's.name as status_name'
        ])
        .where('r.status_id', '=', 1) // AVAILABLE
        .execute();
}

// Get resource by ID (with category & status)
exports.getResourceById = async (resourceId) => {
    return await db.selectFrom('resource as r')
        .leftJoin('category as c', 'r.category_id', 'c.id')
        .leftJoin('status as s', 'r.status_id', 's.id')
        .select([
            'r.id',
            'r.title',
            'r.description',
            'r.price',
            'r.image_url',
            'r.owner_id',
            'c.id as category_id',
            'c.name as category_name',
            's.id as status_id',
            's.name as status_name'
        ])
        .where('r.id', '=', parseInt(resourceId))
        .executeTakeFirst();
};

// Filter resources dynamically (with category & status)
exports.filterResources = async (filters) => {
    let query = db.selectFrom('resource as r')
        .leftJoin('category as c', 'r.category_id', 'c.id')
        .leftJoin('status as s', 'r.status_id', 's.id')
        .select([
            'r.id',
            'r.title',
            'r.price',
            'r.image_url',
            'r.owner_id',
            'c.name as category_name',
            's.name as status_name'
        ]);

    if (filters.categoryId) query = query.where('r.category_id', '=', parseInt(filters.categoryId));
    if (filters.ownerId) query = query.where('r.owner_id', '=', parseInt(filters.ownerId));
    if (filters.priceMax) query = query.where('r.price', '<=', parseFloat(filters.priceMax));

    return await query.execute();
};

// Higher-order functions
exports.createCategory = async (data) => {
    return await db.insertInto('category')
        .values(data)
        .returningAll()
        .executeTakeFirst();
}

exports.getResourceAvailability = async (resourceId, buyerId) => {
    const resource = await db.selectFrom('resource')
        .select(['owner_id', 'status_id'])
        .where('id', '=', parseInt(resourceId))
        .executeTakeFirst();

    if (!resource) throw new Error('Resource not found');

    const available = resource.status_id === 1 && resource.owner_id !== parseInt(buyerId);
    return { available, ownerId: resource.owner_id };
};

exports.checkResourceConfirmable = async (resourceId, userId) => {
    const resource = await db.selectFrom('resource')
        .select(['owner_id', 'status_id'])
        .where('id', '=', parseInt(resourceId))
        .executeTakeFirst();

    if (!resource) throw new Error('Resource not found');

    return resource.status_id === 4 && resource.owner_id === parseInt(userId);
};

exports.changeResourceStatus = async (resourceId, statusId) => {
    const updated = await db.updateTable('resource')
        .set({ status_id: statusId })
        .where('id', '=', parseInt(resourceId))
        .returningAll()
        .executeTakeFirst();

    if (!updated) {
        const error = new Error('Resource not found');
        error.statusCode = 404;
        throw error;
    }
    return updated;
};
