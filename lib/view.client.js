if(typeof window != "undefined" && window !== null && window.name != 'nodejs'){/*
    http://www.JSON.org/json2.js
    2011-01-18

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false, regexp: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    "use strict";

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                this.getUTCFullYear()     + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate())      + 'T' +
                f(this.getUTCHours())     + ':' +
                f(this.getUTCMinutes())   + ':' +
                f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' : gap ?
                    '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                    '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' : gap ?
                '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

/*!
 * Amplify Store - Persistent Client-Side Storage @VERSION
 *
 * Copyright 2011 appendTo LLC. (http://appendto.com/team)
 * Dual licensed under the MIT or GPL licenses.
 * http://appendto.com/open-source-licenses
 *
 * http://amplifyjs.com
 */
(function( amplify, undefined ) {

// MooTools Compatibility
JSON.stringify = JSON.stringify||JSON.encode;
JSON.parse = JSON.parse||JSON.decode;

var store = amplify.store = function( key, value, options, type ) {
	var type = store.type;
	if ( options && options.type && options.type in store.types ) {
		type = options.type;
	}
	return store.types[ type ]( key, value, options || {} );
};

store.types = {};
store.type = null;
store.addType = function( type, storage ) {
	if ( !store.type ) {
		store.type = type;
	}

	store.types[ type ] = storage;
	store[ type ] = function( key, value, options ) {
		options = options || {};
		options.type = type;
		return store( key, value, options );
	};
}
store.error = function() {
	return "amplify.store quota exceeded";
};

function createSimpleStorage( storageType, storage ) {
	var values = storage.__amplify__ ? JSON.parse( storage.__amplify__ ) : {};
	store.addType( storageType, function( key, value, options ) {
		var ret = value,
			now = (new Date()).getTime(),
			storedValue,
			parsed;

		if ( !key ) {
			ret = {};
			for ( key in values ) {
				storedValue = storage[ key ];
				parsed = storedValue ? JSON.parse( storedValue ) : { expires: -1 };
				if ( parsed.expires && parsed.expires <= now ) {
					delete storage[ key ];
					delete values[ key ];
				} else {
					ret[ key.replace( /^__amplify__/, "" ) ] = parsed.data;
				}
			}
			storage.__amplify__ = JSON.stringify( values );
			return ret;
		}

		// protect against overwriting built-in properties
		key = "__amplify__" + key;

		if ( value === undefined ) {
			if ( values[ key ] ) {
				storedValue = storage[ key ];
				parsed = storedValue ? JSON.parse( storedValue ) : { expires: -1 };
				if ( parsed.expires && parsed.expires <= now ) {
					delete storage[ key ];
					delete values[ key ];
				} else {
					return parsed.data;
				}
			}
		} else {
			if ( value === null ) {
				delete storage[ key ];
				delete values[ key ];
			} else {
				parsed = JSON.stringify({
					data: value,
					expires: options.expires ? now + options.expires : null
				});
				try {
					storage[ key ] = parsed;
					values[ key ] = true;
				// quota exceeded
				} catch( error ) {
					// expire old data and try again
					store[ storageType ]();
					try {
						storage[ key ] = parsed;
						values[ key ] = true;
					} catch( error ) {
						throw store.error();
					}
				}
			}
		}

		storage.__amplify__ = JSON.stringify( values );
		return ret;
	});
}

// localStorage + sessionStorage
// IE 8+, Firefox 3.5+, Safari 4+, Chrome 4+, Opera 10.5+, iPhone 2+, Android 2+
for ( var webStorageType in { localStorage: 1, sessionStorage: 1 } ) {
	// try/catch for file protocol in Firefox
	try {
		if ( window[ webStorageType ].getItem ) {
			createSimpleStorage( webStorageType, window[ webStorageType ] );
		}
	} catch( e ) {}
}

// globalStorage
// non-standard: Firefox 2+
// https://developer.mozilla.org/en/dom/storage#globalStorage
if ( window.globalStorage ) {
  // try/catch for security exception from Firefox
  try {
  	createSimpleStorage( "globalStorage",
  		window.globalStorage[ window.location.hostname ] );
  	// Firefox 2.0 and 3.0 have sessionStorage and globalStorage
  	// make sure we defualt to globalStorage
  	// but don't default to globalStorage in 3.5+ which also has localStorage
  	if ( store.type === "sessionStorage" ) {
  		store.type = "globalStorage";
  	}
	} catch ( e ) {}
}

// userData
// non-standard: IE 5+
// http://msdn.microsoft.com/en-us/library/ms531424(v=vs.85).aspx
(function() {
	// append to html instead of body so we can do this from the head
	var div = document.createElement( "div" ),
		attrKey = "amplify",
		attrs;
	div.style.display = "none";
	document.getElementsByTagName( "head" )[ 0 ].appendChild( div );
	if ( div.addBehavior ) {
		div.addBehavior( "#default#userdata" );
		div.load( attrKey );
		attrs = div.getAttribute( attrKey ) ? JSON.parse( div.getAttribute( attrKey ) ) : {};

		store.addType( "userData", function( key, value, options ) {
			var ret = value,
				now = (new Date()).getTime(),
				attr,
				parsed,
				prevValue;

			if ( !key ) {
				ret = {};
				for ( key in attrs ) {
					attr = div.getAttribute( key );
					parsed = attr ? JSON.parse( attr ) : { expires: -1 };
					if ( parsed.expires && parsed.expires <= now ) {
						div.removeAttribute( key );
						delete attrs[ key ];
					} else {
						ret[ key ] = parsed.data;
					}
				}
				div.setAttribute( attrKey, JSON.stringify( attrs ) );
				div.save( attrKey );
				return ret;
			}

			// convert invalid characters to dashes
			// http://www.w3.org/TR/REC-xml/#NT-Name
			// simplified to assume the starting character is valid
			// also removed colon as it is invalid in HTML attribute names
			key = key.replace( /[^-._0-9A-Za-z\xb7\xc0-\xd6\xd8-\xf6\xf8-\u037d\u37f-\u1fff\u200c-\u200d\u203f\u2040\u2070-\u218f]/g, "-" );

			if ( value === undefined ) {
				if ( key in attrs ) {
					attr = div.getAttribute( key );
					parsed = attr ? JSON.parse( attr ) : { expires: -1 };
					if ( parsed.expires && parsed.expires <= now ) {
						div.removeAttribute( key );
						delete attrs[ key ];
					} else {
						return parsed.data;
					}
				}
			} else {
				if ( value === null ) {
					div.removeAttribute( key );
					delete attrs[ key ];
				} else {
					// we need to get the previous value in case we need to rollback
					prevValue = div.getAttribute( key );
					parsed = JSON.stringify({
						data: value,
						expires: (options.expires ? (now + options.expires) : null)
					});
					div.setAttribute( key, parsed );
					attrs[ key ] = true;
				}
			}

			div.setAttribute( attrKey, JSON.stringify( attrs ) );
			try {
				div.save( attrKey );
			// quota exceeded
			} catch ( error ) {
				// roll the value back to the previous value
				if ( prevValue === null ) {
					div.removeAttribute( key );
					delete attrs[ key ];
				} else {
					div.setAttribute( key, prevValue );
				}

				// expire old data and try again
				store.userData();
				try {
					div.setAttribute( key, parsed );
					attrs[ key ] = true;
					div.save( attrKey );
				} catch ( error ) {
					// roll the value back to the previous value
					if ( prevValue === null ) {
						div.removeAttribute( key );
						delete attrs[ key ];
					} else {
						div.setAttribute( key, prevValue );
					}
					throw store.error();
				}
			}
			return ret;
		});
	}
}() );

// in-memory storage
// fallback for all browsers to enable the API even if we can't persist data
createSimpleStorage( "memory", {} );

}( this.amplify = this.amplify || {} ) );

/**
 * History.js Core
 * @author Benjamin Arthur Lupton <contact@balupton.com>
 * @copyright 2010-2011 Benjamin Arthur Lupton <contact@balupton.com>
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */

(function(window,undefined){
	"use strict";

	// --------------------------------------------------------------------------
	// Initialise

	// Localise Globals
	var
		console = window.console||undefined, // Prevent a JSLint complain
		document = window.document, // Make sure we are using the correct document
		navigator = window.navigator, // Make sure we are using the correct navigator
		amplify = window.amplify||false, // Amplify.js
		setTimeout = window.setTimeout,
		clearTimeout = window.clearTimeout,
		setInterval = window.setInterval,
		JSON = window.JSON,
		History = window.History = window.History||{}, // Public History Object
		history = window.history; // Old History Object

	// MooTools Compatibility
	JSON.stringify = JSON.stringify||JSON.encode;
	JSON.parse = JSON.parse||JSON.decode;

	// Check Existence
	if ( typeof History.init !== 'undefined' ) {
		throw new Error('History.js Core has already been loaded...');
	}

	// Initialise History
	History.init = function(){
		// Check Load Status of Adapter
		if ( typeof History.Adapter === 'undefined' ) {
			return false;
		}

		// Check Load Status of Core
		if ( typeof History.initCore !== 'undefined' ) {
			History.initCore();
		}

		// Check Load Status of HTML4 Support
		if ( typeof History.initHtml4 !== 'undefined' ) {
			History.initHtml4();
		}

		// Return true
		return true;
	};

	// --------------------------------------------------------------------------
	// Initialise Core

	// Initialise Core
	History.initCore = function(){
		// Initialise
		if ( typeof History.initCore.initialized !== 'undefined' ) {
			// Already Loaded
			return false;
		}
		else {
			History.initCore.initialized = true;
		}

		// ----------------------------------------------------------------------
		// Options

		/**
		 * History.options
		 * Configurable options
		 */
		History.options = History.options||{};

		/**
		 * History.options.hashChangeInterval
		 * How long should the interval be before hashchange checks
		 */
		History.options.hashChangeInterval = History.options.hashChangeInterval || 100;

		/**
		 * History.options.safariPollInterval
		 * How long should the interval be before safari poll checks
		 */
		History.options.safariPollInterval = History.options.safariPollInterval || 500;

		/**
		 * History.options.doubleCheckInterval
		 * How long should the interval be before we perform a double check
		 */
		History.options.doubleCheckInterval = History.options.doubleCheckInterval || 500;

		/**
		 * History.options.storeInterval
		 * How long should we wait between store calls
		 */
		History.options.storeInterval = History.options.storeInterval || 1000;

		/**
		 * History.options.busyDelay
		 * How long should we wait between busy events
		 */
		History.options.busyDelay = History.options.busyDelay || 250;

		/**
		 * History.options.debug
		 * If true will enable debug messages to be logged
		 */
		History.options.debug = History.options.debug || false;

		/**
		 * History.options.initialTitle
		 * What is the title of the initial state
		 */
		History.options.initialTitle = History.options.initialTitle || document.title;


		// ----------------------------------------------------------------------
		// Debug

		/**
		 * History.debug(message,...)
		 * Logs the passed arguments if debug enabled
		 */
		History.debug = function(){
			if ( (History.options.debug||false) ) {
				History.log.apply(History,arguments);
			}
		};

		/**
		 * History.log(message,...)
		 * Logs the passed arguments
		 */
		History.log = function(){
			// Prepare
			var
				consoleExists = !(typeof console === 'undefined' || typeof console.log === 'undefined' || typeof console.log.apply === 'undefined'),
				textarea = document.getElementById('log'),
				message,
				i,n
				;

			// Write to Console
			if ( consoleExists ) {
				var args = Array.prototype.slice.call(arguments);
				message = args.shift();
				if ( typeof console.debug !== 'undefined' ) {
					console.debug.apply(console,[message,args]);
				}
				else {
					console.log.apply(console,[message,args]);
				}
			}
			else {
				message = ("\n"+arguments[0]+"\n");
			}

			// Write to log
			for ( i=1,n=arguments.length; i<n; ++i ) {
				var arg = arguments[i];
				if ( typeof arg === 'object' && typeof JSON !== 'undefined' ) {
					try {
						arg = JSON.stringify(arg);
					}
					catch ( Exception ) {
						// Recursive Object
					}
				}
				message += "\n"+arg+"\n";
			}

			// Textarea
			if ( textarea ) {
				textarea.value += message+"\n-----\n";
				textarea.scrollTop = textarea.scrollHeight - textarea.clientHeight;
			}
			// No Textarea, No Console
			else if ( !consoleExists ) {
				alert(message);
			}

			// Return true
			return true;
		};

		// ----------------------------------------------------------------------
		// Emulated Status

		/**
		 * History.getInternetExplorerMajorVersion()
		 * Get's the major version of Internet Explorer
		 * @return {integer}
		 * @license Public Domain
		 * @author Benjamin Arthur Lupton <contact@balupton.com>
		 * @author James Padolsey <https://gist.github.com/527683>
		 */
		History.getInternetExplorerMajorVersion = function(){
			var result = History.getInternetExplorerMajorVersion.cached =
					(typeof History.getInternetExplorerMajorVersion.cached !== 'undefined')
				?	History.getInternetExplorerMajorVersion.cached
				:	(function(){
						var v = 3,
								div = document.createElement('div'),
								all = div.getElementsByTagName('i');
						while ( (div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->') && all[0] ) {}
						return (v > 4) ? v : false;
					})()
				;
			return result;
		};

		/**
		 * History.isInternetExplorer()
		 * Are we using Internet Explorer?
		 * @return {boolean}
		 * @license Public Domain
		 * @author Benjamin Arthur Lupton <contact@balupton.com>
		 */
		History.isInternetExplorer = function(){
			var result =
				History.isInternetExplorer.cached =
				(typeof History.isInternetExplorer.cached !== 'undefined')
					?	History.isInternetExplorer.cached
					:	Boolean(History.getInternetExplorerMajorVersion())
				;
			return result;
		};

		/**
		 * History.emulated
		 * Which features require emulating?
		 */
		History.emulated = {
			pushState: !Boolean(
				window.history && window.history.pushState && window.history.replaceState
				&& !(
					(/ Mobile\/([1-7][a-z]|(8([abcde]|f(1[0-8]))))/i).test(navigator.userAgent) /* disable for versions of iOS before version 4.3 (8F190) */
					|| (/AppleWebKit\/5([0-2]|3[0-2])/i).test(navigator.userAgent) /* disable for the mercury iOS browser, or at least older versions of the webkit engine */
				)
			),
			hashChange: Boolean(
				!(('onhashchange' in window) || ('onhashchange' in document))
				||
				(History.isInternetExplorer() && History.getInternetExplorerMajorVersion() < 8)
			)
		};

		/**
		 * History.enabled
		 * Is History enabled?
		 */
		History.enabled = !History.emulated.pushState;

		/**
		 * History.bugs
		 * Which bugs are present
		 */
		History.bugs = {
			/**
			 * Safari 5 and Safari iOS 4 fail to return to the correct state once a hash is replaced by a `replaceState` call
			 * https://bugs.webkit.org/show_bug.cgi?id=56249
			 */
			setHash: Boolean(!History.emulated.pushState && navigator.vendor === 'Apple Computer, Inc.' && /AppleWebKit\/5([0-2]|3[0-3])/.test(navigator.userAgent)),

			/**
			 * Safari 5 and Safari iOS 4 sometimes fail to apply the state change under busy conditions
			 * https://bugs.webkit.org/show_bug.cgi?id=42940
			 */
			safariPoll: Boolean(!History.emulated.pushState && navigator.vendor === 'Apple Computer, Inc.' && /AppleWebKit\/5([0-2]|3[0-3])/.test(navigator.userAgent)),

			/**
			 * MSIE 6 and 7 sometimes do not apply a hash even it was told to (requiring a second call to the apply function)
			 */
			ieDoubleCheck: Boolean(History.isInternetExplorer() && History.getInternetExplorerMajorVersion() < 8),

			/**
			 * MSIE 6 requires the entire hash to be encoded for the hashes to trigger the onHashChange event
			 */
			hashEscape: Boolean(History.isInternetExplorer() && History.getInternetExplorerMajorVersion() < 7)
		};

		/**
		 * History.isEmptyObject(obj)
		 * Checks to see if the Object is Empty
		 * @param {Object} obj
		 * @return {boolean}
		 */
		History.isEmptyObject = function(obj) {
			for ( var name in obj ) {
				return false;
			}
			return true;
		};

		/**
		 * History.cloneObject(obj)
		 * Clones a object
		 * @param {Object} obj
		 * @return {Object}
		 */
		History.cloneObject = function(obj) {
			var hash,newObj;
			if ( obj ) {
				hash = JSON.stringify(obj);
				newObj = JSON.parse(hash);
			}
			else {
				newObj = {};
			}
			return newObj;
		};

		// ----------------------------------------------------------------------
		// URL Helpers

		/**
		 * History.getRootUrl()
		 * Turns "http://mysite.com/dir/page.html?asd" into "http://mysite.com"
		 * @return {String} rootUrl
		 */
		History.getRootUrl = function(){
			// Create
			var rootUrl = document.location.protocol+'//'+(document.location.hostname||document.location.host);
			if ( document.location.port||false ) {
				rootUrl += ':'+document.location.port;
			}
			rootUrl += '/';

			// Return
			return rootUrl;
		};

		/**
		 * History.getBaseHref()
		 * Fetches the `href` attribute of the `<base href="...">` element if it exists
		 * @return {String} baseHref
		 */
		History.getBaseHref = function(){
			// Create
			var
				baseElements = document.getElementsByTagName('base'),
				baseElement = null,
				baseHref = '';

			// Test for Base Element
			if ( baseElements.length === 1 ) {
				// Prepare for Base Element
				baseElement = baseElements[0];
				baseHref = baseElement.href.replace(/[^\/]+$/,'');
			}

			// Adjust trailing slash
			baseHref = baseHref.replace(/\/+$/,'');
			if ( baseHref ) baseHref += '/';

			// Return
			return baseHref;
		};

		/**
		 * History.getBaseUrl()
		 * Fetches the baseHref or basePageUrl or rootUrl (whichever one exists first)
		 * @return {String} baseUrl
		 */
		History.getBaseUrl = function(){
			// Create
			var baseUrl = History.getBaseHref()||History.getBasePageUrl()||History.getRootUrl();

			// Return
			return baseUrl;
		};

		/**
		 * History.getPageUrl()
		 * Fetches the URL of the current page
		 * @return {String} pageUrl
		 */
		History.getPageUrl = function(){
			// Fetch
			var
				State = History.getState(false,false),
				stateUrl = (State||{}).url||document.location.href;

			// Create
			var pageUrl = stateUrl.replace(/\/+$/,'').replace(/[^\/]+$/,function(part,index,string){
				return (/\./).test(part) ? part : part+'/';
			});

			// Return
			return pageUrl;
		};

		/**
		 * History.getBasePageUrl()
		 * Fetches the Url of the directory of the current page
		 * @return {String} basePageUrl
		 */
		History.getBasePageUrl = function(){
			// Create
			var basePageUrl = document.location.href.replace(/[#\?].*/,'').replace(/[^\/]+$/,function(part,index,string){
				return (/[^\/]$/).test(part) ? '' : part;
			}).replace(/\/+$/,'')+'/';

			// Return
			return basePageUrl;
		};

		/**
		 * History.getFullUrl(url)
		 * Ensures that we have an absolute URL and not a relative URL
		 * @param {string} url
		 * @param {Boolean} allowBaseHref
		 * @return {string} fullUrl
		 */
		History.getFullUrl = function(url,allowBaseHref){
			// Prepare
			var fullUrl = url, firstChar = url.substring(0,1);
			allowBaseHref = (typeof allowBaseHref === 'undefined') ? true : allowBaseHref;

			// Check
			if ( /[a-z]+\:\/\//.test(url) ) {
				// Full URL
			}
			else if ( firstChar === '/' ) {
				// Root URL
				fullUrl = History.getRootUrl()+url.replace(/^\/+/,'');
			}
			else if ( firstChar === '#' ) {
				// Anchor URL
				fullUrl = History.getPageUrl().replace(/#.*/,'')+url;
			}
			else if ( firstChar === '?' ) {
				// Query URL
				fullUrl = History.getPageUrl().replace(/[\?#].*/,'')+url;
			}
			else {
				// Relative URL
				if ( allowBaseHref ) {
					fullUrl = History.getBaseUrl()+url.replace(/^(\.\/)+/,'');
				} else {
					fullUrl = History.getBasePageUrl()+url.replace(/^(\.\/)+/,'');
				}
				// We have an if condition above as we do not want hashes
				// which are relative to the baseHref in our URLs
				// as if the baseHref changes, then all our bookmarks
				// would now point to different locations
				// whereas the basePageUrl will always stay the same
			}

			// Return
			return fullUrl.replace(/\#$/,'');
		};

		/**
		 * History.getShortUrl(url)
		 * Ensures that we have a relative URL and not a absolute URL
		 * @param {string} url
		 * @return {string} url
		 */
		History.getShortUrl = function(url){
			// Prepare
			var shortUrl = url, baseUrl = History.getBaseUrl(), rootUrl = History.getRootUrl();

			// Trim baseUrl
			if ( History.emulated.pushState ) {
				// We are in a if statement as when pushState is not emulated
				// The actual url these short urls are relative to can change
				// So within the same session, we the url may end up somewhere different
				shortUrl = shortUrl.replace(baseUrl,'');
			}

			// Trim rootUrl
			shortUrl = shortUrl.replace(rootUrl,'/');

			// Ensure we can still detect it as a state
			if ( History.isTraditionalAnchor(shortUrl) ) {
				shortUrl = './'+shortUrl;
			}

			// Clean It
			shortUrl = shortUrl.replace(/^(\.\/)+/g,'./').replace(/\#$/,'');

			// Return
			return shortUrl;
		};

		// ----------------------------------------------------------------------
		// State Storage

		/**
		 * History.store
		 * The store for all session specific data
		 */
		History.store = amplify ? (amplify.store('History.store')||{}) : {};
		History.store.idToState = History.store.idToState||{};
		History.store.urlToId = History.store.urlToId||{};
		History.store.stateToId = History.store.stateToId||{};

		/**
		 * History.idToState
		 * 1-1: State ID to State Object
		 */
		History.idToState = History.idToState||{};

		/**
		 * History.stateToId
		 * 1-1: State String to State ID
		 */
		History.stateToId = History.stateToId||{};

		/**
		 * History.urlToId
		 * 1-1: State URL to State ID
		 */
		History.urlToId = History.urlToId||{};

		/**
		 * History.storedStates
		 * Store the states in an array
		 */
		History.storedStates = History.storedStates||[];

		/**
		 * History.savedStates
		 * Saved the states in an array
		 */
		History.savedStates = History.savedStates||[];

		/**
		 * History.getState()
		 * Get an object containing the data, title and url of the current state
		 * @param {Boolean} friendly
		 * @param {Boolean} create
		 * @return {Object} State
		 */
		History.getState = function(friendly,create){
			// Prepare
			if ( typeof friendly === 'undefined' ) { friendly = true; }
			if ( typeof create === 'undefined' ) { create = true; }

			// Fetch
			var State = History.getLastSavedState();

			// Create
			if ( !State && create ) {
				State = History.createStateObject();
			}

			// Adjust
			if ( friendly ) {
				State = History.cloneObject(State);
				State.url = State.cleanUrl||State.url;
			}

			// Return
			return State;
		};

		/**
		 * History.getIdByState(State)
		 * Gets a ID for a State
		 * @param {State} newState
		 * @return {String} id
		 */
		History.getIdByState = function(newState){

			// Fetch ID
			var id = History.extractId(newState.url);
			if ( !id ) {
				// Find ID via State String
				var str = History.getStateString(newState);
				if ( typeof History.stateToId[str] !== 'undefined' ) {
					id = History.stateToId[str];
				}
				else if ( typeof History.store.stateToId[str] !== 'undefined' ) {
					id = History.store.stateToId[str];
				}
				else {
					// Generate a new ID
					while ( true ) {
						id = String(Math.floor(Math.random()*1000));
						if ( typeof History.idToState[id] === 'undefined' && typeof History.store.idToState[id] === 'undefined' ) {
							break;
						}
					}

					// Apply the new State to the ID
					History.stateToId[str] = id;
					History.idToState[id] = newState;
				}
			}

			// Return ID
			return id;
		};

		/**
		 * History.normalizeState(State)
		 * Expands a State Object
		 * @param {object} State
		 * @return {object}
		 */
		History.normalizeState = function(oldState){
			// Prepare
			if ( !oldState || (typeof oldState !== 'object') ) {
				oldState = {};
			}

			// Check
			if ( typeof oldState.normalized !== 'undefined' ) {
				return oldState;
			}

			// Adjust
			if ( !oldState.data || (typeof oldState.data !== 'object') ) {
				oldState.data = {};
			}

			// ----------------------------------------------------------------------

			// Create
			var newState = {};
			newState.normalized = true;
			newState.title = oldState.title||'';
			newState.url = History.getFullUrl(History.unescapeString(oldState.url||document.location.href));
			newState.hash = History.getShortUrl(newState.url);
			newState.data = History.cloneObject(oldState.data);

			// Fetch ID
			newState.id = History.getIdByState(newState);

			// ----------------------------------------------------------------------

			// Clean the URL
			newState.cleanUrl = newState.url.replace(/\??\&_suid.*/,'');
			newState.url = newState.cleanUrl;

			// Check to see if we have more than just a url
			var dataNotEmpty = !History.isEmptyObject(newState.data);

			// Apply
			if ( newState.title || dataNotEmpty ) {
				// Add ID to Hash
				newState.hash = History.getShortUrl(newState.url).replace(/\??\&_suid.*/,'');
				if ( !/\?/.test(newState.hash) ) {
					newState.hash += '?';
				}
				newState.hash += '&_suid='+newState.id;
			}

			// Create the Hashed URL
			newState.hashedUrl = History.getFullUrl(newState.hash);

			// ----------------------------------------------------------------------

			// Update the URL if we have a duplicate
			if ( (History.emulated.pushState || History.bugs.safariPoll) && History.hasUrlDuplicate(newState) ) {
				newState.url = newState.hashedUrl;
			}

			// ----------------------------------------------------------------------

			// Return
			return newState;
		};

		/**
		 * History.createStateObject(data,title,url)
		 * Creates a object based on the data, title and url state params
		 * @param {object} data
		 * @param {string} title
		 * @param {string} url
		 * @return {object}
		 */
		History.createStateObject = function(data,title,url){
			// Hashify
			var State = {
				'data': data,
				'title': title,
				'url': url
			};

			// Expand the State
			State = History.normalizeState(State);

			// Return object
			return State;
		};

		/**
		 * History.getStateById(id)
		 * Get a state by it's UID
		 * @param {String} id
		 */
		History.getStateById = function(id){
			// Prepare
			id = String(id);

			// Retrieve
			var State = History.idToState[id] || History.store.idToState[id] || undefined;

			// Return State
			return State;
		};

		/**
		 * Get a State's String
		 * @param {State} passedState
		 */
		History.getStateString = function(passedState){
			// Prepare
			var State = History.normalizeState(passedState);

			// Clean
			var cleanedState = {
				data: State.data,
				title: passedState.title,
				url: passedState.url
			};

			// Fetch
			var str = JSON.stringify(cleanedState);

			// Return
			return str;
		};

		/**
		 * Get a State's ID
		 * @param {State} passedState
		 * @return {String} id
		 */
		History.getStateId = function(passedState){
			// Prepare
			var State = History.normalizeState(passedState);

			// Fetch
			var id = State.id;

			// Return
			return id;
		};

		/**
		 * History.getHashByState(State)
		 * Creates a Hash for the State Object
		 * @param {State} passedState
		 * @return {String} hash
		 */
		History.getHashByState = function(passedState){
			// Prepare
			var hash, State = History.normalizeState(passedState);

			// Fetch
			hash = State.hash;

			// Return
			return hash;
		};

		/**
		 * History.extractId(url_or_hash)
		 * Get a State ID by it's URL or Hash
		 * @param {string} url_or_hash
		 * @return {string} id
		 */
		History.extractId = function ( url_or_hash ) {
			// Prepare
			var id;

			// Extract
			var parts,url;
			parts = /(.*)\&_suid=([0-9]+)$/.exec(url_or_hash);
			url = parts ? (parts[1]||url_or_hash) : url_or_hash;
			id = parts ? String(parts[2]||'') : '';

			// Return
			return id||false;
		};

		/**
		 * History.isTraditionalAnchor
		 * Checks to see if the url is a traditional anchor or not
		 * @param {String} url_or_hash
		 * @return {Boolean}
		 */
		History.isTraditionalAnchor = function(url_or_hash){
			// Check
			var isTraditional = !(/[\/\?\.]/.test(url_or_hash));

			// Return
			return isTraditional;
		};

		/**
		 * History.extractState
		 * Get a State by it's URL or Hash
		 * @param {String} url_or_hash
		 * @return {State|null}
		 */
		History.extractState = function(url_or_hash,create){
			// Prepare
			var State = null;
			create = create||false;

			// Fetch SUID
			var id = History.extractId(url_or_hash);
			if ( id ) {
				State = History.getStateById(id);
			}

			// Fetch SUID returned no State
			if ( !State ) {
				// Fetch URL
				var url = History.getFullUrl(url_or_hash);

				// Check URL
				id = History.getIdByUrl(url)||false;
				if ( id ) {
					State = History.getStateById(id);
				}

				// Create State
				if ( !State && create && !History.isTraditionalAnchor(url_or_hash) ) {
					State = History.createStateObject(null,null,url);
				}
			}

			// Return
			return State;
		};

		/**
		 * History.getIdByUrl()
		 * Get a State ID by a State URL
		 */
		History.getIdByUrl = function(url){
			// Fetch
			var id = History.urlToId[url] || History.store.urlToId[url] || undefined;

			// Return
			return id;
		};

		/**
		 * History.getLastSavedState()
		 * Get an object containing the data, title and url of the current state
		 * @return {Object} State
		 */
		History.getLastSavedState = function(){
			return History.savedStates[History.savedStates.length-1]||undefined;
		};

		/**
		 * History.getLastStoredState()
		 * Get an object containing the data, title and url of the current state
		 * @return {Object} State
		 */
		History.getLastStoredState = function(){
			return History.storedStates[History.storedStates.length-1]||undefined;
		};

		/**
		 * History.hasUrlDuplicate
		 * Checks if a Url will have a url conflict
		 * @param {Object} newState
		 * @return {Boolean} hasDuplicate
		 */
		History.hasUrlDuplicate = function(newState) {
			// Prepare
			var hasDuplicate = false;

			// Fetch
			var oldState = History.extractState(newState.url);

			// Check
			hasDuplicate = oldState && oldState.id !== newState.id;

			// Return
			return hasDuplicate;
		};

		/**
		 * History.storeState
		 * Store a State
		 * @param {Object} newState
		 * @return {Object} newState
		 */
		History.storeState = function(newState){
			// Store the State
			History.urlToId[newState.url] = newState.id;

			// Push the State
			History.storedStates.push(History.cloneObject(newState));

			// Return newState
			return newState;
		};

		/**
		 * History.isLastSavedState(newState)
		 * Tests to see if the state is the last state
		 * @param {Object} newState
		 * @return {boolean} isLast
		 */
		History.isLastSavedState = function(newState){
			// Prepare
			var isLast = false;

			// Check
			if ( History.savedStates.length ) {
				var
					newId = newState.id,
					oldState = History.getLastSavedState(),
					oldId = oldState.id;

				// Check
				isLast = (newId === oldId);
			}

			// Return
			return isLast;
		};

		/**
		 * History.saveState
		 * Push a State
		 * @param {Object} newState
		 * @return {boolean} changed
		 */
		History.saveState = function(newState){
			// Check Hash
			if ( History.isLastSavedState(newState) ) {
				return false;
			}

			// Push the State
			History.savedStates.push(History.cloneObject(newState));

			// Return true
			return true;
		};

		/**
		 * History.getStateByIndex()
		 * Gets a state by the index
		 * @param {integer} index
		 * @return {Object}
		 */
		History.getStateByIndex = function(index){
			// Prepare
			var State = null;

			// Handle
			if ( typeof index === 'undefined' ) {
				// Get the last inserted
				State = History.savedStates[History.savedStates.length-1];
			}
			else if ( index < 0 ) {
				// Get from the end
				State = History.savedStates[History.savedStates.length+index];
			}
			else {
				// Get from the beginning
				State = History.savedStates[index];
			}

			// Return State
			return State;
		};

		// ----------------------------------------------------------------------
		// Hash Helpers

		/**
		 * History.getHash()
		 * Gets the current document hash
		 * @return {string}
		 */
		History.getHash = function(){
			var hash = History.unescapeHash(document.location.hash);
			return hash;
		};

		/**
		 * History.unescapeString()
		 * Unescape a string
		 * @param {String} str
		 * @return {string}
		 */
		History.unescapeString = function(str){
			// Prepare
			var result = str;

			// Unescape hash
			var tmp;
			while ( true ) {
				tmp = window.unescape(result);
				if ( tmp === result ) {
					break;
				}
				result = tmp;
			}

			// Return result
			return result;
		};

		/**
		 * History.unescapeHash()
		 * normalize and Unescape a Hash
		 * @param {String} hash
		 * @return {string}
		 */
		History.unescapeHash = function(hash){
			// Prepare
			var result = History.normalizeHash(hash);

			// Unescape hash
			result = History.unescapeString(result);

			// Return result
			return result;
		};

		/**
		 * History.normalizeHash()
		 * normalize a hash across browsers
		 * @return {string}
		 */
		History.normalizeHash = function(hash){
			var result = hash.replace(/[^#]*#/,'').replace(/#.*/, '');

			// Return result
			return result;
		};

		/**
		 * History.setHash(hash)
		 * Sets the document hash
		 * @param {string} hash
		 * @return {History}
		 */
		History.setHash = function(hash,queue){
			// Handle Queueing
			if ( queue !== false && History.busy() ) {
				// Wait + Push to Queue
				//History.debug('History.setHash: we must wait', arguments);
				History.pushQueue({
					scope: History,
					callback: History.setHash,
					args: arguments,
					queue: queue
				});
				return false;
			}

			// Log
			//History.debug('History.setHash: called',hash);

			// Prepare
			var adjustedHash = History.escapeHash(hash);

			// Make Busy + Continue
			History.busy(true);

			// Check if hash is a state
			var State = History.extractState(hash,true);
			if ( State && !History.emulated.pushState ) {
				// Hash is a state so skip the setHash
				//History.debug('History.setHash: Hash is a state so skipping the hash set with a direct pushState call',arguments);

				// PushState
				History.pushState(State.data,State.title,State.url,false);
			}
			else if ( document.location.hash !== adjustedHash ) {
				// Hash is a proper hash, so apply it

				// Handle browser bugs
				if ( History.bugs.setHash ) {
					// Fix Safari Bug https://bugs.webkit.org/show_bug.cgi?id=56249

					// Fetch the base page
					var pageUrl = History.getPageUrl();

					// Safari hash apply
					History.pushState(null,null,pageUrl+'#'+adjustedHash,false);
				}
				else {
					// Normal hash apply
					document.location.hash = adjustedHash;
				}
			}

			// Chain
			return History;
		};

		/**
		 * History.escape()
		 * normalize and Escape a Hash
		 * @return {string}
		 */
		History.escapeHash = function(hash){
			var result = History.normalizeHash(hash);

			// Escape hash
			result = window.escape(result);

			// IE6 Escape Bug
			if ( !History.bugs.hashEscape ) {
				// Restore common parts
				result = result
					.replace(/\%21/g,'!')
					.replace(/\%26/g,'&')
					.replace(/\%3D/g,'=')
					.replace(/\%3F/g,'?');
			}

			// Return result
			return result;
		};

		/**
		 * History.getHashByUrl(url)
		 * Extracts the Hash from a URL
		 * @param {string} url
		 * @return {string} url
		 */
		History.getHashByUrl = function(url){
			// Extract the hash
			var hash = String(url)
				.replace(/([^#]*)#?([^#]*)#?(.*)/, '$2')
				;

			// Unescape hash
			hash = History.unescapeHash(hash);

			// Return hash
			return hash;
		};

		/**
		 * History.setTitle(title)
		 * Applies the title to the document
		 * @param {State} newState
		 * @return {Boolean}
		 */
		History.setTitle = function(newState){
			// Prepare
			var title = newState.title;

			// Initial
			if ( !title ) {
				var firstState = History.getStateByIndex(0);
				if ( firstState && firstState.url === newState.url ) {
					title = firstState.title||History.options.initialTitle;
				}
			}

			// Apply
			try {
				document.getElementsByTagName('title')[0].innerHTML = title.replace('<','&lt;').replace('>','&gt;').replace(' & ',' &amp; ');
			}
			catch ( Exception ) { }
			document.title = title;

			// Chain
			return History;
		};

		// ----------------------------------------------------------------------
		// Queueing

		/**
		 * History.queues
		 * The list of queues to use
		 * First In, First Out
		 */
		History.queues = [];

		/**
		 * History.busy(value)
		 * @param {boolean} value [optional]
		 * @return {boolean} busy
		 */
		History.busy = function(value){
			// Apply
			if ( typeof value !== 'undefined' ) {
				//History.debug('History.busy: changing ['+(History.busy.flag||false)+'] to ['+(value||false)+']', History.queues.length);
				History.busy.flag = value;
			}
			// Default
			else if ( typeof History.busy.flag === 'undefined' ) {
				History.busy.flag = false;
			}

			// Queue
			if ( !History.busy.flag ) {
				// Execute the next item in the queue
				clearTimeout(History.busy.timeout);
				var fireNext = function(){
					if ( History.busy.flag ) return;
					for ( var i=History.queues.length-1; i >= 0; --i ) {
						var queue = History.queues[i];
						if ( queue.length === 0 ) continue;
						var item = queue.shift();
						History.fireQueueItem(item);
						History.busy.timeout = setTimeout(fireNext,History.options.busyDelay);
					}
				};
				History.busy.timeout = setTimeout(fireNext,History.options.busyDelay);
			}

			// Return
			return History.busy.flag;
		};

		/**
		 * History.fireQueueItem(item)
		 * Fire a Queue Item
		 * @param {Object} item
		 * @return {Mixed} result
		 */
		History.fireQueueItem = function(item){
			return item.callback.apply(item.scope||History,item.args||[]);
		};

		/**
		 * History.pushQueue(callback,args)
		 * Add an item to the queue
		 * @param {Object} item [scope,callback,args,queue]
		 */
		History.pushQueue = function(item){
			// Prepare the queue
			History.queues[item.queue||0] = History.queues[item.queue||0]||[];

			// Add to the queue
			History.queues[item.queue||0].push(item);

			// Chain
			return History;
		};

		/**
		 * History.queue (item,queue), (func,queue), (func), (item)
		 * Either firs the item now if not busy, or adds it to the queue
		 */
		History.queue = function(item,queue){
			// Prepare
			if ( typeof item === 'function' ) {
				item = {
					callback: item
				};
			}
			if ( typeof queue !== 'undefined' ) {
				item.queue = queue;
			}

			// Handle
			if ( History.busy() ) {
				History.pushQueue(item);
			} else {
				History.fireQueueItem(item);
			}

			// Chain
			return History;
		};

		/**
		 * History.clearQueue()
		 * Clears the Queue
		 */
		History.clearQueue = function(){
			History.busy.flag = false;
			History.queues = [];
			return History;
		};


		// ----------------------------------------------------------------------
		// IE Bug Fix

		/**
		 * History.stateChanged
		 * States whether or not the state has changed since the last double check was initialised
		 */
		History.stateChanged = false;

		/**
		 * History.doubleChecker
		 * Contains the timeout used for the double checks
		 */
		History.doubleChecker = false;

		/**
		 * History.doubleCheckComplete()
		 * Complete a double check
		 * @return {History}
		 */
		History.doubleCheckComplete = function(){
			// Update
			History.stateChanged = true;

			// Clear
			History.doubleCheckClear();

			// Chain
			return History;
		};

		/**
		 * History.doubleCheckClear()
		 * Clear a double check
		 * @return {History}
		 */
		History.doubleCheckClear = function(){
			// Clear
			if ( History.doubleChecker ) {
				clearTimeout(History.doubleChecker);
				History.doubleChecker = false;
			}

			// Chain
			return History;
		};

		/**
		 * History.doubleCheck()
		 * Create a double check
		 * @return {History}
		 */
		History.doubleCheck = function(tryAgain){
			// Reset
			History.stateChanged = false;
			History.doubleCheckClear();

			// Fix IE6,IE7 bug where calling history.back or history.forward does not actually change the hash (whereas doing it manually does)
			// Fix Safari 5 bug where sometimes the state does not change: https://bugs.webkit.org/show_bug.cgi?id=42940
			if ( History.bugs.ieDoubleCheck ) {
				// Apply Check
				History.doubleChecker = setTimeout(
					function(){
						History.doubleCheckClear();
						if ( !History.stateChanged ) {
							//History.debug('History.doubleCheck: State has not yet changed, trying again', arguments);
							// Re-Attempt
							tryAgain();
						}
						return true;
					},
					History.options.doubleCheckInterval
				);
			}

			// Chain
			return History;
		};

		// ----------------------------------------------------------------------
		// Safari Bug Fix

		/**
		 * History.safariStatePoll()
		 * Poll the current state
		 * @return {History}
		 */
		History.safariStatePoll = function(){
			// Poll the URL

			// Get the Last State which has the new URL
			var
				urlState = History.extractState(document.location.href),
				newState;

			// Check for a difference
			if ( !History.isLastSavedState(urlState) ) {
				newState = urlState;
			}
			else {
				return;
			}

			// Check if we have a state with that url
			// If not create it
			if ( !newState ) {
				//History.debug('History.safariStatePoll: new');
				newState = History.createStateObject();
			}

			// Apply the New State
			//History.debug('History.safariStatePoll: trigger');
			History.Adapter.trigger(window,'popstate');

			// Chain
			return History;
		};

		// ----------------------------------------------------------------------
		// State Aliases

		/**
		 * History.back(queue)
		 * Send the browser history back one item
		 * @param {Integer} queue [optional]
		 */
		History.back = function(queue){
			//History.debug('History.back: called', arguments);

			// Handle Queueing
			if ( queue !== false && History.busy() ) {
				// Wait + Push to Queue
				//History.debug('History.back: we must wait', arguments);
				History.pushQueue({
					scope: History,
					callback: History.back,
					args: arguments,
					queue: queue
				});
				return false;
			}

			// Make Busy + Continue
			History.busy(true);

			// Fix certain browser bugs that prevent the state from changing
			History.doubleCheck(function(){
				History.back(false);
			});

			// Go back
			history.go(-1);

			// End back closure
			return true;
		};

		/**
		 * History.forward(queue)
		 * Send the browser history forward one item
		 * @param {Integer} queue [optional]
		 */
		History.forward = function(queue){
			//History.debug('History.forward: called', arguments);

			// Handle Queueing
			if ( queue !== false && History.busy() ) {
				// Wait + Push to Queue
				//History.debug('History.forward: we must wait', arguments);
				History.pushQueue({
					scope: History,
					callback: History.forward,
					args: arguments,
					queue: queue
				});
				return false;
			}

			// Make Busy + Continue
			History.busy(true);

			// Fix certain browser bugs that prevent the state from changing
			History.doubleCheck(function(){
				History.forward(false);
			});

			// Go forward
			history.go(1);

			// End forward closure
			return true;
		};

		/**
		 * History.go(index,queue)
		 * Send the browser history back or forward index times
		 * @param {Integer} queue [optional]
		 */
		History.go = function(index,queue){
			//History.debug('History.go: called', arguments);

			// Prepare
			var i;

			// Handle
			if ( index > 0 ) {
				// Forward
				for ( i=1; i<=index; ++i ) {
					History.forward(queue);
				}
			}
			else if ( index < 0 ) {
				// Backward
				for ( i=-1; i>=index; --i ) {
					History.back(queue);
				}
			}
			else {
				throw new Error('History.go: History.go requires a positive or negative integer passed.');
			}

			// Chain
			return History;
		};


		// ----------------------------------------------------------------------
		// Initialise

		/**
		 * Create the initial State
		 */
		History.saveState(History.storeState(History.extractState(document.location.href,true)));

		/**
		 * Bind for Saving Store
		 */
		if ( amplify ) {
			History.onUnload = function(){
				// Prepare
				var
					currentStore = amplify.store('History.store')||{},
					item;

				// Ensure
				currentStore.idToState = currentStore.idToState || {};
				currentStore.urlToId = currentStore.urlToId || {};
				currentStore.stateToId = currentStore.stateToId || {};

				// Sync
				for ( item in History.idToState ) {
					if ( !History.idToState.hasOwnProperty(item) ) {
						continue;
					}
					currentStore.idToState[item] = History.idToState[item];
				}
				for ( item in History.urlToId ) {
					if ( !History.urlToId.hasOwnProperty(item) ) {
						continue;
					}
					currentStore.urlToId[item] = History.urlToId[item];
				}
				for ( item in History.stateToId ) {
					if ( !History.stateToId.hasOwnProperty(item) ) {
						continue;
					}
					currentStore.stateToId[item] = History.stateToId[item];
				}

				// Update
				History.store = currentStore;

				// Store
				amplify.store('History.store',currentStore);
			};
			// For Internet Explorer
			setInterval(History.onUnload,History.options.storeInterval);
			// For Other Browsers
			History.Adapter.bind(window,'beforeunload',History.onUnload);
			History.Adapter.bind(window,'unload',History.onUnload);
			// Both are enabled for consistency
		}


		// ----------------------------------------------------------------------
		// HTML5 State Support

		if ( History.emulated.pushState ) {
			/*
			 * Provide Skeleton for HTML4 Browsers
			 */

			// Prepare
			var emptyFunction = function(){};
			History.pushState = History.pushState||emptyFunction;
			History.replaceState = History.replaceState||emptyFunction;
		}
		else {
			/*
			 * Use native HTML5 History API Implementation
			 */

			/**
			 * History.onPopState(event,extra)
			 * Refresh the Current State
			 */
			History.onPopState = function(event){
				// Reset the double check
				History.doubleCheckComplete();

				// Check for a Hash, and handle apporiatly
				var currentHash	= History.getHash();
				if ( currentHash ) {
					// Expand Hash
					var currentState = History.extractState(currentHash||document.location.href,true);
					if ( currentState ) {
						// We were able to parse it, it must be a State!
						// Let's forward to replaceState
						//History.debug('History.onPopState: state anchor', currentHash, currentState);
						History.replaceState(currentState.data, currentState.title, currentState.url, false);
					}
					else {
						// Traditional Anchor
						//History.debug('History.onPopState: traditional anchor', currentHash);
						History.Adapter.trigger(window,'anchorchange');
						History.busy(false);
					}

					// We don't care for hashes
					History.expectedStateId = false;
					return false;
				}

				// Prepare
				var newState = false;

				// Prepare
				event = event||{};
				if ( typeof event.state === 'undefined' ) {
					// jQuery
					if ( typeof event.originalEvent !== 'undefined' && typeof event.originalEvent.state !== 'undefined' ) {
						event.state = event.originalEvent.state||false;
					}
					// MooTools
					else if ( typeof event.event !== 'undefined' && typeof event.event.state !== 'undefined' ) {
						event.state = event.event.state||false;
					}
				}

				// Ensure
				event.state = (event.state||false);

				// Fetch State
				if ( event.state ) {
					// Vanilla: Back/forward button was used
					newState = History.getStateById(event.state);
				}
				else if ( History.expectedStateId ) {
					// Vanilla: A new state was pushed, and popstate was called manually
					newState = History.getStateById(History.expectedStateId);
				}
				else {
					// Initial State
					newState = History.extractState(document.location.href);
				}

				// The State did not exist in our store
				if ( !newState ) {
					// Regenerate the State
					newState = History.createStateObject(null,null,document.location.href);
				}

				// Clean
				History.expectedStateId = false;

				// Check if we are the same state
				if ( History.isLastSavedState(newState) ) {
					// There has been no change (just the page's hash has finally propagated)
					//History.debug('History.onPopState: no change', newState, History.savedStates);
					History.busy(false);
					return false;
				}

				// Store the State
				History.storeState(newState);
				History.saveState(newState);

				// Force update of the title
				History.setTitle(newState);

				// Fire Our Event
				History.Adapter.trigger(window,'statechange');
				History.busy(false);

				// Return true
				return true;
			};
			History.Adapter.bind(window,'popstate',History.onPopState);

			/**
			 * History.pushState(data,title,url)
			 * Add a new State to the history object, become it, and trigger onpopstate
			 * We have to trigger for HTML4 compatibility
			 * @param {object} data
			 * @param {string} title
			 * @param {string} url
			 * @return {true}
			 */
			History.pushState = function(data,title,url,queue){
				//History.debug('History.pushState: called', arguments);

				// Check the State
				if ( History.getHashByUrl(url) && History.emulated.pushState ) {
					throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');
				}

				// Handle Queueing
				if ( queue !== false && History.busy() ) {
					// Wait + Push to Queue
					//History.debug('History.pushState: we must wait', arguments);
					History.pushQueue({
						scope: History,
						callback: History.pushState,
						args: arguments,
						queue: queue
					});
					return false;
				}

				// Make Busy + Continue
				History.busy(true);

				// Create the newState
				var newState = History.createStateObject(data,title,url);

				// Check it
				if ( History.isLastSavedState(newState) ) {
					// Won't be a change
					History.busy(false);
				}
				else {
					// Store the newState
					History.storeState(newState);
					History.expectedStateId = newState.id;

					// Push the newState
					history.pushState(newState.id,newState.title,newState.url);

					// Fire HTML5 Event
					History.Adapter.trigger(window,'popstate');
				}

				// End pushState closure
				return true;
			};

			/**
			 * History.replaceState(data,title,url)
			 * Replace the State and trigger onpopstate
			 * We have to trigger for HTML4 compatibility
			 * @param {object} data
			 * @param {string} title
			 * @param {string} url
			 * @return {true}
			 */
			History.replaceState = function(data,title,url,queue){
				//History.debug('History.replaceState: called', arguments);

				// Check the State
				if ( History.getHashByUrl(url) && History.emulated.pushState ) {
					throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');
				}

				// Handle Queueing
				if ( queue !== false && History.busy() ) {
					// Wait + Push to Queue
					//History.debug('History.replaceState: we must wait', arguments);
					History.pushQueue({
						scope: History,
						callback: History.replaceState,
						args: arguments,
						queue: queue
					});
					return false;
				}

				// Make Busy + Continue
				History.busy(true);

				// Create the newState
				var newState = History.createStateObject(data,title,url);

				// Check it
				if ( History.isLastSavedState(newState) ) {
					// Won't be a change
					History.busy(false);
				}
				else {
					// Store the newState
					History.storeState(newState);
					History.expectedStateId = newState.id;

					// Push the newState
					history.replaceState(newState.id,newState.title,newState.url);

					// Fire HTML5 Event
					History.Adapter.trigger(window,'popstate');
				}

				// End replaceState closure
				return true;
			};

			// Be aware, the following is only for native pushState implementations
			// If you are wanting to include something for all browsers
			// Then include it above this if block

			/**
			 * Setup Safari Fix
			 */
			if ( History.bugs.safariPoll ) {
				setInterval(History.safariStatePoll, History.options.safariPollInterval);
			}

			/**
			 * Ensure Cross Browser Compatibility
			 */
			if ( navigator.vendor === 'Apple Computer, Inc.' || (navigator.appCodeName||'') === 'Mozilla' ) {
				/**
				 * Fix Safari HashChange Issue
				 */

				// Setup Alias
				History.Adapter.bind(window,'hashchange',function(){
					History.Adapter.trigger(window,'popstate');
				});

				// Initialise Alias
				if ( History.getHash() ) {
					History.Adapter.onDomLoad(function(){
						History.Adapter.trigger(window,'hashchange');
					});
				}
			}

		} // !History.emulated.pushState

	}; // History.initCore

	// Try and Initialise History
	History.init();

})(window);

/**
 * History.js jQuery Adapter
 * @author Benjamin Arthur Lupton <contact@balupton.com>
 * @copyright 2010-2011 Benjamin Arthur Lupton <contact@balupton.com>
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */

// Closure
(function(window,undefined){
	// Localise Globals
	var
		History = window.History = window.History||{},
		$ = window.$;

	// Check Existence
	if ( typeof History.Adapter !== 'undefined' ) {
		throw new Error('History.js Adapter has already been loaded...');
	}

	// Add the Adapter
	History.Adapter = {
		/**
		 * History.Adapter.bind(el,event,callback)
		 * @param {Element|Selector} el
		 * @param {String} event - custom and standard events
		 * @param {Function} callback
		 * @return
		 */
		bind: function(el,event,callback){
			$(el).bind(event,callback);
		},

		/**
		 * History.Adapter.trigger(el,event)
		 * @param {Element|Selector} el
		 * @param {String} event - custom and standard events
		 * @return
		 */
		trigger: function(el,event){
			$(el).trigger(event);
		},

		/**
		 * History.Adapter.trigger(el,event,data)
		 * @param {Function} callback
		 * @return
		 */
		onDomLoad: function(callback) {
			$(callback);
		}
	};

	// Try and Initialise History
	if ( typeof History.init !== 'undefined' ) {
		History.init();
	}

})(window);
}(function() {
  var Builder, RouteResolver, Router, View, ViewManager, add_default_activation_events, array_flatten, array_from, array_without_value, attribute_map, attribute_translations, bind_extend_handler, create_router, deffered, delegate_events, dispatcher, element_cache, environments, extend, generate_selector_delegate, has_change_callback, ie, ie_attribute_translation_sniffing_cache, ie_attribute_translations, is_$, is_array, is_collection, is_element, is_model, is_view, named_param, params_from_ordered_params_and_route, process_node_argument, proxy, reverse_lookup, router_initialized, routes_by_path, routes_by_view, routes_regexps_by_path, set_element, splat_param, supported_events, supported_html_tags, tag, tag_name, template_helpers, templates, wrap_function, _fn, _i, _len;
  var __slice = Array.prototype.slice, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  extend = function(destination, source) {
    var key, value;
    for (key in source) {
      value = source[key];
      destination[key] = value;
    }
    return destination;
  };
  is_view = function(object) {
    return Boolean(object && object.element && object.render);
  };
  is_model = function(object) {
    return Boolean(object && object.get && object.set && object.trigger && object.bind);
  };
  is_collection = function(object) {
    return Boolean(object && object.add && object.remove && object.trigger && object.bind);
  };
  is_array = function(array) {
    return Boolean(array && Object.prototype.toString.call(array) === '[object Array]');
  };
  is_element = function(element) {
    return Boolean((element != null ? element.nodeType : void 0) === 1 || (element != null ? element.nodeType : void 0) === 3);
  };
  is_$ = function($) {
    var _ref;
    return Boolean(($ != null ? $[0] : void 0) && ($ != null ? (_ref = $[0]) != null ? _ref.nodeType : void 0 : void 0) && ($.length != null));
  };
  wrap_function = function(func, wrapper) {
    return function() {
      return wrapper.apply(this, [proxy(func, this)].concat(array_from(arguments)));
    };
  };
  proxy = function(func, object) {
    var args;
    if (object === void 0) {
      return func;
    }
    if (arguments.length < 3) {
      return function() {
        return func.apply(object, arguments);
      };
    } else {
      args = array_from(arguments);
      args.shift();
      args.shift();
      return function() {
        return func.apply(object, args.concat(array_from(arguments)));
      };
    }
  };
  array_without_value = function(array) {
    var item, response, values, _i, _len;
    response = [];
    values = array_from(arguments).slice(1);
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      item = array[_i];
      if (!(in_array(item, values) > -1)) {
        response.push(item);
      }
    }
    return response;
  };
  array_flatten = function(array) {
    var flattened, item, _i, _len;
    flattened = [];
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      item = array[_i];
      if (is_array(item)) {
        flattened = flattened.concat(array_flatten(item));
      } else {
        flattened.push(item);
      }
    }
    return flattened;
  };
  array_from = function(object) {
    var length, results;
    if (!object) {
      return [];
    }
    length = object.length || 0;
    results = new Array(length);
    while (length--) {
      results[length] = object[length];
    }
    return results;
  };
  View = {
    extend: function() {
      var argument, item, key, process_item, value, _base, _i, _len, _results;
      (_base = this.extend).api || (_base.api = {});
      this.mixin || (this.mixin = []);
      process_item = function(key, value) {
        var discard, should_add, _key;
        should_add = true;
        discard = function() {
          return should_add = false;
        };
        if (key === 'extend') {
          for (_key in value) {
            this.extend.api[_key] = value[_key];
          }
        } else {
          if (this.extend.api[key]) {
            this.extend.api[key].apply(this, [value, discard]);
          } else {
            this[key] = value;
          }
        }
        if (should_add) {
          return this.mixin.push([key, value]);
        }
      };
      _results = [];
      for (_i = 0, _len = arguments.length; _i < _len; _i++) {
        argument = arguments[_i];
        _results.push((function() {
          var _i, _len, _ref, _results, _results2;
          if (!is_view(argument) && typeof argument === 'function' && !(argument.mixin != null)) {
            return this.bind('ready', argument);
          } else if (argument) {
            if (argument.mixin != null) {
              _ref = argument.mixin;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                item = _ref[_i];
                _results.push(process_item.apply(this, item));
              }
              return _results;
            } else {
              _results2 = [];
              for (key in argument) {
                value = argument[key];
                _results2.push(process_item.apply(this, [key, value]));
              }
              return _results2;
            }
          }
        }).call(this));
      }
      return _results;
    }
  };
  View.extend({
    stack: function(commands) {
      var callback, command_name, method_name, _results;
      this._stack || (this._stack = {});
      _results = [];
      for (method_name in commands) {
        if (!this[method_name]) {
          this._stack[method_name] = {
            complete: function() {},
            stack: []
          };
          this[method_name] = function() {
            var step, _stack;
            _stack = array_from(this._stack[method_name].stack);
            step = proxy(function() {
              var args;
              args = array_from(arguments).concat([step]);
              if (typeof args[0] === 'number') {
                args.shift();
              }
              return (_stack.shift() || this._stack[method_name].complete).apply(this, args);
            }, this);
            return step.apply(this, array_from(arguments));
          };
        }
        _results.push((function() {
          var _ref, _results;
          _ref = commands[method_name];
          _results = [];
          for (command_name in _ref) {
            callback = _ref[command_name];
            _results.push((function() {
              switch (command_name) {
                case 'complete':
                  return this._stack[method_name].complete = callback;
                case 'add':
                  return this._stack[method_name].stack.push(callback);
                case 'clear':
                  return this._stack[method_name].stack = [];
              }
            }).call(this));
          }
          return _results;
        }).call(this));
      }
      return _results;
    }
  });
  View.extend({
    extend: {
      stack: function(commands) {
        return this.stack(commands);
      }
    }
  });
  View.extend({
    create: function() {
      var callback, class_name, created_views, instance, mixin, mixins, _i, _len, _ref;
      if (arguments.length === 0 || (arguments.length === 1 && typeof arguments[0] === 'function')) {
        instance = this.clone();
        instance.element();
        if (arguments[0]) {
          arguments[0].call(instance);
        }
        return instance;
      }
      created_views = {};
      _ref = arguments[0];
      for (class_name in _ref) {
        mixins = _ref[class_name];
        if (ViewManager.views[class_name] != null) {
          this.trigger('warning', class_name + ' already exists, overwriting.');
        }
        ViewManager.views[class_name] = created_views[class_name] = this.clone();
        ViewManager.views[class_name].name = class_name;
        if (is_array(mixins)) {
          for (_i = 0, _len = mixins.length; _i < _len; _i++) {
            mixin = mixins[_i];
            created_views[class_name].extend(mixin);
          }
        } else {
          created_views[class_name].extend(mixins);
        }
        created_views[class_name].element();
        if (deffered[class_name] != null) {
          while (callback = deffered[class_name].pop()) {
            callback.call(created_views[class_name]);
          }
        }
      }
      return created_views;
    },
    clone: function() {
      var klass;
      klass = {};
      klass.extend = this.extend;
      klass.extend.api = {};
      klass.attributes = {};
      klass._changed = false;
      klass._ready = false;
      klass._callbacks = {};
      klass.extend(this);
      return klass;
    }
  });
  View.extend({
    stack: {
      initialize: {
        add: function() {
          var args, next, _i;
          args = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), next = arguments[_i++];
          if (this._initialized != null) {
            return;
          }
          this._initialized = true;
          if (args.length > 0) {
            if (is_model(args[0])) {
              this._model(args[0]);
            } else if (is_collection(args[0])) {
              this._collection(args[0]);
            } else if (typeof args[0] !== 'function') {
              this.set(args[0]);
            }
            if (typeof args[args.length - 1] === 'function') {
              this._initialize_callback = args[args.length - 1];
            }
          }
          return next();
        }
      }
    }
  });
  View.extend({
    stack: {
      initialize: {
        complete: function() {
          this.render();
          if (this._initialize_callback) {
            this._initialize_callback.call(this);
          }
          return this.trigger.apply(this, ['initialize'].concat(__slice.call(arguments)));
        }
      }
    }
  });
  View.extend({
    extend: {
      initialize: function(callback) {
        return this.stack({
          initialize: {
            add: callback
          }
        });
      }
    }
  });
  View.extend({
    extend: {
      views: function(dependents) {
        var caller, dependent, _i, _len, _results;
        this.views = dependents;
        caller = this;
        _results = [];
        for (_i = 0, _len = dependents.length; _i < _len; _i++) {
          dependent = dependents[_i];
          _results.push((function(dependent) {
            return caller.extend({
              stack: {
                initialize: {
                  add: function() {
                    var args, next, view, _i;
                    args = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), next = arguments[_i++];
                    view = ViewManager(dependent);
                    view.bind({
                      ready: function() {
                        caller[dependent] = view;
                        return next.apply(next, args);
                      }
                    });
                    return view.initialize();
                  }
                }
              }
            });
          })(dependent));
        }
        return _results;
      }
    }
  });
  View.extend({
    bind: function(event_name, callback) {
      var _base, _callback, _event_name;
      if (arguments.length === 1 && typeof event_name === 'object') {
        for (_event_name in event_name) {
          _callback = event_name[_event_name];
          this.bind(_event_name, _callback);
        }
      } else {
        if (!(callback != null)) {
          this.trigger('error', 'No callback specified for ' + event_name);
        }
        this._callbacks || (this._callbacks = {});
        (_base = this._callbacks)[event_name] || (_base[event_name] = []);
        if (!(__indexOf.call(this._callbacks[event_name], callback) >= 0)) {
          this._callbacks[event_name].push(callback);
        }
        if (event_name === 'ready' && this._ready) {
          callback.call(this);
        }
      }
      return this;
    },
    unbind: function(event_name, callback) {
      var i, item, _len, _ref;
      if (!event_name) {
        this._callbacks = {};
      }
      if (!callback) {
        this._callbacks[event_name] = [];
      } else {
        if (!this._callbacks[event_name]) {
          return this;
        }
        _ref = this._callbacks[event_name];
        for (i = 0, _len = _ref.length; i < _len; i++) {
          item = _ref[i];
          if (item === callback) {
            this._callbacks[event_name].splice(i, 1);
            break;
          }
        }
      }
      return this;
    },
    trigger: function(event_name) {
      var item, _i, _j, _len, _len2, _ref, _ref2;
      if (!this._callbacks) {
        return this;
      }
      if (this._callbacks[event_name]) {
        _ref = this._callbacks[event_name];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          if (item != null) {
            item.apply(this, Array.prototype.slice.call(arguments, 1));
          }
        }
      }
      if (this._callbacks.all) {
        _ref2 = this._callbacks.all;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          item = _ref2[_j];
          item.apply(this, arguments);
        }
      }
      return this;
    }
  });
  View.extend({
    on: View.bind,
    removeListener: View.unbind,
    emit: View.trigger
  });
  bind_extend_handler = function(events) {
    var callback, event_name, _callback, _event_name, _results;
    _results = [];
    for (event_name in events) {
      callback = events[event_name];
      _results.push((function() {
        var _ref, _results;
        if (event_name === 'change' && typeof callback === 'object') {
          _ref = events.change;
          _results = [];
          for (_event_name in _ref) {
            _callback = _ref[_event_name];
            _results.push(this.bind('change:' + _event_name, _callback));
          }
          return _results;
        } else {
          return this.bind(event_name, callback);
        }
      }).call(this));
    }
    return _results;
  };
  View.extend({
    extend: {
      bind: bind_extend_handler
    }
  });
  View.extend({
    extend: {
      on: bind_extend_handler
    }
  });
  View.extend({
    on: {
      warning: function(warning) {
        if ((typeof console != "undefined" && console !== null ? console.log : void 0) != null) {
          return console.log.apply(console, ["" + this.name + " warning: "].concat(array_from(arguments)));
        }
      },
      error: function(error) {
        if ((typeof console != "undefined" && console !== null ? console.log : void 0) != null) {
          console.log.apply(console, ["" + (this.name || 'View') + " error: "].concat(array_from(arguments)));
        }
        throw error;
        return setTimeout(function() {
          throw error;
        }, 100);
      }
    }
  });
  environments = {};
  View.extend({
    env: function(envs) {
      var callback, env_name, should_call, _callback, _env_name, _results;
      if (arguments.length === 2) {
        env_name = arguments[0], callback = arguments[1];
        if (!(environments[env_name] != null)) {
          should_call = false;
        } else if (typeof environments[env_name] === 'boolean') {
          should_call = environments[env_name];
        } else {
          should_call = environments[env_name]();
        }
        if (should_call) {
          return callback.call(this);
        }
      } else {
        _results = [];
        for (env_name in envs) {
          callback = envs[env_name];
          _results.push((function() {
            var _results;
            if (env_name === 'set') {
              _results = [];
              for (_env_name in callback) {
                _callback = callback[_env_name];
                _results.push(environments[_env_name] = _callback);
              }
              return _results;
            } else {
              return this.env(env_name, callback);
            }
          }).call(this));
        }
        return _results;
      }
    }
  });
  View.env({
    set: {
      server: function() {
        return ((typeof window != "undefined" && window !== null) && window.name === 'nodejs') || ((typeof process != "undefined" && process !== null) && (typeof require != "undefined" && require !== null) && (typeof global != "undefined" && global !== null) && (typeof module != "undefined" && module !== null));
      },
      client: function() {
        return (typeof window != "undefined" && window !== null) && (window.document != null);
      },
      browser: function() {
        return (typeof window != "undefined" && window !== null) && (window.name != null) && window.name !== 'nodejs';
      }
    }
  });
  View.extend({
    extend: {
      env: function(envs) {
        var args, env_name, response, _callback, _env_name, _results;
        _results = [];
        for (env_name in envs) {
          args = envs[env_name];
          _results.push((function() {
            var _results;
            if (env_name === 'set') {
              _results = [];
              for (_env_name in args) {
                _callback = args[_env_name];
                _results.push(environments[_env_name] = _callback);
              }
              return _results;
            } else {
              if (environments[env_name]()) {
                if (typeof args === 'function') {
                  response = args();
                  if (response) {
                    return this.extend(response);
                  }
                } else {
                  return this.extend(args);
                }
              }
            }
          }).call(this));
        }
        return _results;
      }
    }
  });
  generate_selector_delegate = function() {
    return function(selector) {
      if (!(this._$ != null)) {
        this.trigger('error', "No DOM library is available in " + name);
      }
      return this._$(selector, this[0]);
    };
  };
  View.extend({
    element: function() {
      var element;
      if (this[0]) {
        return this[0];
      }
      element = this.document.createElement('div');
      if (this.name) {
        element.setAttribute('class', this.name);
      }
      return set_element.call(this, element);
    },
    $: generate_selector_delegate(),
    delegate: function(events) {
      return this._delegatedEvents = events;
    }
  });
  View.extend({
    extend: {
      element: function(generator) {
        return this.element = function() {
          if (this[0]) {
            return this[0];
          }
          return set_element.call(this, generator.call(this));
        };
      },
      delegate: function(events) {
        return this.delegate(events);
      },
      $: function(dom_library, discard) {
        if (dom_library && dom_library.fn) {
          this._$ = dom_library;
          return dom_library.fn.view = reverse_lookup;
        } else {
          return this.trigger('error', 'Unsupported DOM library specified, use jQuery or Zepto', dom_library);
        }
      }
    }
  });
  set_element = function(element) {
    this.length = 1;
    this[0] = element;
    this.$ = generate_selector_delegate();
    if (this._$) {
      extend(this.$, this._$(this[0]));
    }
    if (this._delegatedEvents) {
      return delegate_events.call(this, this._delegatedEvents, this[0]);
    }
  };
  delegate_events = function(events, element) {
    var discard, event_name, key, method_name, process_item, selector, _method_name, _ref, _ref2, _ref3, _results;
    if (!(events || (events = this._delegatedEvents))) {
      return;
    }
    if (!(((_ref = this._$) != null ? (_ref2 = _ref.fn) != null ? _ref2.delegate : void 0 : void 0) != null)) {
      this.trigger('error', 'No DOM library the supports delegate() available');
    }
    this._$(element).unbind();
    process_item = function(event_name, selector, method_name) {
      var method;
      method = proxy((typeof method_name === 'string' ? this[method_name] : method_name), this);
      if (selector === '') {
        return this._$(element).bind(event_name, method);
      } else {
        return this._$(element).delegate(selector, event_name, method);
      }
    };
    _results = [];
    for (key in events) {
      method_name = events[key];
      _ref3 = key.match(/^(\w+)\s*(.*)$/), discard = _ref3[0], event_name = _ref3[1], selector = _ref3[2];
      _results.push((function() {
        var _results;
        if (typeof method_name === 'string' || typeof method_name === 'function') {
          return process_item.call(this, event_name, selector, method_name);
        } else {
          _results = [];
          for (selector in method_name) {
            _method_name = method_name[selector];
            _results.push(process_item.call(this, event_name, selector, _method_name));
          }
          return _results;
        }
      }).call(this));
    }
    return _results;
  };
  reverse_lookup = function() {
    return ViewManager(this[0].className);
  };
  View.extend({
    env: {
      client: function() {
        return {
          document: window.document
        };
      }
    }
  });
  View.extend({
    extend: {
      defaults: function(defaults) {
        return this.set(defaults, {
          silent: true
        });
      }
    }
  });
  View.extend({
    _model: function(model) {
      if (is_model(model)) {
        return this.model = model;
      } else {
        return this.trigger('error', 'The model object passed is not a valid model.');
      }
    },
    _collection: function(collection) {
      if (is_collection(collection)) {
        this.collection = collection;
        this.collection.bind('all', __bind(function() {
          return this.trigger.apply(this, arguments);
        }, this));
        this.bind({
          add: function(model) {
            this._elements[model.cid] = this._render(model);
            return this[0].insertBefore(this._elements[model.cid], this[0].childNodes[this.collection.models.indexOf(model)] || null);
          }
        });
        this.bind({
          remove: function(model) {
            if (this._elements[model.cid]) {
              return this[0].removeChild(this._elements[model.cid]);
            }
          }
        });
        return this.bind({
          refresh: function() {
            return this.render();
          }
        });
      } else {
        return this.trigger('error', 'The collection object passed is not a valid collection.');
      }
    },
    get: function(key) {
      return this.attributes[key];
    },
    set: function(attributes, options) {
      var attribute, key_change_events, now, trigger_arguments, value, _i, _len;
      options || (options = {});
      if (!attributes) {
        return this;
      }
      if (attributes.attributes != null) {
        attributes = attributes.attributes;
      }
      now = this.attributes;
      key_change_events = [];
      for (attribute in attributes) {
        value = attributes[attribute];
        if (now[attribute] !== value) {
          now[attribute] = value;
          if (!options.silent) {
            this._changed = true;
            key_change_events.push(['change:' + attribute, value, options]);
          }
        }
      }
      for (_i = 0, _len = key_change_events.length; _i < _len; _i++) {
        trigger_arguments = key_change_events[_i];
        this.trigger.apply(this, trigger_arguments);
      }
      if (!options.silent && this._changed) {
        this.trigger('change', this, options);
      }
      this._changed = false;
      return attributes;
    }
  });
  View.extend({
    extend: {
      model: function(model) {
        return this._model(model);
      }
    }
  });
  View.extend({
    extend: {
      collection: function(collection) {
        return this._collection(collection);
      }
    }
  });
  View.extend({
    before: function(methods) {
      var method, method_name, _methods, _results;
      if (arguments.length === 2) {
        _methods = {};
        _methods[arguments[0]] = arguments[1];
      } else {
        _methods = methods;
      }
      _results = [];
      for (method_name in _methods) {
        method = _methods[method_name];
        _results.push(this[method_name] = wrap_function(this[method_name], method));
      }
      return _results;
    }
  });
  View.extend({
    extend: {
      before: function(methods) {
        return this.before(methods);
      }
    }
  });
  templates = {};
  View.extend({
    extend: {
      templates: function(_templates, discard) {
        templates = _templates;
        return discard();
      }
    }
  });
  View.extend({
    _render: function() {},
    render: function(options) {
      var element, _element, _i, _len;
      options || (options = {});
      if (!(options.update != null)) {
        options.update = true;
      }
      if (this.collection != null) {
        this._elements = {};
        element = this.collection.map(function(model) {
          return this._elements[model.cid] = this._render(model);
        }, this);
      } else {
        element = this._render(this.model ? this.model.attributes : this.attributes);
      }
      if (!options.update) {
        return element;
      }
      if (element) {
        if (!is_element(element) && !is_array(element) && !is_$(element)) {
          this.trigger('error', 'render() did not return an element or array, returned ' + typeof element);
        }
        this[0].innerHTML = '';
        if (!is_array(element) && !is_$(element)) {
          element = [element];
        }
        for (_i = 0, _len = element.length; _i < _len; _i++) {
          _element = element[_i];
          this[0].appendChild(_element);
        }
      }
      if (!this._ready) {
        this._ready = true;
        this.trigger('ready', element);
      }
      return this.trigger('render', element);
    }
  });
  View.extend({
    extend: {
      render: function(filename) {
        var add_helpers_to_context, callback;
        add_helpers_to_context = __bind(function(context) {
          var helper, helper_name, _results;
          _results = [];
          for (helper_name in template_helpers) {
            helper = template_helpers[helper_name];
            _results.push(context[helper_name] = proxy(template_helpers[helper_name], this));
          }
          return _results;
        }, this);
        if (typeof filename === 'string') {
          callback = function(context) {
            var final_context, output;
            if (!templates[filename]) {
              this.trigger('error', 'Template ' + filename + ' not found');
            }
            if (context.attributes != null) {
              final_context = extend({}, context.attributes);
              final_context = extend(final_context, context);
              add_helpers_to_context(final_context);
              output = templates[filename](final_context);
            } else {
              final_context = extend({}, context);
              add_helpers_to_context(final_context);
              output = templates[filename](final_context);
            }
            return output;
          };
        } else {
          callback = filename;
        }
        return this._render = callback;
      }
    }
  });
  template_helpers = {};
  View.extend({
    extend: {
      helpers: function(helpers) {
        return extend(template_helpers, helpers);
      }
    }
  });
  View.extend({
    helpers: {
      url: function(params) {
        return RouteResolver(params);
      }
    }
  });
  tag = function(tag_name) {
    var argument, attribute_name, attributes, element, elements, name, tag, test_element, value, _element, _i, _j, _len, _len2, _ref;
    elements = [];
    attributes = {};
    _ref = array_from(arguments).slice(1);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      argument = _ref[_i];
      process_node_argument(this, elements, attributes, argument);
    }
    tag_name = tag_name.toLowerCase();
    if (ie && (attributes.name || (tag_name === 'input' && attributes.type))) {
      tag = '<' + tag_name;
      if (attributes.name) {
        tag += ' name="' + attributes.name + '"';
      }
      if (tag_name === 'input' && attributes.type) {
        tag += ' type="' + attributes.type + '"';
      }
      tag += '>';
      delete attributes.name;
      delete attributes.type;
      element = this.document.createElement(tag);
    } else {
      if (!element_cache[tag_name]) {
        element_cache[tag_name] = this.document.createElement(tag_name);
      }
      element = element_cache[tag_name].cloneNode(false);
    }
    for (attribute_name in attributes) {
      name = attribute_translations[attribute_name] || attribute_name;
      if (ie && ie_attribute_translations[name]) {
        if (ie_attribute_translation_sniffing_cache[name] != null) {
          name = ie_attribute_translations[name];
        } else {
          test_element = this.document.createElement('div');
          test_element.setAttribute(name, 'test');
          if (test_element[ie_attribute_translations[name]] !== 'test') {
            test_element.setAttribute(ie_attribute_translations[name], 'test');
            if (ie_attribute_translation_sniffing_cache[name] = test_element[ie_attribute_translations[name]] === 'test') {
              name = ie_attribute_translations[name];
            }
          }
        }
      }
      value = attributes[attribute_name];
      if (value === false || !(value != null)) {
        element.removeAttribute(name);
      } else if (value === true) {
        element.setAttribute(name, name);
      } else if (name === 'style') {
        element.style.cssText = value;
      } else {
        element.setAttribute(name, value);
      }
    }
    for (_j = 0, _len2 = elements.length; _j < _len2; _j++) {
      _element = elements[_j];
      if (is_element(_element)) {
        element.appendChild(_element);
      } else {
        element.appendChild(this.document.createTextNode(String(_element)));
      }
    }
    if (this._$) {
      element = this._$(element);
    }
    return element;
  };
  View.extend({
    tag: function() {
      return tag.apply(this, arguments);
    }
  });
  process_node_argument = function(view, elements, attributes, argument) {
    var attribute, attribute_name, flattened, flattened_argument, _element, _i, _j, _len, _len2;
    if (!(argument != null) || argument === false) {
      return;
    }
    if (typeof argument === 'function') {
      argument = argument.call(view);
    }
    if (is_view(argument)) {
      return elements.push(argument[0]);
    }
    if (is_$(argument)) {
      for (_i = 0, _len = argument.length; _i < _len; _i++) {
        _element = argument[_i];
        return elements.push(_element);
      }
    }
    if (is_element(argument)) {
      return elements.push(argument);
    }
    if (typeof argument !== 'string' && typeof argument !== 'number' && !is_array(argument) && !is_$(argument) && !is_element(argument)) {
      for (attribute_name in argument) {
        attribute = argument[attribute_name];
        attributes[attribute_name] = attribute;
      }
      return;
    }
    if ((argument.toArray != null) && typeof argument.toArray === 'function') {
      argument = argument.toArray();
    }
    if (is_array(argument)) {
      flattened = array_flatten(argument);
      for (_j = 0, _len2 = flattened.length; _j < _len2; _j++) {
        flattened_argument = flattened[_j];
        process_node_argument.call(this, view, elements, attributes, flattened_argument);
      }
      return;
    }
    if (is_element(argument) || typeof argument === 'string' || typeof argument === 'number') {
      return elements.push(argument);
    }
  };
  ie = (typeof window != "undefined" && window !== null) && !!(window.attachEvent && !window.opera);
  ie_attribute_translations = {
    "class": 'className',
    checked: 'defaultChecked',
    usemap: 'useMap',
    "for": 'htmlFor',
    readonly: 'readOnly',
    colspan: 'colSpan',
    bgcolor: 'bgColor',
    cellspacing: 'cellSpacing',
    cellpadding: 'cellPadding'
  };
  ie_attribute_translation_sniffing_cache = {};
  attribute_translations = {
    className: 'class',
    htmlFor: 'for'
  };
  element_cache = {};
  supported_events = 'blur focus focusin focusout load resize scroll unload click dblclick\
	mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave\
	change select submit keydown keypress keyup error'.split(/\s+/m);
  supported_html_tags = 'a abbr acronym address applet area b base basefont bdo big blockquote body\
  br button canvas caption center cite code col colgroup dd del dfn dir div dl dt em embed fieldset\
  font form frame frameset h1 h2 h3 h4 h5 h6 head hr html i iframe img input ins isindex\
  kbd label legend li link menu meta nobr noframes noscript object ol optgroup option p\
  param pre q s samp script select small span strike strong style sub sup table tbody td\
  textarea tfoot th thead title tr tt u ul var\
  article aside audio command details figcaption figure footer header hgroup keygen mark\
  meter nav output progress rp ruby section source summary time video'.split(/\s+/m);
  attribute_map = {
    htmlFor: 'for',
    className: 'class'
  };
  Builder = {};
  _fn = function(tag_name) {
    return Builder[tag_name] = function() {
      return tag.apply(this, [tag_name].concat(array_from(arguments)));
    };
  };
  for (_i = 0, _len = supported_html_tags.length; _i < _len; _i++) {
    tag_name = supported_html_tags[_i];
    _fn(tag_name);
  }
  router_initialized = false;
  routes_by_path = {};
  routes_by_view = {};
  routes_regexps_by_path = {};
  named_param = /:([\w\d]+)/g;
  splat_param = /\*([\w\d]+)/g;
  Router = {
    _lastActiveViewName: false,
    _initializedViews: {},
    _views: [],
    mixin: []
  };
  RouteResolver = function() {
    var fragment, optional_param_matcher, ordered_params, param_matcher, param_name, params, path, response, router_params, url, view, _ref;
    if (typeof arguments[0] === 'string' && (ViewManager.views[arguments[0]] != null)) {
      router_params = {};
      router_params[arguments[0]] = {};
      arguments[0] = router_params;
    }
    if (typeof arguments[0] === 'object') {
      _ref = arguments[0];
      for (view in _ref) {
        params = _ref[view];
        if (is_array(params)) {
          params = params_from_ordered_params_and_route(params, routes_by_view[view]);
        }
        url = String(routes_by_view[view]);
        if (params.path) {
          url = url.replace(/\*/, params.path.replace(/^\//, ''));
        }
        param_matcher = new RegExp('(\\()?\\:([\\w]+)(\\))?(\\?)?(/|$)', 'g');
        for (param_name in params) {
          url = url.replace(param_matcher, function() {
            if (arguments[2] === param_name) {
              return params[param_name] + arguments[5];
            } else {
              return (arguments[1] || '') + ':' + arguments[2] + (arguments[3] || '') + (arguments[4] || '') + arguments[5];
            }
          });
        }
        optional_param_matcher = new RegExp('(\\()?\\:([\\w]+)(\\))?\\?(/|$)', 'g');
        url = url.replace(optional_param_matcher, '');
        if (typeof arguments[1] === 'function') {
          dispatcher(ViewManager(view), params, arguments[1]);
        }
        return url.replace(/\([^\)]+\)/g, '');
      }
    } else if (typeof arguments[0] === 'string') {
      fragment = arguments[0];
      for (path in routes_by_path) {
        view = routes_by_path[path];
        if (routes_regexps_by_path[path].test(fragment)) {
          ordered_params = routes_regexps_by_path[path].exec(fragment).slice(1);
          params = params_from_ordered_params_and_route(ordered_params, path);
          response = {};
          response[view] = params;
          if (typeof arguments[1] === 'function') {
            dispatcher(ViewManager(view), params, arguments[1]);
          }
          return response;
        }
      }
      return View.trigger('error', 'Could not resolve the url: ' + arguments[0]);
    }
  };
  View.extend({
    extend: {
      route: function(route, discard) {
        RouteResolver(route, function() {});
        return discard();
      }
    }
  });
  View.extend({
    extend: {
      routes: function(routes, discard) {
        var dependent_views, path, regexp, view;
        dependent_views = [];
        for (path in routes) {
          view = routes[path];
          dependent_views.push(view);
          routes_by_path[path] = view;
          regexp = '^' + path.replace(named_param, "([^\/]*)").replace(splat_param, "(.*?)") + '$';
          routes_regexps_by_path[path] = new RegExp(regexp);
          routes_by_view[view] = path;
          Router._views.push(view);
        }
        View.env({
          browser: function() {
            return create_router();
          }
        });
        Router.mixin.push([
          'initialize', function(next) {
            var view, _i, _len;
            Router.view = this;
            this.router = [];
            for (_i = 0, _len = dependent_views.length; _i < _len; _i++) {
              view = dependent_views[_i];
              this.router.push(ViewManager(view));
            }
            this.on({
              ready: function() {
                var view, _i, _len;
                for (_i = 0, _len = dependent_views.length; _i < _len; _i++) {
                  view = dependent_views[_i];
                  add_default_activation_events(ViewManager(view));
                }
                return View.env({
                  browser: function() {
                    return History.Adapter.trigger(window, 'statechange');
                  }
                });
              }
            });
            return next();
          }
        ]);
        return discard();
      }
    }
  });
  View.extend({
    url: function(params) {
      var params_contain_view_name, router_params;
      params_contain_view_name = function(params) {
        var key_count, param_name;
        key_count = 0;
        for (param_name in params) {
          ++key_count;
        }
        return key_count === 1 && (ViewManager.views[param_name] != null);
      };
      if (params_contain_view_name(params)) {
        router_params = params;
      } else {
        router_params = {};
        router_params[this.name] = {};
        extend(router_params[this.name], this.attributes);
        extend(router_params[this.name], params || {});
      }
      return RouteResolver(router_params);
    }
  });
  add_default_activation_events = function(view_instance) {
    var hide, noop, remove, show;
    hide = function() {
      return this[0].style.display = 'none';
    };
    show = function() {
      return this[0].style.display = null;
    };
    remove = function() {
      return this[0].parentNode.removeChild(this[0]);
    };
    noop = function() {};
    view_instance.bind({
      activated: function() {
        return this.env({
          test: show,
          browser: show,
          server: noop
        });
      },
      deactivated: function() {
        return this.env({
          test: hide,
          browser: hide,
          server: remove
        });
      }
    });
    return view_instance.env({
      test: hide,
      browser: hide
    });
  };
  create_router = function() {
    var root_url;
    root_url = History.getRootUrl();
    $('a').live('click', function(event) {
      var href;
      if (event.which === 2 || event.metaKey) {
        return true;
      }
      href = $(this).attr('href');
      if (/:\/\//.test(href)) {
        return true;
      }
      if (History.enabled) {
        History.pushState(null, '', href);
        event.preventDefault();
        return false;
      }
    });
    return History.Adapter.bind(window, 'statechange', function() {
      var state, url;
      state = History.getState();
      url = state.url.replace(root_url, '/');
      if (typeof pageTracker != "undefined" && pageTracker !== null) {
        pageTracker._trackPageview(url);
      }
      return RouteResolver(url, function() {});
    });
  };
  has_change_callback = function(view) {
    var event_name;
    if (!(view._callbacks != null)) {
      return false;
    }
    for (event_name in view._callbacks) {
      if (event_name === 'change' || event_name.match(/^change\:/)) {
        if (view._callbacks[event_name].length > 0) {
          return true;
        }
      }
    }
    return false;
  };
  dispatcher = function(view_instance, params, callback) {
    var did_change, did_change_observer, dispatch, ensure_parent_node, next;
    did_change = false;
    did_change_observer = function() {
      return did_change = true;
    };
    ensure_parent_node = function() {
      if (!view_instance[0].parentNode) {
        return view_instance.trigger('error', 'This view is part of a Router, and must be attched to a parent node.');
      }
    };
    next = function() {
      var router_view_ready, was_called;
      was_called = false;
      router_view_ready = function() {
        var _i, _len, _ref, _view, _view_instance;
        was_called = true;
        Router.view.unbind('ready', router_view_ready);
        view_instance.unbind('render', next);
        _ref = view_instance.views || [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          _view = _ref[_i];
          _view_instance = ViewManager(_view);
          _view_instance.unbind('render', next);
        }
        if (Router._lastActivatedView) {
          ViewManager(Router._lastActivatedView).trigger('deactivated');
        }
        view_instance.trigger('activated');
        Router._lastActivatedView = view_instance.name;
        callback.call(view_instance, view_instance, params);
        View.trigger('route', view_instance);
        return View.trigger('route:' + view_instance.name, view_instance);
      };
      return Router.view.bind('ready', router_view_ready);
    };
    dispatch = function() {
      var _i, _len, _ref, _view, _view_instance;
      view_instance.bind('render', next);
      _ref = view_instance.views || [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        _view = _ref[_i];
        _view_instance = ViewManager(_view);
        _view_instance.bind('render', next);
      }
      view_instance.bind('change', did_change_observer);
      view_instance.set(params);
      view_instance.unbind('change', did_change_observer);
      if (!did_change) {
        return next();
      } else if (!has_change_callback(view_instance)) {
        return view_instance.trigger('error', 'View with route must respond to a change, or change:key event with a render() call.');
      }
    };
    if (!Router._initializedViews[view_instance.name]) {
      Router._initializedViews[view_instance.name] = true;
      view_instance.bind({
        ready: dispatch
      });
      return view_instance.initialize();
    } else {
      return dispatch();
    }
  };
  params_from_ordered_params_and_route = function(ordered_params, route) {
    var i, key, keys, params, _len;
    params = {};
    keys = [];
    String(route).concat('/?').replace(/\/\(/g, '(?:/').replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional) {
      return keys.push(key);
    });
    for (i = 0, _len = keys.length; i < _len; i++) {
      key = keys[i];
      params[key] = ordered_params[i];
    }
    return params;
  };
  View.extend({
    log: function(method_name) {
      var execute, _i, _len, _method_name, _results;
      execute = function(method_name) {
        return this.before(method_name, function() {
          var args, next, response;
          next = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          response = next.apply(this, args);
          console.log("" + this.name + "." + method_name, array_from(args), ' -> ', response);
          return response;
        });
      };
      if (is_array(method_name)) {
        _results = [];
        for (_i = 0, _len = method_name.length; _i < _len; _i++) {
          _method_name = method_name[_i];
          _results.push(execute.call(this, _method_name));
        }
        return _results;
      } else {
        return execute.call(this, method_name);
      }
    }
  });
  View.extend({
    extend: {
      log: function(method_name) {
        return this.log(method_name);
      }
    }
  });
  deffered = {};
  ViewManager = function() {
    var callback, class_name, response, _callback, _i, _len, _ref, _ref2;
    if (typeof arguments[arguments.length - 1] === 'function') {
      callback = arguments[arguments.length - 1];
    }
    if (is_array(arguments[0]) || typeof arguments[0] === 'string') {
      response = [];
      _ref = array_flatten(array_from(arguments));
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        class_name = _ref[_i];
        if (typeof class_name === 'string') {
          if (!(ViewManager.views[class_name] != null)) {
            View.trigger('error', "" + class_name + " has not been created.");
          }
          response.push(ViewManager.views[class_name]);
        }
      }
      if (typeof arguments[0] === 'string') {
        return response[0];
      } else {
        return response;
      }
    } else {
      response = {};
      _ref2 = arguments[0];
      for (class_name in _ref2) {
        _callback = _ref2[class_name];
        if (!(ViewManager.views[class_name] != null)) {
          response[class_name] = null;
          if (!(deffered[class_name] != null)) {
            deffered[class_name] = [];
          }
          deffered[class_name].push(_callback);
        } else {
          response[class_name] = ViewManager.views[class_name];
          _callback.call(response[class_name], response[class_name]);
        }
      }
      return response;
    }
  };
  ViewManager.views = {};
  ViewManager.create = proxy(View.create, View);
  ViewManager.extend = proxy(View.extend, View);
  ViewManager.env = proxy(View.env, View);
  if (typeof window != "undefined" && window !== null) {
    window.View = ViewManager;
    window.Builder = Builder;
    window.Router = Router;
    window.RouteResolver = RouteResolver;
  }
  if ((typeof module != "undefined" && module !== null ? module.exports : void 0) != null) {
    module.exports.View = ViewManager;
    module.exports.Builder = Builder;
    module.exports.Router = Router;
    module.exports.RouteResolver = RouteResolver;
  }
}).call(this);
