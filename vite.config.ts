import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ command, mode }) => {
  const config = {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };

  if (command === 'build') {
    // Use the correct repository name (British spelling)
    const isGitHubBuild = process.env.GITHUB_PAGES === 'true';
    config.base = isGitHubBuild ? '/3a-console-log-analyser/' : '/';
  }

  return config;
});