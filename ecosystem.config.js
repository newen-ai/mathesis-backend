module.exports = {
    apps : [{
      name: 'mathesis',
      cwd: 'dist/',
      script: 'server.js',
      restart_delay: 1000,
      watch: 'server.js',
      out_file: 'main.log',
      error_file: 'main.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss:SSS',
    }],
  };
  
  