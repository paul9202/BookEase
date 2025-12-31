import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces to allow access from outside the VM
    allowedHosts: [
      'paul-vmware-virtual-platform', // Allow your specific VM hostname
      'localhost',
      '127.0.0.1'
    ]
  }
});