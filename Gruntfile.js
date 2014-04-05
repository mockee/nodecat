module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')
  , jsDir: 'public/js'
  , uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      }
    , build: {
        files: {
          '<%= jsDir %>/editor.min.js': ['<%= jsDir %>/editor.js']
        , '<%= jsDir %>/upload.min.js': ['<%= jsDir %>/upload.js']
        , '<%= jsDir %>/comment.min.js': ['<%= jsDir %>/comment.js']
        }
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.registerTask('default', ['uglify'])
}
