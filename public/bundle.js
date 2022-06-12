
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
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function createEventDispatcher() {
        const component = current_component;
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
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
    let outros;
    function group_outros() {
        outros = {
            remaining: 0,
            callbacks: []
        };
    }
    function check_outros() {
        if (!outros.remaining) {
            run_all(outros.callbacks);
        }
    }
    function on_outro(callback) {
        outros.callbacks.push(callback);
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

    /* src/Navbar.svelte generated by Svelte v3.4.4 */

    const file = "src/Navbar.svelte";

    function create_fragment(ctx) {
    	var div, h1;

    	return {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Player Scoreboard";
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

    /* src/Player.svelte generated by Svelte v3.4.4 */

    const file$1 = "src/Player.svelte";

    // (31:25) {:else}
    function create_else_block(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("+");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (31:6) {#if showControls}
    function create_if_block_1(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("-");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (36:2) {#if showControls}
    function create_if_block(ctx) {
    	var button0, t1, button1, t3, input, dispose;

    	return {
    		c: function create() {
    			button0 = element("button");
    			button0.textContent = "+1";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "-1";
    			t3 = space();
    			input = element("input");
    			button0.className = "btn";
    			add_location(button0, file$1, 36, 4, 792);
    			button1.className = "btn btn-dark";
    			add_location(button1, file$1, 37, 4, 848);
    			attr(input, "type", "number");
    			add_location(input, file$1, 38, 4, 916);

    			dispose = [
    				listen(button0, "click", ctx.addPoint),
    				listen(button1, "click", ctx.removePoint),
    				listen(input, "input", ctx.input_input_handler)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert(target, button0, anchor);
    			insert(target, t1, anchor);
    			insert(target, button1, anchor);
    			insert(target, t3, anchor);
    			insert(target, input, anchor);

    			input.value = ctx.points;
    		},

    		p: function update(changed, ctx) {
    			if (changed.points) input.value = ctx.points;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(button0);
    				detach(t1);
    				detach(button1);
    				detach(t3);
    				detach(input);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var div, h1, t0, t1, t2, t3, button0, t4, button1, t6, h3, t7, t8, t9, dispose;

    	function select_block_type(ctx) {
    		if (ctx.showControls) return create_if_block_1;
    		return create_else_block;
    	}

    	var current_block_type = select_block_type(ctx);
    	var if_block0 = current_block_type(ctx);

    	var if_block1 = (ctx.showControls) && create_if_block(ctx);

    	return {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			t0 = text(ctx.flag);
    			t1 = space();
    			t2 = text(ctx.country);
    			t3 = space();
    			button0 = element("button");
    			if_block0.c();
    			t4 = space();
    			button1 = element("button");
    			button1.textContent = "x";
    			t6 = space();
    			h3 = element("h3");
    			t7 = text("Points: ");
    			t8 = text(ctx.points);
    			t9 = space();
    			if (if_block1) if_block1.c();
    			button0.className = "btn btn-sm";
    			add_location(button0, file$1, 29, 4, 551);
    			button1.className = "btn btn-danger btn-sm";
    			add_location(button1, file$1, 32, 4, 662);
    			h1.className = "svelte-1ekm9jl";
    			add_location(h1, file$1, 27, 2, 521);
    			h3.className = "svelte-1ekm9jl";
    			add_location(h3, file$1, 34, 2, 741);
    			div.className = "card";
    			add_location(div, file$1, 26, 0, 500);

    			dispose = [
    				listen(button0, "click", ctx.toggleControls),
    				listen(button1, "click", ctx.onDelete)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h1);
    			append(h1, t0);
    			append(h1, t1);
    			append(h1, t2);
    			append(h1, t3);
    			append(h1, button0);
    			if_block0.m(button0, null);
    			append(h1, t4);
    			append(h1, button1);
    			append(div, t6);
    			append(div, h3);
    			append(h3, t7);
    			append(h3, t8);
    			append(div, t9);
    			if (if_block1) if_block1.m(div, null);
    		},

    		p: function update(changed, ctx) {
    			if (changed.flag) {
    				set_data(t0, ctx.flag);
    			}

    			if (changed.country) {
    				set_data(t2, ctx.country);
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);
    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(button0, null);
    				}
    			}

    			if (changed.points) {
    				set_data(t8, ctx.points);
    			}

    			if (ctx.showControls) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if_block0.d();
    			if (if_block1) if_block1.d();
    			run_all(dispose);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();

      let { country, points, flag } = $$props;
      let showControls = false;

      const addPoint = () => { const $$result = (points += 1); $$invalidate('points', points); return $$result; };
      const removePoint = () => { const $$result = (points -= 1); $$invalidate('points', points); return $$result; };
      const toggleControls = () => { const $$result = (showControls = !showControls); $$invalidate('showControls', showControls); return $$result; };
       const onDelete = () => dispatch("removeplayer", country);

    	const writable_props = ['country', 'points', 'flag'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Player> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		points = to_number(this.value);
    		$$invalidate('points', points);
    	}

    	$$self.$set = $$props => {
    		if ('country' in $$props) $$invalidate('country', country = $$props.country);
    		if ('points' in $$props) $$invalidate('points', points = $$props.points);
    		if ('flag' in $$props) $$invalidate('flag', flag = $$props.flag);
    	};

    	return {
    		country,
    		points,
    		flag,
    		showControls,
    		addPoint,
    		removePoint,
    		toggleControls,
    		onDelete,
    		input_input_handler
    	};
    }

    class Player extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment$1, safe_not_equal, ["country", "points", "flag"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.country === undefined && !('country' in props)) {
    			console.warn("<Player> was created without expected prop 'country'");
    		}
    		if (ctx.points === undefined && !('points' in props)) {
    			console.warn("<Player> was created without expected prop 'points'");
    		}
    		if (ctx.flag === undefined && !('flag' in props)) {
    			console.warn("<Player> was created without expected prop 'flag'");
    		}
    	}

    	get country() {
    		throw new Error("<Player>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set country(value) {
    		throw new Error("<Player>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get points() {
    		throw new Error("<Player>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set points(value) {
    		throw new Error("<Player>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flag() {
    		throw new Error("<Player>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flag(value) {
    		throw new Error("<Player>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/AddPlayer.svelte generated by Svelte v3.4.4 */

    const file$2 = "src/AddPlayer.svelte";

    function create_fragment$2(ctx) {
    	var form, input0, t0, input1, t1, input2, dispose;

    	return {
    		c: function create() {
    			form = element("form");
    			input0 = element("input");
    			t0 = space();
    			input1 = element("input");
    			t1 = space();
    			input2 = element("input");
    			attr(input0, "type", "text");
    			input0.placeholder = "Player Name";
    			add_location(input0, file$2, 21, 2, 359);
    			attr(input1, "type", "number");
    			input1.placeholder = "Player Points";
    			add_location(input1, file$2, 22, 2, 437);
    			attr(input2, "type", "submit");
    			input2.className = "btn btn-primary";
    			input2.value = "Add Player";
    			add_location(input2, file$2, 23, 2, 518);
    			form.className = "grid-3";
    			add_location(form, file$2, 20, 0, 314);

    			dispose = [
    				listen(input0, "input", ctx.input0_input_handler),
    				listen(input1, "input", ctx.input1_input_handler),
    				listen(form, "submit", ctx.onSubmit)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, form, anchor);
    			append(form, input0);

    			input0.value = ctx.player.country;

    			append(form, t0);
    			append(form, input1);

    			input1.value = ctx.player.points;

    			append(form, t1);
    			append(form, input2);
    		},

    		p: function update(changed, ctx) {
    			if (changed.player && (input0.value !== ctx.player.country)) input0.value = ctx.player.country;
    			if (changed.player) input1.value = ctx.player.points;
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(form);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();

      let player = {
        name: "",
        points: 0
      };

      const onSubmit = e => {
        e.preventDefault();
        dispatch("addplayer", player);
        $$invalidate('player', player = {
          country: "",
          points: 0
        });
      };

    	function input0_input_handler() {
    		player.country = this.value;
    		$$invalidate('player', player);
    	}

    	function input1_input_handler() {
    		player.points = to_number(this.value);
    		$$invalidate('player', player);
    	}

    	return {
    		player,
    		onSubmit,
    		input0_input_handler,
    		input1_input_handler
    	};
    }

    class AddPlayer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$2, safe_not_equal, []);
    	}
    }

    var points = [
        {id:1, country:'Norway', country_code: 'NO', points: {'Sweden' : 1, 'Denmark' : 12}},
        {id:2, country:'Sweden', country_code: 'SE', points: {'Norway' : 1, 'Denmark' : 12}},
        {id:3, country:'Denmark', country_code: 'DK', points: {'Sweden' : 1, 'Norway' : 12}}
       ];

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

    const get = countryCode => {
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
      get
    };

    var countryFlagEmoji_cjs = index;

    /* src/App.svelte generated by Svelte v3.4.4 */

    const file$3 = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.player = list[i];
    	return child_ctx;
    }

    // (25:2) {:else}
    function create_else_block$1(ctx) {
    	var each_1_anchor, current;

    	var each_value = ctx.players;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	function outro_block(i, detaching, local) {
    		if (each_blocks[i]) {
    			if (detaching) {
    				on_outro(() => {
    					each_blocks[i].d(detaching);
    					each_blocks[i] = null;
    				});
    			}

    			each_blocks[i].o(local);
    		}
    	}

    	return {
    		c: function create() {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.countryFlagEmoji || changed.players) {
    				each_value = ctx.players;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						each_blocks[i].i(1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].i(1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();
    				for (; i < each_blocks.length; i += 1) outro_block(i, 1, 1);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) each_blocks[i].i();

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) outro_block(i, 0);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach(each_1_anchor);
    			}
    		}
    	};
    }

    // (23:2) {#if players.length === 0}
    function create_if_block$1(ctx) {
    	var p;

    	return {
    		c: function create() {
    			p = element("p");
    			p.textContent = "No Players";
    			add_location(p, file$3, 23, 4, 573);
    		},

    		m: function mount(target, anchor) {
    			insert(target, p, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(p);
    			}
    		}
    	};
    }

    // (26:4) {#each players as player}
    function create_each_block(ctx) {
    	var current;

    	var player = new Player({
    		props: {
    		flag: countryFlagEmoji_cjs.get(ctx.player.country_code).emoji,
    		country: ctx.player.country,
    		points: ctx.player.id
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			player.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(player, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var player_changes = {};
    			if (changed.countryFlagEmoji || changed.players) player_changes.flag = countryFlagEmoji_cjs.get(ctx.player.country_code).emoji;
    			if (changed.players) player_changes.country = ctx.player.country;
    			if (changed.players) player_changes.points = ctx.player.id;
    			player.$set(player_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			player.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			player.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			player.$destroy(detaching);
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	var t0, div, t1, current_block_type_index, if_block, current;

    	var navbar = new Navbar({ $$inline: true });

    	var addplayer = new AddPlayer({ $$inline: true });
    	addplayer.$on("addplayer", ctx.addPlayer);

    	var if_block_creators = [
    		create_if_block$1,
    		create_else_block$1
    	];

    	var if_blocks = [];

    	function select_block_type(ctx) {
    		if (ctx.players.length === 0) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c: function create() {
    			navbar.$$.fragment.c();
    			t0 = space();
    			div = element("div");
    			addplayer.$$.fragment.c();
    			t1 = space();
    			if_block.c();
    			div.className = "container";
    			add_location(div, file$3, 20, 0, 475);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert(target, t0, anchor);
    			insert(target, div, anchor);
    			mount_component(addplayer, div, null);
    			append(div, t1);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				on_outro(() => {
    					if_blocks[previous_block_index].d(1);
    					if_blocks[previous_block_index] = null;
    				});
    				if_block.o(1);
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				if_block.i(1);
    				if_block.m(div, null);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			navbar.$$.fragment.i(local);

    			addplayer.$$.fragment.i(local);

    			if (if_block) if_block.i();
    			current = true;
    		},

    		o: function outro(local) {
    			navbar.$$.fragment.o(local);
    			addplayer.$$.fragment.o(local);
    			if (if_block) if_block.o();
    			current = false;
    		},

    		d: function destroy(detaching) {
    			navbar.$destroy(detaching);

    			if (detaching) {
    				detach(t0);
    				detach(div);
    			}

    			addplayer.$destroy();

    			if_blocks[current_block_type_index].d();
    		}
    	};
    }

    function instance$2($$self) {
    	

      let players =  points;
      console.log(players);

       const addPlayer = e => {
         const newPlayer = e.detail;
      //   players = [...players, newPlayer];
      console.log(newPlayer);
      };

      console.log(countryFlagEmoji_cjs.data);

    	return { players, addPlayer };
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$3, safe_not_equal, []);
    	}
    }

    const app = new App({
      target: document.body,
      props: {}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
