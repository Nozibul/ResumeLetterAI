const Database = require('../config/database');
const { healthCheck: redisHealthCheck } = require('../config/redis');

exports.checkAllServices = async () => {
  const results = await Promise.allSettled([
    Database.healthCheck(),
    redisHealthCheck(),
    // Future: add more services here
    // checkAIService(), checkEmailService(), etc.
  ]);

  const [dbResult, redisResult] = results;

  const dbHealth = dbResult.status === 'fulfilled'
    ? dbResult.value
    : { status: 'unhealthy', error: dbResult.reason?.message };

  const redisHealth = redisResult.status === 'fulfilled'
    ? redisResult.value
    : { status: 'unhealthy', error: redisResult.reason?.message };

  const isHealthy =
    dbHealth.status === 'healthy' && redisHealth.status === 'healthy';

  return {
    isHealthy,
    services: {
      database: dbHealth,
      redis: redisHealth,
    },
  };
};
