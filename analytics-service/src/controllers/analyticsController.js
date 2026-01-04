const analyticsService = require('../services/analyticsService');

class AnalyticsController {
  /**
   * Obter estatísticas gerais da plataforma
   * GET /analytics/overview
   */
  async getOverview(req, res) {
    try {
      const stats = await analyticsService.getOverallStats();
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obter recursos mais partilhados
   * GET /analytics/top-resources
   */
  async getTopResources(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const resources = await analyticsService.getMostSharedResources(limit);
      
      res.status(200).json({
        success: true,
        data: resources
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obter ranking de utilizadores
   * GET /analytics/user-ranking
   */
  async getUserRanking(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const users = await analyticsService.getUserRanking(limit);
      
      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obter estatísticas de um utilizador
   * GET /analytics/users/:userId
   */
  async getUserStats(req, res) {
    try {
      const { userId } = req.params;
      const stats = await analyticsService.getUserStats(userId);
      
      if (!stats) {
        return res.status(404).json({
          success: false,
          message: 'Estatísticas do utilizador não encontradas'
        });
      }

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obter estatísticas de um recurso
   * GET /analytics/resources/:resourceId
   */
  async getResourceStats(req, res) {
    try {
      const { resourceId } = req.params;
      const stats = await analyticsService.getResourceStats(resourceId);
      
      if (!stats) {
        return res.status(404).json({
          success: false,
          message: 'Estatísticas do recurso não encontradas'
        });
      }

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obter estatísticas diárias
   * GET /analytics/daily-stats
   */
  async getDailyStats(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      const stats = await analyticsService.getDailyStats(days);
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Registar atividade
   * POST /analytics/log-activity
   */
  async logActivity(req, res) {
    try {
      const activity = await analyticsService.logActivity(req.body);
      
      res.status(201).json({
        success: true,
        data: activity
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Atualizar estatísticas de um recurso
   * PUT /analytics/resources/:resourceId
   */
  async updateResourceStats(req, res) {
    try {
      const { resourceId } = req.params;
      const stats = await analyticsService.updateResourceStats(resourceId, req.body);
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Atualizar estatísticas de um utilizador
   * PUT /analytics/users/:userId
   */
  async updateUserStats(req, res) {
    try {
      const { userId } = req.params;
      const stats = await analyticsService.updateUserStats(userId, req.body);
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Gerar relatório
   * POST /analytics/reports
   */
  async generateReport(req, res) {
    try {
      const { type, period } = req.body;
      const generatedBy = req.user?.userId || null;
      
      const report = await analyticsService.generateReport(type, period, generatedBy);
      
      res.status(201).json({
        success: true,
        data: report
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Listar relatórios
   * GET /analytics/reports
   */
  async listReports(req, res) {
    try {
      const filters = {
        type: req.query.type,
        limit: parseInt(req.query.limit) || 50
      };
      
      const reports = await analyticsService.listReports(filters);
      
      res.status(200).json({
        success: true,
        data: reports
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obter relatório específico
   * GET /analytics/reports/:reportId
   */
  async getReport(req, res) {
    try {
      const { reportId } = req.params;
      const report = await analyticsService.getReport(reportId);
      
      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Relatório não encontrado'
        });
      }

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AnalyticsController();
