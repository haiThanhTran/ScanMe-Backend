const mongoose = require("mongoose");
const routerManage = require('../models/system/RouterManage');

let routePermissionsCache = null;
let routePermissionsMap = new Map();

const pathToRegex = (path) => {
  const cleanPath = path.replace(/\/$/, '');
  const pattern = cleanPath.replace(/:[\w]+/g, "[^/]+");
  return new RegExp(`^${pattern}\/?[^/]*$`);
};

const loadRoutePermissions = async () => {
  try {
    const allRoutes = await routerManage.find({});
    const publicRoutes = allRoutes.filter(
      (r) => r.requireToken === false && r.status === "01"
    );

    routePermissionsMap.clear(); 
    publicRoutes.forEach(route => {
      if (!route.path) return; // Skip invalid routes
      
      const key = `${route.method}:${route.path}`;
      const regex = pathToRegex(route.path);
      routePermissionsMap.set(key, { method: route.method, path: route.path, regex });

      if (route.method === "*") {
        ["GET", "POST", "PUT", "DELETE", "PATCH"].forEach(method => {
          const methodKey = `${method}:${route.path}`;
          routePermissionsMap.set(methodKey, { method, path: route.path, regex });
        });
      }
    });

    routePermissionsCache = publicRoutes;
    return publicRoutes;
  } catch (error) {
    console.error("⚠ Error loading routes:", error);
    return [];
  }
};

const routePermissionMiddleware = async (req, res, next) => {
  const isPublicRoute = Array.from(routePermissionsMap.values()).some(
    (route) => {
      if (!route || !route.path) return false;
      const matches = route.method === req.method && route.regex.test(req.path);
      return matches;
    }
  );

  if (isPublicRoute) {
    next();
  } else {
    const auth = require('./AuthMiddleware');
    await auth(req, res, next);
  }
};

const initializeRoutePermissions = async () => {
  await loadRoutePermissions();

  if (process.env.NODE_ENV !== 'production') {
    console.log("✅ Public routes loaded:", routePermissionsCache.length);
  }

  setInterval(async () => {
    await loadRoutePermissions();
    if (process.env.NODE_ENV !== 'production') {
      console.log("🔄 Route permissions refreshed");
    }
  }, 60 * 60 * 1000);
};

module.exports = {
  routePermissionMiddleware,
  initializeRoutePermissions,
  loadRoutePermissions
};
