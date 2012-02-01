var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var res = mod._cached ? mod._cached : mod();
    return res;
}

require.paths = [];
require.modules = {};
require.extensions = [".js",".coffee"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        var y = cwd || '.';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = x + '/package.json';
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = Object_keys(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

require.define = function (filename, fn) {
    var dirname = require._core[filename]
        ? ''
        : require.modules.path().dirname(filename)
    ;
    
    var require_ = function (file) {
        return require(file, dirname)
    };
    require_.resolve = function (name) {
        return require.resolve(name, dirname);
    };
    require_.modules = require.modules;
    require_.define = require.define;
    var module_ = { exports : {} };
    
    require.modules[filename] = function () {
        require.modules[filename]._cached = module_.exports;
        fn.call(
            module_.exports,
            require_,
            module_,
            module_.exports,
            dirname,
            filename
        );
        require.modules[filename]._cached = module_.exports;
        return module_.exports;
    };
};

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key)
    return res;
};

if (typeof process === 'undefined') process = {};

if (!process.nextTick) process.nextTick = (function () {
    var queue = [];
    var canPost = window.postMessage && window.addEventListener
    
    if (canPost) {
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);
    }
    
    return function (fn) {
        if (canPost) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        }
        else setTimeout(fn, 0);
    };
})();

if (!process.title) process.title = 'browser';

if (!process.binding) process.binding = function (name) {
    if (name === 'evals') return require('vm')
    else throw new Error('No such module')
};

if (!process.cwd) process.cwd = function () { return '.' };

require.define("path", function (require, module, exports, __dirname, __filename) {
    function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

});

require.define("/game.js", function (require, module, exports, __dirname, __filename) {
    var bean = require("./lib/bean")

var asGame = function () {

  this.init = function () {
    var that = this
    this.PPS = 12
    this.config = require("./config")
    this.setupInput()
    this.createInitialEntities()
    this.iterateEntities(function (entity) {
      entity.minX = 0
      entity.minY = 0
      entity.maxX = that.canvas.width - entity.width
      entity.maxY = that.canvas.height - entity.height
    })
    this.counter = 0
    this.initSound()
    this.setupMap()
  }

  this.createInitialEntities = function () {
    this.createPlayer()
    this.createEnemies(10)
  }

  this.createPlayer = function () {
    var player
    player = new this.entityBuilders.Player()
    player.init(200, 200, 50, 50, document.querySelector('.res .images .player'))
    this.addEntity(player)
    this.player = player
  }

  this.createEnemies = function (n) {
    var i, newWeakling
    for (i = 0; i < n; i++) {
      newWeakling = new this.entityBuilders.Weakling()
      newWeakling.init(
        Math.round(Math.random() * 700),
        Math.round(Math.random() * 20),
        44, 44,
        document.querySelector('.res .images .weakling'))
      newWeakling.minX = 0
      newWeakling.minY = 0
      newWeakling.maxX = this.canvas.width - newWeakling.width
      newWeakling.maxY = this.canvas.height - newWeakling.height
      this.addEntity(newWeakling)
    }
  }

  this.update = function (deltaT) {
    this.deltaT = deltaT / this.PPS
    this.updateEntities()
    this.clearScreen()
//    this.drawBackground()
    this.drawEntities()
    this.drawStatuses(this.getStatuses())
    this.applyGameRules()
    this.counter += 1
  }

  this.applyGameRules = function () {
    if (this.entities.weakling.length < 0) {
      this.createEnemies(10)
      // Or... something that makes sense
    }
  }

  this.clearScreen = function () {
    // Store the current transformation matrix
    this.context.save()

    // Use the identity matrix while clearing the canvas
    this.context.setTransform(1, 0, 0, 1, 0, 0)
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    // Restore the transform
    this.context.restore()
  }

  this.drawBackground = function () {
    var that = this
    this.map.tiles.forEach(function (tile) {
      if (tile.y > 600) {
        tile.y = -600
      }
      that.context.drawImage(tile.image, 0, tile.y)
      tile.y += 2
    })
  }

  this.drawEntities = function () {
    var that = this, prop
    for (prop in this.entities) {
      if (this.entities.hasOwnProperty(prop)) {
        this.entities[prop].forEach(function (entity) {
          entity.draw(that.context)
        })
      }
    }
  }

  this.setupInput = function () {
    var input = {}

    bean.add(document, 'keydown', function(e) {
      var keyCode = e.which
      input[keyCode] = true
      if (keyCode == 38 || keyCode == 40 || keyCode == 32) e.preventDefault()
    })

    bean.add(document, 'keyup', function(e) {
      var keyCode = e.which
      input[keyCode] = false
    })

    this.input = input
  }

  this.updateEntities = function () {
    var game = this
    this.iterateEntities(function (entity) {
      if (entity.type == 'player') {
        game.handleMotionInput(game.input, entity)
      }
      if (entity.type == 'bullet') {

        if (entity.owner == game.player) {
          game.iterateEntitiesByType('weakling', function (weakling) {
            game.checkForCollisions(entity, weakling, game.onBulletCollision)
          })
        } else {
          game.checkForCollisions(entity, game.player, game.onBulletCollision)
        }

      }
      entity.update(game.input, game)
      if (entity.toRemove) {
        game.removeEntity(entity)
      } else {
        game.moveEntity(entity)
      }
    })
  }

  this.onBulletCollision = function (entityA, entityB) {
    entityA.colliders.push(entityB)
    entityB.colliders.push(entityA)
  }

  this.getStatuses = function () {
    return [
      {text: "LEVEL 1: WEAKLINGS", x: 100, y: this.canvas.height - 30},
      {text: "HEALTH: " + this.player.health, x: this.canvas.width - 200, y: this.canvas.height - 30}
    ]
  }

  this.initSound = function () {
    soundManager.url = '/lib/soundmanager2.swf'
    soundManager.flashVersion = 9
    soundManager.debugMode = false
  }

  this.setupMap = function () {
    this.map = {
      tiles: [
        { image: document.querySelector('.res .images .bg-darkish'), y: 0},
        { image: document.querySelector('.res .images .bg-darkish-flipped'), y: -600}
      ]
    }

  }
}

module.exports = asGame

});

