/**
 * @fileOverview
 * @url https://github.com/otn83/jscls
 * @author otn83 nakahara@coremind.jp
 * @license http://en.wikipedia.org/wiki/MIT_License
 */
(function(w)
{
    var config = w._conf_ || { enabledLog:true };

    var dType = {
        S:"string",
        N:"number",
        B:"boolean",
        F:"function",
        O:"object",
        A:"array"
    };
    function typeOf(val)
    {
        if (isNull(val) || isUndefined(val)) return val;
        else if (isBoolean(val)) return dType.B;
        else if (isNumber(val)) return dType.N;
        else if (isString(val)) return dType.S;
        else if (isArray(val)) return dType.A;
        else if (isFunction(val)) return dType.F;
        else if (isObject(val)) return dType.O;
        else return typeof val;
    }
    function isBoolean(val) {
        return typeof val == dType.B || val instanceof Boolean;
    }
    function isNumber(val) {
        return typeof val == dType.N || val instanceof Number;
    }
    function isString(val) {
        return typeof val == dType.S || val instanceof String;
    }
    function isArray(val) {
        return typeof val == dType.A || val instanceof Array;
    }
    function isFunction(val) {
        return typeof val == dType.F || val instanceof Function;
    }
    var isDomElement = Node ?
        function (val) { return val instanceof Node; }:
        function (val) { return isNumber(val.nodeType); };
    function isObject(val) {
        return typeof val == dType.O && !(val instanceof Array) && val instanceof Object;
    }
    function isUndefined(val) {
        return val === undefined;
    }
    function isNull(val) {
        return val === null;
    }
    function concat() {
        var result = "";
        for(var i = 0, len = arguments.length; i < len; i ++)
            result += arguments[i];
        return result;
    }
    function clone(from, to, deep)
    {
        to = isUndefined(to) ? {}: to;
        for(var p in from)
            to[p] = (isObject(from[p]) && deep) ?
                clone(from[p], {}, deep):
                (isArray(from[p]) && deep) ?
                    from[p].slice(0):
                    from[p];
        return to;
    }
    function indexOf(object)
    {
        for(var i = 0, len = this.length; i < len; i ++)
            if (this[i] === object)
                return i;
        return -1;
    }
    function getOwnPropertyNames(object)
    {
        var _result = [];
        for (var p in object)
            if (object.hasOwnProperty(p))
                _result.push(p);
        return _result;
    }
    function capitalize(str) {
        return str.toLowerCase().replace(/^\w/, function(val) { return val.toUpperCase(); });
    }
    function output(str) {
        console.log(str);
    }
    function log() {
        output(getArrayString.apply(this, arguments));
    }
    function logD() {
        Array.prototype.unshift.call(arguments, "DEBUG|");
        output(getArrayString.apply(this, arguments));
    }
    function log$()
    {
        Array.prototype.unshift.call(arguments, "DEV|");
        output(getArrayString.apply(this, arguments));
    }
    function logW() {
        console.warn(getArrayString.apply(this, arguments));
    }
    function logE() {
        throw new Error(getArrayString.apply(this, arguments));
    }
    function getArrayString()
    {
        var _result = arguments.length === 0 ? "": arguments[0];
        for(var i = 1, len = arguments.length; i < len; i ++)
        {
            _result += " ";
            _result += arguments[i];
        }
        return _result;
    }
    function dump(val, prefix, max, now)
    {
        now = isUndefined(now) ? 0: now;
        max = isUndefined(max) ? 0: max;
        
        prefix = prefix ? prefix + "  " : "  ";
        if (isNull(val) || isUndefined(val))
            logD(prefix, "undefined or null");
        
        for (var p in val)
        {
            if (p == "parent")
                continue;
            if (isFunction(val[p]))
                logD(prefix, p, "function {}");
            else
            if (max >= 1+now && isObject(val[p]) || isArray(val[p]))
            {
                logD(prefix, "[", p, "]");
                dump(val[p], prefix + "  ", max, 1+now);
            }
            else
                logD(prefix, p, " ", val[p]);
        }
    }
//class--------------begin
    var _temp = {};
    function exports()
    {
        var _arrProto = Array.prototype;
        var _classDefine = _arrProto.pop.call(arguments);

        _validateDefine(_classDefine);
        _attachImport(_classDefine, _arrProto.slice.call(arguments, 0));

        jsml ?
            jsml.exports(_classDefine.$name, _classDefine, _classDefine.$import):
            _temp[_classDefine.$name] = _classDefine;
    }
    function _validateDefine(classDefine)
    {
        var _name = classDefine.$name;

        if (!isString(_name))
            logE("$name is not String. ", _name);
        if (!isFunction(classDefine.$define[classDefine.$name.split(".").pop()]))
            logE(_name, "method[constructor] is undefined.");
        if (!isFunction(classDefine.$define.destroy))
            logE(_name, "method[destroy] is undefined.");
        if (isUndefined(classDefine.$extends))
            classDefine.$extends = "root.Origin";
        else
        if (!isString(classDefine.$extends))
            logE("$extends is not String. " + classDefine.$extends);
    }
    function _attachImport(classDefine, packageList)
    {
        classDefine.$import = classDefine.$extends === "Object" ?
            packageList:
            [classDefine.$extends].concat(packageList);
    }
    function require()
    {
        var _packageList = Array.prototype.slice.call(arguments, 0);
        var _callback = _packageList.pop();

        jsml ?
            jsml.require(_packageList, _getRequireCallback(_callback)):
            _getRequireCallback(_callback)();
    }
    function _getRequireCallback(callback)
    {
        var _defineContainer = jsml ? jsml.modules: _temp;
        return function(packageList) {
            var _singletonList = [];

            while (packageList.length > 0)
                _register(_defineContainer[packageList.shift()], _singletonList);

            _createSingleton(_singletonList);
            callback();
        };
    }
    function _register(classDefine, singletonList)
    {
        if (!isUndefined(get(classDefine.$name)))
            return;

        if (isUndefined(get(classDefine.$extends)))
            _register(jsml.modules[classDefine.$extends], singletonList);

        classDefine.$singleton ?
            singletonList.push(classDefine.$name):
            _set(classDefine.$name, _create(classDefine));
    }
    function _createSingleton(singletonList)
    {
        var _failed = [], _beforeLength = singletonList.length;

        while (singletonList.length > 0)
        {
            var _packagePath = singletonList.pop();
            var _classDefine = jsml.modules[_packagePath];
            try {
                _set(_classDefine.$name, new (_create(_classDefine))());
            } catch (e) {
                logW(_classDefine.$name, e.message, e.stack);
                _failed.push(_packagePath);
            }
        }

        if (_failed.length > 0)
            _beforeLength === _failed.length ?
                logE("Singleton initialize Error."):
                _createSingleton(_failed);
    }
    function _set(packagePath, object)
    {
        var _split = packagePath.split(".");
        var _prop  = _split.pop();
        _getPackage(_split)[_prop] = object;
    }
    function get(packagePath)
    {
        var _split = packagePath.split(".");
        var _prop  = _split.pop();
        return _getPackage(_split)[_prop];
    }
    function _getPackage(pathArray)
    {
        var _result = w;

        while (pathArray.length > 0)
        {
            var p = pathArray.shift();
            if (!_result[p]) _result[p] = {};
            _result = _result[p];
        }

        return _result;
    }
    function _create(classDefine)
    {
        var _classPathArray = classDefine.$name.split(".");
        classDefine.temp = {
            spr : _getSuperClass(classDefine),
            name: _classPathArray.pop(),
            path: _classPathArray.join(".")
        };
        classDefine.temp.object = _createPlainClass(classDefine);

        _copyConfig(classDefine);
        _copySuperClassPrototype(classDefine);
        _copySubClassPrototype(classDefine);
        _copyStaticMember(classDefine);
        _createClassMember(classDefine);
        _createInstanceMember(classDefine);
        _tryOverrideConstructor(classDefine);
        _tryOverrideDestroy(classDefine);

        var _result = classDefine.temp.object;
        for (var p in classDefine.temp)
            delete classDefine.temp[p];
        delete classDefine.temp;

        return _result;
    }
    function _getSuperClass(classDefine)
    {
        var _superClass = get(classDefine.$extends);
            
        if (!classDefine.$singleton && _superClass.$class)
            logE(_superClass.$class, "is singleton class. can not extends.");

        return _superClass;
    }
    function _createPlainClass(classDefine)
    {
        var _name  = classDefine.temp.name;

        return !classDefine.$singleton ?
            function() { this[_name].apply(this, arguments); }:
            function() {
                this.$class.getRefCount() === 0 ?
                    this[_name].apply(this, arguments):
                    logE(_name, " is singleton");
            };
    }
    function _copyConfig(classDefine)
    {
        var _default = classDefine.$defaultConfig;
        if (isUndefined(_default)) return;

        var _pkgPath = classDefine.temp.path + "." + classDefine.temp.name;
        var _override = config[_pkgPath];

        config[_pkgPath] = isUndefined(_override) ?
            _default:
            clone(_override, _default, true);
    }
    function _copySuperClassPrototype(classDefine)
    {
        var p;
        var _sub = classDefine.temp.object;
        var _subProto = classDefine.temp.object.prototype;
        var _super = classDefine.temp.spr;
        var _superProto = _super.prototype;
        
        for(p in _superProto) _subProto[p] = _superProto[p];//prototype member
        for(p in _super) _sub[p] = _super[p];//static member

        _sub.superClass = _super;
    }
    function _copySubClassPrototype(classDefine)
    {
        var _logString = classDefine.temp.path + "." + classDefine.temp.name + "::";
        var _subProto = classDefine.temp.object.prototype;
        var _subDef = classDefine.$define;
        var _subOr = classDefine.$override;
        var p;

        for(p in _subDef)
        {
            if (p != "destroy" && isFunction(_subProto[p]))
                logE("method is already defined.", _logString + p);
            _subProto[p] = _subDef[p];
        }

        for(p in _subOr)
        {
            if (!isFunction(_subProto[p]))
                logE("invalid override. method is not defined.", _logString + p);
            _subProto[p] = _subOr[p];
        }
    }
    function _createClassMember(classDefine)
    {
        var _classObject = classDefine.temp.object;
        var _classFullName = classDefine.$name;

        //class property
        _classObject._instanceCounter = 0;
        _classObject.singleton = Boolean(classDefine.$singleton);

        //class method
        _classObject.toString = function() { return _classFullName; };
        _classObject.getRefCount = function() { return this._instanceCounter; };
        _classObject.equal = function(instance)
        {
            while (!isUndefined(instance) && isFunction(instance.getClassFullName))
                if (_classFullName === instance.getClassFullName())
                    return true;
                else instance = instance.$class.superClass.prototype;
            return false;
        };
        if (classDefine.$singleton)
            _classObject.getInstance = function() { return this.$class.__instance__; };
    }
    function _copyStaticMember(classDefine, classObjct)
    {
        var _static = classDefine.$static;
        var _sub = classDefine.temp.object;
        if (isUndefined(_static))
            return;

        if (isFunction(_static))
        {
            _sub.func = _static;
            _sub.func();
            delete _sub.func;
        }
        else
            for (var p in _static)
                _sub[p] = _static[p];
    }
    function _createInstanceMember(classDefine)
    {
        var _subProto = classDefine.temp.object.prototype;
        var _superProto = classDefine.temp.spr.prototype;

        _subProto.$class = classDefine.temp.object;
        _subProto.className = classDefine.temp.name;
        _subProto.classPath = classDefine.temp.path;

        if (classDefine.$extends === "Object")
        {
            _subProto.superClassName = "Object";
            _subProto.superClassPath = "";
        }
        else
        {
            _subProto.superClassName = _superProto.className;
            _subProto.superClassPath = _superProto.classPath;
        }
    }
    function _tryOverrideConstructor(classDefine)
    {
        if (classDefine.$extends === "Object")
            return;

        var _subProto = classDefine.temp.object.prototype;
        var _name = classDefine.temp.name;
        var _subConstructor = _subProto[_name];
        if (!_subConstructor.toString().match(/\.\$super\([\b|\s]*["|']{2}[\b|\s]*\)/))
        {
            var _superProto = classDefine.temp.spr.prototype;
            var _superConstructor = _superProto[_subProto.superClassName];
            _subProto[_name] = function()
            {
                _superConstructor.apply(this, arguments);
                _subConstructor.apply(this, arguments);
            };
        }
    }
    function _tryOverrideDestroy(classDefine)
    {
        if (classDefine.$extends === "Object")
            return;

        var _subProto = classDefine.temp.object.prototype;
        var _subDestroy = _subProto.destroy;
        if (!_subDestroy.toString().match(/\.\$super\([\b|\s]*["|']destroy["|'][\b|\s]*\)/))
        {
            var _superProto = classDefine.temp.spr.prototype;
            var _superDestroy = _superProto.destroy;
            _subProto.destroy = function()
            {
                _subDestroy.apply(this, arguments);
                _superDestroy.apply(this, arguments);
            };
        }
    }
//class--------------end
    
//apply config setting
    if (!config.enabledLog)
        log = logD = logW = logE = log$ = dump = function(){};

    if (jsml && isObject(config.jsmlAlias))
        for (var p in config.jsmlAlias)
            jsml.setAlias(config.jsmlAlias[p], p);

//set global member
    w.cls = {
        exports:exports,
        require:require,
        get:get,
        config:config
    };
    w.out = {
        p:log,
        d:logD,
        w:logW,
        e:logE,
        $:log$//develope
    };
    w.ex = {
        object:{
            dump:dump,
            clone:clone,
            getOwnPropertyNames:getOwnPropertyNames
        },
        string:{
            concat:concat,
            capitalize:capitalize
        }
    };
    w.eq = {
        isBoolean:isBoolean,
        isNumber:isNumber,
        isString:isString,
        isArray:isArray,
        isFunction:isFunction,
        isObject:isObject,
        isNull:isNull,
        isUndefined:isUndefined,
        isDomElement:isDomElement,
        typeOf:typeOf
    };

/*@cc_on
    @if (@_jscript_version <= 6)
        w.console = { log:function(){} };
    @end

    if (isUndefined(Array.prototype.indexOf))
        Array.prototype.indexOf = indexOf;
@*/
})(window);