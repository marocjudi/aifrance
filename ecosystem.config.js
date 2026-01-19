module.exports = {
  apps: [{
    name: 'mandat-ai',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/mandat-ai',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/mandat-ai-error.log',
    out_file: '/var/log/pm2/mandat-ai-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