require.define("/lib/bean.js", function (require, module, exports, __dirname, __filename) {
    /*!
  * bean.js - copyright Jacob Thornton 2011
  * https://github.com/fat/bean
  * MIT License
  * special thanks to:
  * dean edwards: http://dean.edwards.name/
  * dperini: https://github.com/dperini/nwevents
  * the entire mootools team: github.com/mootools/mootools-core
  */
/*global module:true, define:true*/
!function (name, context, definition) {
  if (typeof module !== 'undefined') module.exports = definition(name, context);
  else if (typeof define === 'function' && typeof define.amd  === 'object') define(definition);
  else context[name] = definition(name, context);
}('bean', this, function (name, context) {
  var win = window
    , old = context[name]
    , overOut = /over|out/
    , namespaceRegex = /[^\.]*(?=\..*)\.|.*/
    , nameRegex = /\..*/
    , addEvent = 'addEventListener'
    , attachEvent = 'attachEvent'
    , removeEvent = 'removeEventListener'
    , detachEvent = 'detachEvent'
    , doc = document || {}
    , root = doc.documentElement || {}
    , W3C_MODEL = root[addEvent]
    , eventSupport = W3C_MODEL ? addEvent : attachEvent
    , slice = Array.prototype.slice
    , ONE = { one: 1 } // singleton for quick matching making add() do one()

    , nativeEvents = (function (hash, events, i) {
        for (i = 0; i < events.length; i++)
          hash[events[i]] = 1
        return hash
      })({}, (
          'click dblclick mouseup mousedown contextmenu ' +                  // mouse buttons
          'mousewheel DOMMouseScroll ' +                                     // mouse wheel
          'mouseover mouseout mousemove selectstart selectend ' +            // mouse movement
          'keydown keypress keyup ' +                                        // keyboard
          'orientationchange ' +                                             // mobile
          'touchstart touchmove touchend touchcancel ' +                     // touch
          'gesturestart gesturechange gestureend ' +                         // gesture
          'focus blur change reset select submit ' +                         // form elements
          'load unload beforeunload resize move DOMContentLoaded readystatechange ' + // window
          'error abort scroll ' +                                            // misc
          (W3C_MODEL ? // element.fireEvent('onXYZ'... is not forgiving if we try to fire an event
                       // that doesn't actually exist, so make sure we only do these on newer browsers
            'show ' +                                                          // mouse buttons
            'input invalid ' +                                                 // form elements
            'message readystatechange pageshow pagehide popstate ' +           // window
            'hashchange offline online ' +                                     // window
            'afterprint beforeprint ' +                                        // printing
            'dragstart dragenter dragover dragleave drag drop dragend ' +      // dnd
            'loadstart progress suspend emptied stalled loadmetadata ' +       // media
            'loadeddata canplay canplaythrough playing waiting seeking ' +     // media
            'seeked ended durationchange timeupdate play pause ratechange ' +  // media
            'volumechange cuechange ' +                                        // media
            'checking noupdate downloading cached updateready obsolete ' +     // appcache
            '' : '')
        ).split(' ')
      )

    , customEvents = (function () {
        function isDescendant(parent, node) {
          while ((node = node.parentNode) !== null) {
            if (node === parent) return true
          }
          return false
        }

        function check(event) {
          var related = event.relatedTarget
          if (!related) return related === null
          return (related !== this && related.prefix !== 'xul' && !/document/.test(this.toString()) && !isDescendant(this, related))
        }

        return {
            mouseenter: { base: 'mouseover', condition: check }
          , mouseleave: { base: 'mouseout', condition: check }
          , mousewheel: { base: /Firefox/.test(navigator.userAgent) ? 'DOMMouseScroll' : 'mousewheel' }
        }
      })()

    , fixEvent = (function () {
        var commonProps = 'altKey attrChange attrName bubbles cancelable ctrlKey currentTarget detail eventPhase getModifierState isTrusted metaKey relatedNode relatedTarget shiftKey srcElement target timeStamp type view which'.split(' ')
          , mouseProps = commonProps.concat('button buttons clientX clientY dataTransfer fromElement offsetX offsetY pageX pageY screenX screenY toElement'.split(' '))
          , keyProps = commonProps.concat('char charCode key keyCode'.split(' '))
          , preventDefault = 'preventDefault'
          , createPreventDefault = function (event) {
              return function () {
                if (event[preventDefault])
                  event[preventDefault]()
                else
                  event.returnValue = false
              }
            }
          , stopPropagation = 'stopPropagation'
          , createStopPropagation = function (event) {
              return function () {
                if (event[stopPropagation])
                  event[stopPropagation]()
                else
                  event.cancelBubble = true
              }
            }
          , createStop = function (synEvent) {
              return function () {
                synEvent[preventDefault]()
                synEvent[stopPropagation]()
                synEvent.stopped = true
              }
            }
          , copyProps = function (event, result, props) {
              var i, p
              for (i = props.length; i--;) {
                p = props[i]
                if (!(p in result) && p in event) result[p] = event[p]
              }
            }

        return function (event, isNative) {
          var result = { originalEvent: event, isNative: isNative }
          if (!event)
            return result

          var props
            , type = event.type
            , target = event.target || event.srcElement

          result[preventDefault] = createPreventDefault(event)
          result[stopPropagation] = createStopPropagation(event)
          result.stop = createStop(result)
          result.target = target && target.nodeType === 3 ? target.parentNode : target

          if (isNative) { // we only need basic augmentation on custom events, the rest is too expensive
            if (type.indexOf('key') !== -1) {
              props = keyProps
              result.keyCode = event.which || event.keyCode
            } else if ((/click|mouse|menu/i).test(type)) {
              props = mouseProps
              result.rightClick = event.which === 3 || event.button === 2
              result.pos = { x: 0, y: 0 }
              if (event.pageX || event.pageY) {
                result.clientX = event.pageX
                result.clientY = event.pageY
              } else if (event.clientX || event.clientY) {
                result.clientX = event.clientX + doc.body.scrollLeft + root.scrollLeft
                result.clientY = event.clientY + doc.body.scrollTop + root.scrollTop
              }
              if (overOut.test(type))
                result.relatedTarget = event.relatedTarget || event[(type === 'mouseover' ? 'from' : 'to') + 'Element']
            }
            copyProps(event, result, props || commonProps)
          }
          return result
        }
      })()

      // if we're in old IE we can't do onpropertychange on doc or win so we use doc.documentElement for both
    , targetElement = function (element, isNative) {
        return !W3C_MODEL && !isNative && (element === doc || element === win) ? root : element
      }

      // we use one of these per listener, of any type
    , RegEntry = (function () {
        function entry(element, type, handler, original, namespaces) {
          this.element = element
          this.type = type
          this.handler = handler
          this.original = original
          this.namespaces = namespaces
          this.custom = customEvents[type]
          this.isNative = nativeEvents[type] && element[eventSupport]
          this.eventType = W3C_MODEL || this.isNative ? type : 'propertychange'
          this.customType = !W3C_MODEL && !this.isNative && type
          this.target = targetElement(element, this.isNative)
          this.eventSupport = this.target[eventSupport]
        }

        entry.prototype = {
            // given a list of namespaces, is our entry in any of them?
            inNamespaces: function (checkNamespaces) {
              var i, j
              if (!checkNamespaces)
                return true
              if (!this.namespaces)
                return false
              for (i = checkNamespaces.length; i--;) {
                for (j = this.namespaces.length; j--;) {
                  if (checkNamespaces[i] === this.namespaces[j])
                    return true
                }
              }
              return false
            }

            // match by element, original fn (opt), handler fn (opt)
          , matches: function (checkElement, checkOriginal, checkHandler) {
              return this.element === checkElement &&
                (!checkOriginal || this.original === checkOriginal) &&
                (!checkHandler || this.handler === checkHandler)
            }
        }

        return entry
      })()

    , registry = (function () {
        // our map stores arrays by event type, just because it's better than storing
        // everything in a single array
        var map = {}

          // generic functional search of our registry for matching listeners,
          // `fn` returns false to break out of the loop
          , forAll = function (element, type, original, handler, fn) {
              if (!type || type === '*') {
                // search the whole registry
                for (var t in map) {
                  if (map.hasOwnProperty(t))
                    forAll(element, t, original, handler, fn)
                }
              } else {
                var i = 0, l, list = map[type], all = element === '*'
                if (!list)
                  return
                for (l = list.length; i < l; i++) {
                  if (all || list[i].matches(element, original, handler))
                    if (!fn(list[i], list, i, type))
                      return
                }
              }
            }

          , has = function (element, type, original) {
              // we're not using forAll here simply because it's a bit slower and this
              // needs to be fast
              var i, list = map[type]
              if (list) {
                for (i = list.length; i--;) {
                  if (list[i].matches(element, original, null))
                    return true
                }
              }
              return false
            }

          , get = function (element, type, original) {
              var entries = []
              forAll(element, type, original, null, function (entry) { return entries.push(entry) })
              return entries
            }

          , put = function (entry) {
              (map[entry.type] || (map[entry.type] = [])).push(entry)
              return entry
            }

          , del = function (entry) {
              forAll(entry.element, entry.type, null, entry.handler, function (entry, list, i) {
                list.splice(i, 1)
                return false
              })
            }

            // dump all entries, used for onunload
          , entries = function () {
              var t, entries = []
              for (t in map) {
                if (map.hasOwnProperty(t))
                  entries = entries.concat(map[t])
              }
              return entries
            }

        return { has: has, get: get, put: put, del: del, entries: entries }
      })()

      // add and remove listeners to DOM elements
    , listener = W3C_MODEL ? function (element, type, fn, add) {
        element[add ? addEvent : removeEvent](type, fn, false)
      } : function (element, type, fn, add, custom) {
        if (custom && add && element['_on' + custom] === null)
          element['_on' + custom] = 0
        element[add ? attachEvent : detachEvent]('on' + type, fn)
      }

    , nativeHandler = function (element, fn, args) {
        return function (event) {
          event = fixEvent(event || ((this.ownerDocument || this.document || this).parentWindow || win).event, true)
          return fn.apply(element, [event].concat(args))
        }
      }

    , customHandler = function (element, fn, type, condition, args, isNative) {
        return function (event) {
          if (condition ? condition.apply(this, arguments) : W3C_MODEL ? true : event && event.propertyName === '_on' + type || !event) {
            if (event)
              event = fixEvent(event || ((this.ownerDocument || this.document || this).parentWindow || win).event, isNative)
            fn.apply(element, event && (!args || args.length === 0) ? arguments : slice.call(arguments, event ? 0 : 1).concat(args))
          }
        }
      }

    , once = function (rm, element, type, fn, originalFn) {
        // wrap the handler in a handler that does a remove as well
        return function () {
          rm(element, type, originalFn)
          fn.apply(this, arguments)
        }
      }

    , removeListener = function (element, orgType, handler, namespaces) {
        var i, l, entry
          , type = (orgType && orgType.replace(nameRegex, ''))
          , handlers = registry.get(element, type, handler)

        for (i = 0, l = handlers.length; i < l; i++) {
          if (handlers[i].inNamespaces(namespaces)) {
            if ((entry = handlers[i]).eventSupport)
              listener(entry.target, entry.eventType, entry.handler, false, entry.type)
            // TODO: this is problematic, we have a registry.get() and registry.del() that
            // both do registry searches so we waste cycles doing this. Needs to be rolled into
            // a single registry.forAll(fn) that removes while finding, but the catch is that
            // we'll be splicing the arrays that we're iterating over. Needs extra tests to
            // make sure we don't screw it up. @rvagg
            registry.del(entry)
          }
        }
      }

    , addListener = function (element, orgType, fn, originalFn, args) {
        var entry
          , type = orgType.replace(nameRegex, '')
          , namespaces = orgType.replace(namespaceRegex, '').split('.')

        if (registry.has(element, type, fn))
          return element // no dupe
        if (type === 'unload')
          fn = once(removeListener, element, type, fn, originalFn) // self clean-up
        if (customEvents[type]) {
          if (customEvents[type].condition)
            fn = customHandler(element, fn, type, customEvents[type].condition, true)
          type = customEvents[type].base || type
        }
        entry = registry.put(new RegEntry(element, type, fn, originalFn, namespaces[0] && namespaces))
        entry.handler = entry.isNative ?
          nativeHandler(element, entry.handler, args) :
          customHandler(element, entry.handler, type, false, args, false)
        if (entry.eventSupport)
          listener(entry.target, entry.eventType, entry.handler, true, entry.customType)
      }

    , del = function (selector, fn, $) {
        return function (e) {
          var target, i, array = typeof selector === 'string' ? $(selector, this) : selector
          for (target = e.target; target && target !== this; target = target.parentNode) {
            for (i = array.length; i--;) {
              if (array[i] === target) {
                return fn.apply(target, arguments)
              }
            }
          }
        }
      }

    , remove = function (element, typeSpec, fn) {
        var k, m, type, namespaces, i
          , rm = removeListener
          , isString = typeSpec && typeof typeSpec === 'string'

        if (isString && typeSpec.indexOf(' ') > 0) {
          // remove(el, 't1 t2 t3', fn) or remove(el, 't1 t2 t3')
          typeSpec = typeSpec.split(' ')
          for (i = typeSpec.length; i--;)
            remove(element, typeSpec[i], fn)
          return element
        }
        type = isString && typeSpec.replace(nameRegex, '')
        if (type && customEvents[type])
          type = customEvents[type].type
        if (!typeSpec || isString) {
          // remove(el) or remove(el, t1.ns) or remove(el, .ns) or remove(el, .ns1.ns2.ns3)
          if (namespaces = isString && typeSpec.replace(namespaceRegex, ''))
            namespaces = namespaces.split('.')
          rm(element, type, fn, namespaces)
        } else if (typeof typeSpec === 'function') {
          // remove(el, fn)
          rm(element, null, typeSpec)
        } else {
          // remove(el, { t1: fn1, t2, fn2 })
          for (k in typeSpec) {
            if (typeSpec.hasOwnProperty(k))
              remove(element, k, typeSpec[k])
          }
        }
        return element
      }

    , add = function (element, events, fn, delfn, $) {
        var type, types, i, args
          , originalFn = fn
          , isDel = fn && typeof fn === 'string'

        if (events && !fn && typeof events === 'object') {
          for (type in events) {
            if (events.hasOwnProperty(type))
              add.apply(this, [ element, type, events[type] ])
          }
        } else {
          args = arguments.length > 3 ? slice.call(arguments, 3) : []
          types = (isDel ? fn : events).split(' ')
          isDel && (fn = del(events, (originalFn = delfn), $)) && (args = slice.call(args, 1))
          // special case for one()
          this === ONE && (fn = once(remove, element, events, fn, originalFn))
          for (i = types.length; i--;) addListener(element, types[i], fn, originalFn, args)
        }
        return element
      }

    , one = function () {
        return add.apply(ONE, arguments)
      }

    , fireListener = W3C_MODEL ? function (isNative, type, element) {
        var evt = doc.createEvent(isNative ? 'HTMLEvents' : 'UIEvents')
        evt[isNative ? 'initEvent' : 'initUIEvent'](type, true, true, win, 1)
        element.dispatchEvent(evt)
      } : function (isNative, type, element) {
        element = targetElement(element, isNative)
        // if not-native then we're using onpropertychange so we just increment a custom property
        isNative ? element.fireEvent('on' + type, doc.createEventObject()) : element['_on' + type]++
      }

    , fire = function (element, type, args) {
        var i, j, l, names, handlers
          , types = type.split(' ')

        for (i = types.length; i--;) {
          type = types[i].replace(nameRegex, '')
          if (names = types[i].replace(namespaceRegex, ''))
            names = names.split('.')
          if (!names && !args && element[eventSupport]) {
            fireListener(nativeEvents[type], type, element)
          } else {
            // non-native event, either because of a namespace, arguments or a non DOM element
            // iterate over all listeners and manually 'fire'
            handlers = registry.get(element, type)
            args = [false].concat(args)
            for (j = 0, l = handlers.length; j < l; j++) {
              if (handlers[j].inNamespaces(names))
                handlers[j].handler.apply(element, args)
            }
          }
        }
        return element
      }

    , clone = function (element, from, type) {
        var i = 0
          , handlers = registry.get(from, type)
          , l = handlers.length

        for (;i < l; i++)
          handlers[i].original && add(element, handlers[i].type, handlers[i].original)
        return element
      }

    , bean = {
          add: add
        , one: one
        , remove: remove
        , clone: clone
        , fire: fire
        , noConflict: function () {
            context[name] = old
            return this
          }
      }

  if (win[attachEvent]) {
    // for IE, clean up on unload to avoid leaks
    var cleanup = function () {
      var i, entries = registry.entries()
      for (i in entries) {
        if (entries[i].type && entries[i].type !== 'unload')
          remove(entries[i].element, entries[i].type)
      }
      win[detachEvent]('onunload', cleanup)
      win.CollectGarbage && win.CollectGarbage()
    }
    win[attachEvent]('onunload', cleanup)
  }

  return bean
})

});

