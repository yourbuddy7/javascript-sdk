!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define("Selz",["exports"],e):e(t.Selz={})}(this,function(t){"use strict";function e(t){return(e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function r(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function i(t,e,n){return e&&r(t.prototype,e),n&&r(t,n),t}function o(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function c(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){var n=[],r=!0,i=!1,o=void 0;try{for(var c,a=t[Symbol.iterator]();!(r=(c=a.next()).done)&&(n.push(c.value),!e||n.length!==e);r=!0);}catch(t){i=!0,o=t}finally{try{r||null==a.return||a.return()}finally{if(i)throw o}}return n}(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}var a=function(t){return null!=t?t.constructor:null},u=function(t){return Array.isArray(t)},s=function(t){return a(t)===Object},f=function(t){return a(t)===String},l=function(t){return null==t},d=function(t){return l(t)||(f(t)||u(t))&&!t.length||s(t)&&!Object.keys(t).length},v={array:u,object:s,number:function(t){return a(t)===Number&&!Number.isNaN(t)},string:f,boolean:function(t){return a(t)===Boolean},function:function(t){return a(t)===Function},nullOrUndefined:l,objectId:function(t){return f(t)&&/^[a-f\d]{24}$/i.test(t)},currencyCode:function(t){return f(t)&&/^[A-z]{3}$/.test(t)},url:function(t){var e=!!(1<arguments.length&&void 0!==arguments[1])&&arguments[1];if(function(t,e){return!!(t&&e&&t instanceof e)}(t,window.URL))return!0;var n=t;e||/^https?:\/\/*/.test(t)||(n="http://".concat(t));try{return!d(new URL(n).hostname)}catch(t){return!1}},empty:d},h=function(t){return"https://".concat(v.empty(t)?"sdk.selz.com":"".concat(t,"/sdk"),"/")},g={product:function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:"";return"".concat(h(t),"products/find?url=").concat(e)},products:function(t,e){var n=2<arguments.length&&void 0!==arguments[2]?arguments[2]:"",r=3<arguments.length&&void 0!==arguments[3]?arguments[3]:"",i=4<arguments.length&&void 0!==arguments[4]?arguments[4]:1;return"".concat(h(t),"products/all/").concat(e,"?q=").concat(n,"&c=").concat(r,"&p=").concat(i)},categories:function(t,e){return"".concat(h(t),"categories/").concat(e)},store:function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:null;return v.number(e)?"".concat(h(t),"store/find/").concat(e):"".concat(h(t),"store/find?url=").concat(e)},createCart:function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:"";return"".concat(h(t),"cart/create/").concat(e)},getCart:function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:"";return"".concat(h(t),"cart/").concat(e)},checkCarts:function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:"";return"".concat(h(t),"cart/verify?ids=").concat(e)},addToCart:function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:"";return"".concat(h(t),"cart/add/").concat(e)},updateCartItemQuantity:function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:"";return"".concat(h(t),"cart/updateitemquantity/").concat(e)},removeFromCart:function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:"";return"".concat(h(t),"cart/remove/").concat(e)}},y=null,p=function t(e){n(this,t),Object.assign(this,e)},m=function t(e){n(this,t),Object.assign(this,e)},b=function t(e){n(this,t),Object.assign(this,e),this.cover=new m(e.cover)},w=function t(e){n(this,t),Object.assign(this,e)},j=function t(e){var r=1<arguments.length&&void 0!==arguments[1]?arguments[1]:"";n(this,t),Object.assign(this,e),this.selected=e.id===r},C=function t(e,r){n(this,t),this.id=e,this.label=r},k=function t(e){n(this,t),Object.assign(this,e),this.options=Object.keys(e.options).map(function(t){return new C(t,e.options[t])})},O=function(){function t(e,r){var i=2<arguments.length&&void 0!==arguments[2]?arguments[2]:"";if(n(this,t),v.object(r)){if(y=e,Object.assign(this,r),this.store=y.store,v.object(r.urls)&&(this.urls=new p(r.urls)),v.object(r.media)&&(this.media=new b(r.media)),v.array(r.images)&&(this.images=r.images.map(function(t){return new m(t)})),v.array(r.files)&&(this.files=r.files.map(function(t){return new w(t)})),r.has_variants){var o=v.empty(i)?r.variants[0].id:i;this.variants=r.variants.map(function(t){return new j(t,o)})}r.has_variant_attributes&&(this.variant_attributes=r.variant_attributes.map(function(t){return new k(t)}))}}return i(t,[{key:"selected_variant",get:function(){return v.empty(this.variants)?null:this.variants.find(function(t){return t.selected})}}]),t}(),S=null,I=function t(e,r){n(this,t),this.cartId=r,Object.assign(this,e),this.product=new O(S,e.product,e.variant_id)},E=function(){function t(e,r){var i=!!(2<arguments.length&&void 0!==arguments[2])&&arguments[2];n(this,t),null===r||(S=e,Object.assign(this,r),this.store=S.store,this.active=i,this.items=Array.from(r.items).map(function(t){return new I(t,r.id)}))}return i(t,[{key:"add",value:function(t){return S.addToCart(this.id,t)}},{key:"remove",value:function(t){return S.removeFromCart(this.id,t)}}]),t}(),A=function t(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:null;n(this,t),v.object(e)&&Object.assign(this,e)},P=function t(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:null;n(this,t),v.object(e)&&Object.assign(this,e)};function _(){var t=0<arguments.length&&void 0!==arguments[0]?arguments[0]:"",e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:"",n=2<arguments.length&&void 0!==arguments[2]?arguments[2]:"";return t.replace(new RegExp(e.toString().replace(/([.*+?^=!:${}()|[\]\/\\])/g,"\\$1"),"g"),n.toString())}var q=function(){var t,n=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{},r=1<arguments.length?arguments[1]:void 0,i=2<arguments.length?arguments[2]:void 0,o=r||new FormData;return v.object(n)?(Object.keys(n).forEach(function(r){t=i?"".concat(i,"[").concat(r,"]"):r,"object"!==e(n[r])||n[r]instanceof File?o.append(function(){var t=(0<arguments.length&&void 0!==arguments[0]?arguments[0]:"").toString();return t=_(t,"-"," "),t=_(t,"_"," "),_(t=function(){return(0<arguments.length&&void 0!==arguments[0]?arguments[0]:"").toString().replace(/\w\S*/g,function(t){return t.charAt(0).toUpperCase()+t.substr(1).toLowerCase()})}(t)," ","")}(t),n[r]):q(n[r],o,r)}),o):o};function U(){for(var t=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{},e=arguments.length,n=Array(1<e?e-1:0),r=1;r<e;r++)n[r-1]=arguments[r];if(!n.length)return t;var i=n.shift();return v.object(i)?(Object.keys(i).forEach(function(e){v.object(i[e])?(!Object.keys(t).includes(e)&&Object.assign(t,o({},e,{})),U(t[e],i[e])):Object.assign(t,o({},e,i[e]))}),U.apply(void 0,[t].concat(n))):t}var T={type:"GET",body:{},responseType:"json"};function x(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},n=U({},T,e),r=n.type,i=n.body,o=n.responseType;return new Promise(function(e,n){try{var c=new XMLHttpRequest;if(!("withCredentials"in c)){var a=new Error("No CORS support");throw a.request=c,a}var u=function(){var t=new Error(c.status);t.request=c,n(t)};c.addEventListener("load",function(){var t=c.response;return 400<=c.status?void u():void("json"===o?function(){var t=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{};return new Promise(function(e,n){try{e(JSON.parse(t))}catch(t){n(t)}})}(t).then(function(t){if(t.success)e(t.data);else{var r=new Error("Request failed");r.errors=t.errors,n(r)}}).catch(n):e(t))}),c.addEventListener("error",u),c.open(r,t,!0),"json"!==o&&(c.responseType=o),c.send(q(i))}catch(t){n(t)}})}var N={},L=function(t){if(!Object.keys(N).includes(t)){N[t]=x(t);var e=function(){delete N[t]};N[t].then(e).catch(e)}return N[t]},R=function(t){return x(t,{type:"POST",body:1<arguments.length&&void 0!==arguments[1]?arguments[1]:{}})};var F=new Map,D=function(t){if(null===t)return null;var e=function(t){var e=t;/^https?:\/\/*/.test(t)||(e="http://".concat(t));try{return new URL(e)}catch(t){return null}}(t);return null===e?null:"".concat(e.host).concat(e.pathname).replace(/\/$/,"")},z=function(){function t(e){n(this,t),this.config=Object.assign({keys:{root:"selz-js-sdk",carts:"carts",stores:"stores"},ttl:3600,schema:new Date("2018-07-02").getTime()},e),this.purge()}return i(t,[{key:"get",value:function(e){var n=F.get(this.config.keys.root);if(t.supported){var r=window.localStorage.getItem(this.config.keys.root);v.empty(r)||(n=JSON.parse(r))}return v.empty(n)?null:v.empty(e)?n:Object.keys(n).includes(e)?n[e]:null}},{key:"set",value:function(e,n){var r=!!(2<arguments.length&&void 0!==arguments[2])&&arguments[2],i=this.get()||{};if(i[e]=r&&Object.keys(i).includes(e)?U(i[e],n):n,F.set(this.config.keys.root,i),t.supported){i.schema=this.config.schema;try{window.localStorage.setItem(this.config.keys.root,JSON.stringify(i))}catch(t){}}}},{key:"purge",value:function(){var t=this.get();if(!v.empty(t)){if(+t.schema!==this.config.schema)return void window.localStorage.removeItem(this.config.keys.root);var e=this.get(this.config.keys.stores)||[];v.empty(e)||this.set(this.config.keys.stores,e.filter(function(t){var e=+t.ttl;return 0<e&&e>Date.now()}))}}},{key:"getCarts",value:function(t){var e=this.get(this.config.keys.carts)||{};return v.empty(e)?null:v.number(t)?Object.keys(e).includes(t.toString())?e[t.toString()]:null:e}},{key:"getCart",value:function(t,e){var n=this.getCarts(t);return v.empty(n)?null:v.string(e)?Object.keys(n).includes(e.toUpperCase())?n[e.toUpperCase()]:null:n}},{key:"setCart",value:function(t,e,n){this.set(this.config.keys.carts,o({},t,o({},e.toUpperCase(),{id:n.id,active:n.active})),!0)}},{key:"setCarts",value:function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{};this.set(this.config.keys.carts,o({},t,e))}},{key:"getStore",value:function(t){var e=null;if(!v.number(t)&&!v.url(t))return null;var n=this.get(this.config.keys.stores)||[];if(v.number(t))e=n.find(function(e){return v.object(e.data)&&e.data.id===t});else if(v.url(t)){var r=D(t);if(null===r)return null;e=n.find(function(t){return v.array(t.urls)&&t.urls.includes(r)})}if(!v.object(e))return null;var i=+e.ttl;return 0<i&&i<Date.now()?(this.purge(),null):new P(e.data)}},{key:"setStore",value:function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:null,n=D(e),r=this.get(this.config.keys.stores)||[],i=null;v.empty(r)||(i=r.find(function(e){return e.data.id===t.id}));var o=Date.now()+this.config.ttl;if(v.object(i)){if(Object.assign(i,{data:t,ttl:o}),null!==n){v.array(i.urls)?i.urls.push(n):i.urls=[n];var c=function(t){return v.array(t)?t.filter(function(e,n){return t.indexOf(e)===n}):t}(i.urls);Object.assign(i,{urls:c})}}else{var a={data:t,ttl:o};null!==n&&Object.assign(a,{urls:[n]}),r.push(a)}this.set(this.config.keys.stores,r)}}],[{key:"supported",get:function(){if(!window.localStorage)return!1;try{return window.localStorage.setItem("___test","___test"),window.localStorage.removeItem("___test"),!0}catch(t){return!1}}}]),t}(),$=function(){function t(e){n(this,t);var r=e.env,i=e.store;if(this.env=v.empty(r)?"":r,this.store=i,!v.url(i)&&!v.number(i))throw Error("A store ID or URL is required to create a client");this.storage=new z}return i(t,[{key:"getStoreId",value:function(){var t=this;return new Promise(function(e,n){return v.number(t.store)?void e(t.store):t.store instanceof P?void e(t.store.id):(!v.url(t.store)&&n(new Error("Url is required for user lookup")),void t.getStore().then(function(t){e(t.id)}).catch(n))})}},{key:"getStore",value:function(){var t=this;return new Promise(function(e,n){if(v.number(t.store)||v.url(t.store)){var r=t.storage.getStore(t.store);if(null!==r&&r instanceof P)return void e(r)}if(t.store instanceof P)e(t.store);else{var i=g.store(t.env,t.store);L(i).then(function(n){t.setStore(n),e(t.store)}).catch(n)}})}},{key:"setStore",value:function(t){if(v.object(t)){var e=v.url(this.store)?this.store:null;this.store=new P(t),this.storage.setStore(this.store,e)}}},{key:"getProduct",value:function(t){var e=this;return new Promise(function(n,r){L(g.product(e.env,t)).then(function(t){e.store instanceof P||e.setStore(t.store),n(new O(e,t))}).catch(r)})}},{key:"getProducts",value:function(){var t=this,e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:"",n=1<arguments.length&&void 0!==arguments[1]?arguments[1]:"",r=2<arguments.length&&void 0!==arguments[2]?arguments[2]:1;return new Promise(function(i,o){t.getStoreId().then(function(c){L(g.products(t.env,c,v.empty(e)?"":e,v.string(n)?n:"",!v.number(r)||1>r?1:r)).then(function(e){i(Object.assign({},e,{products:e.products.map(function(e){return new O(t,e)})}))}).catch(o)}).catch(o)})}},{key:"getCategories",value:function(){var t=this;return new Promise(function(e,n){t.getStoreId().then(function(r){L(g.categories(t.env,r)).then(function(t){e(Object.assign({},t,{categories:t.categories.map(function(t){return new A(t)})}))}).catch(n)}).catch(n)})}},{key:"createCart",value:function(t,e){var n=this;return new Promise(function(r,i){return v.empty(t)?void i(new Error("currency is required")):void n.getStoreId().then(function(o){var c=t.toUpperCase();R(g.createCart(n.env,o),{currency:c,discount:v.empty(e)?null:e}).then(function(t){var e=new E(n,t);n.storage.setCart(o,c,e),r(e)}).catch(i)}).catch(i)})}},{key:"getCartId",value:function(t){var e=this;return new Promise(function(n,r){return v.currencyCode(t)?void e.getStoreId().then(function(i){var o=t.toUpperCase(),c=e.storage.getCart(i,o);v.empty(c)?e.createCart(o).then(function(t){return n(t.id)}).catch(r):n(c.id)}).catch(r):void r(new Error("A valid currency code is required"))})}},{key:"getCart",value:function(t){var e=this;return new Promise(function(n,r){var i=v.currencyCode(t),o=v.objectId(t);if(i||o)if(i){var c=t.toUpperCase();e.getCartId(c).then(function(t){return v.empty(t)?void r(new Error("Could not find matching cart for currency code '".concat(c,"'"))):void e.getCart(t).then(function(t){e.setStore(t.store),n(t)}).catch(r)}).catch(r)}else L(g.getCart(e.env,t)).then(function(t){var r=e.getActiveCart(),i=new E(e,t,t.id===r);e.setStore(i.store),n(i)}).catch(r);else r(new Error("A valid currency code or cart id are required"))})}},{key:"getCarts",value:function(){var t=this,e=!(0<arguments.length&&void 0!==arguments[0])||arguments[0];return new Promise(function(n,r){t.getStoreId().then(function(i){var o=t.storage.getCarts(i);if(v.empty(o))n(null);else if(e){var a=Object.keys(o).map(function(t){return o[t].id});L(g.checkCarts(t.env,a.join(","))).then(function(e){Object.entries(e).forEach(function(t){var e=c(t,2),n=e[0];if(!e[1]){var r=Object.keys(o).find(function(t){return o[t].id===n});delete o[r]}}),t.storage.setCarts(i,o),Object.values(o).find(function(t){return t.active})?n(o):t.setActiveCart().then(n).catch(r)}).catch(r)}else n(o)}).catch(r)})}},{key:"setActiveCart",value:function(){var t=this,e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:null;return new Promise(function(n,r){t.getStoreId().then(function(i){t.getCarts(!1).then(function(o){var c=o;if(v.empty(c))n(null);else{if(v.currencyCode(e)){var a=e.toUpperCase(),u=Object.keys(c);if(!u.includes(a))return void r(new Error("No carts for ".concat(a)));u.forEach(function(t){c[t].active=t===a})}else{var s=v.objectId(e)?e:c[Object.keys(c)[0]].id;Object.keys(c).forEach(function(t){var e=c[t];e.active=e.id===s})}t.storage.setCarts(i,c),n(c)}})}).catch(r)})}},{key:"getActiveCart",value:function(){var t=this,e=!!(0<arguments.length&&void 0!==arguments[0])&&arguments[0];return new Promise(function(n,r){t.getStoreId().then(function(i){var o=t.storage.getCarts(i);if(Object.keys(o).length){var c=Object.values(o).find(function(t){return t.active});return c?e?void t.getCart(c.id).then(n).catch(r):void n(c.id):void n(null)}n(null)}).catch(r)})}},{key:"addToCart",value:function(t,e){var n=this;return new Promise(function(r,i){return v.objectId(t)?v.empty(e)?void i(new Error("A valid product is required")):void R(g.addToCart(n.env,t),e).then(function(t){var e=new E(n,t,!0);n.setStore(e.store),n.setActiveCart(e.id).then(function(){r(e)}).catch(i)}).catch(i):void i(new Error("A valid id is required"))})}},{key:"updateCartItemQuantity",value:function(t,e){var n=this,r=2<arguments.length&&void 0!==arguments[2]?arguments[2]:1;return new Promise(function(i,o){return v.objectId(t)?v.empty(e)?void o(new Error("A valid index is required")):void R(g.updateCartItemQuantity(n.env,t),{index:e,quantity:r}).then(function(t){var e=new E(n,t,!0);n.setStore(e.store),n.setActiveCart(e.id).then(function(){i(e)}).catch(o)}).catch(o):void o(new Error("A valid id is required"))})}},{key:"removeFromCart",value:function(t,e){var n=this;return new Promise(function(r,i){return v.objectId(t)?v.empty(e)?void i(new Error("A valid index is required")):void R(g.removeFromCart(n.env,t),{index:e}).then(function(t){if(v.empty(t))n.getCarts().then(function(){return r(null)}).catch(i);else{var e=new E(n,t,!0);n.setActiveCart(e.id).then(function(){r(e)}).catch(i)}}).catch(i):void i(new Error("A valid id is required"))})}}]),t}();t.Product=O,t.Category=A,t.Cart=E,t.CartItem=I,t.Store=P,t.default=$,Object.defineProperty(t,"__esModule",{value:!0})});
//# sourceMappingURL=client.js.map
