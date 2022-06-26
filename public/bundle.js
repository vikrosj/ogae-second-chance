
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
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
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.shift()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            while (render_callbacks.length) {
                const callback = render_callbacks.pop();
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_render);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_render.forEach(add_render_callback);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_render } = component.$$;
        fragment.m(target, anchor);
        // onMount happens after the initial afterUpdate. Because
        // afterUpdate callbacks happen in reverse order (inner first)
        // we schedule onMount callbacks before afterUpdate callbacks
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
        after_render.forEach(add_render_callback);
    }
    function destroy(component, detaching) {
        if (component.$$) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal: not_equal$$1,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_render: [],
            after_render: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_render);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                $$.fragment.l(children(options.target));
            }
            else {
                $$.fragment.c();
            }
            if (options.intro && component.$$.fragment.i)
                component.$$.fragment.i();
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy(this, true);
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
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (!stop) {
                    return; // not ready
                }
                subscribers.forEach((s) => s[1]());
                subscribers.forEach((s) => s[0](value));
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                }
            };
        }
        return { set, update, subscribe };
    }
    /**
     * Get the current value from a store by subscribing and immediately unsubscribing.
     * @param store readable
     */
    function get(store) {
        let value;
        store.subscribe((_) => value = _)();
        return value;
    }

    let participantsArray = writable([
        {
            Name : "Albania",
            Alpha2Code: "AL"
        },
        {
            Name: "Armenia",
            Alpha2Code: "AM"
        },
        {
            Name: "Australia",
            Alpha2Code: "AU"
        },
        {
            Name: "Austria",
            Alpha2Code: "AT"
        },
        {
            Name: "Azerbaijan",
            Alpha2Code: "AZ"
        },
        {
            Name: "Belgium",
            Alpha2Code: "BE"
        },
        {
            Name: "Bulgaria",
            Alpha2Code: "BG"
        },
        {
            Name: "Croatia",
            Alpha2Code: "HR"
        },
        {
            Name: "Cyprus",
            Alpha2Code: "CY"
        },
        {
            Name: "Czech Republic",
            Alpha2Code: "CZ"
        },
        {
            Name: "Denmark",
            Alpha2Code: "DK"
        },
        {
            Name: "Estonia",
            Alpha2Code: "EE"
        },
        {
            Name: "Finland",
            Alpha2Code: "FI"
        },
        {
            Name: "France",
            Alpha2Code: "FR"
        },
        {
            Name: "Germany",
            Alpha2Code: "DE"
        },
        {
            Name: "Georgia",
            Alpha2Code: "GE"
        },
        {
            Name: "Greece",
            Alpha2Code: "GR"
        },
        {
            Name: "Iceland",
            Alpha2Code: "IS"
        },
        {
            Name: "Ireland",
            Alpha2Code: "IE"
        },
        {
            Name: "Israel",
            Alpha2Code: "IL"
        },
        {
            Name: "Italy",
            Alpha2Code: "IT"
        },
        {
            Name: "Latvia",
            Alpha2Code: "LV"
        },
        {
            Name: "Lithuania",
            Alpha2Code: "LT"
        },
        {
            Name: "Malta",
            Alpha2Code: "MT"
        },
        {
            Name: "Moldova",
            Alpha2Code: "MD"
        },
        {
            Name: "Montenegro",
            Alpha2Code: "ME"
        },
        {
            Name: "The Netherlands",
            Alpha2Code: "NL"
        },
        {
            Name: "North Macedonia",
            Alpha2Code: "MK"
        },
        {
            Name: "Norway",
            Alpha2Code: "SE"
        },
        {
            Name: "Poland",
            Alpha2Code: "PL"
        },
        {
            Name: "Portugal",
            Alpha2Code: "PT"
        },
        {
            Name: "Romania",
            Alpha2Code: "RO"
        },
        {
            Name: "San Marino",
            Alpha2Code: "SM"
        },
        {
            Name: "Serbia",
            Alpha2Code: "RS"
        },
        {
            Name: "Slovenia",
            Alpha2Code: "SI"
        },
        {
            Name: "Spain",
            Alpha2Code: "ES"
        },
        {
            Name: "Sweden",
            Alpha2Code: "SE"
        },
        {
            Name: "Switzerland",
            Alpha2Code: "CH"
        },
        {
            Name: "Ukraine",
            Alpha2Code: "UA"
        },
        {
            Name: "United Kingdom",
            Alpha2Code: "GB"
        },
      ]);

    let pointFromArray = writable([
      {
        Name : "Albania",
        Points : {"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "AL"
    },
    {
        Name: "Armenia",
        Points : {"Albania":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "AM"
    },
    {
        Name: "Australia",
        Points : {"Albania":1,"Armenia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "AU"
    },
    {
        Name: "Austria",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "AT"
    },
    {
        Name: "Azerbaijan",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "AZ"
    },
    {
        Name: "Belgium",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1,"Bulgaria":1, "Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "BE"
    },
    {
        Name: "Bulgaria",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1,"Croatia":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "BG"
    },
    {
        Name: "Croatia",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Cyprus":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "HR"
    },
    {
        Name: "Cyprus",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Czech Republic":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
        Alpha2Code: "CY"
    },
    {
        Name: "Czech Republic",
        Points : {"Albania":1,"Armenia":1, "Australia":1, "Austria":1, "Azerbaijan":1, "Belgium":1, "Bulgaria":1, "Croatia":1, "Cyprus":1, "Denmark":1, "Estonia":1, "Finland":1, "France":1, "Germany":1, "Georgia":1, "Greece":1, "Iceland":1, "Ireland":1, "Israel":1, "Italy":1, "Latvia":1, "Lithuania":1, "Malta":1, "Moldova":1, "Montenegro":1, "The Netherlands":1, "North Macedonia":1, "Norway":1, "Poland":1, "Portugal":1, "Romania":1, "San Marino":1, "Serbia":1, "Slovenia":1, "Spain":1, "Sweden":1, "Switzerland":1, "Ukraine":1, "United Kingdom":1},
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

    /* src/Navbar.svelte generated by Svelte v3.4.4 */

    const file = "src/Navbar.svelte";

    function create_fragment(ctx) {
    	var div, h1;

    	return {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "test";
    			add_location(h1, file, 1, 2, 34);
    			div.className = "navbar bg-primary";
    			add_location(div, file, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h1);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment, safe_not_equal, []);
    	}
    }

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

    const countryCodes = Object.keys(data);
    const list = Object.values(data);
    /**
     * Get country flag emoji.
     *
     * @param {String} countryCode
     * @return {Object|Undefined}
     */

    const get$1 = countryCode => {
      if (countryCode === undefined) {
        return list;
      }

      if (typeof countryCode !== "string") {
        return undefined;
      }

      const code = countryCode.toUpperCase();
      return Object.prototype.hasOwnProperty.call(data, code) ? data[code] : undefined;
    };

    var index = {
      data,
      countryCodes,
      list,
      get: get$1
    };

    var countryFlagEmoji_cjs = index;

    function range(start, end) {
        return Array(end - start).fill().map((_, idx) => start + idx)
      }

    function initalizeParticipants(array, country_code, name) {
    		array.forEach(el => {
    		el.value ++;
    		country_code.push(el.Alpha2Code);
        name.push(el.Name);
    	});
    	}

    /* src/App.svelte generated by Svelte v3.4.4 */

    const file$1 = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.i = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.i = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.i = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.i = list[i];
    	return child_ctx;
    }

    // (40:8) {#each Array.from({length: 10}, (_, i) => i + 1)  as i}
    function create_each_block_3(ctx) {
    	var tr, td0, t0_value = countryFlagEmoji_cjs.get(ctx.country_code[ctx.i]).emoji, t0, t1, td1, t2_value = ctx.name[ctx.i], t2, t3, td2, t4_value = ctx.points[ctx.i], t4;

    	return {
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
    			td0.className = "svelte-cctczq";
    			add_location(td0, file$1, 41, 10, 1200);
    			td1.className = "svelte-cctczq";
    			add_location(td1, file$1, 42, 10, 1266);
    			td2.className = "svelte-cctczq";
    			add_location(td2, file$1, 43, 10, 1295);
    			tr.className = "svelte-cctczq";
    			add_location(tr, file$1, 40, 8, 1185);
    		},

    		m: function mount(target, anchor) {
    			insert(target, tr, anchor);
    			append(tr, td0);
    			append(td0, t0);
    			append(tr, t1);
    			append(tr, td1);
    			append(td1, t2);
    			append(tr, t3);
    			append(tr, td2);
    			append(td2, t4);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.points) && t4_value !== (t4_value = ctx.points[ctx.i])) {
    				set_data(t4, t4_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(tr);
    			}
    		}
    	};
    }

    // (51:8) {#each range(11, 20) as i}
    function create_each_block_2(ctx) {
    	var tr, td0, t0_value = countryFlagEmoji_cjs.get(ctx.country_code[ctx.i]).emoji, t0, t1, td1, t2_value = ctx.name[ctx.i], t2, t3, td2, t4_value = ctx.points[ctx.i], t4;

    	return {
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
    			td0.className = "svelte-cctczq";
    			add_location(td0, file$1, 52, 10, 1461);
    			td1.className = "svelte-cctczq";
    			add_location(td1, file$1, 53, 10, 1527);
    			td2.className = "svelte-cctczq";
    			add_location(td2, file$1, 54, 10, 1556);
    			tr.className = "svelte-cctczq";
    			add_location(tr, file$1, 51, 8, 1446);
    		},

    		m: function mount(target, anchor) {
    			insert(target, tr, anchor);
    			append(tr, td0);
    			append(td0, t0);
    			append(tr, t1);
    			append(tr, td1);
    			append(td1, t2);
    			append(tr, t3);
    			append(tr, td2);
    			append(td2, t4);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.points) && t4_value !== (t4_value = ctx.points[ctx.i])) {
    				set_data(t4, t4_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(tr);
    			}
    		}
    	};
    }

    // (62:8) {#each range(21, 30) as i}
    function create_each_block_1(ctx) {
    	var tr, td0, t0_value = countryFlagEmoji_cjs.get(ctx.country_code[ctx.i]).emoji, t0, t1, td1, t2_value = ctx.name[ctx.i], t2, t3, td2, t4_value = ctx.points[ctx.i], t4;

    	return {
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
    			td0.className = "svelte-cctczq";
    			add_location(td0, file$1, 63, 10, 1722);
    			td1.className = "svelte-cctczq";
    			add_location(td1, file$1, 64, 10, 1788);
    			td2.className = "svelte-cctczq";
    			add_location(td2, file$1, 65, 10, 1817);
    			tr.className = "svelte-cctczq";
    			add_location(tr, file$1, 62, 8, 1707);
    		},

    		m: function mount(target, anchor) {
    			insert(target, tr, anchor);
    			append(tr, td0);
    			append(td0, t0);
    			append(tr, t1);
    			append(tr, td1);
    			append(td1, t2);
    			append(tr, t3);
    			append(tr, td2);
    			append(td2, t4);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.points) && t4_value !== (t4_value = ctx.points[ctx.i])) {
    				set_data(t4, t4_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(tr);
    			}
    		}
    	};
    }

    // (73:8) {#each range(31, 39) as i}
    function create_each_block(ctx) {
    	var tr, td0, t0_value = countryFlagEmoji_cjs.get(ctx.country_code[ctx.i]).emoji, t0, t1, td1, t2_value = ctx.name[ctx.i], t2, t3, td2, t4_value = ctx.points[ctx.i], t4;

    	return {
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
    			td0.className = "svelte-cctczq";
    			add_location(td0, file$1, 74, 10, 1983);
    			td1.className = "svelte-cctczq";
    			add_location(td1, file$1, 75, 10, 2049);
    			td2.className = "svelte-cctczq";
    			add_location(td2, file$1, 76, 10, 2078);
    			tr.className = "svelte-cctczq";
    			add_location(tr, file$1, 73, 8, 1968);
    		},

    		m: function mount(target, anchor) {
    			insert(target, tr, anchor);
    			append(tr, td0);
    			append(td0, t0);
    			append(tr, t1);
    			append(tr, td1);
    			append(td1, t2);
    			append(tr, t3);
    			append(tr, td2);
    			append(td2, t4);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.points) && t4_value !== (t4_value = ctx.points[ctx.i])) {
    				set_data(t4, t4_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(tr);
    			}
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var t0, div4, div0, table0, t1, div1, table1, t2, div2, table2, t3, div3, table3, t4, div5, p, t5, t6, t7, div6, button, current, dispose;

    	var navbar = new Navbar({ $$inline: true });

    	var each_value_3 = ctx.Array.from({length: 10}, func);

    	var each_blocks_3 = [];

    	for (var i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_3[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	var each_value_2 = range(11, 20);

    	var each_blocks_2 = [];

    	for (var i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	var each_value_1 = range(21, 30);

    	var each_blocks_1 = [];

    	for (var i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	var each_value = range(31, 39);

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			navbar.$$.fragment.c();
    			t0 = space();
    			div4 = element("div");
    			div0 = element("div");
    			table0 = element("table");

    			for (var i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			t1 = space();
    			div1 = element("div");
    			table1 = element("table");

    			for (var i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t2 = space();
    			div2 = element("div");
    			table2 = element("table");

    			for (var i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t3 = space();
    			div3 = element("div");
    			table3 = element("table");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			div5 = element("div");
    			p = element("p");
    			t5 = text("Points from ");
    			t6 = text(ctx.givesPoints);
    			t7 = space();
    			div6 = element("div");
    			button = element("button");
    			button.textContent = "Give points";
    			table0.className = "svelte-cctczq";
    			add_location(table0, file$1, 38, 4, 1105);
    			div0.className = "column svelte-cctczq";
    			add_location(div0, file$1, 37, 2, 1080);
    			table1.className = "svelte-cctczq";
    			add_location(table1, file$1, 49, 4, 1395);
    			div1.className = "column svelte-cctczq";
    			add_location(div1, file$1, 48, 2, 1370);
    			table2.className = "svelte-cctczq";
    			add_location(table2, file$1, 60, 4, 1656);
    			div2.className = "column svelte-cctczq";
    			add_location(div2, file$1, 59, 2, 1631);
    			table3.className = "svelte-cctczq";
    			add_location(table3, file$1, 71, 4, 1917);
    			div3.className = "column svelte-cctczq";
    			add_location(div3, file$1, 70, 2, 1892);
    			div4.className = "row svelte-cctczq";
    			add_location(div4, file$1, 36, 0, 1060);
    			p.className = "svelte-cctczq";
    			add_location(p, file$1, 84, 2, 2187);
    			div5.className = "points-text svelte-cctczq";
    			add_location(div5, file$1, 83, 0, 2159);
    			button.className = "svelte-cctczq";
    			add_location(button, file$1, 88, 2, 2253);
    			div6.className = "div-down svelte-cctczq";
    			add_location(div6, file$1, 87, 0, 2228);
    			dispose = listen(button, "click", ctx.click_handler);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert(target, t0, anchor);
    			insert(target, div4, anchor);
    			append(div4, div0);
    			append(div0, table0);

    			for (var i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(table0, null);
    			}

    			append(div4, t1);
    			append(div4, div1);
    			append(div1, table1);

    			for (var i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(table1, null);
    			}

    			append(div4, t2);
    			append(div4, div2);
    			append(div2, table2);

    			for (var i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(table2, null);
    			}

    			append(div4, t3);
    			append(div4, div3);
    			append(div3, table3);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table3, null);
    			}

    			insert(target, t4, anchor);
    			insert(target, div5, anchor);
    			append(div5, p);
    			append(p, t5);
    			append(p, t6);
    			insert(target, t7, anchor);
    			insert(target, div6, anchor);
    			append(div6, button);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.points || changed.Array || changed.name || changed.countryFlagEmoji || changed.country_code) {
    				each_value_3 = ctx.Array.from({length: 10}, func);

    				for (var i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_3[i]) {
    						each_blocks_3[i].p(changed, child_ctx);
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

    			if (changed.points || changed.range || changed.name || changed.countryFlagEmoji || changed.country_code) {
    				each_value_2 = range(11, 20);

    				for (var i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(changed, child_ctx);
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

    			if (changed.points || changed.range || changed.name || changed.countryFlagEmoji || changed.country_code) {
    				each_value_1 = range(21, 30);

    				for (var i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(changed, child_ctx);
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

    			if (changed.points || changed.range || changed.name || changed.countryFlagEmoji || changed.country_code) {
    				each_value = range(31, 39);

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
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

    			if (!current || changed.givesPoints) {
    				set_data(t6, ctx.givesPoints);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			navbar.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			navbar.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			navbar.$destroy(detaching);

    			if (detaching) {
    				detach(t0);
    				detach(div4);
    			}

    			destroy_each(each_blocks_3, detaching);

    			destroy_each(each_blocks_2, detaching);

    			destroy_each(each_blocks_1, detaching);

    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach(t4);
    				detach(div5);
    				detach(t7);
    				detach(div6);
    			}

    			dispose();
    		}
    	};
    }

    function func(_, i) {
    	return i + 1;
    }

    function instance($$self, $$props, $$invalidate) {
    	

      const participants = get(participantsArray);
      const pointFrom = get(pointFromArray);
      const votingLength = [...Array(pointFrom.length).keys()];

      let country_code = [];
      let name = [];
      let points = new Array(pointFrom.length).fill(0);
      let givesPoints = "";


      initalizeParticipants(participants, country_code, name);

      function andThePointsGoTo(array, index, name){
        const row = array[index];
        const object = row.Points;

        $$invalidate('givesPoints', givesPoints = row.Name);
        for (const property in object) {
          console.log(`${object[property]} points go to ${property}`);

          points[name.indexOf(property)] = points[name.indexOf(property)] + object[property]; $$invalidate('points', points);
        }

    }

    	function click_handler() {
    		return andThePointsGoTo(pointFrom, votingLength.pop(), name);
    	}

    	return {
    		pointFrom,
    		votingLength,
    		country_code,
    		name,
    		points,
    		givesPoints,
    		andThePointsGoTo,
    		Array,
    		click_handler
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment$1, safe_not_equal, []);
    	}
    }

    const app = new App({
      target: document.body,
      props: {}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