require.define("/config.js", function (require, module, exports, __dirname, __filename) {
    var config = {
  keyMap: {
    ATTACK: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
  },
  maxSpeed: {
    player: 3
  },
  minSpeed: {
    player: 0
  }
}

module.exports = config
});

require.define("/lib/em.js", function (require, module, exports, __dirname, __filename) {
    /**
 * Entity Manager.
 */

function asEntityManager() {
  this.entities = {}

  this.addEntity = function (entity) {
    this.entities[entity.type].push(entity)
  }

  this.removeEntity = function (entity) {
    var index = this.entities[entity.type].indexOf(entity)
    if (index >= 0) {
      this.entities[entity.type].splice(index, 1)
    }
  }

  this.declareEntityTypes = function (types) {
    var that = this
    types.forEach(function (type) {
      that.entities[type] = []
    })
  }

  this.iterateEntities = function (callback) {
    var type
    for (type in this.entities) {
      if (this.entities.hasOwnProperty(type)) {
        this.entities[type].forEach(callback)
      }
    }
  }

  this.iterateEntitiesByType = function (type, callback) {
    if (this.entities[type] == null || this.entities[type].length == 0) {
      return
    }
    this.entities[type].forEach(callback)
  }

  return this
}

module.exports = asEntityManager
});

require.define("/lib/mm.js", function (require, module, exports, __dirname, __filename) {
    /**
 * Motion manager.
 */

function asMotionManager() {

  this.handleMotionInput = function (motionInput, entity) {
    var keyMap = this.config.keyMap,
      noAccelerationInput = !motionInput[keyMap.LEFT] && !motionInput[keyMap.UP] && !motionInput[keyMap.RIGHT] && !motionInput[keyMap.DOWN],
      goingTooFast = {x: entity.speed.x > entity.speed.max, y: entity.speed.y > entity.speed.max},
      speedIsNegative = {x: entity.speed.x < 0, y: entity.speed.y < 0},
      noSpeed = {x: entity.speed.x == 0, y: entity.speed.y == 0}

    if (noAccelerationInput && noSpeed.x) {
      entity.dirX = 0
    }

    if (noAccelerationInput && noSpeed.y) {
      entity.dirY = 0
    }

    entity.speed.x -= entity.speed.damping
    entity.speed.y -= entity.speed.damping
    entity.accelerate.left = motionInput[keyMap.LEFT] && entity.x > entity.minX
    entity.accelerate.up = motionInput[keyMap.UP] && entity.y > entity.minY
    entity.accelerate.right = motionInput[keyMap.RIGHT] && entity.x < entity.maxX
    entity.accelerate.down = motionInput[keyMap.DOWN] && entity.y < entity.maxY

     if (goingTooFast.x) {
      entity.speed.x = entity.speed.max
    } else if (speedIsNegative.x) {
      entity.speed.x = entity.speed.min
    }

    if (goingTooFast.y) {
      entity.speed.y = entity.speed.max
    } else if (speedIsNegative.y) {
      entity.speed.y = entity.speed.min
    }
  }

  this.moveEntity = function (entity) {
    if (entity.onPreMove) {
      entity.onPreMove()
    }
    // Accelerate first
    if (entity.accelerate.left) {
      entity.speed.x += entity.speed.step
      entity.dirX = -1
    }
    if (entity.accelerate.up) {
      entity.speed.y += entity.speed.step
      entity.dirY = -1
    }
    if (entity.accelerate.right) {
      entity.speed.x += entity.speed.step
      entity.dirX = 1
    }
    if (entity.accelerate.down) {
      entity.speed.y += entity.speed.step
      entity.dirY = 1
    }

    var newX = entity.x + ((entity.speed.x * this.deltaT) * entity.dirX),
      newY = entity.y + ((entity.speed.y * this.deltaT) * entity.dirY),
      withinMaxBoundX = newX <= entity.maxX,
      withinMinBoundX = newX >= entity.minX,
      withinBoundsX = withinMaxBoundX && withinMinBoundX,
      withinMaxBoundY = newY <= entity.maxY,
      withinMinBoundY = newY >= entity.minY,
      withinBoundsY = withinMaxBoundY && withinMinBoundY

    if (withinBoundsX) {
      entity.x = newX
    } else {
      entity.speed.x = 0
      entity.dirX = 0
      entity.x = withinMinBoundX ? entity.maxX : entity.minX
    }

    if (withinBoundsY) {
      entity.y = newY
    } else {
      entity.speed.y = 0
      entity.dirY = 0
      entity.y = withinMinBoundY ? entity.maxY : entity.minY
    }

  }
  return this
}

module.exports = asMotionManager
});

