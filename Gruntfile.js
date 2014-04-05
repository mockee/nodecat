module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')
  , jsDir: 'public/js'
  , distDir: 'public/js/dist'
  , uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      }
    , build: {
        files: {
          '<%= distDir %>/editor.min.js': ['<%= jsDir %>/editor.js']
        , '<%= distDir %>/upload.min.js': ['<%= jsDir %>/upload.js']
        , '<%= distDir %>/comment.min.js': ['<%= jsDir %>/comment.js']
        }
      }
    }
  , watch: {
      js: { files: '<%= jsDir %>/*.js', tasks: [ 'uglify' ] }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.registerTask('default', ['uglify'])
}
