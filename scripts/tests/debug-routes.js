import { app } from "./test-app.js";

// Function to extract routes from Express app
function getRoutes(app) {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Routes registered directly on the app
      const methods = Object.keys(middleware.route.methods).map(m => m.toUpperCase());
      routes.push({
        path: middleware.route.path,
        methods: methods
      });
    } else if (middleware.name === 'router') {
      // Router middleware
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods).map(m => m.toUpperCase());
          routes.push({
            path: handler.route.path,
            methods: methods
          });
        }
      });
    }
  });
  return routes;
}

// Print all registered routes
console.log("Registered routes:");
const routes = getRoutes(app);
routes.forEach(route => {
  console.log(`${route.methods.join(', ')} ${route.path}`);
});

console.log("\nTotal routes:", routes.length);