require.define("/lib/cm.js", function (require, module, exports, __dirname, __filename) {
    /**
 * Collision manager.
 */
function Point(x, y) {
  this.x = x
  this.y = y
  this.add = function(point) {
    return new Point(this.x + point.x, this.y + point.y)
  }
  this.sub = function(point) {
    return new Point(this.x - point.x, this.y - point.y)
  }
}

function asCollisionManager() {
  this.prepareForCollisions = function (entity) {
    entity.collision = false
    entity.colliders = []
  }

  this.checkForCollisions = function (entityA, entityB, onCollision) {
    if (entityA.colliders == null) {
      this.prepareForCollisions(entityA)
    }
    if (entityB.colliders == null) {
      this.prepareForCollisions(entityB)
    }
    this.calculateCenter(entityA)
    this.calculateCenter(entityB)
    var points = ['u'], collision = false, nearX, nearY
    for (var i = 0; i < points.length; i++) {
      nearX = Math.abs(entityA[points[i]].x - entityB.u.x) < (entityB.width / 2)
      nearY = Math.abs(entityA[points[i]].y - entityB.u.y) < (entityB.height / 2)
      collision = nearX && nearY
      if (collision === true) {
        entityA.collision = entityB.collision = true
        onCollision(entityA, entityB)
        break
      }
    }
  }

  this.calculateCenter = function (entity) {
    entity.u = new Point(entity.x + (entity.width / 2), entity.y + (entity.height / 2))
  }

  this.calculateVertices = function (entity) {
    entity.a = new Point(entity.x + entity.width, entity.y)
    entity.b = new Point(entity.x + entity.width, entity.y + entity.height)
    entity.c = new Point(entity.x, entity.y + entity.height)
    entity.d = new Point(entity.x, entity.y)
    return entity
  }

  return this
}

module.exports = asCollisionManager
});

