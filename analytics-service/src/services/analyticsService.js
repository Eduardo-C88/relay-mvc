const { PrismaClient } = require('@prisma/client');
const { startOfDay, endOfDay, subDays, format } = require('date-fns');

const prisma = new PrismaClient();

class AnalyticsService {
  /**
   * Registar um evento/atividade
   */
  async logActivity(data) {
    try {
      return await prisma.activityLog.create({
        data: {
          userId: data.userId,
          userName: data.userName || null,
          eventType: data.eventType,
          entityType: data.entityType || null,
          entityId: data.entityId || null,
          metadata: data.metadata || null
        }
      });
    } catch (error) {
      throw new Error(`Erro ao registar atividade: ${error.message}`);
    }
  }

  /**
   * Obter estatísticas gerais da plataforma
   */
  async getOverallStats() {
    try {
      const [
        totalUsers,
        totalResources,
        totalBorrowings,
        totalReviews,
        activeToday
      ] = await Promise.all([
        prisma.userStats.count(),
        prisma.resourceStats.count(),
        prisma.activityLog.count({
          where: { eventType: 'BORROWING_CREATED' }
        }),
        prisma.activityLog.count({
          where: { eventType: 'REVIEW_CREATED' }
        }),
        prisma.activityLog.count({
          where: {
            timestamp: {
              gte: startOfDay(new Date()),
              lte: endOfDay(new Date())
            }
          }
        })
      ]);

      return {
        totalUsers,
        totalResources,
        totalBorrowings,
        totalReviews,
        activeUsersToday: activeToday
      };
    } catch (error) {
      throw new Error(`Erro ao obter estatísticas gerais: ${error.message}`);
    }
  }

  /**
   * Obter recursos mais partilhados
   */
  async getMostSharedResources(limit = 10) {
    try {
      return await prisma.resourceStats.findMany({
        orderBy: { totalBorrowings: 'desc' },
        take: limit,
        select: {
          resourceId: true,
          resourceTitle: true,
          ownerName: true,
          category: true,
          totalBorrowings: true,
          totalViews: true,
          avgBorrowingDays: true,
          lastBorrowedAt: true
        }
      });
    } catch (error) {
      throw new Error(`Erro ao obter recursos mais partilhados: ${error.message}`);
    }
  }

  /**
   * Obter ranking de utilizadores por reputação
   */
  async getUserRanking(limit = 20) {
    try {
      return await prisma.userStats.findMany({
        orderBy: { reputationScore: 'desc' },
        take: limit,
        select: {
          userId: true,
          userName: true,
          totalResourcesShared: true,
          totalResourcesBorrowed: true,
          avgRatingReceived: true,
          reputationScore: true,
          lastActiveAt: true
        }
      });
    } catch (error) {
      throw new Error(`Erro ao obter ranking de utilizadores: ${error.message}`);
    }
  }

  /**
   * Obter estatísticas de um utilizador específico
   */
  async getUserStats(userId) {
    try {
      const userStats = await prisma.userStats.findUnique({
        where: { userId }
      });

      if (!userStats) {
        return null;
      }

      // Obter atividades recentes
      const recentActivities = await prisma.activityLog.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: 10,
        select: {
          eventType: true,
          timestamp: true,
          metadata: true
        }
      });

