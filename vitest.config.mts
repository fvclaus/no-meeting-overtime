import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
 
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    env: {
      CLIENT_ID: "VITEST_CLIENT_ID",
      CLIENT_SECRET: "VITEST_CLIENT_SECRET",
      PROJECT_ID: "vitest",
      QUEUE_LOCATION: "VITEST_QUEUE_LOCATION",
      SITE_BASE: "VITEST_SITE_BASE",
      CLOUD_TASKS_SERVICE_ACCOUNT: "backend-app@vitest.iam.gserviceaccount.com"
    }
  },
})