require.define("/lib/sm.js", function (require, module, exports, __dirname, __filename) {
    var asStatusManager = function () {
  this.drawStatuses = function (statuses) {
    var that = this
    this.context.font = "14px Helvetica"
    this.context.fillStyle = "#a3ff1f"
    statuses.forEach(function(status) {
      that.context.fillText(status.text, status.x, status.y)
    })
  }
}
module.exports = asStatusManager
});

require.define("/player.js", function (require, module, exports, __dirname, __filename) {
    var
  config = require("./config"),
  asEntity = require("./lib/entity"),
  asBullet = require("./bullet"),
  augment = require("./lib/augment"),
  asDrawable = require("./lib/drawable")

var asPlayer = function () {

  this.update = function (input, game) {
    var that = this
    if (input[config.keyMap.ATTACK]) {
      this.attack(game)
    }
    if (this.collision === true && this.colliders && this.colliders.length > 0) {
      this.colliders.forEach(function (colliderEntity) {
        if (colliderEntity.damage != null && colliderEntity.damage != 0) {
          that.health -= colliderEntity.damage
          if (colliderEntity.type == 'bullet') {
            colliderEntity.damage = 0
            soundManager.createSound({
              id: 'playerHitByOrb' + game.counter,
              url: '/res/sounds/player-hit-by-orb.mp3',
              volume: 30
            }).play({multiShot: true})
          }
        }
      })
    }
  }

  this.attack = function (game) {
    function FireBullet(x, y, width, height, image) {
      this.x = x
      this.y = y
      this.speed = {x: 0, y: 12, step: 3.5, damping: 0, max: 10}
      this.dirX = 0
      this.dirY = -1
      this.width = width
      this.height = height
      this.image = image
      this.type = 'bullet'
      this.baseColor = '#f83'
      this.accelerate = {left: false, up: false, right: false, down: false}
      this.minX = 0
      this.minY = -40
    }

    augment(FireBullet, asBullet, asEntity, asDrawable)
    var thisAttackDate = +new Date,
      newBullet,
      timeBetweenAttacks = (thisAttackDate - this.previousAttackDate) * game.deltaT
    if (timeBetweenAttacks < 150) {
      return
    }
//    soundManager.play('fireBulletSFX', {multiShotEvents: true})
    soundManager.createSound({
      id: 'fireBulletSFX' + game.counter,
      url: '/res/sounds/bullet-fire.mp3',
      volume: 40
    }).play({multiShot: true})


    newBullet = new FireBullet(this.x, this.y, 12, 24, document.querySelector('.res .images .bullet-fire'))
    newBullet.maxX = game.canvas.width - newBullet.width
    newBullet.maxY = game.canvas.height - newBullet.height
    newBullet.created = thisAttackDate
    newBullet.damage = 15
    newBullet.owner = this
    newBullet.lifeSpan = 900
    game.addEntity(newBullet)

    this.previousAttackDate = thisAttackDate
  }

  this.init = function (x, y, width, height, image) {
    var that = this

    this.x = x
    this.y = y
    this.speed = {x: 0, y: 0, step: 0.7, damping: 0.330, max: 5, min: 0}
    this.dirX = 0
    this.dirY = 0
    this.accelerate = {left: false, up: false, right: false, down: false}
    this.width = width
    this.height = height
    this.image = image
    this.type = 'player'
    this.baseColor = '#f83'
    this.health = 200
    this.previousAttackDate = 0

    soundManager.onready(function() {
      that.fireBulletSFX = soundManager.createSound({
        id: 'fireBulletSFX',
        url: '/res/sounds/bullet-fire.mp3'
      })
    })

  }
}

module.exports = asPlayer

});

