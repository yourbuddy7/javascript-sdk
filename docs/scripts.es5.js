document.addEventListener("DOMContentLoaded",function(){function t(t,e){var n=document.createElement("details"),c=document.createElement("summary");c.innerHTML=t,n.appendChild(c);var o=document.createElement("div"),i=document.createElement("pre");i.classList.add("prettyprint"),i.innerHTML=JSON.stringify(e,null,4),o.appendChild(i),n.appendChild(o),r.appendChild(n),window.prettyPrint()}function e(e,n){return t(e+" (Error)",n)}function n(n){(function(e){var n=c.get(e.currency_code);return new Promise(function(r,i){"string"==typeof n&&n.length?o.getCart(n).then(function(e){t("Existing cart",e),r(e)}).catch(function(t){return i(t)}):o.createCart(e.currency_code).then(function(t){c.set(e.currency_code,t.id),r(t)}).catch(function(t){return i(t)})})})(n).then(function(r){r.add({id:n.id,variant_id:n.variants[0].id}).then(function(e){t("Added",e),e.checkout()}).catch(function(t){return e("Added",t)})}).catch(function(t){return e("Get cart",t)})}var r=document.getElementById("output"),c={get key(){return"carts"},get:function(t){var e=window.localStorage.getItem(this.key);if(null===e)return"string"==typeof t&&t.length,{};if(e=JSON.parse(e),"string"!=typeof t)return e;var n=t.toLowerCase();return n in e?e[n]:{}},set:function(t,e){var n=c.get();n[t.toLowerCase()]=e,window.localStorage.setItem(this.key,JSON.stringify(n))},remove:function(t){var e=c.get();delete e[t.toLowerCase()],window.localStorage.setItem(this.key,JSON.stringify(e))}},o=new SelzClient({id:13,env:"local",colors:{buttons:{background:"#303e4c",text:"#97e66a"},checkout:{background:"#303e4c",text:"#97e66a"}}});t("Config",o.config),o.getProduct("http://selz.co/1rvbhT6").then(function(e){t("Product",e),n(e)}).catch(function(t){return e("Product",t)}),window.client=o});

//# sourceMappingURL=scripts.es5.js.map
