// health/health.controller.js
const { checkAllServices } = require('./health.service');

exports.getHealthStatus = async (_, res) => {
  try {
    const result = await checkAllServices();

    const statusCode = result.isHealthy ? 200 : 503;
    
    res.status(statusCode).json({
      status: result.isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: result.services,
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
};
