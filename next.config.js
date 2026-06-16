module.exports = {
  output: "standalone",
  crossOrigin: "anonymous",
  serverExternalPackages: [
    "@google-cloud/firestore",
    "@google-cloud/tasks",
    "@google-apps/meet",
    "googleapis",
    "@google-cloud/local-auth",
  ],
};
