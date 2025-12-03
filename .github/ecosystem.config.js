/**
 * PM2 프로덕션 설정
 * 백엔드와 프론트엔드를 안정적으로 실행
 */

module.exports = {
  apps: [
    {
      name: 'freeshell-backend',
      cwd: './backend',
      script: 'npm',
      args: 'run dev',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'freeshell-frontend',
      cwd: './',
      script: 'serve',
      args: '-s dist -l 3000 --cors',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
}

