const { db } = require('../db/db');
const { publishUserUpdated } = require("../events/userPublisher");

exports.getUserProfile = async (userId) => {
    // const user = await prisma.user.findUnique({
    //     where: { id: userId },
    //     select: {
    //         id: true,
    //         name: true,
    //         email: true,  
    //         reputation: true,
    //         address: true, 
    //         course: { select: { id: true, name: true } },
    //         university: { select: { id: true, name: true } },
    //         role: { select: { id: true, name: true } },
    //         createdAt: true,
    //     }
    // });
    const user = await db
        .selectFrom('users')
        .leftJoin('course', 'users.course_id', 'course.id')
        .leftJoin('university', 'users.university_id', 'university.id')
        .leftJoin('role', 'users.role_id', 'role.id')
        .select([  
            'users.id',
            'users.name',
            'users.email',
            'users.reputation',
            'users.address',
            'course.id as courseId',
            'course.name as courseName',
            'university.id as universityId',
            'university.name as universityName',
            'role.id as roleId',
            'role.name as roleName',
            'users.created_at as createdAt',
        ])
        .where('users.id', '=', userId)
        .executeTakeFirst();

    if (!user) return null;

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        reputation: user.reputation,
        address: user.address,
        course: user.courseId ? { id: user.courseId, name: user.courseName } : null,
        university: user.universityId ? { id: user.universityId, name: user.universityName } : null,
        role: user.roleId ? { id: user.roleId, name: user.roleName } : null,
        createdAt: user.createdAt,
    };
}

exports.updateUserProfile = async (userId, updateData) => {
    // // Validate foreign keys if they are being updated
    // if (updateData.universityId) {
    //     const universityExists = await prisma.university.findUnique({
    //         where: { id: updateData.universityId }
    //     });
    //     if (!universityExists) {
    //         throw new Error('University ID does not exist.'); // Handled by 400 in controller
    //     }
    // }
    // if (updateData.courseId) {
    //     const courseExists = await prisma.course.findUnique({ 
    //         where: { id: updateData.courseId } 
    //     });
    //     if (!courseExists) {
    //         throw new Error('Course ID does not exist.'); // Handled by 400 in controller
    //     }
    // }

    // 1. Build a dynamic update object
    // Only include fields if they exist in the updateData

    // Optional: Add this inside updateUserProfile if both are provided
    if (updateData.course_id && updateData.university_id) {
        const match = await db
            .selectFrom('course')
            .select('id')
            .where('id', '=', Number(updateData.course_id))
            .where('university_id', '=', Number(updateData.university_id))
            .executeTakeFirst();
        
        if (!match) throw new Error('Selected course does not belong to this university');
    }

    const fieldsToUpdate = {};
    
    if (updateData.address !== undefined) fieldsToUpdate.address = updateData.address;
    if (updateData.course_id !== undefined) {
        fieldsToUpdate.course_id = updateData.course_id ? Number(updateData.course_id) : null;
    }
    if (updateData.university_id !== undefined) {
        fieldsToUpdate.university_id = updateData.university_id ? Number(updateData.university_id) : null;
    }

    // If no fields are provided, just return the current profile
    if (Object.keys(fieldsToUpdate).length === 0) {
        return await exports.getUserProfile(userId);
    }

    // 2. Perform the update
    // Kysely will only generate SQL for the keys present in fieldsToUpdate
    await db
        .updateTable('users')
        .set(fieldsToUpdate)
        .where('id', '=', userId)
        .execute();

    // 3. Re-fetch the full joined profile
    const fullProfile = await exports.getUserProfile(userId);

    // 4. Publish Event
    if (fullProfile) {
        publishUserUpdated({
            userId: fullProfile.id,
            name: fullProfile.name,
            reputation: fullProfile.reputation,
            university: fullProfile.university?.name,
            course: fullProfile.course?.name
        });
    }

    return fullProfile;
}

exports.changeUserRole = async (userId, roleId) => {
    // 1. Validar se a Role existe e já buscar o nome dela (otimização)
    const role = await db
        .selectFrom('role')
        .select(['id', 'name'])
        .where('id', '=', roleId)
        .executeTakeFirst();

    if (!role) {
        throw new Error('Role ID does not exist.');
    }

    // 2. Atualizar o role_id do usuário
    // Usamos parseInt para garantir que o ID seja tratado como número pelo Postgres
    const updatedUser = await db
        .updateTable('user')
        .set({ role_id: roleId })
        .where('id', '=', parseInt(userId))
        .returning(['id', 'name', 'email'])
        .executeTakeFirst();

    if (!updatedUser) {
        throw new Error('User not found.');
    }

    // 3. Publicar o evento com o nome da Role que buscamos no passo 1
    publishUserUpdated({
        userId: updatedUser.id,
        name: updatedUser.name,
        role: role.name, // Nome vindo da nossa validação inicial
    });

    // 4. Retornar o objeto no formato esperado (com o objeto role aninhado)
    return {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: {
            id: role.id,
            name: role.name
        }
    };
}
