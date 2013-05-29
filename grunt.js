var
  fs            = require('fs')
, sys           = require('sys')
, childProcess  = require('child_process')
, jsdom         = require('jsdom')
, wrench        = require('wrench')
;

/*global module:false*/
module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-mincss');
  grunt.loadNpmTasks('grunt-s3');
  // grunt.loadNpmTasks('grunt-jam');
  // grunt.loadNpmTasks('grunt-escher');

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },

    makeBuildDir: {
      build: {
        dir: './build'
      }
    },

    jam: {
      dist: {
        src: [
          'app.js'
        , 'lib/'
        , 'components/'
        , 'lib/api/'
        , 'pages/'
        , 'modals/'
        , 'models/'
        ]
      , excludes: ['require-less', 'require-css']
      , dest: 'build/app.js'
      , noMinify: false
      , noLicense: true
      , verbose: true
      , almond: false
      }
    },

    s3: {
      key:    process.env.GB_WEBSITE_S3_KEY,
      secret: process.env.GB_WEBSITE_S3_SECRET,
      bucket: 'staging.goodybag.com',
      access: 'public-read',

      upload: [
        {
          src: 'build/index.html'
        , dest: 'index.html'
        , gzip: true
        }
      , {
          src: 'build/app.css'
        , dest: 'css/'
        , gzip: false
        }
      , {
          src: 'build/app.js'
        , dest: 'app.js'
        , gzip: false
        }
      , {
          src: 'build/img/*'
        , dest: '/img'
        , gzip: false
        }
      ]
    },

    copyStuff: {
      build: {
        stuff: [
          './img'
        ]
      , dest: 'build'
      }
    },

    changeConfig: {
      build: {
        path: 'config.js',
        from: 'dev',
        to:   'prod'
      }
    },

    restoreConfig: {
      build: {
        path: 'config.js',
        from: 'prod',
        to:   'dev'
      }
    }
  });

  // Default task.
  grunt.registerTask('default', 'makeBuildDir copyIndex changeConfig copyStuff mincss jam restoreConfig');
  grunt.registerTask('deploy', 'default s3');

  grunt.registerMultiTask('jam', 'Builds jam stuff', function(){
    var
      done    = this.async()
    , command = "jam compile"
    , dest    = this.data.dest
    , incs    = this.data.src
    , exc     = this.data.excludes || []
    , jam     = require(process.cwd() + '/jam/require.config.js')
    ;

    for (var i = incs.length - 1; i >= 0; i--){
      // Is directory
      if (incs[i][incs[i].length -1] === "/"){
        var files = fs.readdirSync(incs[i]);
        for (var n = files.length - 1; n >= 0; n--){
          if (files[n].indexOf('.js') > -1)
            command += " -i " + incs[i] + files[n].replace(".js", "");
        }
      }else{
        command += " -i " + incs[i].replace(".js", "");
      }
    }

    for (var i = jam.packages.length - 1; i >= 0; i--){
      command += " -i " + jam.packages[i].name
    }

    for (var i = exc.length - 1; i >= 0; i--){
      command += " -e " + exc[i]
    }

    command += " -o " + dest;

    if (this.data.noLicense) command += " --no-license";
    if (this.data.noMinify) command += " --no-minify";
    if (this.data.verbose) command += " -v";
    if (this.data.almond) command += " -a";

    if (this.data.verbose) console.log(command);

    childProcess.exec(command, function(error, stdout){
      if (error) return console.log(error), done(false);
      sys.puts(stdout)
      done(true);
    });

  });

  grunt.registerMultiTask('makeBuildDir', 'Creates the build dir', function(){
    var error, dir, this_ = this, done = this.async();

    var mkdir = function(){
      if (error = fs.mkdirSync(this_.data.dir))
        return console.log(error), done(false);

      if (!this_.data.subs || this_.data.subs.length === 0) return true;

      while (dir = this_.data.subs.shift()){
        if (!fs.existsSync(this_.data.dir + '/' + dir)){
          if (error = fs.mkdirSync(this_.data.dir + '/' + dir))
            return console.log(error), done(false);
        }
      }

      return done(true);
    };

    if (!fs.existsSync(this.data.dir)) return mkdir();

    wrench.rmdirRecursive(this.data.dir, function(error){
      if (error) return console.log(error), done(false);
      mkdir();
    });
  });

  // TODO: make this able to use configuration for dynamic values
  grunt.registerTask('copyIndex', "Copies index.html to build directory", function(){
    var done = this.async();

    jsdom.env(
      "index.html"
    , ["http://code.jquery.com/jquery.js"]
    , function (errors, window) {
        var $ = window.$, data = "<!DOCTYPE HTML><html>";
        $('link').remove();
        $('head').append($('<link href="css/app.css" rel="stylesheet" media="screen" />'));
        $('.jsdom').remove();
        $('script').eq(0).attr('src', "app.js");
        data += $('html').html() + "</html>";

        fs.writeFile("./build/index.html", data, function(error){
          if (error) return console.log(error), done(false);

          return done(true);
        });
      }
    );
  });

  // The only way I know how to get config args is from doing a multi
  grunt.registerMultiTask('modifyImagePaths', "Modifies the paths of images in .css to work for build", function(){
    var
      done  = this.async()
    , this_ = this

    , getExp = function(path){
        path = path.replace(/\./g, '\\.');
        path = path.replace(/\//g, '\\/');
        return new RegExp(path, 'g');
      }
    ;

    fs.readFile(this.data.file, 'utf-8', function(error, data){
      if (error) return console.log(error), done(false);

      for (var i = this_.data.oldPaths.length - 1; i >= 0; i--){
        data = data.replace(getExp(this_.data.oldPaths[i]), this_.data.path);
      }

      fs.writeFile(this_.data.file, data, function(error){
        if (error) return console.log(error), done(false);

        done(true);
      });
    });
  });

  grunt.registerMultiTask('copyStuff', 'Copies stuff to build directory', function(){
    var
      done  = this.async()
    , stuff = this.data.stuff
    , dest  = this.data.dest

    , getFileName = function(path){
        path = path.split('/');
        return path[path.length - 1] === "" ? path[path.length - 2] : path[path.length - 1];
      }
    ;

    for (var i = stuff.length - 1, stats; i >= 0; i--){
      stats = fs.lstatSync(stuff[i]);
      if (stats.isDirectory)
        wrench.copyDirSyncRecursive(stuff[i], dest + '/' + getFileName(stuff[i]));
      else
        fs.linkSync(stuff[i], dest + '/' + getFileName(stuff[i]));
    }

    done(true);
  });

  grunt.registerMultiTask('changeConfig', 'Changes the configuration to export production config', function(){
    var
      done  = this.async()
    , path  = this.data.path
    , from  = this.data.from
    , to    = this.data.to
    ;

    fs.readFile(path, 'utf-8', function(error, data){
      if (error) return console.log(error), done(false);

      data = data.replace("return config." + from, "return config." + to);

      fs.writeFile(path, data, function(error){
        if (error) return console.log(error), done(false);

        done(true);
      });
    });
  });

  grunt.registerMultiTask('restoreConfig', 'Changes the configuration to export dev config', function(){
    var
      done  = this.async()
    , path  = this.data.path
    , from  = this.data.from
    , to    = this.data.to
    ;

    fs.readFile(path, 'utf-8', function(error, data){
      if (error) return console.log(error), done(false);

      data = data.replace("return config." + from, "return config." + to);

      fs.writeFile(path, data, function(error){
        if (error) return console.log(error), done(false);

        done(true);
      });
    });
  });
};
