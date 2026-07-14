module.exports = {
    apps : [{
      name: 'mathesis',
      cwd: '.',
      script: 'dist/server.js',
      restart_delay: 1000,
      watch: 'dist/server.js',
      out_file: 'main.log',
      error_file: 'main.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss:SSS',
    }],
  };
  
  