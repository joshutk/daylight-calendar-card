import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import { execSync } from 'child_process';

const dev = process.env.BUILD === 'dev';
const live = process.env.BUILD === 'live';

const plugins = [
  resolve(),
  typescript(),
];

if (!dev && !live) {
  plugins.push(terser());
}

// Deploy to local Docker HA via docker cp
if (dev) {
  plugins.push({
    name: 'docker-cp',
    writeBundle() {
      try {
        execSync(
          'docker cp daylight-calendar-card.js ha-dev:/config/www/daylight-calendar-card.js',
          { stdio: 'inherit' },
        );
      } catch {
        console.error('docker cp failed — is ha-dev container running?');
      }
    },
  });
}

// SCP to live HA after build (home LAN only)
if (live) {
  plugins.push({
    name: 'scp-to-ha',
    writeBundle() {
      try {
        execSync(
          'scp -o StrictHostKeyChecking=no daylight-calendar-card.js root@homeassistant.local:/config/www/daylight-calendar-card.js',
          { stdio: 'inherit' },
        );
      } catch {
        console.error('SCP failed — are you on the home LAN?');
      }
    },
  });
}

export default {
  input: 'src/index.ts',
  output: {
    file: 'daylight-calendar-card.js',
    format: 'es',
    sourcemap: dev || live,
  },
  plugins,
};
