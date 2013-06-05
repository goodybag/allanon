/**
 * I am SO sorry for this gruntfile
 * -john
 */

var
  fs            = require('fs')
, sys           = require('sys')
, childProcess  = require('child_process')
, jsdom         = require('jsdom')
, findit        = require('findit')
, _path         = require("path")

, wrenchLoc     = './node_modules/wrench/lib/wrench.js'
;

// Edit wrench to allow file exclusion
var strWrench = fs.readFileSync(wrenchLoc).toString();
strWrench = strWrench.replace(
  "if(typeof opts !== 'undefined') {"
, "if(typeof opts !== 'undefined') {\n" +
    "if (opts.exclude.indexOf(files[i]) > -1) continue;"
);
fs.writeFileSync(wrenchLoc, strWrench);
var wrench = require('wrench');

// Use this function so I can remove comments from less files during its
// concatenation process. I need to know which modules have already been imported
// to ensure there's no duplicates. In order for me to know for sure, I have to
// manually scan for import statements. Removing the comments first ensures that
// the imports I find are mostly correct :/
var removeComments = function (str) {

  var uid = '_' + +new Date(),
      primitives = [],
      primIndex = 0;

  return (
    str.replace(/(['"])(\\\1|.)+?\1/g, function(match){
      primitives[primIndex] = match;
      return (uid + '') + primIndex++;
    }).replace(/([^\/])(\/(?!\*|\/)(\\\/|.)+?\/[gim]{0,3})/g, function(match, $1, $2){
      primitives[primIndex] = $2;
      return $1 + (uid + '') + primIndex++;
    }).replace(/\/\/.*?\/?\*.+?(?=\n|\r|$)|\/\*[\s\S]*?\/\/[\s\S]*?\*\//g, '').replace(/\/\/.+?(?=\n|\r|$)|\/\*[\s\S]+?\*\//g, '').replace(RegExp('\\/\\*[\\s\\S]+' + uid + '\\d+', 'g'), '').replace(RegExp(uid + '(\\d+)', 'g'), function(match, n){
      return primitives[n];
    })
  );
}

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
      , subs: ['styles', 'lib']
      }
    },

    'inline-scripts-styles': {
      build: {
        src: 'build/index.html'
      }
    },

    'update-require-config': {
      build: {
        location: './app.js'
      , requireConfig: process.cwd() + '/jam/require.config.js'
      , requirePath: process.cwd() + '/jam/require.js'
      }
    },

    jam: {
      dist: {
        src: [ 'app.js', 'lib/filepicker.js' ]
      , lessSearch: [
          'app.js'
        , 'lib/'
        , 'components/'
        , 'lib/api/'
        , 'pages/'
        , 'modals/'
        , 'config.js'
        ]
      , excludes: ['css/css-builder', 'less/lessc-server', 'less/lessc', 'require-less', 'require-css']
      , dest: 'build/app.js'
      , noMinify: false
      , noLicense: true
      , verbose: false
      , almond: false
      }
    },

    s3: {
      options: {
        key:    process.env.GB_WEBSITE_S3_KEY,
        secret: process.env.GB_WEBSITE_S3_SECRET,
        access: 'public-read'
      },
      prod: {
        bucket: 'www.goodybag.com',

        upload: [
          {
            src: 'build/index.html'
          , dest: '/panel/index.html'
          , gzip: true
          }
        , {
            src: 'build/img/*'
          , dest: '/panel/img'
          , gzip: true
          }
        , {
            src: 'build/lib/*'
          , dest: '/panel/lib'
          , gzip: true
          }
        ]
      },

      staging: {
        bucket: 'www.staging.goodybag.com',

        upload: [
          {
            src: 'build/index.html'
          , dest: '/panel/index.html'
          , gzip: true
          }
        , {
            src: 'build/img/*'
          , dest: '/panel/img'
          , gzip: true
          }
        , {
            src: 'build/lib/*'
          , dest: '/panel/lib'
          , gzip: true
          }
        ]
      }

    },

    copyIndex: {
      build: {
        jsSource: 'build/app.js'
      , cssSource: 'build/styles/app.css'
      , change: [
          { from: 'easyXDM.debug', to: 'easyXDM.min' }
        , { from: '/img', to: '/panel/img' }
        , { from: '</head>', to: '\n    <!--[if IE]><link rel="stylesheet" src="styles/ie.css" /><![endif]-->\n</head>'}
        ]
      }
    },

    copyStuff: {
      build: {
        stuff: [
          './img'
        , './lib/easyXDM.min.js'
        , './lib/console.js'
        ]
      , dest: 'build'
      }
    },

    changeConfig: {
      prod: {
        path: 'config.js',
        from: 'dev',
        to:   'prod'
      },

      staging: {
        path: 'config.js',
        from: 'dev',
        to:   'staging'
      }
    },

    restoreConfig: {
      prod: {
        path: 'config.js',
        from: 'prod',
        to:   'dev'
      },

      staging: {
        path: 'config.js',
        from: 'staging',
        to:   'dev'
      }
    },

    less: {
      build: {
        main: './styles/main.less'
      , searchDirs: ['./components', './modals', './pages']
      , out: './build/styles/app.css'
      , minify: true
      }

    , ie: {
        main: './styles/ie.less'
      , searchDirs: []
      , out: './build/styles/ie.css'
      , minify: true
      }
    }
  });

  // Default task.
  var defaultTask = [
    'makeBuildDir'
  , 'changeConfig:staging'
  , 'copyStuff'
  , 'update-require-config'
  , 'jam'
  , 'less'
  , 'copyIndex'
  , 'restoreConfig:staging'
  ];

  grunt.registerTask('default', defaultTask);

  // For prod task, change all staging configs to prod
  grunt.registerTask('deploy', defaultTask.map(function(t){
    return t.replace(':staging', ':prod');
  }).concat( ['s3:prod'] ));

  grunt.registerTask('prod', ['deploy']);

  grunt.registerTask('staging', ['default', 's3:staging']);

  // Not working
  grunt.registerMultiTask('inline-scripts-styles', 'Inlines scripts and styles', function(){
    var
      done    = this.async()
    , folder  = this.data.src.indexOf('/') == -1
                ? './'
                : this.data.src.substring(0, this.data.src.lastIndexOf('/') + 1)

    , this_   = this
    ;

    jsdom.env(
      this.data.src
    , ["http://code.jquery.com/jquery.js"]
    , function (errors, window) {
        var $ = window.$, data = "<!DOCTYPE HTML><html>";

        var scripts = $('script');
        var styles = $('style');

        if (scripts.length > 0){
          scripts.each(function(script){
            if (!script.src) return;
            var $newScript = $('<script />');
            console.log(folder + script.src);
            $newScript.innerHTML = fs.readFileSync(folder + script.src).toString();
            $(script).replaceWith($newScript)
          });
        }

        $('.jsdom').remove();

        data += $('html').html() + "</html>";

        fs.writeFile(this_.data.src, data, function(error){
          if (error) return console.log(error), done(false);

          return done(true);
        });
      }
    );
  });

  grunt.registerMultiTask('less', 'Compiles less', function(){
    var
      done = this.async()
    , tmp = './' + this.data.main.substring(0, this.data.main.lastIndexOf('/') + 1) + 'tmp-style.less'
    , command = './node_modules/less/bin/lessc ' + tmp + ' > ' + this.data.out
    , imported = []
    , main = removeComments( fs.readFileSync(this.data.main).toString() ) + '\n\n'

    , results = []

      // I'm so sorry I suck so bad at regexes I've resorted to crap string splitting
    , getImportFile = function(str){
        var match = str.split('@import ')[1];
        // Trim
        match = match.replace(/^\s\s*/, '').replace(/\s\s*$/, '')
        if (match.indexOf('"') > -1) match = match.split('"')[1];
        else match = match.split("'")[1];
        return match;
      }
    ;

    if (this.data.minify != false) command += ' -x';

    // Find import statements
    main.split('\n').map(function(line){
      if (line.indexOf('@import') == -1) return;

      imported.push( getImportFile(line) );
    });

    // Recursively search directories
    for (var i = 0, l = this.data.searchDirs.length; i < l; ++i){
      results = results.concat(
        findit.sync(this.data.searchDirs[i]).filter(function(file){
          return file.substring(file.length - 5) == '.less';
        })
      );
    }

    // Remove all imports -- TODO - only remove imports that do not need to be there
    // Concat to main file contents
    results.forEach(function(result){
      var file = fs.readFileSync(result).toString();

      file = file.split('\n').map(function(line){
        if (line.indexOf('@import') > -1) return '';
        return line;
      }).join('\n');

      main += file + '\n';
    });

    // Write to temporary location to compile with LESS CLI
    fs.writeFileSync(tmp, main);

    childProcess.exec(command, function(error, stdout){
      if (error) return console.log(error), done(false);
      sys.puts(stdout)

      // Delete tmp file
      fs.unlinkSync(tmp);

      done(true);
    });
  });

  grunt.registerMultiTask('update-require-config', 'Moves require configuration object to the main jam require config so the optimizer can reason about it', function(){
    var done = this.async(), this_ = this;

    childProcess.exec('jam rebuild', function(error, stdout){
      if (error) return console.log(error), done(false);
      sys.puts(stdout);

      var
        user    = require(this_.data.location)
      , config  = require(this_.data.requireConfig)
      , reqFile = fs.readFileSync(this_.data.requirePath).toString()
      , file    = ""
      ;

      if (user.map){
        if (!config.map) config.map = {};

        for (var key in user.map) config.map[key] = user.map[key];
      }

      // Add user configured packages to jam's require config
      config.packages = config.packages.concat(user.packages);

      // Rebuild configuration file
      file += 'var jam = ';
      file += JSON.stringify(config, true, '  ');
      file += ';\n\n';

      delete config.version;
      file += 'if (typeof require !== "undefined" && require.config) {\n';
      file += '  require.config('
      file +=    JSON.stringify(config, true, '  ');
      file += ');\n'
      file += '} else {\n';
      file += '  var require = ';
      file +=    JSON.stringify(config, true, '  ');
      file += ';\n'
      file += '}\n\n';
      file += 'if (typeof exports !== "undefined" && typeof module !== "undefined") {\n'
      file += '  module.exports = jam;\n'
      file += '}';

      reqFile = reqFile.substring(0, reqFile.indexOf('var jam = {'));
      reqFile += file;

      // Re-write the require/require.config file so jam can reason with user packages
      fs.writeFileSync(this_.data.requireConfig, file);
      fs.writeFileSync(this_.data.requirePath, reqFile);

      done()
    });
  });

  grunt.registerMultiTask('jam', 'Builds jam stuff', function(){
    var
      done        = this.async()
    , tmp         = 'tmp-build'
    , command     = "(cd " + tmp + "; jam compile"
    , dest        = this.data.dest
    , incs        = this.data.src
    , exc         = this.data.excludes || []
    , jam         = require(process.cwd() + '/jam/require.config.js')
    , this_       = this
    ;

    for (var i = incs.length - 1; i >= 0; i--){
      // Is directory
      if (incs[i][incs[i].length -1] === "/"){
        var files = fs.readdirSync(incs[i]);
        for (var n = files.length - 1; n >= 0; n--){
          if (files[n].indexOf('.js') > -1)
            command += " -i " + incs[i] + files[n].replace(".js", "");
        }
      } else {
        command += " -i " + incs[i].replace(".js", "");
      }
    }

    for (var i = jam.packages.length - 1; i >= 0; i--){
      if (jam.packages[i].name && exc.indexOf(jam.packages[i].name) > -1) continue;
      command += " -i " + (jam.packages[i].name || jam.packages[i].main.replace('.js', ''))
    }

    for (var i = exc.length - 1; i >= 0; i--){
      command += " -e " + exc[i]
    }

    command += " -o " + dest;

    if (this.data.noLicense) command += " --no-license";
    if (this.data.noMinify) command += " --no-minify";
    if (this.data.verbose) command += " -v";
    if (this.data.almond) command += " -a";

    command += ')';

    if (this.data.verbose) console.log(command);

    // Copy entire directory to tmp build
    wrench.copyDirSyncRecursive(process.cwd(), tmp, { forceDelete: true, exclude: [tmp] });

    // Remove all instances of less! requires
    var search = [];
    this.data.lessSearch.forEach(function(file){
      search = search.concat( findit.sync(tmp + '/' + file) );
    });

    search.forEach(function(file){
      if (fs.statSync(file).isDirectory()) return;

      var contents = fs.readFileSync(file).toString().split('\n');
      contents = contents.map(function(line){
        if (line.indexOf('less!') > -1) return '';
        return line;
      }).join('\n');
      fs.writeFileSync(file, contents);
    });

    childProcess.exec(command, function(error, stdout){
      if (error) return console.log(error), done(false);
      if (this_.data.verbose) sys.puts(stdout);

      // Move the output file to the actual destination
      fs.renameSync(tmp + '/' + dest, dest);

      // Remove tmp-build dir
      wrench.rmdirSyncRecursive(tmp);

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
  grunt.registerMultiTask('copyIndex', "Copies index.html to build directory", function(){
    var done = this.async(), this_ = this;

    jsdom.env(
      "index.html"
    , ["http://code.jquery.com/jquery.js"]
    , function (errors, window) {
        var $ = window.$, data = "<!DOCTYPE HTML><html>";
        $('link[rel="stylesheet"]').remove();
        // This is borken
        // var styles = window.document.createElement('style');
        // styles.type = "text/css";
        // styles.innerHTML = fs.readFileSync(this_.data.cssSource).toString();
        // window.document.head.appendChild(styles);
        $('script').eq(0).replaceWith('<script type="text/javascript">' + fs.readFileSync(this_.data.jsSource).toString() + '</script>')
        $('.jsdom').remove();
        data += $('html').html() + "</html>";

        data = data.replace('</head>', '<style type="text/css">\n' + fs.readFileSync(this_.data.cssSource).toString() + '\n</style>\n</head>');

        if (this_.data.change){
          this_.data.change.forEach(function(c){
            data = data.replace(new RegExp(c.from, 'g'), c.to);
          });
        }

        fs.writeFile("./build/index.html", data, function(error){
          if (error) return console.log(error), done(false);

          return done(true);
        });
      }
    );
  });

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
      if (stats.isDirectory())
        wrench.copyDirSyncRecursive(stuff[i], dest + '/' + getFileName(stuff[i]));
      else
        fs.linkSync(stuff[i], dest + '/' + stuff[i]);
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
