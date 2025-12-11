module.exports = {
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      // Your custom middlewares here
      return middlewares;
    }
  }
};