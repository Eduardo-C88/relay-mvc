const analyticsService = require('../services/analyticsService');

// Mock do Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    activityLog: {
      create: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn()
    },
    resourceStats: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn()
    },
    userStats: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn()
    },
    dailyStats: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn()
    },
    report: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn()
    }
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma)
  };
});

describe('Analytics Service', () => {
  describe('logActivity', () => {
    it('deve registar uma atividade com sucesso', async () => {
      const activityData = {
        userId: 'user-123',
        userName: 'João Silva',
        eventType: 'RESOURCE_CREATED',
        entityType: 'RESOURCE',
        entityId: 'resource-456'
      };

      // Mock da resposta
      const mockActivity = {
        id: 'activity-789',
        ...activityData,
        timestamp: new Date()
      };

      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      prisma.activityLog.create.mockResolvedValue(mockActivity);

      const result = await analyticsService.logActivity(activityData);

      expect(result).toEqual(mockActivity);
      expect(prisma.activityLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: activityData.userId,
          eventType: activityData.eventType
        })
      });
    });

    it('deve lançar erro ao falhar registo', async () => {
      const activityData = {
        userId: 'user-123',
        eventType: 'RESOURCE_CREATED'
      };

      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      prisma.activityLog.create.mockRejectedValue(new Error('Database error'));

      await expect(analyticsService.logActivity(activityData)).rejects.toThrow();
    });
  });

  describe('getMostSharedResources', () => {
    it('deve retornar os recursos mais partilhados', async () => {
      const mockResources = [
        {
          resourceId: 'res-1',
          resourceTitle: 'Cálculo I',
          totalBorrowings: 50,
          totalViews: 120
        },
        {
          resourceId: 'res-2',
          resourceTitle: 'Física II',
          totalBorrowings: 45,
          totalViews: 100
        }
      ];

      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      prisma.resourceStats.findMany.mockResolvedValue(mockResources);

      const result = await analyticsService.getMostSharedResources(10);

      expect(result).toEqual(mockResources);
      expect(prisma.resourceStats.findMany).toHaveBeenCalledWith({
        orderBy: { totalBorrowings: 'desc' },
        take: 10,
        select: expect.any(Object)
      });
    });
  });

  describe('getUserRanking', () => {
    it('deve retornar o ranking de utilizadores', async () => {
      const mockUsers = [
        {
          userId: 'user-1',
          userName: 'João Silva',
          reputationScore: 95.5,
          totalResourcesShared: 20
        },
        {
          userId: 'user-2',
          userName: 'Maria Santos',
          reputationScore: 92.0,
          totalResourcesShared: 15
        }
      ];

      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      prisma.userStats.findMany.mockResolvedValue(mockUsers);

      const result = await analyticsService.getUserRanking(20);

      expect(result).toEqual(mockUsers);
      expect(prisma.userStats.findMany).toHaveBeenCalledWith({
        orderBy: { reputationScore: 'desc' },
        take: 20,
        select: expect.any(Object)
      });
    });
  });
});