      return {
        ...userStats,
        recentActivities
      };
    } catch (error) {
      throw new Error(`Erro ao obter estatísticas do utilizador: ${error.message}`);
    }
  }

  /**
   * Obter estatísticas de um recurso específico
   */
  async getResourceStats(resourceId) {
    try {
      const resourceStats = await prisma.resourceStats.findUnique({
        where: { resourceId }
      });

      if (!resourceStats) {
        return null;
      }

      return resourceStats;
    } catch (error) {
      throw new Error(`Erro ao obter estatísticas do recurso: ${error.message}`);
    }
  }

  /**
   * Obter estatísticas diárias para um período
   */
  async getDailyStats(days = 30) {
    try {
      const startDate = startOfDay(subDays(new Date(), days));
      
      return await prisma.dailyStats.findMany({
        where: {
          date: { gte: startDate }
        },
        orderBy: { date: 'desc' }
      });
    } catch (error) {
      throw new Error(`Erro ao obter estatísticas diárias: ${error.message}`);
    }
  }

  /**
   * Atualizar estatísticas de um recurso
   */
  async updateResourceStats(resourceId, data) {
    try {
      return await prisma.resourceStats.upsert({
        where: { resourceId },
        update: {
          totalBorrowings: data.totalBorrowings,
          totalViews: data.totalViews,
          avgBorrowingDays: data.avgBorrowingDays,
          lastBorrowedAt: data.lastBorrowedAt,
          resourceTitle: data.resourceTitle,
          ownerId: data.ownerId,
          ownerName: data.ownerName,
          category: data.category
        },
        create: {
          resourceId,
          resourceTitle: data.resourceTitle,
          ownerId: data.ownerId,
          ownerName: data.ownerName || null,
          category: data.category || null,
          totalBorrowings: data.totalBorrowings || 0,
          totalViews: data.totalViews || 0,
          avgBorrowingDays: data.avgBorrowingDays || null,
          lastBorrowedAt: data.lastBorrowedAt || null
        }
      });
    } catch (error) {
      throw new Error(`Erro ao atualizar estatísticas do recurso: ${error.message}`);
    }
  }

  /**
   * Atualizar estatísticas de um utilizador
   */
  async updateUserStats(userId, data) {
    try {
      return await prisma.userStats.upsert({
        where: { userId },
        update: {
          userName: data.userName,
          totalResourcesShared: data.totalResourcesShared,
          totalResourcesBorrowed: data.totalResourcesBorrowed,
          totalReviewsGiven: data.totalReviewsGiven,
          totalReviewsReceived: data.totalReviewsReceived,
          avgRatingReceived: data.avgRatingReceived,
          avgRatingGiven: data.avgRatingGiven,
          reputationScore: data.reputationScore,
          lastActiveAt: new Date()
        },
        create: {
          userId,
          userName: data.userName,
          totalResourcesShared: data.totalResourcesShared || 0,
          totalResourcesBorrowed: data.totalResourcesBorrowed || 0,
          totalReviewsGiven: data.totalReviewsGiven || 0,
          totalReviewsReceived: data.totalReviewsReceived || 0,
          avgRatingReceived: data.avgRatingReceived || null,
          avgRatingGiven: data.avgRatingGiven || null,
          reputationScore: data.reputationScore || 0,
          lastActiveAt: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Erro ao atualizar estatísticas do utilizador: ${error.message}`);
    }
  }

  /**
   * Gerar relatório personalizado
   */
  async generateReport(type, period, generatedBy = null) {
    try {
      let data = {};

      switch (type) {
        case 'DAILY':
          data = await this.getDailyReport();
          break;
        case 'WEEKLY':
          data = await this.getWeeklyReport();
          break;
        case 'MONTHLY':
          data = await this.getMonthlyReport();
          break;
        default:
          throw new Error('Tipo de relatório inválido');
      }

      const report = await prisma.report.create({
        data: {
          title: `Relatório ${type} - ${period}`,
          type,
          period,
          data,
          generatedBy
        }
      });

      return report;
    } catch (error) {
      throw new Error(`Erro ao gerar relatório: ${error.message}`);
    }
  }

  /**
   * Obter relatório diário
   */
  async getDailyReport() {
    const today = startOfDay(new Date());
    
    const [stats, topResources, topUsers] = await Promise.all([
      this.getOverallStats(),
      this.getMostSharedResources(5),
      this.getUserRanking(5)
    ]);

    return {
      date: format(today, 'yyyy-MM-dd'),
      overview: stats,
      topResources,
      topUsers
    };
  }

  /**
   * Obter relatório semanal
   */
  async getWeeklyReport() {
    const stats = await this.getDailyStats(7);
    const [topResources, topUsers] = await Promise.all([
      this.getMostSharedResources(10),
      this.getUserRanking(10)
    ]);

    return {
      period: 'Últimos 7 dias',
      dailyStats: stats,
      topResources,
      topUsers
    };
  }

  /**
   * Obter relatório mensal
   */
  async getMonthlyReport() {
    const stats = await this.getDailyStats(30);
    const [topResources, topUsers] = await Promise.all([
      this.getMostSharedResources(20),
      this.getUserRanking(20)
    ]);

    return {
      period: 'Últimos 30 dias',
      dailyStats: stats,
      topResources,
      topUsers
    };
  }

  /**
   * Listar relatórios gerados
   */
  async listReports(filters = {}) {
    try {
      const where = {};
      
      if (filters.type) {
        where.type = filters.type;
      }

      return await prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50
      });
    } catch (error) {
      throw new Error(`Erro ao listar relatórios: ${error.message}`);
    }
  }

  /**
   * Obter um relatório específico
   */
  async getReport(reportId) {
    try {
      return await prisma.report.findUnique({
        where: { id: reportId }
      });
    } catch (error) {
      throw new Error(`Erro ao obter relatório: ${error.message}`);
    }
  }
}

module.exports = new AnalyticsService();
