/* To prevent jshint from yelling at module.exports. */
/* jshint node:true */

'use strict';

var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function(connect, dir) {
	return connect.static(require('path').resolve(dir));
};

module.exports = function(grunt) {

	// Loads all grunt tasks
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
	require('time-grunt')(grunt);

	// App configuration
	var config = grunt.file.readYAML('site/_config-grunt.yml');

	// Tasks configuration
	grunt.initConfig({

		config: config,

		clean: {
			destination: {
				files: [{
					dot: true,
					src: [
						'<%= config.destination %>/*',
						'!<%= config.destination %>/.git*'
					]
				}]
			},
			tidyup: {
				files: [{
					dot: true,
					src: []
				}]
			}
		},

		compass: {
			options: {
				sassDir: '<%= config.source %>/_sass',
				imagesDir: '<%= config.source %>/imgs',
				cssDir: '<%= config.source %>/css',
				force: true
			},
			uncompressed: {
				options: {
					outputStyle: 'expanded'
				}
			},
			compressed: {
				options: {
					outputStyle: 'compressed'
				}
			}
		},

		// This task is pre-configured by useminPrepare,
		// using the usemin blocks inside index.html.
		//
		// concat: {},

		connect: {
			options: {
				hostname: 'localhost',
				port: config.port
			},
			'destination-source': {
				options: {
					middleware: function(connect) {
						return [
							lrSnippet,
							// serves from destination first
							mountFolder(connect, config.destination),
							// falls back to source if not found in destination
							mountFolder(connect, config.source)
						];
					}
				}
			},
			destination: {
				options: {
					middleware: function(connect) {
						return [
							mountFolder(connect, config.destination)
						];
					}
				}
			}
		},

		copy: {
			optimisedjsToSrc: {
				src: '*.min.js',
				dest: '<%= config.source %>/js/',
				flatten: true,
				filter: 'isFile',
				expand:true,
				nonull: true,
				cwd: '<%= config.destination %>/js/',
			},
			optimisedcssToSrc: {
				src: '*.min.css',
				dest: '<%= config.source %>/css/',
				flatten: true,
				filter: 'isFile',
				expand:true,
				nonull: true,
				cwd: '<%= config.destination %>/css/',
			},
			jsToDest: {
				src: '*.js',
				dest: '<%= config.destination %>/js/',
				flatten: true,
				filter: 'isFile',
				expand:true,
				nonull: true,
				cwd: '<%= config.source %>/js/',
			},
			cssToDest: {
				src: '*.css',
				dest: '<%= config.destination %>/css/',
				flatten: true,
				filter: 'isFile',
				expand:true,
				nonull: true,
				cwd: '<%= config.source %>/css/',
			},
		},

		csslint: {
			options: {
				csslintrc: '.csslintrc'
			},
			lax: {
				src: '<%= config.destination %>/css/*.css',
				options: {
					import: false
				}
			},
			strict: {
				src: '<%= config.destination %>/css/*.css',
				options: {
					import: 2
				}
			}
		},

		// This task is pre-configured by useminPrepare,
		// using the usemin blocks inside index.html.
		//
		cssmin: {
			options: {
				keepSpecialComments: 0
			}
		},

		htmlmin: {
			all: {
				options: {
					removeCommentsFromCDATA: true,
					// https://github.com/yeoman/grunt-usemin/issues/44
					collapseWhitespace: true,
					collapseBooleanAttributes: true,
					// removeAttributeQuotes: true,
					removeRedundantAttributes: true,
					useShortDoctype: true,
					removeEmptyAttributes: true,
					removeOptionalTags: true
				},
				files: [{
					expand: true,
					cwd: '<%= config.destination %>',
					src: ['**/*.html'],
					dest: '<%= config.destination %>'
				}]
			}
		},

		jekyll: {
			destination: {
				config: 'site/_config-grunt.yml'
			}
		},

		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			source: [
				'Gruntfile.js',
				'<%= config.source %>/**/js/**/*.js',
				'!<%= config.source %>/**/vendors/**/*.js',
				'!<%= config.source %>/**/*.min.js'
			]
		},

		open: {
			index: {
				path: 'http://localhost:<%=config.port%>'
			}
		},

		replace: {
			files: [
				{expand: true, flatten: true, src: ['<%=config.destination>/**/*.html'], dest: '<%=config.destination>/'}
			],
			develop: {
				options: {
					patterns: [
						{
							match: 'http://localhost:8081',
							replacement: '/'
						}
					]
				}
			},
			stage: {
				options: {
					patterns: [
						{
							match: 'http://localhost:8081',
							replacement: '/'
						}
					]
				}
			},
			production: {
				options: {
					patterns: [
						{
							match: 'http://localhost:8081',
							replacement: '/web/essentials'
						}
					]
				}
			}
		},

		shell: {
			options: {
				failOnError: true,
				stdout: true,
				stderr: true
			}
		},

		// This task is pre-configured by useminPrepare,
		// using the usemin blocks inside index.html.
		//
		// uglify: {
		//   build: {}
		// },

		useminPrepare: {
			html: '<%= config.destination %>/index.html',
			options: {
				dest: '<%= config.destination %>'
			}
		},

		usemin: {
			html: ['<%= config.destination %>/**/*.html'],
			options: {
				dirs: ['<%= config.destination %>']
			}
		},

    webfont: {
      icons: {
        src: '<%= config.source %>/icons/*.svg',
        dest: '<%= config.source %>/icons',
        destCss: '<%= config.source %>/_sass/_components',
        options: {
          stylesheet: 'scss',
          relativeFontPath: '../icons',
          htmlDemo: false,
          templateOptions: {
            classPrefix: 'icon-'
          }
        }
      }
    },

		watch: {
			// When styles change, recompile them
			styles: {
				files: [
          '<%= config.source %>/_sass/**/*.scss',
          '<%= config.source %>/css/**/*.css'
        ],
				tasks: ['compass:uncompressed','copy:cssToDest']
			},

			// when scripts change, lint them and run unit tests
			scripts: {
				files: ['<%= config.source %>/**/*.js'],
				tasks: ['jshint:source','copy:jsToDest']
			},

			// when jekyll source changes, recompile them
			jekyll: {
				files: [
					'<%= config.source %>/**/*.html',
					'<%= config.source %>/**/*.liquid',
					'<%= config.source %>/**/*.markdown',
					'<%= config.source %>/**/*.rb',
					'<%= config.source %>/**/*.md'
				],
				tasks: ['jekyll:destination', 'compass:uncompressed']
			},

			// when served files change, reload them in the browser
			served: {
				options: {
					livereload: LIVERELOAD_PORT
				},
				files: [
					'<%= config.destination %>/**/*.html',	// view files (from jekyll)
					'<%= config.destination %>/css/*.css',	// css files (from sass)
					'<%= config.source %>/**/*.css',		// css files (raw)
					'<%= config.source %>/**/*.js'			// script files
				]
			}
		}

	});

	// Test task
	grunt.registerTask('test', 'Lints all javascript and CSS sources.\nOptions: --strict: enable strict linting mode', function(){

		var strict = grunt.option('strict');

		if(strict) {
			return grunt.task.run([
				'jshint:source'
				// 'csslint:strict'
			]);
		} else {
			return grunt.task.run([
				'jshint:source'
				// 'csslint:lax'
			]);
		}
	});

	// Build task
	grunt.registerTask('build', 'Runs the "test" task, then builds the website.\nOptions:\n  --uncompressed: avoids code compression (js,css,html)', function() {

		var uncompressed = grunt.option('uncompressed');

		if(uncompressed) {
			return grunt.task.run([
				'test',						// Code quality control
				'clean:destination',		// Clean out the destination directory
				'compass:uncompressed',		// Build the CSS using Compass
				'jekyll:destination',		// Build the site with Jekyll
				'useminPrepare',			// Prepare for optimised asset substitution
				'concat',					// Combine JS and CSS assets into single files
				'usemin',					// Carry out optimised asset substitution
				// 'clean:tidyup',			// Clean up any stray source files
				'copy:optimisedjsToSrc',			// Copy the optimised JS back to the source directory
				'copy:optimisedcssToSrc'			// Copy the optimised CSS back to the source directory
			]);
		} else {
			return grunt.task.run([
				'test',						// Code quality control
				'clean:destination',		// Clean out the destination directory
				'compass:uncompressed',		// Build the CSS using Compass with compression
				'jekyll:destination',		// Build the site with Jekyll
				'useminPrepare',			// Prepare for optimised asset substitution
				'concat',					// Combine JS and CSS assets into single files
				'cssmin',					// Minify the combined CSS
				'uglify',					// Minify the combined JS
				'usemin',					// Carry out optimised asset substitution
				// 'htmlmin:all',			// Minify the final HTML
				// 'clean:tidyup',			// Clean up any stray source files
				'copy:optimisedjsToSrc',			// Copy the optimised JS back to the source directory
				'copy:optimisedcssToSrc'			// Copy the optimised CSS back to the source directory
			]);
		}

	});

	grunt.registerTask('previewbuild', 'Use this task to preview the final build in your browser. \n  Note: Runs tests automatically before building and serving', function() {

		return grunt.task.run([
			'test',
			'build',
			'open:index',
			'connect:destination:keepalive'
		]);

	});

	// Serve task
	grunt.registerTask('serve', 'Runs the "build" task, then serves the website locally.\nOptions:\n  --uncompressed: avoids code compression (js,css,html)', function() {

		return grunt.task.run([
			'test',
			'build',
			'open:index',
			'connect:destination:keepalive'
		]);

	});

	// Develop task
	grunt.registerTask('develop', 'The default task for developers.\nRuns the tests, builds the minimum required, serves the content (source and destination) and watches for changes.', function() {

		return grunt.task.run([
			'clean:destination',
			'jekyll:destination',
      'webfont:icons',
			'compass:uncompressed',
			'open:index',
			'connect:destination-source',
			'watch'
		]);

	});

	// Develop task
	grunt.registerTask('deploy', 'Runs the "test" task, then builds the website and carries out string replacement on specific URLs.\nOptions:\n  --production: carries out path replacement for production environment', function() {

		var production = grunt.option('production');

		if(production) {
			return grunt.task.run([
				'build --uncompressed',
				'replace:production'
			]);
		} else {
			return grunt.task.run([
				'build',
				'replace:develop'
			]);

		}

	});

	// Default task
	grunt.registerTask('default', 'develop');

};
