/**
 * Created by Adam on 8/13/2014.
 * Enhancements to Storage
 */

var _setItem = Storage.prototype.setItem;
var _getItem = Storage.prototype.getItem;

Storage.prototype.setItem = function (key, value) {
    if (this === window.localStorage) {
        _setItem.apply(this, [key, JSON.stringify(value)]);
    } else
        _setItem.apply(this, arguments);
};

Storage.prototype.getItem = function (key) {
    if (this === window.localStorage) {
        var value = JSON.parse(_getItem.apply(this, arguments));
        return value;
    } else
        _getItem.apply(this, arguments);
};

var data = {
    _initialized: false,
    init: function () {
        if (this._initialized) return;
        this._initialized = true;
        window.addEventListener("storage", this._handle_storage, false);
        if ("server" in window.localStorage) return;
        this.set("server", null);
        this.set("channels", null);
        this.set("clients", {});
        this.set("current_window", null);
//        this.set("queue", {});
    },
    _check_if_init: function () {
        if (!this._initialized) throw "Data structure not initialized. Call data.init() first. data.init() should only be called once!";
        return true;
    },
    _handle_storage: function (e) {
        var type = e.key;
        var event = new CustomEvent("speakeasy." + type, {
            "detail": {
                "from": e.oldValue,
                "to": e.newValue,
                "page": e.url
            },
            "cancelable": true
        });
        window.dispatchEvent(event);
    },
    get: function (key) {
        this._check_if_init();
        return window.localStorage.getItem(key);
    },
    set: function (key, value) {
        this._check_if_init();
        window.localStorage.setItem(key, value)
    },
    push: function(key, value) {
        this._check_if_init();
        this.set(key, this.get(key).push(value));
    },
    pop: function(key) {
        var data = this.get(key);
        var ret_val = data.pop();
        this.set(key, data);
        return ret_val;
    },
    dequeue: function(key) {
        var data = this.get(key);
        var ret_val = data.shift();
        this.set(key, data);
        return ret_val;
    },
    addToObj: function(obj_key, key, value) {
        this._check_if_init();
        var obj = this.get(obj_key);
        obj[key] = value;
        this.set(key, obj);
    },
    listenTo: function (key, callback) {
        window.addEventListener("speakeasy." + key, callback);
    },
    addToQueue: function (window, method, data) {
        this._check_if_init();
        var queue = this.get(window + "_queue") || {};
//        if (!(window in queue)) queue[window] = {};
        if (!(method in queue)) queue[method] = [];
        queue[method].push(data);
        this.set(window + "_queue", queue);
    }
};