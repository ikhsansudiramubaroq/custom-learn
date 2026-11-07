// Dijalankan PM2 di server. Satu proses, karena isi di memori dan batas login tidak dibagi antar proses.
module.exports = {
  apps: [
    {
      name: 'custom-learn',
      cwd: __dirname,
      script: 'node_modules/next/dist/bin/next',
      // 127.0.0.1: hanya Nginx yang bisa menghubungi aplikasi, bukan komputer lain di jaringan.
      args: 'start -H 127.0.0.1 -p 3000',
      exec_mode: 'fork',
      instances: 1,
      node_args: '--max-old-space-size=384',
      max_memory_restart: '600M',
      env: { NODE_ENV: 'production' },
    },
  ],
}
