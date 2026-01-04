const express = require('express');
const { body, param, query } = require('express-validator');
const analyticsController = require('../controllers/analyticsController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Estatísticas e relatórios da plataforma
 */

/**
 * @swagger
 * /analytics/overview:
 *   get:
 *     summary: Obter estatísticas gerais da plataforma
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas obtidas com sucesso
 *       401:
 *         description: Não autorizado
 */
router.get('/overview', verifyToken, analyticsController.getOverview);

/**
 * @swagger
 * /analytics/top-resources:
 *   get:
 *     summary: Obter recursos mais partilhados
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número de recursos a retornar (padrão 10)
 *     responses:
 *       200:
 *         description: Lista de recursos mais partilhados
 */
router.get('/top-resources', analyticsController.getTopResources);

/**
 * @swagger
 * /analytics/user-ranking:
 *   get:
 *     summary: Obter ranking de utilizadores
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número de utilizadores a retornar (padrão 20)
 *     responses:
 *       200:
 *         description: Ranking de utilizadores
 */
router.get('/user-ranking', analyticsController.getUserRanking);

/**
 * @swagger
 * /analytics/users/{userId}:
 *   get:
 *     summary: Obter estatísticas de um utilizador
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estatísticas do utilizador
 *       404:
 *         description: Utilizador não encontrado
 */
router.get(
  '/users/:userId',
  verifyToken,
  param('userId').isString().notEmpty(),
  validate,
  analyticsController.getUserStats
);

/**
 * @swagger
 * /analytics/resources/{resourceId}:
 *   get:
 *     summary: Obter estatísticas de um recurso
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estatísticas do recurso
 *       404:
 *         description: Recurso não encontrado
 */
router.get(
  '/resources/:resourceId',
  verifyToken,
  param('resourceId').isString().notEmpty(),
  validate,
  analyticsController.getResourceStats
);

/**
 * @swagger
 * /analytics/daily-stats:
 *   get:
 *     summary: Obter estatísticas diárias
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *         description: Número de dias (padrão 30)
 *     responses:
 *       200:
 *         description: Estatísticas diárias
 */
router.get(
  '/daily-stats',
  verifyToken,
  requireAdmin,
  analyticsController.getDailyStats
);

/**
 * @swagger
 * /analytics/log-activity:
 *   post:
 *     summary: Registar uma atividade
 *     tags: [Analytics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - eventType
 *             properties:
 *               userId:
 *                 type: string
 *               userName:
 *                 type: string
 *               eventType:
 *                 type: string
 *               entityType:
 *                 type: string
 *               entityId:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Atividade registada
 */
router.post(
  '/log-activity',
  body('userId').isString().notEmpty(),
  body('eventType').isString().notEmpty(),
  body('userName').optional().isString(),
  body('entityType').optional().isString(),
  body('entityId').optional().isString(),
  body('metadata').optional().isObject(),
  validate,
  analyticsController.logActivity
);

/**
 * @swagger
 * /analytics/resources/{resourceId}:
 *   put:
 *     summary: Atualizar estatísticas de um recurso
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Estatísticas atualizadas
 */
router.put(
  '/resources/:resourceId',
  verifyToken,
  param('resourceId').isString().notEmpty(),
  validate,
  analyticsController.updateResourceStats
);

/**
 * @swagger
 * /analytics/users/{userId}:
 *   put:
 *     summary: Atualizar estatísticas de um utilizador
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Estatísticas atualizadas
 */
router.put(
  '/users/:userId',
  verifyToken,
  param('userId').isString().notEmpty(),
  validate,
  analyticsController.updateUserStats
);

/**
 * @swagger
 * /analytics/reports:
 *   post:
 *     summary: Gerar relatório
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - period
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [DAILY, WEEKLY, MONTHLY]
 *               period:
 *                 type: string
 *     responses:
 *       201:
 *         description: Relatório gerado
 */
router.post(
  '/reports',
  verifyToken,
  requireAdmin,
  body('type').isIn(['DAILY', 'WEEKLY', 'MONTHLY']),
  body('period').isString().notEmpty(),
  validate,
  analyticsController.generateReport
);

/**
 * @swagger
 * /analytics/reports:
 *   get:
 *     summary: Listar relatórios
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de relatórios
 */
router.get(
  '/reports',
  verifyToken,
  requireAdmin,
  analyticsController.listReports
);

/**
 * @swagger
 * /analytics/reports/{reportId}:
 *   get:
 *     summary: Obter relatório específico
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Relatório obtido
 *       404:
 *         description: Relatório não encontrado
 */
router.get(
  '/reports/:reportId',
  verifyToken,
  requireAdmin,
  param('reportId').isString().notEmpty(),
  validate,
  analyticsController.getReport
);

module.exports = router;
