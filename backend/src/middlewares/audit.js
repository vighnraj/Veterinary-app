const prisma = require('../config/database');

/**
 * Create audit log entry
 */
const createAuditLog = async ({
  accountId,
  userId,
  action,
  entity,
  entityId,
  oldData,
  newData,
  ipAddress,
  userAgent,
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        accountId,
        userId,
        action,
        entity,
        entityId,
        oldData: oldData ? JSON.parse(JSON.stringify(oldData)) : null,
        newData: newData ? JSON.parse(JSON.stringify(newData)) : null,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

/**
 * Audit middleware factory
 */
const auditAction = (action, entity) => {
  return (req, res, next) => {
    // Store audit info on request for later use
    req.auditInfo = {
      action,
      entity,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('user-agent'),
    };

    // Override res.json to capture the response
    const originalJson = res.json.bind(res);
    res.json = function (data) {
      // Only log on successful operations
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const entityId = data?.data?.id || req.params.id;

        createAuditLog({
          accountId: req.accountId,
          userId: req.user.id,
          action: req.auditInfo.action,
          entity: req.auditInfo.entity,
          entityId,
          oldData: req.auditOldData,
          newData: data?.data,
          ipAddress: req.auditInfo.ipAddress,
          userAgent: req.auditInfo.userAgent,
        });
      }

      return originalJson(data);
    };

    next();
  };
};

/**
 * Store old data before update
 */
const storeOldData = (data) => {
  return (req, res, next) => {
    req.auditOldData = data;
    next();
  };
};

module.exports = {
  createAuditLog,
  auditAction,
  storeOldData,
};
