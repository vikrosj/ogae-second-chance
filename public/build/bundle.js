
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }

    const is_client = typeof window !== 'undefined';
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.49.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Navbar.svelte generated by Svelte v3.49.0 */

    const file$3 = "src/Navbar.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "static/esc_norway_edit.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "logo");
    			attr_dev(img, "class", "svelte-1atai9j");
    			add_location(img, file$3, 1, 2, 34);
    			attr_dev(div, "class", "navbar-background svelte-1atai9j");
    			add_location(div, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Navbar', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var countryFlagEmoji_umd = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
    	module.exports = factory() ;
    }(commonjsGlobal, (function () {
    	function createCommonjsModule(fn, module) {
    		return module = { exports: {} }, fn(module, module.exports), module.exports;
    	}

    	var _global = createCommonjsModule(function (module) {
    	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
    	var global = module.exports = typeof window != 'undefined' && window.Math == Math
    	  ? window : typeof self != 'undefined' && self.Math == Math ? self
    	  // eslint-disable-next-line no-new-func
    	  : Function('return this')();
    	if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
    	});

    	var _core = createCommonjsModule(function (module) {
    	var core = module.exports = { version: '2.6.0' };
    	if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
    	});
    	_core.version;

    	var _isObject = function (it) {
    	  return typeof it === 'object' ? it !== null : typeof it === 'function';
    	};

    	var _anObject = function (it) {
    	  if (!_isObject(it)) throw TypeError(it + ' is not an object!');
    	  return it;
    	};

    	var _fails = function (exec) {
    	  try {
    	    return !!exec();
    	  } catch (e) {
    	    return true;
    	  }
    	};

    	// Thank's IE8 for his funny defineProperty
    	var _descriptors = !_fails(function () {
    	  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
    	});

    	var document = _global.document;
    	// typeof document.createElement is 'object' in old IE
    	var is = _isObject(document) && _isObject(document.createElement);
    	var _domCreate = function (it) {
    	  return is ? document.createElement(it) : {};
    	};

    	var _ie8DomDefine = !_descriptors && !_fails(function () {
    	  return Object.defineProperty(_domCreate('div'), 'a', { get: function () { return 7; } }).a != 7;
    	});

    	// 7.1.1 ToPrimitive(input [, PreferredType])

    	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
    	// and the second argument - flag - preferred type is a string
    	var _toPrimitive = function (it, S) {
    	  if (!_isObject(it)) return it;
    	  var fn, val;
    	  if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
    	  if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
    	  if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
    	  throw TypeError("Can't convert object to primitive value");
    	};

    	var dP = Object.defineProperty;

    	var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
    	  _anObject(O);
    	  P = _toPrimitive(P, true);
    	  _anObject(Attributes);
    	  if (_ie8DomDefine) try {
    	    return dP(O, P, Attributes);
    	  } catch (e) { /* empty */ }
    	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
    	  if ('value' in Attributes) O[P] = Attributes.value;
    	  return O;
    	};

    	var _objectDp = {
    		f: f
    	};

    	var _propertyDesc = function (bitmap, value) {
    	  return {
    	    enumerable: !(bitmap & 1),
    	    configurable: !(bitmap & 2),
    	    writable: !(bitmap & 4),
    	    value: value
    	  };
    	};

    	var _hide = _descriptors ? function (object, key, value) {
    	  return _objectDp.f(object, key, _propertyDesc(1, value));
    	} : function (object, key, value) {
    	  object[key] = value;
    	  return object;
    	};

    	var hasOwnProperty = {}.hasOwnProperty;
    	var _has = function (it, key) {
    	  return hasOwnProperty.call(it, key);
    	};

    	var id = 0;
    	var px = Math.random();
    	var _uid = function (key) {
    	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
    	};

    	var _redefine = createCommonjsModule(function (module) {
    	var SRC = _uid('src');
    	var TO_STRING = 'toString';
    	var $toString = Function[TO_STRING];
    	var TPL = ('' + $toString).split(TO_STRING);

    	_core.inspectSource = function (it) {
    	  return $toString.call(it);
    	};

    	(module.exports = function (O, key, val, safe) {
    	  var isFunction = typeof val == 'function';
    	  if (isFunction) _has(val, 'name') || _hide(val, 'name', key);
    	  if (O[key] === val) return;
    	  if (isFunction) _has(val, SRC) || _hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
    	  if (O === _global) {
    	    O[key] = val;
    	  } else if (!safe) {
    	    delete O[key];
    	    _hide(O, key, val);
    	  } else if (O[key]) {
    	    O[key] = val;
    	  } else {
    	    _hide(O, key, val);
    	  }
    	// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
    	})(Function.prototype, TO_STRING, function toString() {
    	  return typeof this == 'function' && this[SRC] || $toString.call(this);
    	});
    	});

    	var _aFunction = function (it) {
    	  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
    	  return it;
    	};

    	// optional / simple context binding

    	var _ctx = function (fn, that, length) {
    	  _aFunction(fn);
    	  if (that === undefined) return fn;
    	  switch (length) {
    	    case 1: return function (a) {
    	      return fn.call(that, a);
    	    };
    	    case 2: return function (a, b) {
    	      return fn.call(that, a, b);
    	    };
    	    case 3: return function (a, b, c) {
    	      return fn.call(that, a, b, c);
    	    };
    	  }
    	  return function (/* ...args */) {
    	    return fn.apply(that, arguments);
    	  };
    	};

    	var PROTOTYPE = 'prototype';

    	var $export = function (type, name, source) {
    	  var IS_FORCED = type & $export.F;
    	  var IS_GLOBAL = type & $export.G;
    	  var IS_STATIC = type & $export.S;
    	  var IS_PROTO = type & $export.P;
    	  var IS_BIND = type & $export.B;
    	  var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] || (_global[name] = {}) : (_global[name] || {})[PROTOTYPE];
    	  var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
    	  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
    	  var key, own, out, exp;
    	  if (IS_GLOBAL) source = name;
    	  for (key in source) {
    	    // contains in native
    	    own = !IS_FORCED && target && target[key] !== undefined;
    	    // export native or passed
    	    out = (own ? target : source)[key];
    	    // bind timers to global for call from export context
    	    exp = IS_BIND && own ? _ctx(out, _global) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
    	    // extend global
    	    if (target) _redefine(target, key, out, type & $export.U);
    	    // export
    	    if (exports[key] != out) _hide(exports, key, exp);
    	    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
    	  }
    	};
    	_global.core = _core;
    	// type bitmap
    	$export.F = 1;   // forced
    	$export.G = 2;   // global
    	$export.S = 4;   // static
    	$export.P = 8;   // proto
    	$export.B = 16;  // bind
    	$export.W = 32;  // wrap
    	$export.U = 64;  // safe
    	$export.R = 128; // real proto method for `library`
    	var _export = $export;

    	var toString = {}.toString;

    	var _cof = function (it) {
    	  return toString.call(it).slice(8, -1);
    	};

    	// fallback for non-array-like ES3 and non-enumerable old V8 strings

    	// eslint-disable-next-line no-prototype-builtins
    	var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
    	  return _cof(it) == 'String' ? it.split('') : Object(it);
    	};

    	// 7.2.1 RequireObjectCoercible(argument)
    	var _defined = function (it) {
    	  if (it == undefined) throw TypeError("Can't call method on  " + it);
    	  return it;
    	};

    	// to indexed object, toObject with fallback for non-array-like ES3 strings


    	var _toIobject = function (it) {
    	  return _iobject(_defined(it));
    	};

    	// 7.1.4 ToInteger
    	var ceil = Math.ceil;
    	var floor = Math.floor;
    	var _toInteger = function (it) {
    	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
    	};

    	// 7.1.15 ToLength

    	var min = Math.min;
    	var _toLength = function (it) {
    	  return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
    	};

    	var max = Math.max;
    	var min$1 = Math.min;
    	var _toAbsoluteIndex = function (index, length) {
    	  index = _toInteger(index);
    	  return index < 0 ? max(index + length, 0) : min$1(index, length);
    	};

    	// false -> Array#indexOf
    	// true  -> Array#includes



    	var _arrayIncludes = function (IS_INCLUDES) {
    	  return function ($this, el, fromIndex) {
    	    var O = _toIobject($this);
    	    var length = _toLength(O.length);
    	    var index = _toAbsoluteIndex(fromIndex, length);
    	    var value;
    	    // Array#includes uses SameValueZero equality algorithm
    	    // eslint-disable-next-line no-self-compare
    	    if (IS_INCLUDES && el != el) while (length > index) {
    	      value = O[index++];
    	      // eslint-disable-next-line no-self-compare
    	      if (value != value) return true;
    	    // Array#indexOf ignores holes, Array#includes - not
    	    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
    	      if (O[index] === el) return IS_INCLUDES || index || 0;
    	    } return !IS_INCLUDES && -1;
    	  };
    	};

    	var _shared = createCommonjsModule(function (module) {
    	var SHARED = '__core-js_shared__';
    	var store = _global[SHARED] || (_global[SHARED] = {});

    	(module.exports = function (key, value) {
    	  return store[key] || (store[key] = value !== undefined ? value : {});
    	})('versions', []).push({
    	  version: _core.version,
    	  mode:  'global',
    	  copyright: '© 2018 Denis Pushkarev (zloirock.ru)'
    	});
    	});

    	var shared = _shared('keys');

    	var _sharedKey = function (key) {
    	  return shared[key] || (shared[key] = _uid(key));
    	};

    	var arrayIndexOf = _arrayIncludes(false);
    	var IE_PROTO = _sharedKey('IE_PROTO');

    	var _objectKeysInternal = function (object, names) {
    	  var O = _toIobject(object);
    	  var i = 0;
    	  var result = [];
    	  var key;
    	  for (key in O) if (key != IE_PROTO) _has(O, key) && result.push(key);
    	  // Don't enum bug & hidden keys
    	  while (names.length > i) if (_has(O, key = names[i++])) {
    	    ~arrayIndexOf(result, key) || result.push(key);
    	  }
    	  return result;
    	};

    	// IE 8- don't enum bug keys
    	var _enumBugKeys = (
    	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
    	).split(',');

    	// 19.1.2.14 / 15.2.3.14 Object.keys(O)



    	var _objectKeys = Object.keys || function keys(O) {
    	  return _objectKeysInternal(O, _enumBugKeys);
    	};

    	var f$1 = {}.propertyIsEnumerable;

    	var _objectPie = {
    		f: f$1
    	};

    	var isEnum = _objectPie.f;
    	var _objectToArray = function (isEntries) {
    	  return function (it) {
    	    var O = _toIobject(it);
    	    var keys = _objectKeys(O);
    	    var length = keys.length;
    	    var i = 0;
    	    var result = [];
    	    var key;
    	    while (length > i) if (isEnum.call(O, key = keys[i++])) {
    	      result.push(isEntries ? [key, O[key]] : O[key]);
    	    } return result;
    	  };
    	};

    	// https://github.com/tc39/proposal-object-values-entries

    	var $values = _objectToArray(false);

    	_export(_export.S, 'Object', {
    	  values: function values(it) {
    	    return $values(it);
    	  }
    	});

    	var _wks = createCommonjsModule(function (module) {
    	var store = _shared('wks');

    	var Symbol = _global.Symbol;
    	var USE_SYMBOL = typeof Symbol == 'function';

    	var $exports = module.exports = function (name) {
    	  return store[name] || (store[name] =
    	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : _uid)('Symbol.' + name));
    	};

    	$exports.store = store;
    	});

    	// 22.1.3.31 Array.prototype[@@unscopables]
    	var UNSCOPABLES = _wks('unscopables');
    	var ArrayProto = Array.prototype;
    	if (ArrayProto[UNSCOPABLES] == undefined) _hide(ArrayProto, UNSCOPABLES, {});
    	var _addToUnscopables = function (key) {
    	  ArrayProto[UNSCOPABLES][key] = true;
    	};

    	var _iterStep = function (done, value) {
    	  return { value: value, done: !!done };
    	};

    	var _iterators = {};

    	var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
    	  _anObject(O);
    	  var keys = _objectKeys(Properties);
    	  var length = keys.length;
    	  var i = 0;
    	  var P;
    	  while (length > i) _objectDp.f(O, P = keys[i++], Properties[P]);
    	  return O;
    	};

    	var document$1 = _global.document;
    	var _html = document$1 && document$1.documentElement;

    	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])



    	var IE_PROTO$1 = _sharedKey('IE_PROTO');
    	var Empty = function () { /* empty */ };
    	var PROTOTYPE$1 = 'prototype';

    	// Create object with fake `null` prototype: use iframe Object with cleared prototype
    	var createDict = function () {
    	  // Thrash, waste and sodomy: IE GC bug
    	  var iframe = _domCreate('iframe');
    	  var i = _enumBugKeys.length;
    	  var lt = '<';
    	  var gt = '>';
    	  var iframeDocument;
    	  iframe.style.display = 'none';
    	  _html.appendChild(iframe);
    	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
    	  // createDict = iframe.contentWindow.Object;
    	  // html.removeChild(iframe);
    	  iframeDocument = iframe.contentWindow.document;
    	  iframeDocument.open();
    	  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
    	  iframeDocument.close();
    	  createDict = iframeDocument.F;
    	  while (i--) delete createDict[PROTOTYPE$1][_enumBugKeys[i]];
    	  return createDict();
    	};

    	var _objectCreate = Object.create || function create(O, Properties) {
    	  var result;
    	  if (O !== null) {
    	    Empty[PROTOTYPE$1] = _anObject(O);
    	    result = new Empty();
    	    Empty[PROTOTYPE$1] = null;
    	    // add "__proto__" for Object.getPrototypeOf polyfill
    	    result[IE_PROTO$1] = O;
    	  } else result = createDict();
    	  return Properties === undefined ? result : _objectDps(result, Properties);
    	};

    	var def = _objectDp.f;

    	var TAG = _wks('toStringTag');

    	var _setToStringTag = function (it, tag, stat) {
    	  if (it && !_has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
    	};

    	var IteratorPrototype = {};

    	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
    	_hide(IteratorPrototype, _wks('iterator'), function () { return this; });

    	var _iterCreate = function (Constructor, NAME, next) {
    	  Constructor.prototype = _objectCreate(IteratorPrototype, { next: _propertyDesc(1, next) });
    	  _setToStringTag(Constructor, NAME + ' Iterator');
    	};

    	// 7.1.13 ToObject(argument)

    	var _toObject = function (it) {
    	  return Object(_defined(it));
    	};

    	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)


    	var IE_PROTO$2 = _sharedKey('IE_PROTO');
    	var ObjectProto = Object.prototype;

    	var _objectGpo = Object.getPrototypeOf || function (O) {
    	  O = _toObject(O);
    	  if (_has(O, IE_PROTO$2)) return O[IE_PROTO$2];
    	  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    	    return O.constructor.prototype;
    	  } return O instanceof Object ? ObjectProto : null;
    	};

    	var ITERATOR = _wks('iterator');
    	var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
    	var FF_ITERATOR = '@@iterator';
    	var KEYS = 'keys';
    	var VALUES = 'values';

    	var returnThis = function () { return this; };

    	var _iterDefine = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
    	  _iterCreate(Constructor, NAME, next);
    	  var getMethod = function (kind) {
    	    if (!BUGGY && kind in proto) return proto[kind];
    	    switch (kind) {
    	      case KEYS: return function keys() { return new Constructor(this, kind); };
    	      case VALUES: return function values() { return new Constructor(this, kind); };
    	    } return function entries() { return new Constructor(this, kind); };
    	  };
    	  var TAG = NAME + ' Iterator';
    	  var DEF_VALUES = DEFAULT == VALUES;
    	  var VALUES_BUG = false;
    	  var proto = Base.prototype;
    	  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
    	  var $default = $native || getMethod(DEFAULT);
    	  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
    	  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
    	  var methods, key, IteratorPrototype;
    	  // Fix native
    	  if ($anyNative) {
    	    IteratorPrototype = _objectGpo($anyNative.call(new Base()));
    	    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
    	      // Set @@toStringTag to native iterators
    	      _setToStringTag(IteratorPrototype, TAG, true);
    	      // fix for some old engines
    	      if ( typeof IteratorPrototype[ITERATOR] != 'function') _hide(IteratorPrototype, ITERATOR, returnThis);
    	    }
    	  }
    	  // fix Array#{values, @@iterator}.name in V8 / FF
    	  if (DEF_VALUES && $native && $native.name !== VALUES) {
    	    VALUES_BUG = true;
    	    $default = function values() { return $native.call(this); };
    	  }
    	  // Define iterator
    	  if ( (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    	    _hide(proto, ITERATOR, $default);
    	  }
    	  // Plug for library
    	  _iterators[NAME] = $default;
    	  _iterators[TAG] = returnThis;
    	  if (DEFAULT) {
    	    methods = {
    	      values: DEF_VALUES ? $default : getMethod(VALUES),
    	      keys: IS_SET ? $default : getMethod(KEYS),
    	      entries: $entries
    	    };
    	    if (FORCED) for (key in methods) {
    	      if (!(key in proto)) _redefine(proto, key, methods[key]);
    	    } else _export(_export.P + _export.F * (BUGGY || VALUES_BUG), NAME, methods);
    	  }
    	  return methods;
    	};

    	// 22.1.3.4 Array.prototype.entries()
    	// 22.1.3.13 Array.prototype.keys()
    	// 22.1.3.29 Array.prototype.values()
    	// 22.1.3.30 Array.prototype[@@iterator]()
    	var es6_array_iterator = _iterDefine(Array, 'Array', function (iterated, kind) {
    	  this._t = _toIobject(iterated); // target
    	  this._i = 0;                   // next index
    	  this._k = kind;                // kind
    	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
    	}, function () {
    	  var O = this._t;
    	  var kind = this._k;
    	  var index = this._i++;
    	  if (!O || index >= O.length) {
    	    this._t = undefined;
    	    return _iterStep(1);
    	  }
    	  if (kind == 'keys') return _iterStep(0, index);
    	  if (kind == 'values') return _iterStep(0, O[index]);
    	  return _iterStep(0, [index, O[index]]);
    	}, 'values');

    	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
    	_iterators.Arguments = _iterators.Array;

    	_addToUnscopables('keys');
    	_addToUnscopables('values');
    	_addToUnscopables('entries');

    	var ITERATOR$1 = _wks('iterator');
    	var TO_STRING_TAG = _wks('toStringTag');
    	var ArrayValues = _iterators.Array;

    	var DOMIterables = {
    	  CSSRuleList: true, // TODO: Not spec compliant, should be false.
    	  CSSStyleDeclaration: false,
    	  CSSValueList: false,
    	  ClientRectList: false,
    	  DOMRectList: false,
    	  DOMStringList: false,
    	  DOMTokenList: true,
    	  DataTransferItemList: false,
    	  FileList: false,
    	  HTMLAllCollection: false,
    	  HTMLCollection: false,
    	  HTMLFormElement: false,
    	  HTMLSelectElement: false,
    	  MediaList: true, // TODO: Not spec compliant, should be false.
    	  MimeTypeArray: false,
    	  NamedNodeMap: false,
    	  NodeList: true,
    	  PaintRequestList: false,
    	  Plugin: false,
    	  PluginArray: false,
    	  SVGLengthList: false,
    	  SVGNumberList: false,
    	  SVGPathSegList: false,
    	  SVGPointList: false,
    	  SVGStringList: false,
    	  SVGTransformList: false,
    	  SourceBufferList: false,
    	  StyleSheetList: true, // TODO: Not spec compliant, should be false.
    	  TextTrackCueList: false,
    	  TextTrackList: false,
    	  TouchList: false
    	};

    	for (var collections = _objectKeys(DOMIterables), i = 0; i < collections.length; i++) {
    	  var NAME = collections[i];
    	  var explicit = DOMIterables[NAME];
    	  var Collection = _global[NAME];
    	  var proto = Collection && Collection.prototype;
    	  var key;
    	  if (proto) {
    	    if (!proto[ITERATOR$1]) _hide(proto, ITERATOR$1, ArrayValues);
    	    if (!proto[TO_STRING_TAG]) _hide(proto, TO_STRING_TAG, NAME);
    	    _iterators[NAME] = ArrayValues;
    	    if (explicit) for (key in es6_array_iterator) if (!proto[key]) _redefine(proto, key, es6_array_iterator[key], true);
    	  }
    	}

    	// most Object methods by ES6 should accept primitives



    	var _objectSap = function (KEY, exec) {
    	  var fn = (_core.Object || {})[KEY] || Object[KEY];
    	  var exp = {};
    	  exp[KEY] = exec(fn);
    	  _export(_export.S + _export.F * _fails(function () { fn(1); }), 'Object', exp);
    	};

    	// 19.1.2.14 Object.keys(O)



    	_objectSap('keys', function () {
    	  return function keys(it) {
    	    return _objectKeys(_toObject(it));
    	  };
    	});

    	var data = {
    	  AC: {
    	    code: "AC",
    	    unicode: "U+1F1E6 U+1F1E8",
    	    name: "Ascension Island",
    	    emoji: "🇦🇨"
    	  },
    	  AD: {
    	    code: "AD",
    	    unicode: "U+1F1E6 U+1F1E9",
    	    name: "Andorra",
    	    emoji: "🇦🇩"
    	  },
    	  AE: {
    	    code: "AE",
    	    unicode: "U+1F1E6 U+1F1EA",
    	    name: "United Arab Emirates",
    	    emoji: "🇦🇪"
    	  },
    	  AF: {
    	    code: "AF",
    	    unicode: "U+1F1E6 U+1F1EB",
    	    name: "Afghanistan",
    	    emoji: "🇦🇫"
    	  },
    	  AG: {
    	    code: "AG",
    	    unicode: "U+1F1E6 U+1F1EC",
    	    name: "Antigua & Barbuda",
    	    emoji: "🇦🇬"
    	  },
    	  AI: {
    	    code: "AI",
    	    unicode: "U+1F1E6 U+1F1EE",
    	    name: "Anguilla",
    	    emoji: "🇦🇮"
    	  },
    	  AL: {
    	    code: "AL",
    	    unicode: "U+1F1E6 U+1F1F1",
    	    name: "Albania",
    	    emoji: "🇦🇱"
    	  },
    	  AM: {
    	    code: "AM",
    	    unicode: "U+1F1E6 U+1F1F2",
    	    name: "Armenia",
    	    emoji: "🇦🇲"
    	  },
    	  AO: {
    	    code: "AO",
    	    unicode: "U+1F1E6 U+1F1F4",
    	    name: "Angola",
    	    emoji: "🇦🇴"
    	  },
    	  AQ: {
    	    code: "AQ",
    	    unicode: "U+1F1E6 U+1F1F6",
    	    name: "Antarctica",
    	    emoji: "🇦🇶"
    	  },
    	  AR: {
    	    code: "AR",
    	    unicode: "U+1F1E6 U+1F1F7",
    	    name: "Argentina",
    	    emoji: "🇦🇷"
    	  },
    	  AS: {
    	    code: "AS",
    	    unicode: "U+1F1E6 U+1F1F8",
    	    name: "American Samoa",
    	    emoji: "🇦🇸"
    	  },
    	  AT: {
    	    code: "AT",
    	    unicode: "U+1F1E6 U+1F1F9",
    	    name: "Austria",
    	    emoji: "🇦🇹"
    	  },
    	  AU: {
    	    code: "AU",
    	    unicode: "U+1F1E6 U+1F1FA",
    	    name: "Australia",
    	    emoji: "🇦🇺"
    	  },
    	  AW: {
    	    code: "AW",
    	    unicode: "U+1F1E6 U+1F1FC",
    	    name: "Aruba",
    	    emoji: "🇦🇼"
    	  },
    	  AX: {
    	    code: "AX",
    	    unicode: "U+1F1E6 U+1F1FD",
    	    name: "Åland Islands",
    	    emoji: "🇦🇽"
    	  },
    	  AZ: {
    	    code: "AZ",
    	    unicode: "U+1F1E6 U+1F1FF",
    	    name: "Azerbaijan",
    	    emoji: "🇦🇿"
    	  },
    	  BA: {
    	    code: "BA",
    	    unicode: "U+1F1E7 U+1F1E6",
    	    name: "Bosnia & Herzegovina",
    	    emoji: "🇧🇦"
    	  },
    	  BB: {
    	    code: "BB",
    	    unicode: "U+1F1E7 U+1F1E7",
    	    name: "Barbados",
    	    emoji: "🇧🇧"
    	  },
    	  BD: {
    	    code: "BD",
    	    unicode: "U+1F1E7 U+1F1E9",
    	    name: "Bangladesh",
    	    emoji: "🇧🇩"
    	  },
    	  BE: {
    	    code: "BE",
    	    unicode: "U+1F1E7 U+1F1EA",
    	    name: "Belgium",
    	    emoji: "🇧🇪"
    	  },
    	  BF: {
    	    code: "BF",
    	    unicode: "U+1F1E7 U+1F1EB",
    	    name: "Burkina Faso",
    	    emoji: "🇧🇫"
    	  },
    	  BG: {
    	    code: "BG",
    	    unicode: "U+1F1E7 U+1F1EC",
    	    name: "Bulgaria",
    	    emoji: "🇧🇬"
    	  },
    	  BH: {
    	    code: "BH",
    	    unicode: "U+1F1E7 U+1F1ED",
    	    name: "Bahrain",
    	    emoji: "🇧🇭"
    	  },
    	  BI: {
    	    code: "BI",
    	    unicode: "U+1F1E7 U+1F1EE",
    	    name: "Burundi",
    	    emoji: "🇧🇮"
    	  },
    	  BJ: {
    	    code: "BJ",
    	    unicode: "U+1F1E7 U+1F1EF",
    	    name: "Benin",
    	    emoji: "🇧🇯"
    	  },
    	  BL: {
    	    code: "BL",
    	    unicode: "U+1F1E7 U+1F1F1",
    	    name: "St. Barthélemy",
    	    emoji: "🇧🇱"
    	  },
    	  BM: {
    	    code: "BM",
    	    unicode: "U+1F1E7 U+1F1F2",
    	    name: "Bermuda",
    	    emoji: "🇧🇲"
    	  },
    	  BN: {
    	    code: "BN",
    	    unicode: "U+1F1E7 U+1F1F3",
    	    name: "Brunei",
    	    emoji: "🇧🇳"
    	  },
    	  BO: {
    	    code: "BO",
    	    unicode: "U+1F1E7 U+1F1F4",
    	    name: "Bolivia",
    	    emoji: "🇧🇴"
    	  },
    	  BQ: {
    	    code: "BQ",
    	    unicode: "U+1F1E7 U+1F1F6",
    	    name: "Caribbean Netherlands",
    	    emoji: "🇧🇶"
    	  },
    	  BR: {
    	    code: "BR",
    	    unicode: "U+1F1E7 U+1F1F7",
    	    name: "Brazil",
    	    emoji: "🇧🇷"
    	  },
    	  BS: {
    	    code: "BS",
    	    unicode: "U+1F1E7 U+1F1F8",
    	    name: "Bahamas",
    	    emoji: "🇧🇸"
    	  },
    	  BT: {
    	    code: "BT",
    	    unicode: "U+1F1E7 U+1F1F9",
    	    name: "Bhutan",
    	    emoji: "🇧🇹"
    	  },
    	  BV: {
    	    code: "BV",
    	    unicode: "U+1F1E7 U+1F1FB",
    	    name: "Bouvet Island",
    	    emoji: "🇧🇻"
    	  },
    	  BW: {
    	    code: "BW",
    	    unicode: "U+1F1E7 U+1F1FC",
    	    name: "Botswana",
    	    emoji: "🇧🇼"
    	  },
    	  BY: {
    	    code: "BY",
    	    unicode: "U+1F1E7 U+1F1FE",
    	    name: "Belarus",
    	    emoji: "🇧🇾"
    	  },
    	  BZ: {
    	    code: "BZ",
    	    unicode: "U+1F1E7 U+1F1FF",
    	    name: "Belize",
    	    emoji: "🇧🇿"
    	  },
    	  CA: {
    	    code: "CA",
    	    unicode: "U+1F1E8 U+1F1E6",
    	    name: "Canada",
    	    emoji: "🇨🇦"
    	  },
    	  CC: {
    	    code: "CC",
    	    unicode: "U+1F1E8 U+1F1E8",
    	    name: "Cocos (Keeling) Islands",
    	    emoji: "🇨🇨"
    	  },
    	  CD: {
    	    code: "CD",
    	    unicode: "U+1F1E8 U+1F1E9",
    	    name: "Congo - Kinshasa",
    	    emoji: "🇨🇩"
    	  },
    	  CF: {
    	    code: "CF",
    	    unicode: "U+1F1E8 U+1F1EB",
    	    name: "Central African Republic",
    	    emoji: "🇨🇫"
    	  },
    	  CG: {
    	    code: "CG",
    	    unicode: "U+1F1E8 U+1F1EC",
    	    name: "Congo - Brazzaville",
    	    emoji: "🇨🇬"
    	  },
    	  CH: {
    	    code: "CH",
    	    unicode: "U+1F1E8 U+1F1ED",
    	    name: "Switzerland",
    	    emoji: "🇨🇭"
    	  },
    	  CI: {
    	    code: "CI",
    	    unicode: "U+1F1E8 U+1F1EE",
    	    name: "Côte d’Ivoire",
    	    emoji: "🇨🇮"
    	  },
    	  CK: {
    	    code: "CK",
    	    unicode: "U+1F1E8 U+1F1F0",
    	    name: "Cook Islands",
    	    emoji: "🇨🇰"
    	  },
    	  CL: {
    	    code: "CL",
    	    unicode: "U+1F1E8 U+1F1F1",
    	    name: "Chile",
    	    emoji: "🇨🇱"
    	  },
    	  CM: {
    	    code: "CM",
    	    unicode: "U+1F1E8 U+1F1F2",
    	    name: "Cameroon",
    	    emoji: "🇨🇲"
    	  },
    	  CN: {
    	    code: "CN",
    	    unicode: "U+1F1E8 U+1F1F3",
    	    name: "China",
    	    emoji: "🇨🇳"
    	  },
    	  CO: {
    	    code: "CO",
    	    unicode: "U+1F1E8 U+1F1F4",
    	    name: "Colombia",
    	    emoji: "🇨🇴"
    	  },
    	  CP: {
    	    code: "CP",
    	    unicode: "U+1F1E8 U+1F1F5",
    	    name: "Clipperton Island",
    	    emoji: "🇨🇵"
    	  },
    	  CR: {
    	    code: "CR",
    	    unicode: "U+1F1E8 U+1F1F7",
    	    name: "Costa Rica",
    	    emoji: "🇨🇷"
    	  },
    	  CU: {
    	    code: "CU",
    	    unicode: "U+1F1E8 U+1F1FA",
    	    name: "Cuba",
    	    emoji: "🇨🇺"
    	  },
    	  CV: {
    	    code: "CV",
    	    unicode: "U+1F1E8 U+1F1FB",
    	    name: "Cape Verde",
    	    emoji: "🇨🇻"
    	  },
    	  CW: {
    	    code: "CW",
    	    unicode: "U+1F1E8 U+1F1FC",
    	    name: "Curaçao",
    	    emoji: "🇨🇼"
    	  },
    	  CX: {
    	    code: "CX",
    	    unicode: "U+1F1E8 U+1F1FD",
    	    name: "Christmas Island",
    	    emoji: "🇨🇽"
    	  },
    	  CY: {
    	    code: "CY",
    	    unicode: "U+1F1E8 U+1F1FE",
    	    name: "Cyprus",
    	    emoji: "🇨🇾"
    	  },
    	  CZ: {
    	    code: "CZ",
    	    unicode: "U+1F1E8 U+1F1FF",
    	    name: "Czechia",
    	    emoji: "🇨🇿"
    	  },
    	  DE: {
    	    code: "DE",
    	    unicode: "U+1F1E9 U+1F1EA",
    	    name: "Germany",
    	    emoji: "🇩🇪"
    	  },
    	  DG: {
    	    code: "DG",
    	    unicode: "U+1F1E9 U+1F1EC",
    	    name: "Diego Garcia",
    	    emoji: "🇩🇬"
    	  },
    	  DJ: {
    	    code: "DJ",
    	    unicode: "U+1F1E9 U+1F1EF",
    	    name: "Djibouti",
    	    emoji: "🇩🇯"
    	  },
    	  DK: {
    	    code: "DK",
    	    unicode: "U+1F1E9 U+1F1F0",
    	    name: "Denmark",
    	    emoji: "🇩🇰"
    	  },
    	  DM: {
    	    code: "DM",
    	    unicode: "U+1F1E9 U+1F1F2",
    	    name: "Dominica",
    	    emoji: "🇩🇲"
    	  },
    	  DO: {
    	    code: "DO",
    	    unicode: "U+1F1E9 U+1F1F4",
    	    name: "Dominican Republic",
    	    emoji: "🇩🇴"
    	  },
    	  DZ: {
    	    code: "DZ",
    	    unicode: "U+1F1E9 U+1F1FF",
    	    name: "Algeria",
    	    emoji: "🇩🇿"
    	  },
    	  EA: {
    	    code: "EA",
    	    unicode: "U+1F1EA U+1F1E6",
    	    name: "Ceuta & Melilla",
    	    emoji: "🇪🇦"
    	  },
    	  EC: {
    	    code: "EC",
    	    unicode: "U+1F1EA U+1F1E8",
    	    name: "Ecuador",
    	    emoji: "🇪🇨"
    	  },
    	  EE: {
    	    code: "EE",
    	    unicode: "U+1F1EA U+1F1EA",
    	    name: "Estonia",
    	    emoji: "🇪🇪"
    	  },
    	  EG: {
    	    code: "EG",
    	    unicode: "U+1F1EA U+1F1EC",
    	    name: "Egypt",
    	    emoji: "🇪🇬"
    	  },
    	  EH: {
    	    code: "EH",
    	    unicode: "U+1F1EA U+1F1ED",
    	    name: "Western Sahara",
    	    emoji: "🇪🇭"
    	  },
    	  ER: {
    	    code: "ER",
    	    unicode: "U+1F1EA U+1F1F7",
    	    name: "Eritrea",
    	    emoji: "🇪🇷"
    	  },
    	  ES: {
    	    code: "ES",
    	    unicode: "U+1F1EA U+1F1F8",
    	    name: "Spain",
    	    emoji: "🇪🇸"
    	  },
    	  ET: {
    	    code: "ET",
    	    unicode: "U+1F1EA U+1F1F9",
    	    name: "Ethiopia",
    	    emoji: "🇪🇹"
    	  },
    	  EU: {
    	    code: "EU",
    	    unicode: "U+1F1EA U+1F1FA",
    	    name: "European Union",
    	    emoji: "🇪🇺"
    	  },
    	  FI: {
    	    code: "FI",
    	    unicode: "U+1F1EB U+1F1EE",
    	    name: "Finland",
    	    emoji: "🇫🇮"
    	  },
    	  FJ: {
    	    code: "FJ",
    	    unicode: "U+1F1EB U+1F1EF",
    	    name: "Fiji",
    	    emoji: "🇫🇯"
    	  },
    	  FK: {
    	    code: "FK",
    	    unicode: "U+1F1EB U+1F1F0",
    	    name: "Falkland Islands",
    	    emoji: "🇫🇰"
    	  },
    	  FM: {
    	    code: "FM",
    	    unicode: "U+1F1EB U+1F1F2",
    	    name: "Micronesia",
    	    emoji: "🇫🇲"
    	  },
    	  FO: {
    	    code: "FO",
    	    unicode: "U+1F1EB U+1F1F4",
    	    name: "Faroe Islands",
    	    emoji: "🇫🇴"
    	  },
    	  FR: {
    	    code: "FR",
    	    unicode: "U+1F1EB U+1F1F7",
    	    name: "France",
    	    emoji: "🇫🇷"
    	  },
    	  GA: {
    	    code: "GA",
    	    unicode: "U+1F1EC U+1F1E6",
    	    name: "Gabon",
    	    emoji: "🇬🇦"
    	  },
    	  GB: {
    	    code: "GB",
    	    unicode: "U+1F1EC U+1F1E7",
    	    name: "United Kingdom",
    	    emoji: "🇬🇧"
    	  },
    	  GD: {
    	    code: "GD",
    	    unicode: "U+1F1EC U+1F1E9",
    	    name: "Grenada",
    	    emoji: "🇬🇩"
    	  },
    	  GE: {
    	    code: "GE",
    	    unicode: "U+1F1EC U+1F1EA",
    	    name: "Georgia",
    	    emoji: "🇬🇪"
    	  },
    	  GF: {
    	    code: "GF",
    	    unicode: "U+1F1EC U+1F1EB",
    	    name: "French Guiana",
    	    emoji: "🇬🇫"
    	  },
    	  GG: {
    	    code: "GG",
    	    unicode: "U+1F1EC U+1F1EC",
    	    name: "Guernsey",
    	    emoji: "🇬🇬"
    	  },
    	  GH: {
    	    code: "GH",
    	    unicode: "U+1F1EC U+1F1ED",
    	    name: "Ghana",
    	    emoji: "🇬🇭"
    	  },
    	  GI: {
    	    code: "GI",
    	    unicode: "U+1F1EC U+1F1EE",
    	    name: "Gibraltar",
    	    emoji: "🇬🇮"
    	  },
    	  GL: {
    	    code: "GL",
    	    unicode: "U+1F1EC U+1F1F1",
    	    name: "Greenland",
    	    emoji: "🇬🇱"
    	  },
    	  GM: {
    	    code: "GM",
    	    unicode: "U+1F1EC U+1F1F2",
    	    name: "Gambia",
    	    emoji: "🇬🇲"
    	  },
    	  GN: {
    	    code: "GN",
    	    unicode: "U+1F1EC U+1F1F3",
    	    name: "Guinea",
    	    emoji: "🇬🇳"
    	  },
    	  GP: {
    	    code: "GP",
    	    unicode: "U+1F1EC U+1F1F5",
    	    name: "Guadeloupe",
    	    emoji: "🇬🇵"
    	  },
    	  GQ: {
    	    code: "GQ",
    	    unicode: "U+1F1EC U+1F1F6",
    	    name: "Equatorial Guinea",
    	    emoji: "🇬🇶"
    	  },
    	  GR: {
    	    code: "GR",
    	    unicode: "U+1F1EC U+1F1F7",
    	    name: "Greece",
    	    emoji: "🇬🇷"
    	  },
    	  GS: {
    	    code: "GS",
    	    unicode: "U+1F1EC U+1F1F8",
    	    name: "South Georgia & South Sandwich Islands",
    	    emoji: "🇬🇸"
    	  },
    	  GT: {
    	    code: "GT",
    	    unicode: "U+1F1EC U+1F1F9",
    	    name: "Guatemala",
    	    emoji: "🇬🇹"
    	  },
    	  GU: {
    	    code: "GU",
    	    unicode: "U+1F1EC U+1F1FA",
    	    name: "Guam",
    	    emoji: "🇬🇺"
    	  },
    	  GW: {
    	    code: "GW",
    	    unicode: "U+1F1EC U+1F1FC",
    	    name: "Guinea-Bissau",
    	    emoji: "🇬🇼"
    	  },
    	  GY: {
    	    code: "GY",
    	    unicode: "U+1F1EC U+1F1FE",
    	    name: "Guyana",
    	    emoji: "🇬🇾"
    	  },
    	  HK: {
    	    code: "HK",
    	    unicode: "U+1F1ED U+1F1F0",
    	    name: "Hong Kong SAR China",
    	    emoji: "🇭🇰"
    	  },
    	  HM: {
    	    code: "HM",
    	    unicode: "U+1F1ED U+1F1F2",
    	    name: "Heard & McDonald Islands",
    	    emoji: "🇭🇲"
    	  },
    	  HN: {
    	    code: "HN",
    	    unicode: "U+1F1ED U+1F1F3",
    	    name: "Honduras",
    	    emoji: "🇭🇳"
    	  },
    	  HR: {
    	    code: "HR",
    	    unicode: "U+1F1ED U+1F1F7",
    	    name: "Croatia",
    	    emoji: "🇭🇷"
    	  },
    	  HT: {
    	    code: "HT",
    	    unicode: "U+1F1ED U+1F1F9",
    	    name: "Haiti",
    	    emoji: "🇭🇹"
    	  },
    	  HU: {
    	    code: "HU",
    	    unicode: "U+1F1ED U+1F1FA",
    	    name: "Hungary",
    	    emoji: "🇭🇺"
    	  },
    	  IC: {
    	    code: "IC",
    	    unicode: "U+1F1EE U+1F1E8",
    	    name: "Canary Islands",
    	    emoji: "🇮🇨"
    	  },
    	  ID: {
    	    code: "ID",
    	    unicode: "U+1F1EE U+1F1E9",
    	    name: "Indonesia",
    	    emoji: "🇮🇩"
    	  },
    	  IE: {
    	    code: "IE",
    	    unicode: "U+1F1EE U+1F1EA",
    	    name: "Ireland",
    	    emoji: "🇮🇪"
    	  },
    	  IL: {
    	    code: "IL",
    	    unicode: "U+1F1EE U+1F1F1",
    	    name: "Israel",
    	    emoji: "🇮🇱"
    	  },
    	  IM: {
    	    code: "IM",
    	    unicode: "U+1F1EE U+1F1F2",
    	    name: "Isle of Man",
    	    emoji: "🇮🇲"
    	  },
    	  IN: {
    	    code: "IN",
    	    unicode: "U+1F1EE U+1F1F3",
    	    name: "India",
    	    emoji: "🇮🇳"
    	  },
    	  IO: {
    	    code: "IO",
    	    unicode: "U+1F1EE U+1F1F4",
    	    name: "British Indian Ocean Territory",
    	    emoji: "🇮🇴"
    	  },
    	  IQ: {
    	    code: "IQ",
    	    unicode: "U+1F1EE U+1F1F6",
    	    name: "Iraq",
    	    emoji: "🇮🇶"
    	  },
    	  IR: {
    	    code: "IR",
    	    unicode: "U+1F1EE U+1F1F7",
    	    name: "Iran",
    	    emoji: "🇮🇷"
    	  },
    	  IS: {
    	    code: "IS",
    	    unicode: "U+1F1EE U+1F1F8",
    	    name: "Iceland",
    	    emoji: "🇮🇸"
    	  },
    	  IT: {
    	    code: "IT",
    	    unicode: "U+1F1EE U+1F1F9",
    	    name: "Italy",
    	    emoji: "🇮🇹"
    	  },
    	  JE: {
    	    code: "JE",
    	    unicode: "U+1F1EF U+1F1EA",
    	    name: "Jersey",
    	    emoji: "🇯🇪"
    	  },
    	  JM: {
    	    code: "JM",
    	    unicode: "U+1F1EF U+1F1F2",
    	    name: "Jamaica",
    	    emoji: "🇯🇲"
    	  },
    	  JO: {
    	    code: "JO",
    	    unicode: "U+1F1EF U+1F1F4",
    	    name: "Jordan",
    	    emoji: "🇯🇴"
    	  },
    	  JP: {
    	    code: "JP",
    	    unicode: "U+1F1EF U+1F1F5",
    	    name: "Japan",
    	    emoji: "🇯🇵"
    	  },
    	  KE: {
    	    code: "KE",
    	    unicode: "U+1F1F0 U+1F1EA",
    	    name: "Kenya",
    	    emoji: "🇰🇪"
    	  },
    	  KG: {
    	    code: "KG",
    	    unicode: "U+1F1F0 U+1F1EC",
    	    name: "Kyrgyzstan",
    	    emoji: "🇰🇬"
    	  },
    	  KH: {
    	    code: "KH",
    	    unicode: "U+1F1F0 U+1F1ED",
    	    name: "Cambodia",
    	    emoji: "🇰🇭"
    	  },
    	  KI: {
    	    code: "KI",
    	    unicode: "U+1F1F0 U+1F1EE",
    	    name: "Kiribati",
    	    emoji: "🇰🇮"
    	  },
    	  KM: {
    	    code: "KM",
    	    unicode: "U+1F1F0 U+1F1F2",
    	    name: "Comoros",
    	    emoji: "🇰🇲"
    	  },
    	  KN: {
    	    code: "KN",
    	    unicode: "U+1F1F0 U+1F1F3",
    	    name: "St. Kitts & Nevis",
    	    emoji: "🇰🇳"
    	  },
    	  KP: {
    	    code: "KP",
    	    unicode: "U+1F1F0 U+1F1F5",
    	    name: "North Korea",
    	    emoji: "🇰🇵"
    	  },
    	  KR: {
    	    code: "KR",
    	    unicode: "U+1F1F0 U+1F1F7",
    	    name: "South Korea",
    	    emoji: "🇰🇷"
    	  },
    	  KW: {
    	    code: "KW",
    	    unicode: "U+1F1F0 U+1F1FC",
    	    name: "Kuwait",
    	    emoji: "🇰🇼"
    	  },
    	  KY: {
    	    code: "KY",
    	    unicode: "U+1F1F0 U+1F1FE",
    	    name: "Cayman Islands",
    	    emoji: "🇰🇾"
    	  },
    	  KZ: {
    	    code: "KZ",
    	    unicode: "U+1F1F0 U+1F1FF",
    	    name: "Kazakhstan",
    	    emoji: "🇰🇿"
    	  },
    	  LA: {
    	    code: "LA",
    	    unicode: "U+1F1F1 U+1F1E6",
    	    name: "Laos",
    	    emoji: "🇱🇦"
    	  },
    	  LB: {
    	    code: "LB",
    	    unicode: "U+1F1F1 U+1F1E7",
    	    name: "Lebanon",
    	    emoji: "🇱🇧"
    	  },
    	  LC: {
    	    code: "LC",
    	    unicode: "U+1F1F1 U+1F1E8",
    	    name: "St. Lucia",
    	    emoji: "🇱🇨"
    	  },
    	  LI: {
    	    code: "LI",
    	    unicode: "U+1F1F1 U+1F1EE",
    	    name: "Liechtenstein",
    	    emoji: "🇱🇮"
    	  },
    	  LK: {
    	    code: "LK",
    	    unicode: "U+1F1F1 U+1F1F0",
    	    name: "Sri Lanka",
    	    emoji: "🇱🇰"
    	  },
    	  LR: {
    	    code: "LR",
    	    unicode: "U+1F1F1 U+1F1F7",
    	    name: "Liberia",
    	    emoji: "🇱🇷"
    	  },
    	  LS: {
    	    code: "LS",
    	    unicode: "U+1F1F1 U+1F1F8",
    	    name: "Lesotho",
    	    emoji: "🇱🇸"
    	  },
    	  LT: {
    	    code: "LT",
    	    unicode: "U+1F1F1 U+1F1F9",
    	    name: "Lithuania",
    	    emoji: "🇱🇹"
    	  },
    	  LU: {
    	    code: "LU",
    	    unicode: "U+1F1F1 U+1F1FA",
    	    name: "Luxembourg",
    	    emoji: "🇱🇺"
    	  },
    	  LV: {
    	    code: "LV",
    	    unicode: "U+1F1F1 U+1F1FB",
    	    name: "Latvia",
    	    emoji: "🇱🇻"
    	  },
    	  LY: {
    	    code: "LY",
    	    unicode: "U+1F1F1 U+1F1FE",
    	    name: "Libya",
    	    emoji: "🇱🇾"
    	  },
    	  MA: {
    	    code: "MA",
    	    unicode: "U+1F1F2 U+1F1E6",
    	    name: "Morocco",
    	    emoji: "🇲🇦"
    	  },
    	  MC: {
    	    code: "MC",
    	    unicode: "U+1F1F2 U+1F1E8",
    	    name: "Monaco",
    	    emoji: "🇲🇨"
    	  },
    	  MD: {
    	    code: "MD",
    	    unicode: "U+1F1F2 U+1F1E9",
    	    name: "Moldova",
    	    emoji: "🇲🇩"
    	  },
    	  ME: {
    	    code: "ME",
    	    unicode: "U+1F1F2 U+1F1EA",
    	    name: "Montenegro",
    	    emoji: "🇲🇪"
    	  },
    	  MF: {
    	    code: "MF",
    	    unicode: "U+1F1F2 U+1F1EB",
    	    name: "St. Martin",
    	    emoji: "🇲🇫"
    	  },
    	  MG: {
    	    code: "MG",
    	    unicode: "U+1F1F2 U+1F1EC",
    	    name: "Madagascar",
    	    emoji: "🇲🇬"
    	  },
    	  MH: {
    	    code: "MH",
    	    unicode: "U+1F1F2 U+1F1ED",
    	    name: "Marshall Islands",
    	    emoji: "🇲🇭"
    	  },
    	  MK: {
    	    code: "MK",
    	    unicode: "U+1F1F2 U+1F1F0",
    	    name: "Macedonia",
    	    emoji: "🇲🇰"
    	  },
    	  ML: {
    	    code: "ML",
    	    unicode: "U+1F1F2 U+1F1F1",
    	    name: "Mali",
    	    emoji: "🇲🇱"
    	  },
    	  MM: {
    	    code: "MM",
    	    unicode: "U+1F1F2 U+1F1F2",
    	    name: "Myanmar (Burma)",
    	    emoji: "🇲🇲"
    	  },
    	  MN: {
    	    code: "MN",
    	    unicode: "U+1F1F2 U+1F1F3",
    	    name: "Mongolia",
    	    emoji: "🇲🇳"
    	  },
    	  MO: {
    	    code: "MO",
    	    unicode: "U+1F1F2 U+1F1F4",
    	    name: "Macau SAR China",
    	    emoji: "🇲🇴"
    	  },
    	  MP: {
    	    code: "MP",
    	    unicode: "U+1F1F2 U+1F1F5",
    	    name: "Northern Mariana Islands",
    	    emoji: "🇲🇵"
    	  },
    	  MQ: {
    	    code: "MQ",
    	    unicode: "U+1F1F2 U+1F1F6",
    	    name: "Martinique",
    	    emoji: "🇲🇶"
    	  },
    	  MR: {
    	    code: "MR",
    	    unicode: "U+1F1F2 U+1F1F7",
    	    name: "Mauritania",
    	    emoji: "🇲🇷"
    	  },
    	  MS: {
    	    code: "MS",
    	    unicode: "U+1F1F2 U+1F1F8",
    	    name: "Montserrat",
    	    emoji: "🇲🇸"
    	  },
    	  MT: {
    	    code: "MT",
    	    unicode: "U+1F1F2 U+1F1F9",
    	    name: "Malta",
    	    emoji: "🇲🇹"
    	  },
    	  MU: {
    	    code: "MU",
    	    unicode: "U+1F1F2 U+1F1FA",
    	    name: "Mauritius",
    	    emoji: "🇲🇺"
    	  },
    	  MV: {
    	    code: "MV",
    	    unicode: "U+1F1F2 U+1F1FB",
    	    name: "Maldives",
    	    emoji: "🇲🇻"
    	  },
    	  MW: {
    	    code: "MW",
    	    unicode: "U+1F1F2 U+1F1FC",
    	    name: "Malawi",
    	    emoji: "🇲🇼"
    	  },
    	  MX: {
    	    code: "MX",
    	    unicode: "U+1F1F2 U+1F1FD",
    	    name: "Mexico",
    	    emoji: "🇲🇽"
    	  },
    	  MY: {
    	    code: "MY",
    	    unicode: "U+1F1F2 U+1F1FE",
    	    name: "Malaysia",
    	    emoji: "🇲🇾"
    	  },
    	  MZ: {
    	    code: "MZ",
    	    unicode: "U+1F1F2 U+1F1FF",
    	    name: "Mozambique",
    	    emoji: "🇲🇿"
    	  },
    	  NA: {
    	    code: "NA",
    	    unicode: "U+1F1F3 U+1F1E6",
    	    name: "Namibia",
    	    emoji: "🇳🇦"
    	  },
    	  NC: {
    	    code: "NC",
    	    unicode: "U+1F1F3 U+1F1E8",
    	    name: "New Caledonia",
    	    emoji: "🇳🇨"
    	  },
    	  NE: {
    	    code: "NE",
    	    unicode: "U+1F1F3 U+1F1EA",
    	    name: "Niger",
    	    emoji: "🇳🇪"
    	  },
    	  NF: {
    	    code: "NF",
    	    unicode: "U+1F1F3 U+1F1EB",
    	    name: "Norfolk Island",
    	    emoji: "🇳🇫"
    	  },
    	  NG: {
    	    code: "NG",
    	    unicode: "U+1F1F3 U+1F1EC",
    	    name: "Nigeria",
    	    emoji: "🇳🇬"
    	  },
    	  NI: {
    	    code: "NI",
    	    unicode: "U+1F1F3 U+1F1EE",
    	    name: "Nicaragua",
    	    emoji: "🇳🇮"
    	  },
    	  NL: {
    	    code: "NL",
    	    unicode: "U+1F1F3 U+1F1F1",
    	    name: "Netherlands",
    	    emoji: "🇳🇱"
    	  },
    	  NO: {
    	    code: "NO",
    	    unicode: "U+1F1F3 U+1F1F4",
    	    name: "Norway",
    	    emoji: "🇳🇴"
    	  },
    	  NP: {
    	    code: "NP",
    	    unicode: "U+1F1F3 U+1F1F5",
    	    name: "Nepal",
    	    emoji: "🇳🇵"
    	  },
    	  NR: {
    	    code: "NR",
    	    unicode: "U+1F1F3 U+1F1F7",
    	    name: "Nauru",
    	    emoji: "🇳🇷"
    	  },
    	  NU: {
    	    code: "NU",
    	    unicode: "U+1F1F3 U+1F1FA",
    	    name: "Niue",
    	    emoji: "🇳🇺"
    	  },
    	  NZ: {
    	    code: "NZ",
    	    unicode: "U+1F1F3 U+1F1FF",
    	    name: "New Zealand",
    	    emoji: "🇳🇿"
    	  },
    	  OM: {
    	    code: "OM",
    	    unicode: "U+1F1F4 U+1F1F2",
    	    name: "Oman",
    	    emoji: "🇴🇲"
    	  },
    	  PA: {
    	    code: "PA",
    	    unicode: "U+1F1F5 U+1F1E6",
    	    name: "Panama",
    	    emoji: "🇵🇦"
    	  },
    	  PE: {
    	    code: "PE",
    	    unicode: "U+1F1F5 U+1F1EA",
    	    name: "Peru",
    	    emoji: "🇵🇪"
    	  },
    	  PF: {
    	    code: "PF",
    	    unicode: "U+1F1F5 U+1F1EB",
    	    name: "French Polynesia",
    	    emoji: "🇵🇫"
    	  },
    	  PG: {
    	    code: "PG",
    	    unicode: "U+1F1F5 U+1F1EC",
    	    name: "Papua New Guinea",
    	    emoji: "🇵🇬"
    	  },
    	  PH: {
    	    code: "PH",
    	    unicode: "U+1F1F5 U+1F1ED",
    	    name: "Philippines",
    	    emoji: "🇵🇭"
    	  },
    	  PK: {
    	    code: "PK",
    	    unicode: "U+1F1F5 U+1F1F0",
    	    name: "Pakistan",
    	    emoji: "🇵🇰"
    	  },
    	  PL: {
    	    code: "PL",
    	    unicode: "U+1F1F5 U+1F1F1",
    	    name: "Poland",
    	    emoji: "🇵🇱"
    	  },
    	  PM: {
    	    code: "PM",
    	    unicode: "U+1F1F5 U+1F1F2",
    	    name: "St. Pierre & Miquelon",
    	    emoji: "🇵🇲"
    	  },
    	  PN: {
    	    code: "PN",
    	    unicode: "U+1F1F5 U+1F1F3",
    	    name: "Pitcairn Islands",
    	    emoji: "🇵🇳"
    	  },
    	  PR: {
    	    code: "PR",
    	    unicode: "U+1F1F5 U+1F1F7",
    	    name: "Puerto Rico",
    	    emoji: "🇵🇷"
    	  },
    	  PS: {
    	    code: "PS",
    	    unicode: "U+1F1F5 U+1F1F8",
    	    name: "Palestinian Territories",
    	    emoji: "🇵🇸"
    	  },
    	  PT: {
    	    code: "PT",
    	    unicode: "U+1F1F5 U+1F1F9",
    	    name: "Portugal",
    	    emoji: "🇵🇹"
    	  },
    	  PW: {
    	    code: "PW",
    	    unicode: "U+1F1F5 U+1F1FC",
    	    name: "Palau",
    	    emoji: "🇵🇼"
    	  },
    	  PY: {
    	    code: "PY",
    	    unicode: "U+1F1F5 U+1F1FE",
    	    name: "Paraguay",
    	    emoji: "🇵🇾"
    	  },
    	  QA: {
    	    code: "QA",
    	    unicode: "U+1F1F6 U+1F1E6",
    	    name: "Qatar",
    	    emoji: "🇶🇦"
    	  },
    	  RE: {
    	    code: "RE",
    	    unicode: "U+1F1F7 U+1F1EA",
    	    name: "Réunion",
    	    emoji: "🇷🇪"
    	  },
    	  RO: {
    	    code: "RO",
    	    unicode: "U+1F1F7 U+1F1F4",
    	    name: "Romania",
    	    emoji: "🇷🇴"
    	  },
    	  RS: {
    	    code: "RS",
    	    unicode: "U+1F1F7 U+1F1F8",
    	    name: "Serbia",
    	    emoji: "🇷🇸"
    	  },
    	  RU: {
    	    code: "RU",
    	    unicode: "U+1F1F7 U+1F1FA",
    	    name: "Russia",
    	    emoji: "🇷🇺"
    	  },
    	  RW: {
    	    code: "RW",
    	    unicode: "U+1F1F7 U+1F1FC",
    	    name: "Rwanda",
    	    emoji: "🇷🇼"
    	  },
    	  SA: {
    	    code: "SA",
    	    unicode: "U+1F1F8 U+1F1E6",
    	    name: "Saudi Arabia",
    	    emoji: "🇸🇦"
    	  },
    	  SB: {
    	    code: "SB",
    	    unicode: "U+1F1F8 U+1F1E7",
    	    name: "Solomon Islands",
    	    emoji: "🇸🇧"
    	  },
    	  SC: {
    	    code: "SC",
    	    unicode: "U+1F1F8 U+1F1E8",
    	    name: "Seychelles",
    	    emoji: "🇸🇨"
    	  },
    	  SD: {
    	    code: "SD",
    	    unicode: "U+1F1F8 U+1F1E9",
    	    name: "Sudan",
    	    emoji: "🇸🇩"
    	  },
    	  SE: {
    	    code: "SE",
    	    unicode: "U+1F1F8 U+1F1EA",
    	    name: "Sweden",
    	    emoji: "🇸🇪"
    	  },
    	  SG: {
    	    code: "SG",
    	    unicode: "U+1F1F8 U+1F1EC",
    	    name: "Singapore",
    	    emoji: "🇸🇬"
    	  },
    	  SH: {
    	    code: "SH",
    	    unicode: "U+1F1F8 U+1F1ED",
    	    name: "St. Helena",
    	    emoji: "🇸🇭"
    	  },
    	  SI: {
    	    code: "SI",
    	    unicode: "U+1F1F8 U+1F1EE",
    	    name: "Slovenia",
    	    emoji: "🇸🇮"
    	  },
    	  SJ: {
    	    code: "SJ",
    	    unicode: "U+1F1F8 U+1F1EF",
    	    name: "Svalbard & Jan Mayen",
    	    emoji: "🇸🇯"
    	  },
    	  SK: {
    	    code: "SK",
    	    unicode: "U+1F1F8 U+1F1F0",
    	    name: "Slovakia",
    	    emoji: "🇸🇰"
    	  },
    	  SL: {
    	    code: "SL",
    	    unicode: "U+1F1F8 U+1F1F1",
    	    name: "Sierra Leone",
    	    emoji: "🇸🇱"
    	  },
    	  SM: {
    	    code: "SM",
    	    unicode: "U+1F1F8 U+1F1F2",
    	    name: "San Marino",
    	    emoji: "🇸🇲"
    	  },
    	  SN: {
    	    code: "SN",
    	    unicode: "U+1F1F8 U+1F1F3",
    	    name: "Senegal",
    	    emoji: "🇸🇳"
    	  },
    	  SO: {
    	    code: "SO",
    	    unicode: "U+1F1F8 U+1F1F4",
    	    name: "Somalia",
    	    emoji: "🇸🇴"
    	  },
    	  SR: {
    	    code: "SR",
    	    unicode: "U+1F1F8 U+1F1F7",
    	    name: "Suriname",
    	    emoji: "🇸🇷"
    	  },
    	  SS: {
    	    code: "SS",
    	    unicode: "U+1F1F8 U+1F1F8",
    	    name: "South Sudan",
    	    emoji: "🇸🇸"
    	  },
    	  ST: {
    	    code: "ST",
    	    unicode: "U+1F1F8 U+1F1F9",
    	    name: "São Tomé & Príncipe",
    	    emoji: "🇸🇹"
    	  },
    	  SV: {
    	    code: "SV",
    	    unicode: "U+1F1F8 U+1F1FB",
    	    name: "El Salvador",
    	    emoji: "🇸🇻"
    	  },
    	  SX: {
    	    code: "SX",
    	    unicode: "U+1F1F8 U+1F1FD",
    	    name: "Sint Maarten",
    	    emoji: "🇸🇽"
    	  },
    	  SY: {
    	    code: "SY",
    	    unicode: "U+1F1F8 U+1F1FE",
    	    name: "Syria",
    	    emoji: "🇸🇾"
    	  },
    	  SZ: {
    	    code: "SZ",
    	    unicode: "U+1F1F8 U+1F1FF",
    	    name: "Swaziland",
    	    emoji: "🇸🇿"
    	  },
    	  TA: {
    	    code: "TA",
    	    unicode: "U+1F1F9 U+1F1E6",
    	    name: "Tristan da Cunha",
    	    emoji: "🇹🇦"
    	  },
    	  TC: {
    	    code: "TC",
    	    unicode: "U+1F1F9 U+1F1E8",
    	    name: "Turks & Caicos Islands",
    	    emoji: "🇹🇨"
    	  },
    	  TD: {
    	    code: "TD",
    	    unicode: "U+1F1F9 U+1F1E9",
    	    name: "Chad",
    	    emoji: "🇹🇩"
    	  },
    	  TF: {
    	    code: "TF",
    	    unicode: "U+1F1F9 U+1F1EB",
    	    name: "French Southern Territories",
    	    emoji: "🇹🇫"
    	  },
    	  TG: {
    	    code: "TG",
    	    unicode: "U+1F1F9 U+1F1EC",
    	    name: "Togo",
    	    emoji: "🇹🇬"
    	  },
    	  TH: {
    	    code: "TH",
    	    unicode: "U+1F1F9 U+1F1ED",
    	    name: "Thailand",
    	    emoji: "🇹🇭"
    	  },
    	  TJ: {
    	    code: "TJ",
    	    unicode: "U+1F1F9 U+1F1EF",
    	    name: "Tajikistan",
    	    emoji: "🇹🇯"
    	  },
    	  TK: {
    	    code: "TK",
    	    unicode: "U+1F1F9 U+1F1F0",
    	    name: "Tokelau",
    	    emoji: "🇹🇰"
    	  },
    	  TL: {
    	    code: "TL",
    	    unicode: "U+1F1F9 U+1F1F1",
    	    name: "Timor-Leste",
    	    emoji: "🇹🇱"
    	  },
    	  TM: {
    	    code: "TM",
    	    unicode: "U+1F1F9 U+1F1F2",
    	    name: "Turkmenistan",
    	    emoji: "🇹🇲"
    	  },
    	  TN: {
    	    code: "TN",
    	    unicode: "U+1F1F9 U+1F1F3",
    	    name: "Tunisia",
    	    emoji: "🇹🇳"
    	  },
    	  TO: {
    	    code: "TO",
    	    unicode: "U+1F1F9 U+1F1F4",
    	    name: "Tonga",
    	    emoji: "🇹🇴"
    	  },
    	  TR: {
    	    code: "TR",
    	    unicode: "U+1F1F9 U+1F1F7",
    	    name: "Turkey",
    	    emoji: "🇹🇷"
    	  },
    	  TT: {
    	    code: "TT",
    	    unicode: "U+1F1F9 U+1F1F9",
    	    name: "Trinidad & Tobago",
    	    emoji: "🇹🇹"
    	  },
    	  TV: {
    	    code: "TV",
    	    unicode: "U+1F1F9 U+1F1FB",
    	    name: "Tuvalu",
    	    emoji: "🇹🇻"
    	  },
    	  TW: {
    	    code: "TW",
    	    unicode: "U+1F1F9 U+1F1FC",
    	    name: "Taiwan",
    	    emoji: "🇹🇼"
    	  },
    	  TZ: {
    	    code: "TZ",
    	    unicode: "U+1F1F9 U+1F1FF",
    	    name: "Tanzania",
    	    emoji: "🇹🇿"
    	  },
    	  UA: {
    	    code: "UA",
    	    unicode: "U+1F1FA U+1F1E6",
    	    name: "Ukraine",
    	    emoji: "🇺🇦"
    	  },
    	  UG: {
    	    code: "UG",
    	    unicode: "U+1F1FA U+1F1EC",
    	    name: "Uganda",
    	    emoji: "🇺🇬"
    	  },
    	  UM: {
    	    code: "UM",
    	    unicode: "U+1F1FA U+1F1F2",
    	    name: "U.S. Outlying Islands",
    	    emoji: "🇺🇲"
    	  },
    	  UN: {
    	    code: "UN",
    	    unicode: "U+1F1FA U+1F1F3",
    	    name: "United Nations",
    	    emoji: "🇺🇳"
    	  },
    	  US: {
    	    code: "US",
    	    unicode: "U+1F1FA U+1F1F8",
    	    name: "United States",
    	    emoji: "🇺🇸"
    	  },
    	  UY: {
    	    code: "UY",
    	    unicode: "U+1F1FA U+1F1FE",
    	    name: "Uruguay",
    	    emoji: "🇺🇾"
    	  },
    	  UZ: {
    	    code: "UZ",
    	    unicode: "U+1F1FA U+1F1FF",
    	    name: "Uzbekistan",
    	    emoji: "🇺🇿"
    	  },
    	  VA: {
    	    code: "VA",
    	    unicode: "U+1F1FB U+1F1E6",
    	    name: "Vatican City",
    	    emoji: "🇻🇦"
    	  },
    	  VC: {
    	    code: "VC",
    	    unicode: "U+1F1FB U+1F1E8",
    	    name: "St. Vincent & Grenadines",
    	    emoji: "🇻🇨"
    	  },
    	  VE: {
    	    code: "VE",
    	    unicode: "U+1F1FB U+1F1EA",
    	    name: "Venezuela",
    	    emoji: "🇻🇪"
    	  },
    	  VG: {
    	    code: "VG",
    	    unicode: "U+1F1FB U+1F1EC",
    	    name: "British Virgin Islands",
    	    emoji: "🇻🇬"
    	  },
    	  VI: {
    	    code: "VI",
    	    unicode: "U+1F1FB U+1F1EE",
    	    name: "U.S. Virgin Islands",
    	    emoji: "🇻🇮"
    	  },
    	  VN: {
    	    code: "VN",
    	    unicode: "U+1F1FB U+1F1F3",
    	    name: "Vietnam",
    	    emoji: "🇻🇳"
    	  },
    	  VU: {
    	    code: "VU",
    	    unicode: "U+1F1FB U+1F1FA",
    	    name: "Vanuatu",
    	    emoji: "🇻🇺"
    	  },
    	  WF: {
    	    code: "WF",
    	    unicode: "U+1F1FC U+1F1EB",
    	    name: "Wallis & Futuna",
    	    emoji: "🇼🇫"
    	  },
    	  WS: {
    	    code: "WS",
    	    unicode: "U+1F1FC U+1F1F8",
    	    name: "Samoa",
    	    emoji: "🇼🇸"
    	  },
    	  XK: {
    	    code: "XK",
    	    unicode: "U+1F1FD U+1F1F0",
    	    name: "Kosovo",
    	    emoji: "🇽🇰"
    	  },
    	  YE: {
    	    code: "YE",
    	    unicode: "U+1F1FE U+1F1EA",
    	    name: "Yemen",
    	    emoji: "🇾🇪"
    	  },
    	  YT: {
    	    code: "YT",
    	    unicode: "U+1F1FE U+1F1F9",
    	    name: "Mayotte",
    	    emoji: "🇾🇹"
    	  },
    	  ZA: {
    	    code: "ZA",
    	    unicode: "U+1F1FF U+1F1E6",
    	    name: "South Africa",
    	    emoji: "🇿🇦"
    	  },
    	  ZM: {
    	    code: "ZM",
    	    unicode: "U+1F1FF U+1F1F2",
    	    name: "Zambia",
    	    emoji: "🇿🇲"
    	  },
    	  ZW: {
    	    code: "ZW",
    	    unicode: "U+1F1FF U+1F1FC",
    	    name: "Zimbabwe",
    	    emoji: "🇿🇼"
    	  }
    	};

    	var countryCodes = Object.keys(data);
    	var list = Object.values(data);
    	/**
    	 * Get country flag emoji.
    	 *
    	 * @param {String} countryCode
    	 * @return {Object|Undefined}
    	 */

    	var get = function get(countryCode) {
    	  if (countryCode === undefined) {
    	    return list;
    	  }

    	  if (typeof countryCode !== "string") {
    	    return undefined;
    	  }

    	  var code = countryCode.toUpperCase();
    	  return Object.prototype.hasOwnProperty.call(data, code) ? data[code] : undefined;
    	};

    	var index = {
    	  data: data,
    	  countryCodes: countryCodes,
    	  list: list,
    	  get: get
    	};

    	return index;

    })));
    });

    function range(start, end) {
        return Array(end - start).fill().map((_, idx) => start + idx)
      }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    let participantsArray = writable([
        {
            Name : "Albania",
            Alpha2Code: "AL",
            Points: 0
        },
        {
            Name: "Armenia",
            Alpha2Code: "AM",
            Points: 0
        },
        {
            Name: "Australia",
            Alpha2Code: "AU",
            Points: 0
        },
        {
            Name: "Austria",
            Alpha2Code: "AT",
            Points: 0
        },
        {
            Name: "Azerbaijan",
            Alpha2Code: "AZ",
            Points: 0
        },
        {
            Name: "Belgium",
            Alpha2Code: "BE",
            Points: 0
        },
        {
            Name: "Bulgaria",
            Alpha2Code: "BG",
            Points: 0
        },
        {
            Name: "Croatia",
            Alpha2Code: "HR",
            Points: 0
        },
        {
            Name: "Cyprus",
            Alpha2Code: "CY",
            Points: 0
        },
        {
            Name: "Czech Republic",
            Alpha2Code: "CZ",
            Points: 0
        },
        {
            Name: "Denmark",
            Alpha2Code: "DK",
            Points: 0
        },
        {
            Name: "Estonia",
            Alpha2Code: "EE",
            Points: 0
        },
        {
            Name: "Finland",
            Alpha2Code: "FI",
            Points: 0
        },
        {
            Name: "France",
            Alpha2Code: "FR",
            Points: 0
        },
        {
            Name: "Germany",
            Alpha2Code: "DE",
            Points: 0
        },
        {
            Name: "Georgia",
            Alpha2Code: "GE",
            Points: 0
        },
        {
            Name: "Greece",
            Alpha2Code: "GR",
            Points: 0
        },
        {
            Name: "Iceland",
            Alpha2Code: "IS",
            Points: 0
        },
        {
            Name: "Ireland",
            Alpha2Code: "IE",
            Points: 0
        },
        {
            Name: "Israel",
            Alpha2Code: "IL",
            Points: 0
        },
        {
            Name: "Italy",
            Alpha2Code: "IT",
            Points: 0
        },
        {
            Name: "Latvia",
            Alpha2Code: "LV",
            Points: 0
        },
        {
            Name: "Lithuania",
            Alpha2Code: "LT",
            Points: 0
        },
        {
            Name: "Malta",
            Alpha2Code: "MT",
            Points: 0
        },
        {
            Name: "Moldova",
            Alpha2Code: "MD",
            Points: 0
        },
        {
            Name: "Montenegro",
            Alpha2Code: "ME",
            Points: 0
        },
        {
            Name: "The Netherlands",
            Alpha2Code: "NL",
            Points: 0
        },
        {
            Name: "North Macedonia",
            Alpha2Code: "MK",
            Points: 0
        },
        {
            Name: "Norway",
            Alpha2Code: "NO",
            Points: 0
        },
        {
            Name: "Poland",
            Alpha2Code: "PL",
            Points: 0
        },
        {
            Name: "Portugal",
            Alpha2Code: "PT",
            Points: 0
        },
        {
            Name: "Romania",
            Alpha2Code: "RO",
            Points: 0
        },
        {
            Name: "San Marino",
            Alpha2Code: "SM",
            Points: 0
        },
        {
            Name: "Serbia",
            Alpha2Code: "RS",
            Points: 0
        },
        {
            Name: "Slovenia",
            Alpha2Code: "SI",
            Points: 0
        },
        {
            Name: "Spain",
            Alpha2Code: "ES",
            Points: 0
        },
        {
            Name: "Sweden",
            Alpha2Code: "SE",
            Points: 0
        },
        {
            Name: "Switzerland",
            Alpha2Code: "CH",
            Points: 0
        },
        {
            Name: "Ukraine",
            Alpha2Code: "UA",
            Points: 0
        },
        {
            Name: "United Kingdom",
            Alpha2Code: "GB",
            Points: 0
        },
      ]);

    /* src/Table.svelte generated by Svelte v3.49.0 */
    const file$2 = "src/Table.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (19:10) {#each Array.from({length: 10}, (_, i) => i + 1)  as i}
    function create_each_block_3(ctx) {
    	let tr;
    	let td0;
    	let t0_value = countryFlagEmoji_umd.get(/*participantsStore*/ ctx[0][/*i*/ ctx[1]].Alpha2Code).emoji + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*participantsStore*/ ctx[0][/*i*/ ctx[1]].Name + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*participantsStore*/ ctx[0][/*i*/ ctx[1]].Points + "";
    	let t4;
    	let t5;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			attr_dev(td0, "class", "svelte-1xuq1ca");
    			add_location(td0, file$2, 20, 12, 424);
    			attr_dev(td1, "class", "svelte-1xuq1ca");
    			add_location(td1, file$2, 21, 12, 508);
    			attr_dev(td2, "class", "svelte-1xuq1ca");
    			add_location(td2, file$2, 22, 12, 557);
    			add_location(tr, file$2, 19, 10, 407);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*participantsStore*/ 1 && t0_value !== (t0_value = countryFlagEmoji_umd.get(/*participantsStore*/ ctx[0][/*i*/ ctx[1]].Alpha2Code).emoji + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*participantsStore*/ 1 && t2_value !== (t2_value = /*participantsStore*/ ctx[0][/*i*/ ctx[1]].Name + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*participantsStore*/ 1 && t4_value !== (t4_value = /*participantsStore*/ ctx[0][/*i*/ ctx[1]].Points + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(19:10) {#each Array.from({length: 10}, (_, i) => i + 1)  as i}",
    		ctx
    	});

    	return block;
    }

    // (30:10) {#each range(11, 20) as i}
    function create_each_block_2(ctx) {
    	let tr;
    	let td0;
    	let t0_value = countryFlagEmoji_umd.get(/*participantsStore*/ ctx[0][/*i*/ ctx[1]].Alpha2Code).emoji + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*participantsStore*/ ctx[0][/*i*/ ctx[1]].Name + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*participantsStore*/ ctx[0][/*i*/ ctx[1]].Points + "";
    	let t4;
    	let t5;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			attr_dev(td0, "class", "svelte-1xuq1ca");
    			add_location(td0, file$2, 31, 12, 759);
    			attr_dev(td1, "class", "svelte-1xuq1ca");
    			add_location(td1, file$2, 32, 12, 843);
    			attr_dev(td2, "class", "svelte-1xuq1ca");
    			add_location(td2, file$2, 33, 12, 892);
    			add_location(tr, file$2, 30, 10, 742);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*participantsStore*/ 1 && t0_value !== (t0_value = countryFlagEmoji_umd.get(/*participantsStore*/ ctx[0][/*i*/ ctx[1]].Alpha2Code).emoji + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*participantsStore*/ 1 && t2_value !== (t2_value = /*participantsStore*/ ctx[0][/*i*/ ctx[1]].Name + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*participantsStore*/ 1 && t4_value !== (t4_value = /*participantsStore*/ ctx[0][/*i*/ ctx[1]].Points + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(30:10) {#each range(11, 20) as i}",
    		ctx
    	});

    	return block;
    }

    // (41:10) {#each range(21, 30) as i}
    function create_each_block_1(ctx) {
    	let tr;
    	let td0;
    	let t0_value = countryFlagEmoji_umd.get(/*participantsStore*/ ctx[0][/*i*/ ctx[1]].Alpha2Code).emoji + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*participantsStore*/ ctx[0][/*i*/ ctx[1]].Name + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*participantsStore*/ ctx[0][/*i*/ ctx[1]].Points + "";
    	let t4;
    	let t5;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			attr_dev(td0, "class", "svelte-1xuq1ca");
    			add_location(td0, file$2, 42, 12, 1094);
    			attr_dev(td1, "class", "svelte-1xuq1ca");
    			add_location(td1, file$2, 43, 12, 1178);
    			attr_dev(td2, "class", "svelte-1xuq1ca");
    			add_location(td2, file$2, 44, 12, 1227);
    			add_location(tr, file$2, 41, 10, 1077);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*participantsStore*/ 1 && t0_value !== (t0_value = countryFlagEmoji_umd.get(/*participantsStore*/ ctx[0][/*i*/ ctx[1]].Alpha2Code).emoji + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*participantsStore*/ 1 && t2_value !== (t2_value = /*participantsStore*/ ctx[0][/*i*/ ctx[1]].Name + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*participantsStore*/ 1 && t4_value !== (t4_value = /*participantsStore*/ ctx[0][/*i*/ ctx[1]].Points + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(41:10) {#each range(21, 30) as i}",
    		ctx
    	});

    	return block;
    }

    // (52:10) {#each range(31, 40) as i}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let t0_value = countryFlagEmoji_umd.get(/*participantsStore*/ ctx[0][/*i*/ ctx[1]].Alpha2Code).emoji + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*participantsStore*/ ctx[0][/*i*/ ctx[1]].Name + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*participantsStore*/ ctx[0][/*i*/ ctx[1]].Points + "";
    	let t4;
    	let t5;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			attr_dev(td0, "class", "svelte-1xuq1ca");
    			add_location(td0, file$2, 53, 12, 1429);
    			attr_dev(td1, "class", "svelte-1xuq1ca");
    			add_location(td1, file$2, 54, 12, 1513);
    			attr_dev(td2, "class", "svelte-1xuq1ca");
    			add_location(td2, file$2, 55, 12, 1562);
    			add_location(tr, file$2, 52, 10, 1412);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*participantsStore*/ 1 && t0_value !== (t0_value = countryFlagEmoji_umd.get(/*participantsStore*/ ctx[0][/*i*/ ctx[1]].Alpha2Code).emoji + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*participantsStore*/ 1 && t2_value !== (t2_value = /*participantsStore*/ ctx[0][/*i*/ ctx[1]].Name + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*participantsStore*/ 1 && t4_value !== (t4_value = /*participantsStore*/ ctx[0][/*i*/ ctx[1]].Points + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(52:10) {#each range(31, 40) as i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div4;
    	let div0;
    	let table0;
    	let t0;
    	let div1;
    	let table1;
    	let t1;
    	let div2;
    	let table2;
    	let t2;
    	let div3;
    	let table3;
    	let each_value_3 = Array.from({ length: 10 }, func);
    	validate_each_argument(each_value_3);
    	let each_blocks_3 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_3[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value_2 = range(11, 20);
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = range(21, 30);
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = range(31, 40);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			table0 = element("table");

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			t0 = space();
    			div1 = element("div");
    			table1 = element("table");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t1 = space();
    			div2 = element("div");
    			table2 = element("table");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			div3 = element("div");
    			table3 = element("table");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(table0, "class", "svelte-1xuq1ca");
    			add_location(table0, file$2, 17, 6, 323);
    			attr_dev(div0, "class", "column svelte-1xuq1ca");
    			add_location(div0, file$2, 16, 4, 296);
    			attr_dev(table1, "class", "svelte-1xuq1ca");
    			add_location(table1, file$2, 28, 6, 687);
    			attr_dev(div1, "class", "column svelte-1xuq1ca");
    			add_location(div1, file$2, 27, 4, 660);
    			attr_dev(table2, "class", "svelte-1xuq1ca");
    			add_location(table2, file$2, 39, 6, 1022);
    			attr_dev(div2, "class", "column svelte-1xuq1ca");
    			add_location(div2, file$2, 38, 4, 995);
    			attr_dev(table3, "class", "svelte-1xuq1ca");
    			add_location(table3, file$2, 50, 6, 1357);
    			attr_dev(div3, "class", "column svelte-1xuq1ca");
    			add_location(div3, file$2, 49, 4, 1330);
    			attr_dev(div4, "class", "row svelte-1xuq1ca");
    			add_location(div4, file$2, 15, 0, 274);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, table0);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(table0, null);
    			}

    			append_dev(div4, t0);
    			append_dev(div4, div1);
    			append_dev(div1, table1);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(table1, null);
    			}

    			append_dev(div4, t1);
    			append_dev(div4, div2);
    			append_dev(div2, table2);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(table2, null);
    			}

    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div3, table3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table3, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*participantsStore, Array, countryFlagEmoji*/ 1) {
    				each_value_3 = Array.from({ length: 10 }, func);
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_3[i]) {
    						each_blocks_3[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_3[i] = create_each_block_3(child_ctx);
    						each_blocks_3[i].c();
    						each_blocks_3[i].m(table0, null);
    					}
    				}

    				for (; i < each_blocks_3.length; i += 1) {
    					each_blocks_3[i].d(1);
    				}

    				each_blocks_3.length = each_value_3.length;
    			}

    			if (dirty & /*participantsStore, range, countryFlagEmoji*/ 1) {
    				each_value_2 = range(11, 20);
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(table1, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*participantsStore, range, countryFlagEmoji*/ 1) {
    				each_value_1 = range(21, 30);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(table2, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*participantsStore, range, countryFlagEmoji*/ 1) {
    				each_value = range(31, 40);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table3, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks_3, detaching);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func = (_, i) => i + 1;

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Table', slots, []);
    	let participantsStore = [];

    	participantsArray.subscribe(data => {
    		$$invalidate(0, participantsStore = data);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Table> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		countryFlagEmoji: countryFlagEmoji_umd,
    		range,
    		participantsArray,
    		participantsStore
    	});

    	$$self.$inject_state = $$props => {
    		if ('participantsStore' in $$props) $$invalidate(0, participantsStore = $$props.participantsStore);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [participantsStore];
    }

    class Table extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Table",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const pointFromArray = writable([
      {
        Name : "Albania",
        Points : {"Armenia":1, "Australia":2, "Austria":3, "Azerbaijan":4, "Belgium":5, "Bulgaria":6, "Croatia":7, "Cyprus":8, "Czech Republic":10, "Denmark":0, "Estonia":0, "Finland":0, "France":0, "Germany":0, "Georgia":0, "Greece":0, "Iceland":0, "Ireland":0, "Israel":0, "Italy":0, "Latvia":0, "Lithuania":0, "Malta":0, "Moldova":0, "Montenegro":0, "The Netherlands":0, "North Macedonia":0, "Norway":0, "Poland":0, "Portugal":0, "Romania":0, "San Marino":0, "Serbia":0, "Slovenia":0, "Spain":0, "Sweden":0, "Switzerland":0, "Ukraine":0, "United Kingdom":0},
        Alpha2Code: "AL"
    },
    {
        Name: "Armenia",
        Points : {"Albania":1, "Australia":2, "Austria":3, "Azerbaijan":4, "Belgium":5, "Bulgaria":6, "Croatia":7, "Cyprus":8, "Czech Republic":10, "Denmark":0, "Estonia":0, "Finland":0, "France":0, "Germany":0, "Georgia":0, "Greece":0, "Iceland":0, "Ireland":0, "Israel":0, "Italy":0, "Latvia":0, "Lithuania":0, "Malta":0, "Moldova":0, "Montenegro":0, "The Netherlands":0, "North Macedonia":0, "Norway":0, "Poland":0, "Portugal":0, "Romania":0, "San Marino":0, "Serbia":0, "Slovenia":0, "Spain":0, "Sweden":0, "Switzerland":0, "Ukraine":0, "United Kingdom":0},
        Alpha2Code: "AM"
    },
    {
        Name: "Australia",
        Points : {"Albania":1,"Armenia":2, "Austria":3, "Azerbaijan":4, "Belgium":5, "Bulgaria":6, "Croatia":7, "Cyprus":8, "Czech Republic":10, "Denmark":0, "Estonia":0, "Finland":0, "France":0, "Germany":0, "Georgia":0, "Greece":0, "Iceland":0, "Ireland":0, "Israel":0, "Italy":0, "Latvia":0, "Lithuania":0, "Malta":0, "Moldova":0, "Montenegro":0, "The Netherlands":0, "North Macedonia":0, "Norway":0, "Poland":0, "Portugal":0, "Romania":0, "San Marino":0, "Serbia":0, "Slovenia":0, "Spain":0, "Sweden":0, "Switzerland":0, "Ukraine":0, "United Kingdom":0},
        Alpha2Code: "AU"
    },
    {
        Name: "Austria",
        Points : {"Albania":1,"Armenia":2, "Australia":3, "Azerbaijan":4, "Belgium":5, "Bulgaria":6, "Croatia":7, "Cyprus":8, "Czech Republic":10, "Denmark":0, "Estonia":0, "Finland":0, "France":0, "Germany":0, "Georgia":0, "Greece":0, "Iceland":0, "Ireland":0, "Israel":0, "Italy":0, "Latvia":0, "Lithuania":0, "Malta":0, "Moldova":0, "Montenegro":0, "The Netherlands":0, "North Macedonia":0, "Norway":0, "Poland":0, "Portugal":0, "Romania":0, "San Marino":0, "Serbia":0, "Slovenia":0, "Spain":0, "Sweden":0, "Switzerland":0, "Ukraine":0, "United Kingdom":0},
        Alpha2Code: "AT"
    },
    {
        Name: "Azerbaijan",
        Points : {"Albania":1,"Armenia":2, "Australia":3, "Austria":4, "Belgium":5, "Bulgaria":6, "Croatia":7, "Cyprus":8, "Czech Republic":10, "Denmark":0, "Estonia":0, "Finland":0, "France":0, "Germany":0, "Georgia":0, "Greece":0, "Iceland":0, "Ireland":0, "Israel":0, "Italy":0, "Latvia":0, "Lithuania":0, "Malta":0, "Moldova":0, "Montenegro":0, "The Netherlands":0, "North Macedonia":0, "Norway":0, "Poland":0, "Portugal":0, "Romania":0, "San Marino":0, "Serbia":0, "Slovenia":0, "Spain":0, "Sweden":0, "Switzerland":0, "Ukraine":0, "United Kingdom":0},
        Alpha2Code: "AZ"
    },
    {
        Name: "Belgium",
        Points : {"Albania":1,"Armenia":2, "Australia":3, "Austria":4, "Azerbaijan":5,"Bulgaria":6, "Croatia":7, "Cyprus":8, "Czech Republic":10, "Denmark":0, "Estonia":0, "Finland":0, "France":0, "Germany":0, "Georgia":0, "Greece":0, "Iceland":0, "Ireland":0, "Israel":0, "Italy":0, "Latvia":0, "Lithuania":0, "Malta":0, "Moldova":0, "Montenegro":0, "The Netherlands":0, "North Macedonia":0, "Norway":0, "Poland":0, "Portugal":0, "Romania":0, "San Marino":0, "Serbia":0, "Slovenia":0, "Spain":0, "Sweden":0, "Switzerland":0, "Ukraine":0, "United Kingdom":0},
        Alpha2Code: "BE"
    },
    {
        Name: "Bulgaria",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1,"Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":0, "Estonia":0, "Finland":0, "France":0, "Germany":0, "Georgia":0, "Greece":0, "Iceland":0, "Ireland":0, "Israel":0, "Italy":0, "Latvia":0, "Lithuania":0, "Malta":0, "Moldova":0, "Montenegro":0, "The Netherlands":0, "North Macedonia":0, "Norway":0, "Poland":0, "Portugal":0, "Romania":0, "San Marino":0, "Serbia":0, "Slovenia":0, "Spain":0, "Sweden":0, "Switzerland":0, "Ukraine":0, "United Kingdom":0},
        Alpha2Code: "BG"
    },
    {
        Name: "Croatia",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Cyprus":1, "Czech Republic":1, "Denmark":0, "Estonia":0, "Finland":0, "France":0, "Germany":0, "Georgia":0, "Greece":0, "Iceland":0, "Ireland":0, "Israel":0, "Italy":0, "Latvia":0, "Lithuania":0, "Malta":0, "Moldova":0, "Montenegro":0, "The Netherlands":0, "North Macedonia":0, "Norway":0, "Poland":0, "Portugal":0, "Romania":0, "San Marino":0, "Serbia":0, "Slovenia":0, "Spain":0, "Sweden":0, "Switzerland":0, "Ukraine":0, "United Kingdom":0},
        Alpha2Code: "HR"
    },
    {
        Name: "Cyprus",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Czech Republic":1, "Denmark":0, "Estonia":0, "Finland":0, "France":0, "Germany":0, "Georgia":0, "Greece":0, "Iceland":0, "Ireland":0, "Israel":0, "Italy":0, "Latvia":0, "Lithuania":0, "Malta":0, "Moldova":0, "Montenegro":0, "The Netherlands":0, "North Macedonia":0, "Norway":0, "Poland":0, "Portugal":0, "Romania":0, "San Marino":0, "Serbia":0, "Slovenia":0, "Spain":0, "Sweden":0, "Switzerland":0, "Ukraine":0, "United Kingdom":0},
        Alpha2Code: "CY"
    },
    {
        Name: "Czech Republic",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Denmark":0, "Estonia":0, "Finland":0, "France":0, "Germany":0, "Georgia":0, "Greece":0, "Iceland":0, "Ireland":0, "Israel":0, "Italy":0, "Latvia":0, "Lithuania":0, "Malta":0, "Moldova":0, "Montenegro":0, "The Netherlands":0, "North Macedonia":0, "Norway":0, "Poland":0, "Portugal":0, "Romania":0, "San Marino":0, "Serbia":0, "Slovenia":0, "Spain":0, "Sweden":0, "Switzerland":0, "Ukraine":0, "United Kingdom":0},
        Alpha2Code: "CZ"
    },
    {
        Name: "Denmark",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "DK"
    },
    {
        Name: "Estonia",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "EE"
    },
    {
        Name: "Finland",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "FI"
    },
    {
        Name: "France",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "FR"
    },
    {
        Name: "Germany",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "DE"
    },
    {
        Name: "Georgia",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "GE"
    },
    {
        Name: "Greece",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "GR"
    },
    {
        Name: "Iceland",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "IS"
    },
    {
        Name: "Ireland",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "IE"
    },
    {
        Name: "Israel",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "IL"
    },
    {
        Name: "Italy",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "IT"
    },
    {
        Name: "Latvia",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "LV"
    },
    {
        Name: "Lithuania",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "LT"
    },
    {
        Name: "Malta",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "MT"
    },
    {
        Name: "Moldova",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1,  "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "MD"
    },
    {
        Name: "Montenegro",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1,"The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "ME"
    },
    {
        Name: "The Netherlands",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "NL"
    },
    {
        Name: "North Macedonia",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "MK"
    },
    {
        Name: "Norway",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "NO"
    },
    {
        Name: "Poland",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "PL"
    },
    {
        Name: "Portugal",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "PT"
    },
    {
        Name: "Romania",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "RO"
    },
    {
        Name: "San Marino",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "SM"
    },
    {
        Name: "Serbia",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "RS"
    },
    {
        Name: "Slovenia",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "SI"
    },
    {
        Name: "Spain",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1,"Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "ES"
    },
    {
        Name: "Sweden",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "SE"
    },
    {
        Name: "Switzerland",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "CH"
    },
    {
        Name: "Ukraine",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "United Kingdom":1},
        Alpha2Code: "UA"
    },
    {
        Name: "United Kingdom",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1},
        Alpha2Code: "GB"
    }
    ]

      );

    function addPoints(pointsTo, pointsValue){
        participantsArray.update(currentData => {
          let cp = [...currentData];
          let specific = cp.find((row) => row.Name == pointsTo);

          specific.Points+= pointsValue;
          return cp;
          });
      }
    function andThePointsGoTo(array, index){
        const row = array[index];
        const object = row.Points;
      
        // givesPoints = "Points from ".concat(row.Name);

        for (const property in object) {
          
          console.log(`${object[property]} points go to ${property}`);

          addPoints(property, object[property]);

        }
    }

    function compare( a, b ) {
        if ( a.Points < b.Points ){
          return 1;
        }
        if ( a.Points > b.Points ){
          return -1;
        }
        return 0;
      }

    /* src/PointsButton.svelte generated by Svelte v3.49.0 */
    const file$1 = "src/PointsButton.svelte";

    // (45:2) {#if visible}
    function create_if_block_1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Points from:";
    			add_location(p, file$1, 45, 2, 1138);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(45:2) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (51:2) {#if visible}
    function create_if_block(ctx) {
    	let p;
    	let t0;
    	let t1;
    	let t2_value = countryFlagEmoji_umd.get(/*alpha2Code*/ ctx[2]).emoji + "";
    	let t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text(/*fromCountry*/ ctx[0]);
    			t1 = space();
    			t2 = text(t2_value);
    			add_location(p, file$1, 51, 2, 1221);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fromCountry*/ 1) set_data_dev(t0, /*fromCountry*/ ctx[0]);
    			if (dirty & /*alpha2Code*/ 4 && t2_value !== (t2_value = countryFlagEmoji_umd.get(/*alpha2Code*/ ctx[2]).emoji + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(51:2) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div0;
    	let button;
    	let t1;
    	let div1;
    	let t2;
    	let div2;
    	let mounted;
    	let dispose;
    	let if_block0 = /*visible*/ ctx[1] && create_if_block_1(ctx);
    	let if_block1 = /*visible*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "1-10 points";
    			t1 = space();
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t2 = space();
    			div2 = element("div");
    			if (if_block1) if_block1.c();
    			attr_dev(button, "class", "button-2 svelte-agwv2l");
    			add_location(button, file$1, 40, 4, 1011);
    			attr_dev(div0, "class", "points-button svelte-agwv2l");
    			add_location(div0, file$1, 39, 0, 979);
    			attr_dev(div1, "class", "points-text-1 svelte-agwv2l");
    			add_location(div1, file$1, 43, 0, 1092);
    			attr_dev(div2, "class", "points-text-2 svelte-agwv2l");
    			add_location(div2, file$1, 49, 0, 1175);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, button);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			if (if_block0) if_block0.m(div1, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div2, anchor);
    			if (if_block1) if_block1.m(div2, null);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*visible*/ ctx[1]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div1, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*visible*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(div2, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div2);
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PointsButton', slots, []);
    	const pointFrom = get_store_value(pointFromArray);
    	const votingLength = [...Array(pointFrom.length).keys()];
    	let participantsStore = [];
    	let fromCountry = "";
    	let visible = false;
    	let alpha2Code = "GB";

    	participantsArray.subscribe(data => {
    		participantsStore = data;
    	});

    	function sortUpdate() {
    		participantsStore.sort(compare);
    	}

    	function onClick() {
    		let idx = votingLength.pop();
    		andThePointsGoTo(pointFrom, idx);
    		$$invalidate(0, fromCountry = pointFrom[idx].Name);
    		$$invalidate(2, alpha2Code = pointFrom[idx].Alpha2Code);
    		$$invalidate(1, visible = true);

    		// setTimeout(() => console.log("Waiting..."), 3000);
    		sortUpdate();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PointsButton> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => onClick();

    	$$self.$capture_state = () => ({
    		participantsArray,
    		pointFromArray,
    		get: get_store_value,
    		andThePointsGoTo,
    		compare,
    		countryFlagEmoji: countryFlagEmoji_umd,
    		pointFrom,
    		votingLength,
    		participantsStore,
    		fromCountry,
    		visible,
    		alpha2Code,
    		sortUpdate,
    		onClick
    	});

    	$$self.$inject_state = $$props => {
    		if ('participantsStore' in $$props) participantsStore = $$props.participantsStore;
    		if ('fromCountry' in $$props) $$invalidate(0, fromCountry = $$props.fromCountry);
    		if ('visible' in $$props) $$invalidate(1, visible = $$props.visible);
    		if ('alpha2Code' in $$props) $$invalidate(2, alpha2Code = $$props.alpha2Code);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fromCountry, visible, alpha2Code, onClick, click_handler];
    }

    class PointsButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PointsButton",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Video.svelte generated by Svelte v3.49.0 */

    const file = "src/Video.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let video;
    	let track;
    	let video_src_value;
    	let video_is_paused = true;
    	let video_updating = false;
    	let video_animationframe;
    	let t0;
    	let p;
    	let t1;
    	let button;
    	let t2_value = (/*paused*/ ctx[0] ? "12 points" : "Pause") + "";
    	let t2;
    	let mounted;
    	let dispose;

    	function video_timeupdate_handler() {
    		cancelAnimationFrame(video_animationframe);

    		if (!video.paused) {
    			video_animationframe = raf(video_timeupdate_handler);
    			video_updating = true;
    		}

    		/*video_timeupdate_handler*/ ctx[7].call(video);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			video = element("video");
    			track = element("track");
    			t0 = space();
    			p = element("p");
    			t1 = space();
    			button = element("button");
    			t2 = text(t2_value);
    			attr_dev(track, "kind", "captions");
    			add_location(track, file, 18, 1, 282);
    			attr_dev(video, "poster", "static/esc_norway.jpg");
    			if (!src_url_equal(video.src, video_src_value = "static/12_points_from/germany.mp4")) attr_dev(video, "src", video_src_value);
    			attr_dev(video, "class", "svelte-1bfu0tu");
    			if (/*duration*/ ctx[2] === void 0) add_render_callback(() => /*video_durationchange_handler*/ ctx[6].call(video));
    			add_location(video, file, 8, 0, 100);
    			add_location(p, file, 20, 0, 315);
    			attr_dev(button, "class", "button-2 svelte-1bfu0tu");
    			add_location(button, file, 24, 0, 405);
    			attr_dev(div, "class", "svelte-1bfu0tu");
    			add_location(div, file, 6, 0, 93);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, video);
    			append_dev(video, track);

    			if (!isNaN(/*volume*/ ctx[1])) {
    				video.volume = /*volume*/ ctx[1];
    			}

    			append_dev(div, t0);
    			append_dev(div, p);
    			append_dev(div, t1);
    			append_dev(div, button);
    			append_dev(button, t2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(video, "volumechange", /*video_volumechange_handler*/ ctx[4]),
    					listen_dev(video, "play", /*video_play_pause_handler*/ ctx[5]),
    					listen_dev(video, "pause", /*video_play_pause_handler*/ ctx[5]),
    					listen_dev(video, "durationchange", /*video_durationchange_handler*/ ctx[6]),
    					listen_dev(video, "timeupdate", video_timeupdate_handler),
    					listen_dev(button, "click", /*click_handler*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*volume*/ 2 && !isNaN(/*volume*/ ctx[1])) {
    				video.volume = /*volume*/ ctx[1];
    			}

    			if (dirty & /*paused*/ 1 && video_is_paused !== (video_is_paused = /*paused*/ ctx[0])) {
    				video[video_is_paused ? "pause" : "play"]();
    			}

    			if (!video_updating && dirty & /*currentTime*/ 8 && !isNaN(/*currentTime*/ ctx[3])) {
    				video.currentTime = /*currentTime*/ ctx[3];
    			}

    			video_updating = false;
    			if (dirty & /*paused*/ 1 && t2_value !== (t2_value = (/*paused*/ ctx[0] ? "12 points" : "Pause") + "")) set_data_dev(t2, t2_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Video', slots, []);
    	let paused = true;
    	let volume = 1;
    	let duration;
    	let currentTime = 0;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Video> was created with unknown prop '${key}'`);
    	});

    	function video_volumechange_handler() {
    		volume = this.volume;
    		$$invalidate(1, volume);
    	}

    	function video_play_pause_handler() {
    		paused = this.paused;
    		$$invalidate(0, paused);
    	}

    	function video_durationchange_handler() {
    		duration = this.duration;
    		$$invalidate(2, duration);
    	}

    	function video_timeupdate_handler() {
    		currentTime = this.currentTime;
    		$$invalidate(3, currentTime);
    	}

    	const click_handler = () => $$invalidate(0, paused = !paused);
    	$$self.$capture_state = () => ({ paused, volume, duration, currentTime });

    	$$self.$inject_state = $$props => {
    		if ('paused' in $$props) $$invalidate(0, paused = $$props.paused);
    		if ('volume' in $$props) $$invalidate(1, volume = $$props.volume);
    		if ('duration' in $$props) $$invalidate(2, duration = $$props.duration);
    		if ('currentTime' in $$props) $$invalidate(3, currentTime = $$props.currentTime);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		paused,
    		volume,
    		duration,
    		currentTime,
    		video_volumechange_handler,
    		video_play_pause_handler,
    		video_durationchange_handler,
    		video_timeupdate_handler,
    		click_handler
    	];
    }

    class Video extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Video",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.49.0 */

    function create_fragment(ctx) {
    	let navbar;
    	let t0;
    	let table;
    	let t1;
    	let pointsbutton;
    	let t2;
    	let video;
    	let current;
    	navbar = new Navbar({ $$inline: true });
    	table = new Table({ $$inline: true });
    	pointsbutton = new PointsButton({ $$inline: true });
    	video = new Video({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			create_component(table.$$.fragment);
    			t1 = space();
    			create_component(pointsbutton.$$.fragment);
    			t2 = space();
    			create_component(video.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(table, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(pointsbutton, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(video, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(table.$$.fragment, local);
    			transition_in(pointsbutton.$$.fragment, local);
    			transition_in(video.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(table.$$.fragment, local);
    			transition_out(pointsbutton.$$.fragment, local);
    			transition_out(video.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(table, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(pointsbutton, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(video, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Navbar, Table, PointsButton, Video });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
      props: {}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
