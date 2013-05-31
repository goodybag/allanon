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
      , subs: ['styles']
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
        src: [ 'app.js' ]
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
    },

    less: {
      build: {
        main: './styles/main.less'
      , searchDirs: ['./components', './modals', './pages']
      , out: './build/styles/app.css'
      , minify: true
      }
    }
  });

  // Default task.
  grunt.registerTask('default', [
    'makeBuildDir'
  , 'copyIndex'
  , 'changeConfig'
  , 'copyStuff'
  , 'update-require-config'
  , 'jam'
  , 'less'
  , 'restoreConfig'
  ].join(' '));

  grunt.registerTask('deploy', 'default s3');

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
      if (exc.indexOf(jam.packages[i].name) > -1) continue;
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
      
      console.log(file);
      var contents = fs.readFileSync(file).toString().split('\n');
      contents = contents.map(function(line){
        if (line.indexOf('less!') > -1) return '';
        return line;
      }).join('\n');
      fs.writeFileSync(file, contents);
    });

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
