module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    clean: {
      build: {
        files: [{
          dot: true,
          src: [
            "docs/*"
          ]
        }]
      }
    },
    copy: {
      build: {
        files: [{
          expand: true,
          dot: true,
          cwd: "app",
          src: [
            "img/**/*",
            "audio/**/*"
          ],
          dest: "docs"
        }]
      }
    },
    pug: {
      compile: {
        options: {
          data: {
            debug: false,
            page: "main"
          }
        },
        files: {
          "docs/index.html": "app/views/main.pug",
          "docs/page.html": "app/views/page.pug"
        }
      }
    },
    stylus: {
      compile: {
        options: {
          paths: ['public/css/main.styl'],
          use: [
            require('nib') // use stylus plugin at compile time
          ]
        },
        files: {
          'docs/css/main.css': 'app/css/main.styl',
          'docs/css/page.css': 'app/css/page.styl'
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-pug');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Build Tasks
  grunt.registerTask('build', [
    'clean',
    'copy',
    'pug',
    'stylus'
  ]);
};