require.define("/lib/entity.js", function (require, module, exports, __dirname, __filename) {
    /**
 * Entity mixin.
 */

function asEntity() {
  this.update = function (input, game) {

  }

  this.handleAccelerationInput = function (accelerationInput) {
    this.accelerate.left = accelerationInput.left && this.x > this.minX
    this.accelerate.up = accelerationInput.up && this.y > this.minY
    this.accelerate.right = accelerationInput.right && this.x < this.maxX
    this.accelerate.down = accelerationInput.down && this.y < this.maxY
  }

  return this
}

module.exports = asEntity
});

require.define("/bullet.js", function (require, module, exports, __dirname, __filename) {
    var asBullet = function () {

  this.update = function (input, game) {
    var tooOld = (+new Date - this.created) * game.deltaT > this.lifeSpan
    this.toRemove = (tooOld || this.collision === true)
  }

}

module.exports = asBullet

});

require.define("/lib/augment.js", function (require, module, exports, __dirname, __filename) {
    function augment() {
  var proto = Array.prototype.slice.call(arguments)[0],
    mixins = Array.prototype.splice.call(arguments, 1)
  function F() {}
  var i
  for (i = mixins.length - 1; i >= 0; i--) {
    mixins[i].call(F.prototype)
  }
  proto.call(F.prototype)
  proto.prototype = F.prototype
}

module.exports = augment
});

