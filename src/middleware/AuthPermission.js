const {getPermissionsForUser} = require('../database/db')

function checkPermission(permission){
  return async function (req, res, next) {
    try {
      const userPermissions = await getPermissionsForUser(req.account.userId);

      const checkPermission = userPermissions.some(permissions => permission.includes(permissions));
      if (checkPermission) {
        next();
      } else {
        res.status(403).json({
          status: 403,
          message: 'Bạn không có quyền truy cập!!!!'
        });
      }
    } catch (error) {
      console.error('Lỗi kiểm tra quyền:', error);
      res.status(500).send('Lỗi server');
    }
  };
}

module.exports = {checkPermission}