require.define("/lib/drawable.js", function (require, module, exports, __dirname, __filename) {
    var asDrawable = function (action) {
  this.draw = function (context) {
    if (this.image != null) {
      context.drawImage(this.image, this.x, this.y)
    } else {
      context.fillStyle = this.baseColor;
      context.fillRect(this.x, this.y, this.width, this.height)
    }
  }
}

module.exports = asDrawable

});

require.define("/enemy.js", function (require, module, exports, __dirname, __filename) {
    var
  asEntity = require("./lib/entity"),
  asBullet = require("./bullet"),
  augment = require("./lib/augment"),
  asDrawable = require("./lib/drawable")


var asEnemy = function () {
  this.update = function (input, game) {
    var that = this
    this.dirX = Math.random() * 10 >= 5 ? 1 : -1
    if (this.collision === true && this.colliders && this.colliders.length > 0) {
      this.colliders.forEach(function (colliderEntity) {
        if (colliderEntity.damage != null) {
          that.health -= colliderEntity.damage
          if (colliderEntity.type == 'bullet') {
            colliderEntity.damage = 0
          }
        }
      })
    }
    this.toRemove = this.health < 1
    if (this.toRemove) {
      soundManager.createSound({
        id: 'fireBulletSFX' + game.counter,
        url: '/res/sounds/enemy-explosion.mp3',
        volume: 10
      }).play({multiShot: true})
    } else {
      this.attack(game)
    }
  }

  this.attack = function (game) {
    function ElectricOrbBullet(x, y, width, height, image) {
      this.x = x
      this.y = y
      this.speed = {x: 1.6, y: 3.6, step: 3.5, damping: 0, max: 10}
      this.dirX = 0
      this.dirY = 1
      this.width = width
      this.height = height
      this.image = image
      this.type = 'bullet'
      this.baseColor = '#f83'
      this.accelerate = {left: false, up: false, right: false, down: false}
      this.minX = 40
      this.minY = 0
    }

    augment(ElectricOrbBullet, asBullet, asEntity, asDrawable)

    var thisAttackDate = +new Date,
      newBullet,
      timeBetweenAttacks = (thisAttackDate - this.previousAttackDate) * game.deltaT
    if (timeBetweenAttacks < 2000 + (Math.random() * 5000)) {
      return
    }
    newBullet = new ElectricOrbBullet(this.x, this.y, 12, 24, document.querySelector('.res .images .bullet-electricorb'))
    newBullet.maxX = game.canvas.width - newBullet.width
    newBullet.maxY = game.canvas.height + newBullet.height + 100
    newBullet.created = thisAttackDate
    newBullet.damage = 10
    newBullet.owner = this
    newBullet.lifeSpan = 50000
    newBullet.onPreMove = function () {
      this.x += (Math.sin(this.y * 0.06) * 4)
      if (this.x < game.player.x) {
        this.dirX = 1
      } else if (this.x > game.player.x) {
        this.dirX = -1
      }
    }
    game.addEntity(newBullet)

    this.previousAttackDate = thisAttackDate
  }

  this.init = function (x, y, width, height, image) {
    this.x = x
    this.y = y
    this.speed = {x: 0.8, y: 0, step: 1.5, damping: 0.060, max: 5, min: 0}
    this.dirX = 0
    this.dirY = 0
    this.accelerate = {left: false, up: false, right: false, down: false}
    this.width = width
    this.height = height
    this.image = image
    this.type = 'weakling'
    this.baseColor = '#835'
    this.health = 100
    this.previousAttackDate = 0
  }


}

module.exports = asEnemy

});

require.define("/main.js", function (require, module, exports, __dirname, __filename) {
    /* Require stuff. This is ugly. */

var
  asGame = require("./game"),
  asEntityManager = require("./lib/em"),
  asMotionManager = require("./lib/mm"),
  asCollisionManager = require("./lib/cm"),
  asStatusManager = require("./lib/sm"),
  asPlayer = require("./player"),
  player,
  asEnemy = require("./enemy"),
  asEntity = require("./lib/entity"),
  game,
  augment = require("./lib/augment"),
  asDrawable = require("./lib/drawable"),
  newWeakling

function RedGiant(canvas, context) {
  this.canvas = canvas
  this.context = context
}
augment(RedGiant, asGame, asEntityManager, asMotionManager, asCollisionManager, asStatusManager)

function Player() { }
augment(Player, asPlayer, asEntity, asEntityManager, asDrawable)

function Weakling() { }
augment(Weakling, asEnemy, asEntity, asEntityManager, asDrawable)

game = new RedGiant(
  document.getElementById("main-canvas"),
  document.getElementById("main-canvas").getContext("2d")
)
game.declareEntityTypes(['player', 'weakling', 'bullet'])

game.entityBuilders = {Weakling: Weakling, Player: Player}

game.init()

function animationLoop(render, element) {
  var running, lastFrame = +new Date;

  function loop(now) {
    // stop the loop if render returned false
    if (running !== false) {
      requestAnimationFrame(loop, element)
      var deltaT = now - lastFrame;
      // do not render frame when deltaT is too high
      if (deltaT < 160) {
        running = render(deltaT)
      }
      lastFrame = now
    }
  }

  loop(lastFrame)
}

animationLoop(function(deltaT) {
  game.update(deltaT)
}, game.canvas)
});
require("/main.js");
