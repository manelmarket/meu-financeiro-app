import{n as Ts,F as vs}from"./index-nDAO0xpr.js";const bs=()=>{};var Xn={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qr=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let i=n.charCodeAt(r);i<128?e[t++]=i:i<2048?(e[t++]=i>>6|192,e[t++]=i&63|128):(i&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(i=65536+((i&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=i>>18|240,e[t++]=i>>12&63|128,e[t++]=i>>6&63|128,e[t++]=i&63|128):(e[t++]=i>>12|224,e[t++]=i>>6&63|128,e[t++]=i&63|128)}return e},As=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const i=n[t++];if(i<128)e[r++]=String.fromCharCode(i);else if(i>191&&i<224){const s=n[t++];e[r++]=String.fromCharCode((i&31)<<6|s&63)}else if(i>239&&i<365){const s=n[t++],o=n[t++],l=n[t++],d=((i&7)<<18|(s&63)<<12|(o&63)<<6|l&63)-65536;e[r++]=String.fromCharCode(55296+(d>>10)),e[r++]=String.fromCharCode(56320+(d&1023))}else{const s=n[t++],o=n[t++];e[r++]=String.fromCharCode((i&15)<<12|(s&63)<<6|o&63)}}return e.join("")},Gr={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let i=0;i<n.length;i+=3){const s=n[i],o=i+1<n.length,l=o?n[i+1]:0,d=i+2<n.length,g=d?n[i+2]:0,_=s>>2,y=(s&3)<<4|l>>4;let w=(l&15)<<2|g>>6,P=g&63;d||(P=64,o||(w=64)),r.push(t[_],t[y],t[w],t[P])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(qr(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):As(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let i=0;i<n.length;){const s=t[n.charAt(i++)],l=i<n.length?t[n.charAt(i)]:0;++i;const g=i<n.length?t[n.charAt(i)]:64;++i;const y=i<n.length?t[n.charAt(i)]:64;if(++i,s==null||l==null||g==null||y==null)throw new Ss;const w=s<<2|l>>4;if(r.push(w),g!==64){const P=l<<4&240|g>>2;if(r.push(P),y!==64){const S=g<<6&192|y;r.push(S)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class Ss extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Ps=function(n){const e=qr(n);return Gr.encodeByteArray(e,!0)},wt=function(n){return Ps(n).replace(/\./g,"")},Kr=function(n){try{return Gr.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rs(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ns=()=>Rs().__FIREBASE_DEFAULTS__,ks=()=>{if(typeof process>"u"||typeof Xn>"u")return;const n=Xn.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},Cs=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&Kr(n[1]);return e&&JSON.parse(e)},Tn=()=>{try{return bs()||Ns()||ks()||Cs()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},Jr=n=>{var e,t;return(t=(e=Tn())==null?void 0:e.emulatorHosts)==null?void 0:t[n]},Ds=n=>{const e=Jr(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},Xr=()=>{var n;return(n=Tn())==null?void 0:n.config},Yr=n=>{var e;return(e=Tn())==null?void 0:e[`_${n}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Os{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vs(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",i=n.iat||0,s=n.sub||n.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o={iss:`https://securetoken.google.com/${r}`,aud:r,iat:i,exp:i+3600,auth_time:i,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}},...n};return[wt(JSON.stringify(t)),wt(JSON.stringify(o)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function F(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Ls(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(F())}function Ms(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Us(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function Fs(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function xs(){const n=F();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function $s(){try{return typeof indexedDB=="object"}catch{return!1}}function Bs(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(r);i.onsuccess=()=>{i.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},i.onupgradeneeded=()=>{t=!1},i.onerror=()=>{var s;e(((s=i.error)==null?void 0:s.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const js="FirebaseError";class de extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=js,Object.setPrototypeOf(this,de.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Ze.prototype.create)}}class Ze{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},i=`${this.service}/${e}`,s=this.errors[e],o=s?zs(s,r):"Error",l=`${this.serviceName}: ${o} (${i}).`;return new de(i,l,r)}}function zs(n,e){try{let t=0,r="";for(;t<n.length;){const i=n.indexOf("{$",t);if(i===-1){r+=n.substring(t);break}const s=n.indexOf("}",i+2);if(s===-1){r+=n.substring(t);break}const o=n.substring(i+2,s),l=e[o];r+=n.substring(t,i)+(l!=null?String(l):`<${o}?>`),t=s+1}return r}catch{return n}}function Hs(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function ce(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const i of t){if(!r.includes(i))return!1;const s=n[i],o=e[i];if(Yn(s)&&Yn(o)){if(!ce(s,o))return!1}else if(s!==o)return!1}for(const i of r)if(!t.includes(i))return!1;return!0}function Yn(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function et(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(i=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function Ws(n,e){const t=new qs(n,e);return t.subscribe.bind(t)}class qs{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let i;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");Gs(e,["next","error","complete"])?i=e:i={next:e,error:t,complete:r},i.next===void 0&&(i.next=Gt),i.error===void 0&&(i.error=Gt),i.complete===void 0&&(i.complete=Gt);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Gs(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function Gt(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function M(n){return n&&n._delegate?n._delegate:n}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tt(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Qr(n){return(await fetch(n,{credentials:"include"})).ok}class Re{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ve="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ks{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new Os;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:t});i&&r.resolve(i)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),r=(e==null?void 0:e.optional)??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(i){if(r)return null;throw i}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Xs(e))try{this.getOrInitializeService({instanceIdentifier:ve})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(t);try{const s=this.getOrInitializeService({instanceIdentifier:i});r.resolve(s)}catch{}}}}clearInstance(e=ve){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=ve){return this.instances.has(e)}getOptions(e=ve){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[s,o]of this.instancesDeferred.entries()){const l=this.normalizeInstanceIdentifier(s);r===l&&o.resolve(i)}return i}onInit(e,t){const r=this.normalizeInstanceIdentifier(t),i=this.onInitCallbacks.get(r)??new Set;i.add(e),this.onInitCallbacks.set(r,i);const s=this.instances.get(r);return s&&e(s,r),()=>{i.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const i of r)try{i(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Js(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=ve){return this.component?this.component.multipleInstances?e:ve:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Js(n){return n===ve?void 0:n}function Xs(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ys{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new Ks(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var R;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(R||(R={}));const Qs={debug:R.DEBUG,verbose:R.VERBOSE,info:R.INFO,warn:R.WARN,error:R.ERROR,silent:R.SILENT},Zs=R.INFO,eo={[R.DEBUG]:"log",[R.VERBOSE]:"log",[R.INFO]:"info",[R.WARN]:"warn",[R.ERROR]:"error"},to=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),i=eo[e];if(i)console[i](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class vn{constructor(e){this.name=e,this._logLevel=Zs,this._logHandler=to,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in R))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Qs[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,R.DEBUG,...e),this._logHandler(this,R.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,R.VERBOSE,...e),this._logHandler(this,R.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,R.INFO,...e),this._logHandler(this,R.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,R.WARN,...e),this._logHandler(this,R.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,R.ERROR,...e),this._logHandler(this,R.ERROR,...e)}}const no=(n,e)=>e.some(t=>n instanceof t);let Qn,Zn;function ro(){return Qn||(Qn=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function io(){return Zn||(Zn=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Zr=new WeakMap,un=new WeakMap,ei=new WeakMap,Kt=new WeakMap,bn=new WeakMap;function so(n){const e=new Promise((t,r)=>{const i=()=>{n.removeEventListener("success",s),n.removeEventListener("error",o)},s=()=>{t(Ie(n.result)),i()},o=()=>{r(n.error),i()};n.addEventListener("success",s),n.addEventListener("error",o)});return e.then(t=>{t instanceof IDBCursor&&Zr.set(t,n)}).catch(()=>{}),bn.set(e,n),e}function oo(n){if(un.has(n))return;const e=new Promise((t,r)=>{const i=()=>{n.removeEventListener("complete",s),n.removeEventListener("error",o),n.removeEventListener("abort",o)},s=()=>{t(),i()},o=()=>{r(n.error||new DOMException("AbortError","AbortError")),i()};n.addEventListener("complete",s),n.addEventListener("error",o),n.addEventListener("abort",o)});un.set(n,e)}let ln={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return un.get(n);if(e==="objectStoreNames")return n.objectStoreNames||ei.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return Ie(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function ao(n){ln=n(ln)}function co(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const r=n.call(Jt(this),e,...t);return ei.set(r,e.sort?e.sort():[e]),Ie(r)}:io().includes(n)?function(...e){return n.apply(Jt(this),e),Ie(Zr.get(this))}:function(...e){return Ie(n.apply(Jt(this),e))}}function uo(n){return typeof n=="function"?co(n):(n instanceof IDBTransaction&&oo(n),no(n,ro())?new Proxy(n,ln):n)}function Ie(n){if(n instanceof IDBRequest)return so(n);if(Kt.has(n))return Kt.get(n);const e=uo(n);return e!==n&&(Kt.set(n,e),bn.set(e,n)),e}const Jt=n=>bn.get(n);function lo(n,e,{blocked:t,upgrade:r,blocking:i,terminated:s}={}){const o=indexedDB.open(n,e),l=Ie(o);return r&&o.addEventListener("upgradeneeded",d=>{r(Ie(o.result),d.oldVersion,d.newVersion,Ie(o.transaction),d)}),t&&o.addEventListener("blocked",d=>t(d.oldVersion,d.newVersion,d)),l.then(d=>{s&&d.addEventListener("close",()=>s()),i&&d.addEventListener("versionchange",g=>i(g.oldVersion,g.newVersion,g))}).catch(()=>{}),l}const ho=["get","getKey","getAll","getAllKeys","count"],fo=["put","add","delete","clear"],Xt=new Map;function er(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(Xt.get(e))return Xt.get(e);const t=e.replace(/FromIndex$/,""),r=e!==t,i=fo.includes(t);if(!(t in(r?IDBIndex:IDBObjectStore).prototype)||!(i||ho.includes(t)))return;const s=async function(o,...l){const d=this.transaction(o,i?"readwrite":"readonly");let g=d.store;return r&&(g=g.index(l.shift())),(await Promise.all([g[t](...l),i&&d.done]))[0]};return Xt.set(e,s),s}ao(n=>({...n,get:(e,t,r)=>er(e,t)||n.get(e,t,r),has:(e,t)=>!!er(e,t)||n.has(e,t)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class po{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(mo(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function mo(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const hn="@firebase/app",tr="0.16.2";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ue=new vn("@firebase/app"),go="@firebase/app-compat",_o="@firebase/analytics-compat",yo="@firebase/analytics",Io="@firebase/app-check-compat",wo="@firebase/app-check",Eo="@firebase/auth",To="@firebase/auth-compat",vo="@firebase/database",bo="@firebase/data-connect",Ao="@firebase/database-compat",So="@firebase/functions",Po="@firebase/functions-compat",Ro="@firebase/installations",No="@firebase/installations-compat",ko="@firebase/messaging",Co="@firebase/messaging-compat",Do="@firebase/performance",Oo="@firebase/performance-compat",Vo="@firebase/remote-config",Lo="@firebase/remote-config-compat",Mo="@firebase/storage",Uo="@firebase/storage-compat",Fo="@firebase/firestore",xo="@firebase/ai",$o="@firebase/firestore-compat",Bo="firebase",jo="12.19.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dn="[DEFAULT]",zo={[hn]:"fire-core",[go]:"fire-core-compat",[yo]:"fire-analytics",[_o]:"fire-analytics-compat",[wo]:"fire-app-check",[Io]:"fire-app-check-compat",[Eo]:"fire-auth",[To]:"fire-auth-compat",[vo]:"fire-rtdb",[bo]:"fire-data-connect",[Ao]:"fire-rtdb-compat",[So]:"fire-fn",[Po]:"fire-fn-compat",[Ro]:"fire-iid",[No]:"fire-iid-compat",[ko]:"fire-fcm",[Co]:"fire-fcm-compat",[Do]:"fire-perf",[Oo]:"fire-perf-compat",[Vo]:"fire-rc",[Lo]:"fire-rc-compat",[Mo]:"fire-gcs",[Uo]:"fire-gcs-compat",[Fo]:"fire-fst",[$o]:"fire-fst-compat",[xo]:"fire-vertex","fire-js":"fire-js",[Bo]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Et=new Map,Ho=new Map,fn=new Map;function nr(n,e){try{n.container.addComponent(e)}catch(t){ue.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function Me(n){const e=n.name;if(fn.has(e))return ue.debug(`There were multiple attempts to register component ${e}.`),!1;fn.set(e,n);for(const t of Et.values())nr(t,n);for(const t of Ho.values())nr(t,n);return!0}function An(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function G(n){return n==null?!1:n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wo={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different {$mismatchedParam}. Existing: '{$oldValue}'. New: '{$newValue}'.","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},se=new Ze("app","Firebase",Wo);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qo{constructor(e,t,r){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new Re("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw se.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xe=jo;function ti(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r={name:dn,automaticDataCollectionEnabled:!0,...e},i=r.name;if(typeof i!="string"||!i)throw se.create("bad-app-name",{appName:String(i)});if(t||(t=Xr()),!t)throw se.create("no-options");const s=Et.get(i);if(s)if(ce(t,s.options)){if(ce(r,s.config))return s;throw se.create("duplicate-app",{appName:i,mismatchedParam:"config",oldValue:JSON.stringify(s.config),newValue:JSON.stringify(r)})}else throw se.create("duplicate-app",{appName:i,mismatchedParam:"options",oldValue:JSON.stringify(s.options),newValue:JSON.stringify(t)});const o=new Ys(i);for(const d of fn.values())o.addComponent(d);const l=new qo(t,r,o);return Et.set(i,l),l}function ni(n=dn){const e=Et.get(n);if(!e&&n===dn&&Xr())return ti();if(!e)throw se.create("no-app",{appName:n});return e}function we(n,e,t){let r=zo[n]??n;t&&(r+=`-${t}`);const i=r.match(/\s|\//),s=e.match(/\s|\//);if(i||s){const o=[`Unable to register library "${r}" with version "${e}":`];i&&o.push(`library name "${r}" contains illegal characters (whitespace or "/")`),i&&s&&o.push("and"),s&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),ue.warn(o.join(" "));return}Me(new Re(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Go="firebase-heartbeat-database",Ko=1,Ge="firebase-heartbeat-store";let Yt=null;function ri(){return Yt||(Yt=lo(Go,Ko,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(Ge)}catch(t){console.warn(t)}}}}).catch(n=>{throw se.create("idb-open",{originalErrorMessage:n.message})})),Yt}async function Jo(n){try{const t=(await ri()).transaction(Ge),r=await t.objectStore(Ge).get(ii(n));return await t.done,r}catch(e){if(e instanceof de)ue.warn(e.message);else{const t=se.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});ue.warn(t.message)}}}async function rr(n,e){try{const r=(await ri()).transaction(Ge,"readwrite");await r.objectStore(Ge).put(e,ii(n)),await r.done}catch(t){if(t instanceof de)ue.warn(t.message);else{const r=se.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});ue.warn(r.message)}}}function ii(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xo=1024,Yo=30;class Qo{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new ea(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=ir();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(o=>o.date===s))return;if(this._heartbeatsCache.heartbeats.push({date:s,agent:i}),this._heartbeatsCache.heartbeats.length>Yo){const o=ta(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){ue.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=ir(),{heartbeatsToSend:r,unsentEntries:i}=Zo(this._heartbeatsCache.heartbeats),s=wt(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(t){return ue.warn(t),""}}}function ir(){return new Date().toISOString().substring(0,10)}function Zo(n,e=Xo){const t=[];let r=n.slice();for(const i of n){const s=t.find(o=>o.agent===i.agent);if(s){if(s.dates.push(i.date),sr(t)>e){s.dates.pop();break}}else if(t.push({agent:i.agent,dates:[i.date]}),sr(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class ea{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return $s()?Bs().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await Jo(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return rr(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return rr(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...e.heartbeats]})}else return}}function sr(n){return wt(JSON.stringify({version:2,heartbeats:n})).length}function ta(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let r=1;r<n.length;r++)n[r].date<t&&(t=n[r].date,e=r);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function na(n){Me(new Re("platform-logger",e=>new po(e),"PRIVATE")),Me(new Re("heartbeat",e=>new Qo(e),"PRIVATE")),we(hn,tr,n),we(hn,tr,"esm2020"),we("fire-js","")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */na("");var ra="firebase",ia="12.19.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */we(ra,ia,"app");function si(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const sa=si,oi=new Ze("auth","Firebase",si());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Tt=new vn("@firebase/auth");function pt(n,...e){Tt.logLevel<=R.WARN&&Tt.warn(`Auth (${xe}): ${n}`,...e)}function mt(n,...e){Tt.logLevel<=R.ERROR&&Tt.error(`Auth (${xe}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function te(n,...e){throw Sn(n,...e)}function X(n,...e){return Sn(n,...e)}function Lt(n,e,t){const r={...sa(),[e]:t};return new Ze("auth","Firebase",r).create(e,{appName:n.name})}function Ae(n){return Lt(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function oa(n,e,t){const r=t;if(!(e instanceof r))throw r.name!==e.constructor.name&&te(n,"argument-error"),Lt(n,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function Sn(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return oi.create(n,...e)}function T(n,e,...t){if(!n)throw Sn(e,...t)}function oe(n){const e="INTERNAL ASSERTION FAILED: "+n;throw mt(e),new Error(e)}function le(n,e){n||oe(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pn(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.href)||""}function aa(){return or()==="http:"||or()==="https:"}function or(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ca(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(aa()||Us()||"connection"in navigator)?navigator.onLine:!0}function ua(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nt{constructor(e,t){this.shortDelay=e,this.longDelay=t,le(t>e,"Short delay should be less than long delay!"),this.isMobile=Ls()||Fs()}get(){return ca()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Pn(n,e){le(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ai{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;oe("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;oe("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;oe("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const la={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ha=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],da=new nt(3e4,6e4);function Rn(n,e){return n.tenantId&&!e.tenantId?{...e,tenantId:n.tenantId}:e}async function $e(n,e,t,r,i={}){return ci(n,i,async()=>{let s={},o={};r&&(e==="GET"?o=r:s={body:JSON.stringify(r)});const l=et({...o,key:n.config.apiKey}).slice(1),d=await n._getAdditionalHeaders();d["Content-Type"]="application/json",n.languageCode&&(d["X-Firebase-Locale"]=n.languageCode);const g={method:e,headers:d,...s};return Ms()||(g.referrerPolicy="strict-origin-when-cross-origin"),n.emulatorConfig&&tt(n.emulatorConfig.host)&&(g.credentials="include"),ai.fetch()(await ui(n,n.config.apiHost,t,l),g)})}async function ci(n,e,t){n._canInitEmulator=!1;const r={...la,...e};try{const i=new pa(n),s=await Promise.race([t(),i.promise]);i.clearNetworkTimeout();const o=await s.json();if("needConfirmation"in o)throw ut(n,"account-exists-with-different-credential",o);if(s.ok&&!("errorMessage"in o))return o;{const l=s.ok?o.errorMessage:o.error.message,[d,g]=l.split(" : ");if(d==="FEDERATED_USER_ID_ALREADY_LINKED")throw ut(n,"credential-already-in-use",o);if(d==="EMAIL_EXISTS")throw ut(n,"email-already-in-use",o);if(d==="USER_DISABLED")throw ut(n,"user-disabled",o);const _=r[d]||d.toLowerCase().replace(/[_\s]+/g,"-");if(g)throw Lt(n,_,g);te(n,_)}}catch(i){if(i instanceof de)throw i;te(n,"network-request-failed",{message:String(i)})}}async function fa(n,e,t,r,i={}){const s=await $e(n,e,t,r,i);return"mfaPendingCredential"in s&&te(n,"multi-factor-auth-required",{_serverResponse:s}),s}async function ui(n,e,t,r){const i=`${e}${t}?${r}`,s=n,o=s.config.emulator?Pn(n.config,i):`${n.config.apiScheme}://${i}`;return ha.includes(t)&&(await s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(o).toString():o}class pa{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(X(this.auth,"network-request-failed")),da.get())})}}function ut(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const i=X(n,e,r);return i.customData._tokenResponse=t,i}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ma(n,e){return $e(n,"POST","/v1/accounts:delete",e)}async function vt(n,e){return $e(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function He(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function ga(n,e=!1){const t=M(n),r=await t.getIdToken(e),i=Nn(r);T(i&&i.exp&&i.auth_time&&i.iat,t.auth,"internal-error");const s=typeof i.firebase=="object"?i.firebase:void 0,o=s==null?void 0:s.sign_in_provider;return{claims:i,token:r,authTime:He(Qt(i.auth_time)),issuedAtTime:He(Qt(i.iat)),expirationTime:He(Qt(i.exp)),signInProvider:o||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function Qt(n){return Number(n)*1e3}function Nn(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return mt("JWT malformed, contained fewer than 3 sections"),null;try{const i=Kr(t);return i?JSON.parse(i):(mt("Failed to decode base64 JWT payload"),null)}catch(i){return mt("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function ar(n){const e=Nn(n);return T(e,"internal-error"),T(typeof e.exp<"u","internal-error"),T(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ke(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof de&&_a(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function _a({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ya{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const t=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),t}else{this.errorBackoff=3e4;const r=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,r)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mn{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=He(this.lastLoginAt),this.creationTime=He(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function bt(n){var y;const e=n.auth,t=await n.getIdToken(),r=await Ke(n,vt(e,{idToken:t}));T(r==null?void 0:r.users.length,e,"internal-error");const i=r.users[0];n._notifyReloadListener(i);const s=(y=i.providerUserInfo)!=null&&y.length?li(i.providerUserInfo):[],o=wa(n.providerData,s),l=n.isAnonymous,d=!(n.email&&i.passwordHash)&&!(o!=null&&o.length),g=l?d:!1,_={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:o,metadata:new mn(i.createdAt,i.lastLoginAt),isAnonymous:g};Object.assign(n,_)}async function Ia(n){const e=M(n);await bt(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function wa(n,e){return[...n.filter(r=>!e.some(i=>i.providerId===r.providerId)),...e]}function li(n){return n.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ea(n,e){const t=await ci(n,{},async()=>{const r=et({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:s}=n.config,o=await ui(n,i,"/v1/token",`key=${s}`),l=await n._getAdditionalHeaders();l["Content-Type"]="application/x-www-form-urlencoded";const d={method:"POST",headers:l,body:r};return n.emulatorConfig&&tt(n.emulatorConfig.host)&&(d.credentials="include"),ai.fetch()(o,d)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function Ta(n,e){return $e(n,"POST","/v2/accounts:revokeToken",Rn(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ve{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){T(e.idToken,"internal-error"),T(typeof e.idToken<"u","internal-error"),T(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):ar(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){T(e.length!==0,"internal-error");const t=ar(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(T(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:i,expiresIn:s}=await Ea(e,t);this.updateTokensAndExpiration(r,i,Number(s))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:i,expirationTime:s}=t,o=new Ve;return r&&(T(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),i&&(T(typeof i=="string","internal-error",{appName:e}),o.accessToken=i),s&&(T(typeof s=="number","internal-error",{appName:e}),o.expirationTime=s),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Ve,this.toJSON())}_performRefresh(){return oe("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function me(n,e){T(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class J{constructor({uid:e,auth:t,stsTokenManager:r,...i}){this.providerId="firebase",this.proactiveRefresh=new ya(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=r,this.accessToken=r.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new mn(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const t=await Ke(this,this.stsTokenManager.getToken(this.auth,e));return T(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return ga(this,e)}reload(){return Ia(this)}_assign(e){this!==e&&(T(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>({...t})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new J({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){T(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await bt(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(G(this.auth.app))return Promise.reject(Ae(this.auth));const e=await this.getIdToken();return await Ke(this,ma(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const r=t.displayName??void 0,i=t.email??void 0,s=t.phoneNumber??void 0,o=t.photoURL??void 0,l=t.tenantId??void 0,d=t._redirectEventId??void 0,g=t.createdAt??void 0,_=t.lastLoginAt??void 0,{uid:y,emailVerified:w,isAnonymous:P,providerData:S,stsTokenManager:b}=t;T(y&&b,e,"internal-error");const v=Ve.fromJSON(this.name,b);T(typeof y=="string",e,"internal-error"),me(r,e.name),me(i,e.name),T(typeof w=="boolean",e,"internal-error"),T(typeof P=="boolean",e,"internal-error"),me(s,e.name),me(o,e.name),me(l,e.name),me(d,e.name),me(g,e.name),me(_,e.name);const V=new J({uid:y,auth:e,email:i,emailVerified:w,displayName:r,isAnonymous:P,photoURL:o,phoneNumber:s,tenantId:l,stsTokenManager:v,createdAt:g,lastLoginAt:_});return S&&Array.isArray(S)&&(V.providerData=S.map(U=>({...U}))),d&&(V._redirectEventId=d),V}static async _fromIdTokenResponse(e,t,r=!1){const i=new Ve;i.updateFromServerResponse(t);const s=new J({uid:t.localId,auth:e,stsTokenManager:i,isAnonymous:r});return await bt(s),s}static async _fromGetAccountInfoResponse(e,t,r){const i=t.users[0];T(i.localId!==void 0,"internal-error");const s=i.providerUserInfo!==void 0?li(i.providerUserInfo):[],o=!(i.email&&i.passwordHash)&&!(s!=null&&s.length),l=new Ve;l.updateFromIdToken(r);const d=new J({uid:i.localId,auth:e,stsTokenManager:l,isAnonymous:o}),g={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:s,metadata:new mn(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(s!=null&&s.length)};return Object.assign(d,g),d}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cr=new Map;function ae(n){le(n instanceof Function,"Expected a class definition");let e=cr.get(n);return e?(le(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,cr.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hi{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}hi.type="NONE";const ur=hi;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gt(n,e,t){return`firebase:${n}:${e}:${t}`}class Se{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:i,name:s}=this.auth;this.fullUserKey=gt(this.userKey,i.apiKey,s),this.fullPersistenceKey=gt("persistence",i.apiKey,s),this.boundEventHandler=t._onStorageEvent.bind(t);try{this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}catch{}}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await vt(this.auth,{idToken:e}).catch(()=>{});return t?J._fromGetAccountInfoResponse(this.auth,t,e):null}return J._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){try{this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}catch{}}static async create(e,t,r="authUser"){if(!t.length)return new Se(ae(ur),e,r);const i=(await Promise.all(t.map(async g=>{try{if(await g._isAvailable())return g}catch{return}}))).filter(g=>g);let s=i[0]||ae(ur);const o=gt(r,e.config.apiKey,e.name);let l=null;for(const g of t)try{const _=await g._get(o);if(_){let y;if(typeof _=="string"){const w=await vt(e,{idToken:_}).catch(()=>{});if(!w)break;y=await J._fromGetAccountInfoResponse(e,w,_)}else y=J._fromJSON(e,_);g!==s&&(l=y),s=g;break}}catch{}const d=i.filter(g=>g._shouldAllowMigration);return!s._shouldAllowMigration||!d.length?new Se(s,e,r):(s=d[0],l&&await s._set(o,l.toJSON()),await Promise.all(t.map(async g=>{if(g!==s)try{await g._remove(o)}catch{}})),new Se(s,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lr(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(mi(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(di(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(_i(e))return"Blackberry";if(yi(e))return"Webos";if(fi(e))return"Safari";if((e.includes("chrome/")||pi(e))&&!e.includes("edge/"))return"Chrome";if(gi(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function di(n=F()){return/firefox\//i.test(n)}function fi(n=F()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function pi(n=F()){return/crios\//i.test(n)}function mi(n=F()){return/iemobile/i.test(n)}function gi(n=F()){return/android/i.test(n)}function _i(n=F()){return/blackberry/i.test(n)}function yi(n=F()){return/webos/i.test(n)}function kn(n=F()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function va(n=F()){var e;return kn(n)&&!!((e=window.navigator)!=null&&e.standalone)}function ba(){return xs()&&document.documentMode===10}function Ii(n=F()){return kn(n)||gi(n)||yi(n)||_i(n)||/windows phone/i.test(n)||mi(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wi(n,e=[]){let t;switch(n){case"Browser":t=lr(F());break;case"Worker":t=`${lr(F())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${xe}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Aa{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=s=>new Promise((o,l)=>{try{const d=e(s);o(d)}catch(d){l(d)}});r.onAbort=t,this.queue.push(r);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const i of t)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Sa(n,e={}){return $e(n,"GET","/v2/passwordPolicy",Rn(n,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pa=6;class Ra{constructor(e){var r;const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=t.minPasswordLength??Pa,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((r=e.allowedNonAlphanumericCharacters)==null?void 0:r.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),i&&(t.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let i=0;i<e.length;i++)r=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,i,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Na{constructor(e,t,r,i){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new hr(this),this.idTokenSubscription=new hr(this),this.beforeStateQueue=new Aa(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=oi,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=ae(t)),this._initializationPromise=this.queue(async()=>{var r,i,s;if(!this._deleted){try{this.persistenceManager=await Se.create(this,e)}catch(o){pt(`Failed to initialize persistence: ${o}`),this.persistenceManager=await Se.create(this,[])}finally{(r=this._resolvePersistenceManagerAvailable)==null||r.call(this)}if(!this._deleted){if((i=this._popupRedirectResolver)!=null&&i._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}try{await this.initializeCurrentUser(t)}catch(o){pt(`Failed to initialize current user: ${o}`),await this.directlySetCurrentUser(null).catch(()=>{})}this.lastNotifiedUid=((s=this.currentUser)==null?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await vt(this,{idToken:e}),r=await J._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var s;if(G(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(l=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(l,l))}):this.directlySetCurrentUser(null)}const t=await this.assertedPersistence.getCurrentUser();let r=t,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(s=this.redirectUser)==null?void 0:s._redirectEventId,l=r==null?void 0:r._redirectEventId,d=await this.tryRedirectSignIn(e);(!o||o===l)&&(d!=null&&d.user)&&(r=d.user,i=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(r)}catch(o){r=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return T(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await bt(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=ua()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(G(this.app))return Promise.reject(Ae(this));const t=e?M(e):null;return t&&T(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&T(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return G(this.app)?Promise.reject(Ae(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return G(this.app)?Promise.reject(Ae(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(ae(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await Sa(this),t=new Ra(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Ze("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await Ta(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&ae(e)||this._popupRedirectResolver;T(t,this,"argument-error"),this.redirectPersistenceManager=await Se.create(this,[ae(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)==null?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)==null?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((t=this.currentUser)==null?void 0:t.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,i){if(this._deleted)return()=>{};const s=typeof t=="function"?t:t.next.bind(t);let o=!1;const l=this._isInitialized?Promise.resolve():this._initializationPromise;if(T(l,this,"internal-error"),l.then(()=>{o||s(this.currentUser)}).catch(d=>{if(!o)if(typeof t!="function"&&t.error)t.error(d);else if(r)r(d);else throw d}),typeof t=="function"){const d=e.addObserver(t,r,i);return()=>{o=!0,d()}}else{const d=e.addObserver(t);return()=>{o=!0,d()}}}async directlySetCurrentUser(e){if(this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,this.persistenceManager)try{e?await this.persistenceManager.setCurrentUser(e):await this.persistenceManager.removeCurrentUser()}catch(t){const r=(t==null?void 0:t.message)||String(t),i=Lt(this,"internal-error",`An internal AuthError has occurred: ${r}`);throw i.customData={originalError:t},i}}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return T(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=wi(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var i;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=await((i=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:i.getHeartbeatsHeader());t&&(e["X-Firebase-Client"]=t);const r=await this._getAppCheckToken();return r&&(e["X-Firebase-AppCheck"]=r),e}async _getAppCheckToken(){var t;if(G(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((t=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:t.getToken());return e!=null&&e.error&&pt(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function Mt(n){return M(n)}class hr{constructor(e){this.auth=e,this.observer=null,this.addObserver=Ws(t=>this.observer=t)}get next(){return T(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Cn={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function ka(n){Cn=n}function Ca(n){return Cn.loadJS(n)}function Da(){return Cn.gapiScript}function Oa(n){return`__${n}${Math.floor(Math.random()*1e6)}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Va(n,e){const t=An(n,"auth");if(t.isInitialized()){const i=t.getImmediate(),s=t.getOptions();if(ce(s,e??{}))return i;te(i,"already-initialized")}return t.initialize({options:e})}function La(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(ae);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function Ma(n,e,t){const r=Mt(n);T(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const i=!1,s=Ei(e),{host:o,port:l}=Ua(e),d=l===null?"":`:${l}`,g={url:`${s}//${o}${d}/`},_=Object.freeze({host:o,port:l,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:i})});if(!r._canInitEmulator){T(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),T(ce(g,r.config.emulator)&&ce(_,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=g,r.emulatorConfig=_,r.settings.appVerificationDisabledForTesting=!0,tt(o)?Qr(`${s}//${o}${d}`):Fa()}function Ei(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function Ua(n){const e=Ei(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(r);if(i){const s=i[1];return{host:s,port:dr(r.substr(s.length+1))}}else{const[s,o]=r.split(":");return{host:s,port:dr(o)}}}function dr(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function Fa(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ti{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return oe("not implemented")}_getIdTokenResponse(e){return oe("not implemented")}_linkToIdToken(e,t){return oe("not implemented")}_getReauthenticationResolver(e){return oe("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Le(n,e){return fa(n,"POST","/v1/accounts:signInWithIdp",Rn(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xa="http://localhost";class Ne extends Ti{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new Ne(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):te("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:i,...s}=t;if(!r||!i)return null;const o=new Ne(r,i);return o.idToken=s.idToken||void 0,o.accessToken=s.accessToken||void 0,o.secret=s.secret,o.nonce=s.nonce,o.pendingToken=s.pendingToken||null,o}_getIdTokenResponse(e){const t=this.buildRequest();return Le(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,Le(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Le(e,t)}buildRequest(){const e={requestUri:xa,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=et(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dn{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rt extends Dn{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ge extends rt{constructor(){super("facebook.com")}static credential(e){return Ne._fromParams({providerId:ge.PROVIDER_ID,signInMethod:ge.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return ge.credentialFromTaggedObject(e)}static credentialFromError(e){return ge.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return ge.credential(e.oauthAccessToken)}catch{return null}}}ge.FACEBOOK_SIGN_IN_METHOD="facebook.com";ge.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ie extends rt{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return Ne._fromParams({providerId:ie.PROVIDER_ID,signInMethod:ie.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return ie.credentialFromTaggedObject(e)}static credentialFromError(e){return ie.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return ie.credential(t,r)}catch{return null}}}ie.GOOGLE_SIGN_IN_METHOD="google.com";ie.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _e extends rt{constructor(){super("github.com")}static credential(e){return Ne._fromParams({providerId:_e.PROVIDER_ID,signInMethod:_e.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return _e.credentialFromTaggedObject(e)}static credentialFromError(e){return _e.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return _e.credential(e.oauthAccessToken)}catch{return null}}}_e.GITHUB_SIGN_IN_METHOD="github.com";_e.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ye extends rt{constructor(){super("twitter.com")}static credential(e,t){return Ne._fromParams({providerId:ye.PROVIDER_ID,signInMethod:ye.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return ye.credentialFromTaggedObject(e)}static credentialFromError(e){return ye.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return ye.credential(t,r)}catch{return null}}}ye.TWITTER_SIGN_IN_METHOD="twitter.com";ye.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ue{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,i=!1){const s=await J._fromIdTokenResponse(e,r,i),o=fr(r);return new Ue({user:s,providerId:o,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const i=fr(r);return new Ue({user:e,providerId:i,_tokenResponse:r,operationType:t})}}function fr(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class At extends de{constructor(e,t,r,i){super(t.code,t.message),this.operationType=r,this.user=i,Object.setPrototypeOf(this,At.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,i){return new At(e,t,r,i)}}function vi(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?At._fromErrorAndOperation(n,s,e,r):s})}async function $a(n,e,t=!1){const r=await Ke(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return Ue._forOperation(n,"link",r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ba(n,e,t=!1){const{auth:r}=n;if(G(r.app))return Promise.reject(Ae(r));const i="reauthenticate";try{const s=await Ke(n,vi(r,i,e,n),t);T(s.idToken,r,"internal-error");const o=Nn(s.idToken);T(o,r,"internal-error");const{sub:l}=o;return T(n.uid===l,r,"user-mismatch"),Ue._forOperation(n,i,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&te(r,"user-mismatch"),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ja(n,e,t=!1){if(G(n.app))return Promise.reject(Ae(n));const r="signIn",i=await vi(n,r,e),s=await Ue._fromIdTokenResponse(n,r,i);return t||await n._updateCurrentUser(s.user),s}function za(n,e,t,r){return M(n).onIdTokenChanged(e,t,r)}function Ha(n,e,t){return M(n).beforeAuthStateChanged(e,t)}function Wa(n,e,t,r){return M(n).onAuthStateChanged(e,t,r)}function qa(n){return M(n).signOut()}const St="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bi{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(St,"1"),this.storage.removeItem(St),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ga=1e3,Ka=10;class Ai extends bi{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Ii(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),i=this.localCache[t];r!==i&&e(t,i,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((o,l,d)=>{this.notifyListeners(o,d)});return}const r=e.key;t?this.detachListener():this.stopPolling();const i=()=>{const o=this.storage.getItem(r);!t&&this.localCache[r]===o||this.notifyListeners(r,o)},s=this.storage.getItem(r);ba()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,Ka):i()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},Ga)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}Ai.type="LOCAL";const Ja=Ai;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Si extends bi{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}Si.type="SESSION";const Pi=Si;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xa(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ut{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(i=>i.isListeningto(e));if(t)return t;const r=new Ut(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:i,data:s}=t.data,o=this.handlersMap[i];if(!(o!=null&&o.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:i});const l=Array.from(o).map(async g=>g(t.origin,s)),d=await Xa(l);t.ports[0].postMessage({status:"done",eventId:r,eventType:i,response:d})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Ut.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function On(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ya{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const i=typeof MessageChannel<"u"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let s,o;return new Promise((l,d)=>{const g=On("",20);i.port1.start();const _=setTimeout(()=>{d(new Error("unsupported_event"))},r);o={messageChannel:i,onMessage(y){const w=y;if(w.data.eventId===g)switch(w.data.status){case"ack":clearTimeout(_),s=setTimeout(()=>{d(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),l(w.data.response);break;default:clearTimeout(_),clearTimeout(s),d(new Error("invalid_response"));break}}},this.handlers.add(o),i.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:g,data:t},[i.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Z(){return window}function Qa(n){Z().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ri(){return typeof Z().WorkerGlobalScope<"u"&&typeof Z().importScripts=="function"}async function Za(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function ec(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)==null?void 0:n.controller)||null}function tc(){return Ri()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ni="firebaseLocalStorageDb",nc=1,Pt="firebaseLocalStorage",ki="fbase_key";class it{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function Ft(n,e){return n.transaction([Pt],e?"readwrite":"readonly").objectStore(Pt)}function rc(){const n=indexedDB.deleteDatabase(Ni);return new it(n).toPromise()}function Ci(){const n=indexedDB.open(Ni,nc);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(Pt,{keyPath:ki})}catch(i){t(i)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(Pt)?e(r):(r.close(),await rc(),e(await Ci()))})})}async function pr(n,e,t){const r=Ft(n,!0).put({[ki]:e,value:t});return new it(r).toPromise()}async function ic(n,e){const t=Ft(n,!1).get(e),r=await new it(t).toPromise();return r===void 0?null:r.value}function mr(n,e){const t=Ft(n,!0).delete(e);return new it(t).toPromise()}const sc=800,oc=3;class Di{registerLifecycleListeners(){typeof window<"u"&&typeof window.addEventListener=="function"&&(window.addEventListener("pagehide",this.onPageHide),window.addEventListener("pageshow",this.onPageShow))}unregisterLifecycleListeners(){typeof window<"u"&&typeof window.removeEventListener=="function"&&(window.removeEventListener("pagehide",this.onPageHide),window.removeEventListener("pageshow",this.onPageShow))}constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.isClosing=!1,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this.onPageHide=()=>{this.isClosing=!0,this.stopPolling(),this.dbPromise&&(this.dbPromise.then(e=>e.close()).catch(()=>{}),this.dbPromise=null)},this.onPageShow=()=>{this.isClosing&&(this.isClosing=!1,Object.keys(this.listeners).length>0&&this.startPolling())},this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.dbPromise?this.dbPromise:(this.dbPromise=Ci(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>oc)throw r;if(this.dbPromise){const i=this.dbPromise;this.dbPromise=null;try{(await i).close()}catch{}}}}async initializeServiceWorkerMessaging(){return Ri()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Ut._getInstance(tc()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var t,r;if(this.activeServiceWorker=await Za(),!this.activeServiceWorker)return;this.sender=new Ya(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(t=e[0])!=null&&t.fulfilled&&(r=e[0])!=null&&r.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||ec()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return indexedDB?(await this._withRetries(async e=>{await pr(e,St,"1"),await mr(e,St)}),!0):!1}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>pr(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>ic(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>mr(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){if(this.isClosing)return[];try{const e=await this._withRetries(i=>{const s=Ft(i,!1).getAll();return new it(s).toPromise()});if(this.isClosing)return[];if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:i,value:s}of e)r.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(s)&&(this.notifyListeners(i,s),t.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!r.has(i)&&(this.notifyListeners(i,null),t.push(i));return t}catch(e){return this.isClosing||pt(`Firebase Auth cross-tab polling failed with error: ${e}`),[]}}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),sc)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.startPolling(),this.registerLifecycleListeners()),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.stopPolling(),this.unregisterLifecycleListeners())}}Di.type="LOCAL";const ac=Di;new nt(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Oi(n,e){return e?ae(e):(T(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vn extends Ti{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Le(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Le(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Le(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function cc(n){return ja(n.auth,new Vn(n),n.bypassAuthState)}function uc(n){const{auth:e,user:t}=n;return T(t,e,"internal-error"),Ba(t,new Vn(n),n.bypassAuthState)}async function lc(n){const{auth:e,user:t}=n;return T(t,e,"internal-error"),$a(t,new Vn(n),n.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vi{constructor(e,t,r,i,s=!1){this.auth=e,this.resolver=r,this.user=i,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:i,tenantId:s,error:o,type:l}=e;if(o){this.reject(o);return}const d={auth:this.auth,requestUri:t,sessionId:r,tenantId:s||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(l)(d))}catch(g){this.reject(g)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return cc;case"linkViaPopup":case"linkViaRedirect":return lc;case"reauthViaPopup":case"reauthViaRedirect":return uc;default:te(this.auth,"internal-error")}}resolve(e){le(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){le(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hc=new nt(2e3,1e4);async function dc(n,e,t){if(G(n.app))return Promise.reject(X(n,"operation-not-supported-in-this-environment"));const r=Mt(n);oa(n,e,Dn);const i=Oi(r,t);return new be(r,"signInViaPopup",e,i).executeNotNull()}class be extends Vi{constructor(e,t,r,i,s){super(e,t,i,s),this.provider=r,this.authWindow=null,this.pollId=null,be.currentPopupAction&&be.currentPopupAction.cancel(),be.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return T(e,this.auth,"internal-error"),e}async onExecution(){le(this.filter.length===1,"Popup operations only handle one event");const e=On();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(X(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(X(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,be.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if((r=(t=this.authWindow)==null?void 0:t.window)!=null&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(X(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,hc.get())};e()}}be.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fc="pendingRedirect",_t=new Map;class pc extends Vi{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=_t.get(this.auth._key());if(!e){try{const r=await mc(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}_t.set(this.auth._key(),e)}return this.bypassAuthState||_t.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function mc(n,e){const t=yc(e),r=_c(n);if(!await r._isAvailable())return!1;const i=await r._get(t)==="true";return await r._remove(t),i}function gc(n,e){_t.set(n._key(),e)}function _c(n){return ae(n._redirectPersistence)}function yc(n){return gt(fc,n.config.apiKey,n.name)}async function Ic(n,e,t=!1){if(G(n.app))return Promise.reject(Ae(n));const r=Mt(n),i=Oi(r,e),o=await new pc(r,i,t).execute();return o&&!t&&(delete o.user._redirectEventId,await r._persistUserIfCurrent(o.user),await r._setRedirectUser(null,e)),o}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wc=10*60*1e3;class Ec{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!Tc(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!Li(e)){const i=((r=e.error.code)==null?void 0:r.split("auth/")[1])||"internal-error";t.onError(X(this.auth,i))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=wc&&this.cachedEventUids.clear(),this.cachedEventUids.has(gr(e))}saveEventToCache(e){this.cachedEventUids.add(gr(e)),this.lastProcessedEventTime=Date.now()}}function gr(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function Li({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function Tc(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Li(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function vc(n,e={}){return $e(n,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bc=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Ac=/^https?/;async function Sc(n){if(n.config.emulator)return;const{authorizedDomains:e}=await vc(n);for(const t of e)try{if(Pc(t))return}catch{}te(n,"unauthorized-domain")}function Pc(n){const e=pn(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const o=new URL(n);return o.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&o.hostname===r}if(!Ac.test(t))return!1;if(bc.test(n))return r===n;const i=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rc=new nt(3e4,6e4);function _r(){const n=Z().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function Nc(n){return new Promise((e,t)=>{var i,s,o;function r(){_r(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{_r(),t(X(n,"network-request-failed"))},timeout:Rc.get()})}if((s=(i=Z().gapi)==null?void 0:i.iframes)!=null&&s.Iframe)e(gapi.iframes.getContext());else if((o=Z().gapi)!=null&&o.load)r();else{const l=Oa("iframefcb");return Z()[l]=()=>{gapi.load?r():t(X(n,"network-request-failed"))},Ca(`${Da()}?onload=${l}`).catch(d=>t(d))}}).catch(e=>{throw yt=null,e})}let yt=null;function kc(n){return yt=yt||Nc(n),yt}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Cc=new nt(5e3,15e3),Dc="__/auth/iframe",Oc="emulator/auth/iframe",Vc={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Lc=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function Mc(n){const e=n.config;T(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?Pn(e,Oc):`https://${n.config.authDomain}/${Dc}`,r={apiKey:e.apiKey,appName:n.name,v:xe},i=Lc.get(n.config.apiHost);i&&(r.eid=i);const s=n._getFrameworks();return s.length&&(r.fw=s.join(",")),`${t}?${et(r).slice(1)}`}async function Uc(n){const e=await kc(n),t=Z().gapi;return T(t,n,"internal-error"),e.open({where:document.body,url:Mc(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:Vc,dontclear:!0},r=>new Promise(async(i,s)=>{await r.restyle({setHideOnLeave:!1});const o=X(n,"network-request-failed"),l=Z().setTimeout(()=>{s(o)},Cc.get());function d(){Z().clearTimeout(l),i(r)}r.ping(d).then(d,()=>{s(o)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fc={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},xc=500,$c=600,Bc="_blank",jc="http://localhost";class yr{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function zc(n,e,t,r=xc,i=$c){const s=Math.max((window.screen.availHeight-i)/2,0).toString(),o=Math.max((window.screen.availWidth-r)/2,0).toString();let l="";const d={...Fc,width:r.toString(),height:i.toString(),top:s,left:o},g=F().toLowerCase();t&&(l=pi(g)?Bc:t),di(g)&&(e=e||jc,d.scrollbars="yes");const _=Object.entries(d).reduce((w,[P,S])=>`${w}${P}=${S},`,"");if(va(g)&&l!=="_self")return Hc(e||"",l),new yr(null);const y=window.open(e||"",l,_);T(y,n,"popup-blocked");try{y.focus()}catch{}return new yr(y)}function Hc(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wc="__/auth/handler",qc="emulator/auth/handler",Gc=encodeURIComponent("fac");async function Ir(n,e,t,r,i,s){T(n.config.authDomain,n,"auth-domain-config-required"),T(n.config.apiKey,n,"invalid-api-key");const o={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:xe,eventId:i};if(e instanceof Dn){e.setDefaultLanguage(n.languageCode),o.providerId=e.providerId||"",Hs(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[_,y]of Object.entries({}))o[_]=y}if(e instanceof rt){const _=e.getScopes().filter(y=>y!=="");_.length>0&&(o.scopes=_.join(","))}n.tenantId&&(o.tid=n.tenantId);const l=o;for(const _ of Object.keys(l))l[_]===void 0&&delete l[_];const d=await n._getAppCheckToken(),g=d?`#${Gc}=${encodeURIComponent(d)}`:"";return`${Kc(n)}?${et(l).slice(1)}${g}`}function Kc({config:n}){return n.emulator?Pn(n,qc):`https://${n.authDomain}/${Wc}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zt="webStorageSupport";class Jc{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Pi,this._completeRedirectFn=Ic,this._overrideRedirectResult=gc}async _openPopup(e,t,r,i){var o;le((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const s=await Ir(e,t,r,pn(),i);return zc(e,s,On())}async _openRedirect(e,t,r,i){await this._originValidation(e);const s=await Ir(e,t,r,pn(),i);return Qa(s),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:i,promise:s}=this.eventManagers[t];return i?Promise.resolve(i):(le(s,"If manager is not set, promise should be"),s)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await Uc(e),r=new Ec(e);return t.register("authEvent",i=>(T(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:r.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(Zt,{type:Zt},i=>{var o;const s=(o=i==null?void 0:i[0])==null?void 0:o[Zt];s!==void 0&&t(!!s),te(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=Sc(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return Ii()||fi()||kn()}}const Xc=Jc;var wr="@firebase/auth",Er="1.13.6";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yc{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){T(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qc(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function Zc(n){Me(new Re("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:o,authDomain:l}=r.options;T(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});const d={apiKey:o,authDomain:l,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:wi(n)},g=new Na(r,i,s,d);return La(g,t),g},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),Me(new Re("auth-internal",e=>{const t=Mt(e.getProvider("auth").getImmediate());return(r=>new Yc(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),we(wr,Er,Qc(n)),we(wr,Er,"esm2020")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const eu=5*60,tu=Yr("authIdTokenMaxAge")||eu;let Tr=null;const nu=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>tu)return;const i=t==null?void 0:t.token;Tr!==i&&(Tr=i,await fetch(n,{method:i?"POST":"DELETE",headers:i?{Authorization:`Bearer ${i}`}:{}}))};function ru(n=ni()){const e=An(n,"auth");if(e.isInitialized())return e.getImmediate();const t=Va(n,{popupRedirectResolver:Xc,persistence:[ac,Ja,Pi]}),r=Yr("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const s=new URL(r,location.origin);if(location.origin===s.origin){const o=nu(s.toString());Ha(t,o,()=>o(t.currentUser)),za(t,l=>o(l))}}const i=Jr("auth");return i&&Ma(t,`http://${i}`),t}function iu(){var n;return((n=document.getElementsByTagName("head"))==null?void 0:n[0])??document}ka({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=i=>{const s=X("internal-error");s.customData=i,t(s)},r.type="text/javascript",r.charset="UTF-8",iu().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});Zc("Browser");var vr=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Mi;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(h,a){function u(){}u.prototype=a.prototype,h.F=a.prototype,h.prototype=new u,h.prototype.constructor=h,h.D=function(p,f,m){for(var c=Array(arguments.length-2),Te=2;Te<arguments.length;Te++)c[Te-2]=arguments[Te];return a.prototype[f].apply(p,c)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(r,t),r.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function i(h,a,u){u||(u=0);const p=Array(16);if(typeof a=="string")for(var f=0;f<16;++f)p[f]=a.charCodeAt(u++)|a.charCodeAt(u++)<<8|a.charCodeAt(u++)<<16|a.charCodeAt(u++)<<24;else for(f=0;f<16;++f)p[f]=a[u++]|a[u++]<<8|a[u++]<<16|a[u++]<<24;a=h.g[0],u=h.g[1],f=h.g[2];let m=h.g[3],c;c=a+(m^u&(f^m))+p[0]+3614090360&4294967295,a=u+(c<<7&4294967295|c>>>25),c=m+(f^a&(u^f))+p[1]+3905402710&4294967295,m=a+(c<<12&4294967295|c>>>20),c=f+(u^m&(a^u))+p[2]+606105819&4294967295,f=m+(c<<17&4294967295|c>>>15),c=u+(a^f&(m^a))+p[3]+3250441966&4294967295,u=f+(c<<22&4294967295|c>>>10),c=a+(m^u&(f^m))+p[4]+4118548399&4294967295,a=u+(c<<7&4294967295|c>>>25),c=m+(f^a&(u^f))+p[5]+1200080426&4294967295,m=a+(c<<12&4294967295|c>>>20),c=f+(u^m&(a^u))+p[6]+2821735955&4294967295,f=m+(c<<17&4294967295|c>>>15),c=u+(a^f&(m^a))+p[7]+4249261313&4294967295,u=f+(c<<22&4294967295|c>>>10),c=a+(m^u&(f^m))+p[8]+1770035416&4294967295,a=u+(c<<7&4294967295|c>>>25),c=m+(f^a&(u^f))+p[9]+2336552879&4294967295,m=a+(c<<12&4294967295|c>>>20),c=f+(u^m&(a^u))+p[10]+4294925233&4294967295,f=m+(c<<17&4294967295|c>>>15),c=u+(a^f&(m^a))+p[11]+2304563134&4294967295,u=f+(c<<22&4294967295|c>>>10),c=a+(m^u&(f^m))+p[12]+1804603682&4294967295,a=u+(c<<7&4294967295|c>>>25),c=m+(f^a&(u^f))+p[13]+4254626195&4294967295,m=a+(c<<12&4294967295|c>>>20),c=f+(u^m&(a^u))+p[14]+2792965006&4294967295,f=m+(c<<17&4294967295|c>>>15),c=u+(a^f&(m^a))+p[15]+1236535329&4294967295,u=f+(c<<22&4294967295|c>>>10),c=a+(f^m&(u^f))+p[1]+4129170786&4294967295,a=u+(c<<5&4294967295|c>>>27),c=m+(u^f&(a^u))+p[6]+3225465664&4294967295,m=a+(c<<9&4294967295|c>>>23),c=f+(a^u&(m^a))+p[11]+643717713&4294967295,f=m+(c<<14&4294967295|c>>>18),c=u+(m^a&(f^m))+p[0]+3921069994&4294967295,u=f+(c<<20&4294967295|c>>>12),c=a+(f^m&(u^f))+p[5]+3593408605&4294967295,a=u+(c<<5&4294967295|c>>>27),c=m+(u^f&(a^u))+p[10]+38016083&4294967295,m=a+(c<<9&4294967295|c>>>23),c=f+(a^u&(m^a))+p[15]+3634488961&4294967295,f=m+(c<<14&4294967295|c>>>18),c=u+(m^a&(f^m))+p[4]+3889429448&4294967295,u=f+(c<<20&4294967295|c>>>12),c=a+(f^m&(u^f))+p[9]+568446438&4294967295,a=u+(c<<5&4294967295|c>>>27),c=m+(u^f&(a^u))+p[14]+3275163606&4294967295,m=a+(c<<9&4294967295|c>>>23),c=f+(a^u&(m^a))+p[3]+4107603335&4294967295,f=m+(c<<14&4294967295|c>>>18),c=u+(m^a&(f^m))+p[8]+1163531501&4294967295,u=f+(c<<20&4294967295|c>>>12),c=a+(f^m&(u^f))+p[13]+2850285829&4294967295,a=u+(c<<5&4294967295|c>>>27),c=m+(u^f&(a^u))+p[2]+4243563512&4294967295,m=a+(c<<9&4294967295|c>>>23),c=f+(a^u&(m^a))+p[7]+1735328473&4294967295,f=m+(c<<14&4294967295|c>>>18),c=u+(m^a&(f^m))+p[12]+2368359562&4294967295,u=f+(c<<20&4294967295|c>>>12),c=a+(u^f^m)+p[5]+4294588738&4294967295,a=u+(c<<4&4294967295|c>>>28),c=m+(a^u^f)+p[8]+2272392833&4294967295,m=a+(c<<11&4294967295|c>>>21),c=f+(m^a^u)+p[11]+1839030562&4294967295,f=m+(c<<16&4294967295|c>>>16),c=u+(f^m^a)+p[14]+4259657740&4294967295,u=f+(c<<23&4294967295|c>>>9),c=a+(u^f^m)+p[1]+2763975236&4294967295,a=u+(c<<4&4294967295|c>>>28),c=m+(a^u^f)+p[4]+1272893353&4294967295,m=a+(c<<11&4294967295|c>>>21),c=f+(m^a^u)+p[7]+4139469664&4294967295,f=m+(c<<16&4294967295|c>>>16),c=u+(f^m^a)+p[10]+3200236656&4294967295,u=f+(c<<23&4294967295|c>>>9),c=a+(u^f^m)+p[13]+681279174&4294967295,a=u+(c<<4&4294967295|c>>>28),c=m+(a^u^f)+p[0]+3936430074&4294967295,m=a+(c<<11&4294967295|c>>>21),c=f+(m^a^u)+p[3]+3572445317&4294967295,f=m+(c<<16&4294967295|c>>>16),c=u+(f^m^a)+p[6]+76029189&4294967295,u=f+(c<<23&4294967295|c>>>9),c=a+(u^f^m)+p[9]+3654602809&4294967295,a=u+(c<<4&4294967295|c>>>28),c=m+(a^u^f)+p[12]+3873151461&4294967295,m=a+(c<<11&4294967295|c>>>21),c=f+(m^a^u)+p[15]+530742520&4294967295,f=m+(c<<16&4294967295|c>>>16),c=u+(f^m^a)+p[2]+3299628645&4294967295,u=f+(c<<23&4294967295|c>>>9),c=a+(f^(u|~m))+p[0]+4096336452&4294967295,a=u+(c<<6&4294967295|c>>>26),c=m+(u^(a|~f))+p[7]+1126891415&4294967295,m=a+(c<<10&4294967295|c>>>22),c=f+(a^(m|~u))+p[14]+2878612391&4294967295,f=m+(c<<15&4294967295|c>>>17),c=u+(m^(f|~a))+p[5]+4237533241&4294967295,u=f+(c<<21&4294967295|c>>>11),c=a+(f^(u|~m))+p[12]+1700485571&4294967295,a=u+(c<<6&4294967295|c>>>26),c=m+(u^(a|~f))+p[3]+2399980690&4294967295,m=a+(c<<10&4294967295|c>>>22),c=f+(a^(m|~u))+p[10]+4293915773&4294967295,f=m+(c<<15&4294967295|c>>>17),c=u+(m^(f|~a))+p[1]+2240044497&4294967295,u=f+(c<<21&4294967295|c>>>11),c=a+(f^(u|~m))+p[8]+1873313359&4294967295,a=u+(c<<6&4294967295|c>>>26),c=m+(u^(a|~f))+p[15]+4264355552&4294967295,m=a+(c<<10&4294967295|c>>>22),c=f+(a^(m|~u))+p[6]+2734768916&4294967295,f=m+(c<<15&4294967295|c>>>17),c=u+(m^(f|~a))+p[13]+1309151649&4294967295,u=f+(c<<21&4294967295|c>>>11),c=a+(f^(u|~m))+p[4]+4149444226&4294967295,a=u+(c<<6&4294967295|c>>>26),c=m+(u^(a|~f))+p[11]+3174756917&4294967295,m=a+(c<<10&4294967295|c>>>22),c=f+(a^(m|~u))+p[2]+718787259&4294967295,f=m+(c<<15&4294967295|c>>>17),c=u+(m^(f|~a))+p[9]+3951481745&4294967295,h.g[0]=h.g[0]+a&4294967295,h.g[1]=h.g[1]+(f+(c<<21&4294967295|c>>>11))&4294967295,h.g[2]=h.g[2]+f&4294967295,h.g[3]=h.g[3]+m&4294967295}r.prototype.v=function(h,a){a===void 0&&(a=h.length);const u=a-this.blockSize,p=this.C;let f=this.h,m=0;for(;m<a;){if(f==0)for(;m<=u;)i(this,h,m),m+=this.blockSize;if(typeof h=="string"){for(;m<a;)if(p[f++]=h.charCodeAt(m++),f==this.blockSize){i(this,p),f=0;break}}else for(;m<a;)if(p[f++]=h[m++],f==this.blockSize){i(this,p),f=0;break}}this.h=f,this.o+=a},r.prototype.A=function(){var h=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);h[0]=128;for(var a=1;a<h.length-8;++a)h[a]=0;a=this.o*8;for(var u=h.length-8;u<h.length;++u)h[u]=a&255,a/=256;for(this.v(h),h=Array(16),a=0,u=0;u<4;++u)for(let p=0;p<32;p+=8)h[a++]=this.g[u]>>>p&255;return h};function s(h,a){var u=l;return Object.prototype.hasOwnProperty.call(u,h)?u[h]:u[h]=a(h)}function o(h,a){this.h=a;const u=[];let p=!0;for(let f=h.length-1;f>=0;f--){const m=h[f]|0;p&&m==a||(u[f]=m,p=!1)}this.g=u}var l={};function d(h){return-128<=h&&h<128?s(h,function(a){return new o([a|0],a<0?-1:0)}):new o([h|0],h<0?-1:0)}function g(h){if(isNaN(h)||!isFinite(h))return y;if(h<0)return v(g(-h));const a=[];let u=1;for(let p=0;h>=u;p++)a[p]=h/u|0,u*=4294967296;return new o(a,0)}function _(h,a){if(h.length==0)throw Error("number format error: empty string");if(a=a||10,a<2||36<a)throw Error("radix out of range: "+a);if(h.charAt(0)=="-")return v(_(h.substring(1),a));if(h.indexOf("-")>=0)throw Error('number format error: interior "-" character');const u=g(Math.pow(a,8));let p=y;for(let m=0;m<h.length;m+=8){var f=Math.min(8,h.length-m);const c=parseInt(h.substring(m,m+f),a);f<8?(f=g(Math.pow(a,f)),p=p.j(f).add(g(c))):(p=p.j(u),p=p.add(g(c)))}return p}var y=d(0),w=d(1),P=d(16777216);n=o.prototype,n.m=function(){if(b(this))return-v(this).m();let h=0,a=1;for(let u=0;u<this.g.length;u++){const p=this.i(u);h+=(p>=0?p:4294967296+p)*a,a*=4294967296}return h},n.toString=function(h){if(h=h||10,h<2||36<h)throw Error("radix out of range: "+h);if(S(this))return"0";if(b(this))return"-"+v(this).toString(h);const a=g(Math.pow(h,6));var u=this;let p="";for(;;){const f=ne(u,a).g;u=V(u,f.j(a));let m=((u.g.length>0?u.g[0]:u.h)>>>0).toString(h);if(u=f,S(u))return m+p;for(;m.length<6;)m="0"+m;p=m+p}},n.i=function(h){return h<0?0:h<this.g.length?this.g[h]:this.h};function S(h){if(h.h!=0)return!1;for(let a=0;a<h.g.length;a++)if(h.g[a]!=0)return!1;return!0}function b(h){return h.h==-1}n.l=function(h){return h=V(this,h),b(h)?-1:S(h)?0:1};function v(h){const a=h.g.length,u=[];for(let p=0;p<a;p++)u[p]=~h.g[p];return new o(u,~h.h).add(w)}n.abs=function(){return b(this)?v(this):this},n.add=function(h){const a=Math.max(this.g.length,h.g.length),u=[];let p=0;for(let f=0;f<=a;f++){let m=p+(this.i(f)&65535)+(h.i(f)&65535),c=(m>>>16)+(this.i(f)>>>16)+(h.i(f)>>>16);p=c>>>16,m&=65535,c&=65535,u[f]=c<<16|m}return new o(u,u[u.length-1]&-2147483648?-1:0)};function V(h,a){return h.add(v(a))}n.j=function(h){if(S(this)||S(h))return y;if(b(this))return b(h)?v(this).j(v(h)):v(v(this).j(h));if(b(h))return v(this.j(v(h)));if(this.l(P)<0&&h.l(P)<0)return g(this.m()*h.m());const a=this.g.length+h.g.length,u=[];for(var p=0;p<2*a;p++)u[p]=0;for(p=0;p<this.g.length;p++)for(let f=0;f<h.g.length;f++){const m=this.i(p)>>>16,c=this.i(p)&65535,Te=h.i(f)>>>16,Jn=h.i(f)&65535;u[2*p+2*f]+=c*Jn,U(u,2*p+2*f),u[2*p+2*f+1]+=m*Jn,U(u,2*p+2*f+1),u[2*p+2*f+1]+=c*Te,U(u,2*p+2*f+1),u[2*p+2*f+2]+=m*Te,U(u,2*p+2*f+2)}for(h=0;h<a;h++)u[h]=u[2*h+1]<<16|u[2*h];for(h=a;h<2*a;h++)u[h]=0;return new o(u,0)};function U(h,a){for(;(h[a]&65535)!=h[a];)h[a+1]+=h[a]>>>16,h[a]&=65535,a++}function x(h,a){this.g=h,this.h=a}function ne(h,a){if(S(a))throw Error("division by zero");if(S(h))return new x(y,y);if(b(h))return a=ne(v(h),a),new x(v(a.g),v(a.h));if(b(a))return a=ne(h,v(a)),new x(v(a.g),a.h);if(h.g.length>30){if(b(h)||b(a))throw Error("slowDivide_ only works with positive integers.");for(var u=w,p=a;p.l(h)<=0;)u=fe(u),p=fe(p);var f=pe(u,1),m=pe(p,1);for(p=pe(p,2),u=pe(u,2);!S(p);){var c=m.add(p);c.l(h)<=0&&(f=f.add(u),m=c),p=pe(p,1),u=pe(u,1)}return a=V(h,f.j(a)),new x(f,a)}for(f=y;h.l(a)>=0;){for(u=Math.max(1,Math.floor(h.m()/a.m())),p=Math.ceil(Math.log(u)/Math.LN2),p=p<=48?1:Math.pow(2,p-48),m=g(u),c=m.j(a);b(c)||c.l(h)>0;)u-=p,m=g(u),c=m.j(a);S(m)&&(m=w),f=f.add(m),h=V(h,c)}return new x(f,h)}n.B=function(h){return ne(this,h).h},n.and=function(h){const a=Math.max(this.g.length,h.g.length),u=[];for(let p=0;p<a;p++)u[p]=this.i(p)&h.i(p);return new o(u,this.h&h.h)},n.or=function(h){const a=Math.max(this.g.length,h.g.length),u=[];for(let p=0;p<a;p++)u[p]=this.i(p)|h.i(p);return new o(u,this.h|h.h)},n.xor=function(h){const a=Math.max(this.g.length,h.g.length),u=[];for(let p=0;p<a;p++)u[p]=this.i(p)^h.i(p);return new o(u,this.h^h.h)};function fe(h){const a=h.g.length+1,u=[];for(let p=0;p<a;p++)u[p]=h.i(p)<<1|h.i(p-1)>>>31;return new o(u,h.h)}function pe(h,a){const u=a>>5;a%=32;const p=h.g.length-u,f=[];for(let m=0;m<p;m++)f[m]=a>0?h.i(m+u)>>>a|h.i(m+u+1)<<32-a:h.i(m+u);return new o(f,h.h)}r.prototype.digest=r.prototype.A,r.prototype.reset=r.prototype.u,r.prototype.update=r.prototype.v,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.B,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=g,o.fromString=_,Mi=o}).apply(typeof vr<"u"?vr:typeof self<"u"?self:typeof window<"u"?window:{});/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ${constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}$.UNAUTHENTICATED=new $(null),$.GOOGLE_CREDENTIALS=new $("google-credentials-uid"),$.FIRST_PARTY=new $("first-party-uid"),$.MOCK_USER=new $("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Be="12.19.0";function su(n){Be=n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fe=new vn("@firebase/firestore");function ke(n,...e){if(Fe.logLevel<=R.DEBUG){const t=e.map(Ln);Fe.debug(`Firestore (${Be}): ${n}`,...t)}}function xt(n,...e){if(Fe.logLevel<=R.ERROR){const t=e.map(Ln);Fe.error(`Firestore (${Be}): ${n}`,...t)}}function Ui(n,...e){if(Fe.logLevel<=R.WARN){const t=e.map(Ln);Fe.warn(`Firestore (${Be}): ${n}`,...t)}}function Ln(n){if(typeof n=="string")return n;try{return function(t){return JSON.stringify(t)}(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function N(n,e,t){let r="Unexpected state";typeof e=="string"?r=e:t=e,Fi(n,r,t)}function Fi(n,e,t){let r=`FIRESTORE (${Be}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;if(t!==void 0)try{r+=" CONTEXT: "+JSON.stringify(t)}catch{r+=" CONTEXT: "+t}throw xt(r),new Error(r)}function H(n,e,t,r){let i="Unexpected state";typeof t=="string"?i=t:r=t,n||Fi(e,i,r)}function xi(n,e){return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const I={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class E extends de{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $i{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class ou{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t($.UNAUTHENTICATED))}shutdown(){}}class au{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class cu{constructor(e){this.auth=null,e.onInit(t=>{this.auth=t})}getToken(){return this.auth?this.auth.getToken().then(e=>e?(H(typeof e.accessToken=="string",42297,{Z:e}),new $i(e.accessToken,new $(this.auth.getUid()))):null):Promise.resolve(null)}invalidateToken(){}start(e,t){}shutdown(){}}class uu{constructor(e,t,r){this.ee=e,this.te=t,this.re=r,this.type="FirstParty",this.user=$.FIRST_PARTY,this.ne=new Map}ie(){return this.re?this.re():null}get headers(){this.ne.set("X-Goog-AuthUser",this.ee);const e=this.ie();return e&&this.ne.set("Authorization",e),this.te&&this.ne.set("X-Goog-Iam-Authorization-Token",this.te),this.ne}}class lu{constructor(e,t,r){this.ee=e,this.te=t,this.re=r}getToken(){return Promise.resolve(new uu(this.ee,this.te,this.re))}start(e,t){e.enqueueRetryable(()=>t($.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class br{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class hu{constructor(e,t){this.se=t,this.appCheck=null,this.oe=null,G(e)&&e.settings.appCheckToken&&(this.oe=e.settings.appCheckToken),t.onInit(r=>{this.appCheck=r})}getToken(){return this.oe?Promise.resolve(new br(this.oe)):this.appCheck?this.appCheck.getToken().then(e=>e?(H(typeof e.token=="string",3470,{tokenResult:e}),new br(e.token)):null):Promise.resolve(null)}invalidateToken(){}start(e,t){}shutdown(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class du{constructor(e,t,r,i,s,o,l,d,g,_,y,w,P){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=i,this.ssl=s,this.forceLongPolling=o,this.autoDetectLongPolling=l,this.longPollingOptions=d,this.useFetchStreams=g,this.isUsingEmulator=_,this.apiKey=y,this._customHeaders=w,this.grpcFlowControlWindow=P}}const gn="(default)";class Je{constructor(e,t){this.projectId=e,this.database=t||gn}static empty(){return new Je("","")}get isDefaultDatabase(){return this.database===gn}isEqual(e){return e instanceof Je&&e.projectId===this.projectId&&e.database===this.database}}function fu(n,e){if(!Object.prototype.hasOwnProperty.apply(n.options,["projectId"]))throw new E(I.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Je(n.options.projectId,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pu(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mu{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const i=pu(40);for(let s=0;s<i.length;++s)r.length<20&&i[s]<t&&(r+=e.charAt(i[s]%62))}return r}}function Ee(n,e){return n<e?-1:n>e?1:0}function gu(n,e){const t=Math.min(n.length,e.length);for(let r=0;r<t;r++){const i=n.charAt(r),s=e.charAt(r);if(i!==s)return en(i)===en(s)?Ee(i,s):en(i)?1:-1}return Ee(n.length,e.length)}const _u=55296,yu=57343;function en(n){const e=n.charCodeAt(0);return e>=_u&&e<=yu}function Bi(n,e,t){return n.length===e.length&&n.every((r,i)=>t(r,e[i]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ar="__name__";class Q{constructor(e,t,r){t===void 0?t=0:t>e.length&&N(637,{offset:t,range:e.length}),r===void 0?r=e.length-t:r>e.length-t&&N(1746,{length:r,range:e.length-t}),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return Q.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof Q?e.forEach(r=>{t.push(r)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let i=0;i<r;i++){const s=Q.compareSegments(e.get(i),t.get(i));if(s!==0)return s}return Ee(e.length,t.length)}static compareSegments(e,t){const r=Q.isNumericId(e),i=Q.isNumericId(t);return r&&!i?-1:!r&&i?1:r&&i?Q.extractNumericId(e).compare(Q.extractNumericId(t)):gu(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return Mi.fromString(e.substring(4,e.length-2))}}class O extends Q{construct(e,t,r){return new O(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toStringWithLeadingSlash(){return`/${this.canonicalString()}`}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new E(I.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter(i=>i.length>0))}return new O(t)}static emptyPath(){return new O([])}}const Iu=/^[_a-zA-Z][_a-zA-Z0-9]*$/;let Xe=class De extends Q{construct(e,t,r){return new De(e,t,r)}static isValidIdentifier(e){return Iu.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),De.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===Ar}static keyField(){return new De([Ar])}static fromServerFormat(e){const t=[];let r="",i=0;const s=()=>{if(r.length===0)throw new E(I.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let o=!1;for(;i<e.length;){const l=e[i];if(l==="\\"){if(i+1===e.length)throw new E(I.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const d=e[i+1];if(d!=="\\"&&d!=="."&&d!=="`")throw new E(I.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=d,i+=2}else l==="`"?(o=!o,i++):l!=="."||o?(r+=l,i++):(s(),i++)}if(s(),o)throw new E(I.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new De(t)}static emptyPath(){return new De([])}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class z{constructor(e){this.path=e}static fromPath(e){return new z(O.fromString(e))}static fromName(e){return new z(O.fromString(e).popFirst(5))}static empty(){return new z(O.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&O.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return O.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new z(new O(e.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wu(n,e,t){if(!t)throw new E(I.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function Sr(n){if(!z.isDocumentKey(n))throw new E(I.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function ji(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function Mn(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":N(12329,{type:typeof n})}function st(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new E(I.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=Mn(n);throw new E(I.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zi(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let lt=null;function Eu(){return lt===null?lt=function(){return 268435456+Math.round(2147483648*Math.random())}():lt++,"0x"+lt.toString(16)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Tu(n){return n==null}function Rt(n){return n===0&&1/n==-1/0}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tn="RestConnection",vu={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class bu{get ae(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.ue=t+"://"+e.host,this._e=`projects/${r}/databases/${i}`,this.ce=this.databaseId.database===gn?`project_id=${r}`:`project_id=${r}&database_id=${i}`}le(e,t,r,i,s){const o=Eu(),l=this.he(e,t.toUriEncodedString());ke(tn,`Sending RPC '${e}' ${o}:`,l,r);const d={"google-cloud-resource-prefix":this._e,"x-goog-request-params":this.ce};this.fe(d,i,s);const{host:g}=new URL(l),_=tt(g);return this.me(e,l,d,r,_).then(y=>(ke(tn,`Received RPC '${e}' ${o}: `,y),y),y=>{throw Ui(tn,`RPC '${e}' ${o} failed with error: `,y,"url: ",l,"request:",r),y})}de(e,t,r,i,s,o){return this.le(e,t,r,i,s)}fe(e,t,r){if(e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+Be}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach((i,s)=>e[s]=i),r&&r.headers.forEach((i,s)=>e[s]=i),this.databaseInfo._customHeaders)for(const i of Object.keys(this.databaseInfo._customHeaders))e[i]=this.databaseInfo._customHeaders[i]}he(e,t){const r=vu[e];let i=`${this.ue}/v1/${t}:${r}`;return this.databaseInfo.apiKey&&(i=`${i}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),i}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Pr,A;function Au(n){switch(n){case I.OK:return N(64938);case I.CANCELLED:case I.UNKNOWN:case I.DEADLINE_EXCEEDED:case I.RESOURCE_EXHAUSTED:case I.INTERNAL:case I.UNAVAILABLE:case I.UNAUTHENTICATED:return!1;case I.INVALID_ARGUMENT:case I.NOT_FOUND:case I.ALREADY_EXISTS:case I.PERMISSION_DENIED:case I.FAILED_PRECONDITION:case I.ABORTED:case I.OUT_OF_RANGE:case I.UNIMPLEMENTED:case I.DATA_LOSS:return!0;default:return N(15467,{code:n})}}function Rr(n){if(n===void 0)return xt("RPC_ERROR","HTTP error has no status"),I.UNKNOWN;switch(n){case 200:return I.OK;case 400:return I.FAILED_PRECONDITION;case 401:return I.UNAUTHENTICATED;case 403:return I.PERMISSION_DENIED;case 404:return I.NOT_FOUND;case 409:return I.ABORTED;case 416:return I.OUT_OF_RANGE;case 429:return I.RESOURCE_EXHAUSTED;case 499:return I.CANCELLED;case 500:return I.UNKNOWN;case 501:return I.UNIMPLEMENTED;case 503:return I.UNAVAILABLE;case 504:return I.DEADLINE_EXCEEDED;default:return n>=200&&n<300?I.OK:n>=400&&n<500?I.FAILED_PRECONDITION:n>=500&&n<600?I.INTERNAL:I.UNKNOWN}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(A=Pr||(Pr={}))[A.OK=0]="OK",A[A.CANCELLED=1]="CANCELLED",A[A.UNKNOWN=2]="UNKNOWN",A[A.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",A[A.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",A[A.NOT_FOUND=5]="NOT_FOUND",A[A.ALREADY_EXISTS=6]="ALREADY_EXISTS",A[A.PERMISSION_DENIED=7]="PERMISSION_DENIED",A[A.UNAUTHENTICATED=16]="UNAUTHENTICATED",A[A.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",A[A.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",A[A.ABORTED=10]="ABORTED",A[A.OUT_OF_RANGE=11]="OUT_OF_RANGE",A[A.UNIMPLEMENTED=12]="UNIMPLEMENTED",A[A.INTERNAL=13]="INTERNAL",A[A.UNAVAILABLE=14]="UNAVAILABLE",A[A.DATA_LOSS=15]="DATA_LOSS";class Su extends bu{Ee(e,t){throw new Error("Not supported by FetchConnection")}async me(e,t,r,i,s){var d;const o=JSON.stringify(i);let l;try{const g={method:"POST",headers:r,body:o};s&&(g.credentials="include"),l=await fetch(t,g)}catch(g){const _=g,y=_==null?void 0:_.message,w=_!=null&&_.cause?String(_.cause):void 0,P=(y&&w?`${y} (${w})`:y??w)??(_==null?void 0:_.statusText)??String(g);throw new E(Rr(_==null?void 0:_.status),`Request failed with error: ${P}`)}if(!l.ok){let g=await l.json();Array.isArray(g)&&(g=g[0]);const _=(d=g==null?void 0:g.error)==null?void 0:d.message;throw new E(Rr(l.status),`Request failed with error: ${_??l.statusText}`)}return l.json()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nr(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function ot(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pu extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class he{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(i){try{return atob(i)}catch(s){throw typeof DOMException<"u"&&s instanceof DOMException?new Pu("Invalid base64 string: "+s):s}}(e);return new he(t)}static fromUint8Array(e){const t=function(i){let s="";for(let o=0;o<i.length;++o)s+=String.fromCharCode(i[o]);return s}(e);return new he(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const r=new Uint8Array(t.length);for(let i=0;i<t.length;i++)r[i]=t.charCodeAt(i);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Ee(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}he.EMPTY_BYTE_STRING=new he("");const Ru=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Ye(n){if(H(!!n,39018),typeof n=="string"){let e=0;const t=Ru.exec(n);if(H(!!t,46558,{timestamp:n}),t[1]){let i=t[1];i=(i+"000000000").substr(0,9),e=Number(i)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:B(n.seconds),nanos:B(n.nanos)}}function B(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function _n(n){return typeof n=="string"?he.fromBase64String(n):he.fromUint8Array(n)}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function q(n,e){const t={typeString:n};return e&&(t.value=e),t}function at(n,e){if(!ji(n))throw new E(I.INVALID_ARGUMENT,"JSON must be an object");let t;for(const r in e)if(e[r]){const i=e[r].typeString,s="value"in e[r]?{value:e[r].value}:void 0;if(!(r in n)){t=`JSON missing required field: '${r}'`;break}const o=n[r];if(i&&typeof o!==i){t=`JSON field '${r}' must be a ${i}.`;break}if(s!==void 0&&o!==s.value){t=`Expected '${r}' field to equal '${s.value}'`;break}}if(t)throw new E(I.INVALID_ARGUMENT,t);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kr=-62135596800,Cr=1e6;class k{static now(){return k.fromMillis(Date.now())}static fromDate(e){return k.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor((e-1e3*t)*Cr);return new k(t,r)}static fromInstant(e){if(!e||typeof e.Te!="bigint")throw new E(I.INVALID_ARGUMENT,"Invalid Temporal.Instant object provided.");return k._fromEpochNanoseconds(e.Te)}static _fromEpochNanoseconds(e){let t,r;if(e>=0n)t=Number(e/1000000000n),r=Number(e%1000000000n);else{const i=e%1000000000n;i===0n?(t=Number(e/1000000000n),r=0):(t=Number(e/1000000000n-1n),r=Number(i+1000000000n))}return new k(t,r)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new E(I.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new E(I.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<kr)throw new E(I.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new E(I.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/Cr}toInstant(){if(typeof Temporal>"u"||!Temporal.Instant)throw new E(I.FAILED_PRECONDITION,"The Temporal object is not available in the current environment.");const e=1000000000n*BigInt(this.seconds)+BigInt(this.nanoseconds);return Temporal.Instant.__PRIVATE_fromEpochNanoseconds(e)}_compareTo(e){return this.seconds===e.seconds?Ee(this.nanoseconds,e.nanoseconds):Ee(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:k._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(at(e,k._jsonSchema))return new k(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-kr;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}k._jsonSchemaVersion="firestore/timestamp/1.0",k._jsonSchema={type:q("string",k._jsonSchemaVersion),seconds:q("number"),nanoseconds:q("number")};function Hi(n){var t,r;return((r=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{}).__type__)==null?void 0:r.stringValue)==="server_timestamp"}function Wi(n){const e=n.mapValue.fields.__previous_value__;return Hi(e)?Wi(e):e}function yn(n){const e=Ye(n.mapValue.fields.__local_write_time__.timestampValue);return new k(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qi="__type__",Nu="__max__",Gi="__vector__",Ki="value";function In(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?Hi(n)?4:function(t){return(((t.mapValue||{}).fields||{}).__type__||{}).stringValue===Nu}(n)?9007199254740991:function(t){var i,s;return((s=(((i=t==null?void 0:t.mapValue)==null?void 0:i.fields)||{})[qi])==null?void 0:s.stringValue)===Gi}(n)?10:11:N(28295,{value:n})}function wn(n,e,t){if(n===e)return!0;const r=In(n);if(r!==In(e))return!1;switch(r){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return yn(n).isEqual(yn(e));case 3:return function(s,o){if(typeof s.timestampValue=="string"&&typeof o.timestampValue=="string"&&s.timestampValue.length===o.timestampValue.length)return s.timestampValue===o.timestampValue;const l=Ye(s.timestampValue),d=Ye(o.timestampValue);return l.seconds===d.seconds&&l.nanos===d.nanos}(n,e);case 5:return n.stringValue===e.stringValue;case 6:return function(s,o){return _n(s.bytesValue).isEqual(_n(o.bytesValue))}(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return function(s,o){return B(s.geoPointValue.latitude)===B(o.geoPointValue.latitude)&&B(s.geoPointValue.longitude)===B(o.geoPointValue.longitude)}(n,e);case 2:return function(s,o,l){if("integerValue"in s&&"integerValue"in o)return B(s.integerValue)===B(o.integerValue);let d,g;return!("doubleValue"in s)||!("doubleValue"in o)?!1:(d=B(s.doubleValue),g=B(o.doubleValue),d===g?Rt(d)===Rt(g):!!(l===void 0||l.Pe)&&isNaN(d)&&isNaN(g))}(n,e,t);case 9:return Bi(n.arrayValue.values||[],e.arrayValue.values||[],(i,s)=>wn(i,s,t));case 10:case 11:return function(s,o,l){const d=s.mapValue.fields||{},g=o.mapValue.fields||{};if(Nr(d)!==Nr(g))return!1;for(const _ in d)if(d.hasOwnProperty(_)&&(g[_]===void 0||!wn(d[_],g[_],l)))return!1;return!0}(n,e,t);default:return N(52216,{left:n})}}function nn(n){return!!n&&"mapValue"in n}function We(n){if(n.geoPointValue)return{geoPointValue:{...n.geoPointValue}};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:{...n.timestampValue}};if(n.mapValue){const e={mapValue:{fields:{}}};return ot(n.mapValue.fields,(t,r)=>e.mapValue.fields[t]=We(r)),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=We(n.arrayValue.values[t]);return e}return{...n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class C{static fromTimestamp(e){return new C(e)}static min(){return new C(new k(0,0))}static max(){return new C(new k(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nt{constructor(e,t){this.comparator=e,this.root=t||L.EMPTY}insert(e,t){return new Nt(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,L.BLACK,null,null))}remove(e){return new Nt(this.comparator,this.root.remove(e,this.comparator).copy(null,null,L.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const i=this.comparator(e,r.key);if(i===0)return t+r.left.size;i<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,r)=>(e(t,r),!1))}toString(){const e=[];return this.inorderTraversal((t,r)=>(e.push(`${t}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new ht(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new ht(this.root,e,this.comparator,!1)}getReverseIterator(){return new ht(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new ht(this.root,e,this.comparator,!0)}}class ht{constructor(e,t,r,i){this.isReverse=i,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=t?r(e.key,t):1,t&&i&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(s===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class L{constructor(e,t,r,i,s){this.key=e,this.value=t,this.color=r??L.RED,this.left=i??L.EMPTY,this.right=s??L.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,i,s){return new L(e??this.key,t??this.value,r??this.color,i??this.left,s??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let i=this;const s=r(e,i.key);return i=s<0?i.copy(null,null,null,i.left.insert(e,t,r),null):s===0?i.copy(null,t,null,null,null):i.copy(null,null,null,null,i.right.insert(e,t,r)),i.fixUp()}removeMin(){if(this.left.isEmpty())return L.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,i=this;if(t(e,i.key)<0)i.left.isEmpty()||i.left.isRed()||i.left.left.isRed()||(i=i.moveRedLeft()),i=i.copy(null,null,null,i.left.remove(e,t),null);else{if(i.left.isRed()&&(i=i.rotateRight()),i.right.isEmpty()||i.right.isRed()||i.right.left.isRed()||(i=i.moveRedRight()),t(e,i.key)===0){if(i.right.isEmpty())return L.EMPTY;r=i.right.min(),i=i.copy(r.key,r.value,null,null,i.right.removeMin())}i=i.copy(null,null,null,null,i.right.remove(e,t))}return i.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,L.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,L.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw N(43730,{key:this.key,value:this.value});if(this.right.isRed())throw N(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw N(27949);return e+(this.isRed()?0:1)}}L.EMPTY=null,L.RED=!0,L.BLACK=!1;L.EMPTY=new class{constructor(){this.size=0}get key(){throw N(57766)}get value(){throw N(16141)}get color(){throw N(16727)}get left(){throw N(29726)}get right(){throw N(36894)}copy(e,t,r,i,s){return this}insert(e,t,r){return new L(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kt{constructor(e){this.comparator=e,this.data=new Nt(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,r)=>(e(t),!1))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const i=r.getNext();if(this.comparator(i.key,e[1])>=0)return;t(i.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new Dr(this.data.getIterator())}getIteratorFrom(e){return new Dr(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(r=>{t=t.add(r)}),t}isEqual(e){if(!(e instanceof kt)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const i=t.getNext().key,s=r.getNext().key;if(this.comparator(i,s)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new kt(this.comparator);return t.data=e,t}}class Dr{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ce{constructor(e){this.fields=e,e.sort(Xe.comparator)}static empty(){return new Ce([])}unionWith(e){let t=new kt(Xe.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new Ce(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return Bi(this.fields,e.fields,(t,r)=>t.isEqual(r))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class W{constructor(e){this.value=e}static empty(){return new W({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!nn(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=We(t)}setAll(e){let t=Xe.emptyPath(),r={},i=[];e.forEach((o,l)=>{if(!t.isImmediateParentOf(l)){const d=this.getFieldsMap(t);this.applyChanges(d,r,i),r={},i=[],t=l.popLast()}o?r[l.lastSegment()]=We(o):i.push(l.lastSegment())});const s=this.getFieldsMap(t);this.applyChanges(s,r,i)}delete(e){const t=this.field(e.popLast());nn(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return wn(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let i=t.mapValue.fields[e.get(r)];nn(i)&&i.mapValue.fields||(i={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=i),t=i}return t.mapValue.fields}applyChanges(e,t,r){ot(t,(i,s)=>e[i]=s);for(const i of r)delete e[i]}clone(){return new W(We(this.value))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class re{constructor(e,t,r,i,s,o,l){this.key=e,this.documentType=t,this.version=r,this.readTime=i,this.createTime=s,this.data=o,this.documentState=l}static newInvalidDocument(e){return new re(e,0,C.min(),C.min(),C.min(),W.empty(),0)}static newFoundDocument(e,t,r,i){return new re(e,1,t,C.min(),r,i,0)}static newNoDocument(e,t){return new re(e,2,t,C.min(),C.min(),W.empty(),0)}static newUnknownDocument(e,t){return new re(e,3,t,C.min(),C.min(),W.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(C.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=W.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=W.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=C.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof re&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new re(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ku{constructor(e,t=null,r=[],i=[],s=null,o="F",l=null,d=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=i,this.limit=s,this.limitType=o,this.startAt=l,this.endAt=d,this.pe=null,this.ye=null,this.we=null,this.startAt,this.endAt}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ji(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Rt(e)?"-0":e}}function Cu(n,e,t){return function(i){return typeof i=="number"&&Number.isInteger(i)&&!Rt(i)&&i<=Number.MAX_SAFE_INTEGER&&i>=Number.MIN_SAFE_INTEGER}(e)?function(i){return{integerValue:""+i}}(e):Ji(n,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $t{constructor(){this._=void 0}}class Du extends $t{}class Xi extends $t{constructor(e){super(),this.elements=e}}class Yi extends $t{constructor(e){super(),this.elements=e}}class Un extends $t{constructor(e,t){super(),this.serializer=e,this.ge=t}}class Ou extends Un{}class Vu extends Un{}class Lu extends Un{}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qi{constructor(e,t){this.field=e,this.transform=t}}class K{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new K}static exists(e){return new K(void 0,e)}static updateTime(e){return new K(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}class Bt{}class Zi extends Bt{constructor(e,t,r,i=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=i,this.type=0}getFieldMask(){return null}}class Fn extends Bt{constructor(e,t,r,i,s=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=i,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}class es extends Bt{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class ts extends Bt{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}class Mu{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function It(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Uu(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function Fu(n,e){return It(n,e.toTimestamp())}function rn(n){return H(!!n,49232),C.fromTimestamp(function(t){const r=Ye(t);return new k(r.seconds,r.nanos)}(n))}function ns(n,e){return En(n,e).canonicalString()}function En(n,e){const t=function(i){return new O(["projects",i.projectId,"databases",i.database])}(n).child("documents");return e===void 0?t:t.child(e)}function Ct(n,e){return ns(n.databaseId,e.path)}function Or(n,e){const t=function(i){const s=O.fromString(i);return H(rs(s),10190,{key:s.toString()}),s}(e);if(t.get(1)!==n.databaseId.projectId)throw new E(I.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new E(I.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new z(function(i){return H(i.length>4&&i.get(4)==="documents",29091,{key:i.toString()}),i.popFirst(5)}(t))}function Vr(n,e,t){return{name:Ct(n,e),fields:t.value.mapValue.fields}}function xu(n,e){return"found"in e?function(r,i){H(!!i.found,43571),i.found.name,i.found.updateTime;const s=Or(r,i.found.name),o=rn(i.found.updateTime),l=i.found.createTime?rn(i.found.createTime):C.min(),d=new W({mapValue:{fields:i.found.fields}});return re.newFoundDocument(s,o,l,d)}(n,e):"missing"in e?function(r,i){H(!!i.missing,3894),H(!!i.readTime,22933);const s=Or(r,i.missing),o=rn(i.readTime);return re.newNoDocument(s,o)}(n,e):N(7234,{result:e})}function $u(n,e){let t;if(e instanceof Zi)t={update:Vr(n,e.key,e.value)};else if(e instanceof es)t={delete:Ct(n,e.key)};else if(e instanceof Fn)t={update:Vr(n,e.key,e.data),updateMask:Bu(e.fieldMask)};else{if(!(e instanceof ts))return N(16599,{Fe:e.type});t={verify:Ct(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(r=>function(s,o){const l=o.transform;if(l instanceof Du)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(l instanceof Xi)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:l.elements}};if(l instanceof Yi)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:l.elements}};if(l instanceof Ou)return{fieldPath:o.field.canonicalString(),increment:l.ge};if(l instanceof Vu)return{fieldPath:o.field.canonicalString(),minimum:l.ge};if(l instanceof Lu)return{fieldPath:o.field.canonicalString(),maximum:l.ge};throw N(20930,{transform:o.transform})}(0,r))),e.precondition.isNone||(t.currentDocument=function(i,s){return s.updateTime!==void 0?{updateTime:Fu(i,s.updateTime)}:s.exists!==void 0?{exists:s.exists}:N(27497)}(n,e.precondition)),t}function Bu(n){const e=[];return n.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function rs(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}function is(n){return!!n&&typeof n._toProto=="function"&&n._protoValueType==="ProtoValue"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xn(n){return new Mu(n,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ju{}class zu extends ju{constructor(e,t,r,i){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=i,this.be=!1}De(){if(this.be)throw new E(I.FAILED_PRECONDITION,"The client has already been terminated.")}le(e,t,r,i){return this.De(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,o])=>this.connection.le(e,En(t,r),i,s,o)).catch(s=>{throw s.name==="FirebaseError"?(s.code===I.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new E(I.UNKNOWN,s.toString())})}de(e,t,r,i,s){return this.De(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,l])=>this.connection.de(e,En(t,r),i,o,l,s)).catch(o=>{throw o.name==="FirebaseError"?(o.code===I.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new E(I.UNKNOWN,o.toString())})}terminate(){this.be=!0,this.connection.terminate()}}async function $n(n,e){const t=xi(n),r={writes:e.map(i=>$u(t.serializer,i))};await t.le("Commit",t.serializer.databaseId,O.emptyPath(),r)}async function ss(n,e){const t=xi(n),r={documents:e.map(l=>Ct(t.serializer,l))},i=await t.de("BatchGetDocuments",t.serializer.databaseId,O.emptyPath(),r,e.length),s=new Map;i.forEach(l=>{const d=xu(t.serializer,l);s.set(d.key.toString(),d)});const o=[];return e.forEach(l=>{const d=s.get(l.toString());H(!!d,55234,{key:l}),o.push(d)}),o}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const os="ComponentProvider",qe=new Map;function jt(n){if(n._terminated)throw new E(I.FAILED_PRECONDITION,"The client has already been terminated.");if(!qe.has(n)){ke(os,"Initializing Datastore");const e=function(s){return new Su(s)}(function(s,o,l,d,g){return new du(s,o,l,g.host,g.ssl,g.experimentalForceLongPolling,g.experimentalAutoDetectLongPolling,zi(g.experimentalLongPollingOptions),g.useFetchStreams,g.isUsingEmulator,d,g._customHeaders,g.grpcFlowControlWindow)}(n._databaseId,n.app.options.appId||"",n._persistenceKey,n.app.options.apiKey,n._freezeSettings())),t=xn(n._databaseId),r=function(s,o,l,d){return new zu(s,o,l,d)}(n._authCredentials,n._appCheckCredentials,e,t);qe.set(n,r)}return qe.get(n)}const Hu=1048576,as="firestore.googleapis.com",Lr=!0;class Mr{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new E(I.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=as,this.ssl=Lr}else this.host=e.host,this.ssl=e.ssl??Lr;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e._customHeaders&&(this._customHeaders={...e._customHeaders}),e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<Hu)throw new E(I.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}if(function(r,i,s,o){if(i===!0&&o===!0)throw new E(I.INVALID_ARGUMENT,`${r} and ${s} cannot be used together.`)}("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=zi(e.experimentalLongPollingOptions??{}),function(r){if(r.timeoutSeconds!==void 0){if(isNaN(r.timeoutSeconds))throw new E(I.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (must not be NaN)`);if(r.timeoutSeconds<5)throw new E(I.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (minimum allowed value is 5)`);if(r.timeoutSeconds>30)throw new E(I.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams,e.grpcFlowControlWindow!==void 0){if(typeof e.grpcFlowControlWindow!="number"||e.grpcFlowControlWindow<=0||e.grpcFlowControlWindow>2147483647||!Number.isInteger(e.grpcFlowControlWindow))throw new E(I.INVALID_ARGUMENT,"grpcFlowControlWindow must be a positive integer and cannot exceed 2147483647");this.grpcFlowControlWindow=e.grpcFlowControlWindow}}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,i){return r.timeoutSeconds===i.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams&&this.grpcFlowControlWindow===e.grpcFlowControlWindow&&function(r,i){if(r===i)return!0;if(!r||!i)return!1;const s=Object.keys(r),o=Object.keys(i);if(s.length!==o.length)return!1;for(const l of s)if(r[l]!==i[l])return!1;return!0}(this._customHeaders,e._customHeaders)}}class zt{constructor(e,t,r,i){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Mr({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new E(I.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new E(I.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Mr(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new ou;switch(r.type){case"firstParty":return new lu(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new E(I.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const r=qe.get(t);r&&(ke(os,"Removing Datastore"),qe.delete(t),r.terminate())}(this),Promise.resolve()}}function Wu(n,e){const t=typeof n=="object"?n:ni(),r=typeof n=="string"?n:"(default)",i=An(t,"firestore/lite").getImmediate({identifier:r});if(!i._initialized){const s=Ds("firestore");s&&qu(i,...s)}return i}function qu(n,e,t,r={}){var g;n=st(n,zt);const i=tt(e),s=n._getSettings(),o={...s,emulatorOptions:n._getEmulatorOptions()},l=`${e}:${t}`;i&&Qr(`https://${l}`),s.host!==as&&s.host!==l&&Ui("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const d={...s,host:l,ssl:i,emulatorOptions:r};if(!ce(d,o)&&(n._setSettings(d),r.mockUserToken)){let _,y;if(typeof r.mockUserToken=="string")_=r.mockUserToken,y=$.MOCK_USER;else{_=Vs(r.mockUserToken,(g=n._app)==null?void 0:g.options.projectId);const w=r.mockUserToken.sub||r.mockUserToken.user_id;if(!w)throw new E(I.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");y=new $(w)}n._authCredentials=new au(new $i(_,y))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bn{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new Bn(this.firestore,e,this._query)}}class D{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Qe(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new D(this.firestore,e,this._key)}toJSON(){return{type:D._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,r){if(at(t,D._jsonSchema))return new D(e,r||null,new z(O.fromString(t.referencePath)))}}D._jsonSchemaVersion="firestore/documentReference/1.0",D._jsonSchema={type:q("string",D._jsonSchemaVersion),referencePath:q("string")};class Qe extends Bn{constructor(e,t,r){super(e,t,function(s){return new ku(s)}(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new D(this.firestore,null,new z(e))}withConverter(e){return new Qe(this.firestore,e,this._path)}}function sn(n,e,...t){if(n=M(n),arguments.length===1&&(e=mu.newId()),wu("doc","path",e),n instanceof zt){const r=O.fromString(e,...t);return Sr(r),new D(n,null,new z(r))}{if(!(n instanceof D||n instanceof Qe))throw new E(I.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(O.fromString(e,...t));return Sr(r),new D(n.firestore,n instanceof Qe?n.converter:null,new z(r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class j{constructor(e){this._byteString=e}static fromBase64String(e){try{return new j(he.fromBase64String(e))}catch(t){throw new E(I.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new j(he.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:j._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(at(e,j._jsonSchema))return j.fromBase64String(e.bytes)}}j._jsonSchemaVersion="firestore/bytes/1.0",j._jsonSchema={type:q("string",j._jsonSchemaVersion),bytes:q("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ht{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new E(I.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Xe(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ct{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ee{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new E(I.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new E(I.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return Ee(this._lat,e._lat)||Ee(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:ee._jsonSchemaVersion}}static fromJSON(e){if(at(e,ee._jsonSchema))return new ee(e.latitude,e.longitude)}}ee._jsonSchemaVersion="firestore/geoPoint/1.0",ee._jsonSchema={type:q("string",ee._jsonSchemaVersion),latitude:q("number"),longitude:q("number")};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Y{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){/**
* @license
* Copyright 2017 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(r,i){if(r.length!==i.length)return!1;for(let s=0;s<r.length;++s)if(r[s]!==i[s])return!1;return!0}(this._values,e._values)}toJSON(){return{type:Y._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(at(e,Y._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(t=>typeof t=="number"))return new Y(e.vectorValues);throw new E(I.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}Y._jsonSchemaVersion="firestore/vectorValue/1.0",Y._jsonSchema={type:q("string",Y._jsonSchemaVersion),vectorValues:q("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gu=/^__.*__$/;class Ku{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new Fn(e,this.data,this.fieldMask,t,this.fieldTransforms):new Zi(e,this.data,t,this.fieldTransforms)}}class cs{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return new Fn(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function us(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw N(40011,{dataSource:n})}}class Wt{constructor(e,t,r,i,s,o){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=i,s===void 0&&this.validatePath(),this.fieldTransforms=s||[],this.fieldMask=o||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new Wt({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){var i;const t=(i=this.path)==null?void 0:i.child(e),r=this.contextWith({path:t,arrayElement:!1});return r.validatePathSegment(e),r}childContextForFieldPath(e){var i;const t=(i=this.path)==null?void 0:i.child(e),r=this.contextWith({path:t,arrayElement:!1});return r.validatePath(),r}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return Ot(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(e.length===0)throw this.createError("Document fields must not be empty");if(us(this.dataSource)&&Gu.test(e))throw this.createError('Document fields cannot begin and end with "__"')}}class Ju{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||xn(e)}createContext(e,t,r,i=!1){return new Wt({dataSource:e,methodName:t,targetDoc:r,path:Xe.emptyPath(),arrayElement:!1,hasConverter:i},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function jn(n){const e=n._freezeSettings(),t=xn(n._databaseId);return new Ju(n._databaseId,!!e.ignoreUndefinedProperties,t)}function ls(n,e,t,r,i,s={}){const o=n.createContext(s.merge||s.mergeFields?2:0,e,t,i);Wn("Data must be an object, but it was:",o,r);const l=ps(r,o);let d,g;if(s.merge)d=new Ce(o.fieldMask),g=o.fieldTransforms;else if(s.mergeFields){const _=[];for(const y of s.mergeFields){const w=Dt(e,y,t);if(!o.contains(w))throw new E(I.INVALID_ARGUMENT,`Field '${w}' is specified in your field mask but missing from your input data.`);ys(_,w)||_.push(w)}d=new Ce(_),g=o.fieldTransforms.filter(y=>d.covers(y.field))}else d=null,g=o.fieldTransforms;return new Ku(new W(l),d,g)}class qt extends ct{_toFieldTransform(e){if(e.dataSource!==2)throw e.dataSource===1?e.createError(`${this._methodName}() can only appear at the top level of your update data`):e.createError(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof qt}}function hs(n,e,t){return new Wt({dataSource:3,targetDoc:e.settings.targetDoc,methodName:n._methodName,arrayElement:t},e.databaseId,e.serializer,e.ignoreUndefinedProperties)}class zn extends ct{constructor(e,t){super(e),this.Se=t}_toFieldTransform(e){const t=hs(this,e,!0),r=this.Se.map(s=>je(s,t)),i=new Xi(r);return new Qi(e.path,i)}isEqual(e){return e instanceof zn&&ce(this.Se,e.Se)}}class Hn extends ct{constructor(e,t){super(e),this.Se=t}_toFieldTransform(e){const t=hs(this,e,!0),r=this.Se.map(s=>je(s,t)),i=new Yi(r);return new Qi(e.path,i)}isEqual(e){return e instanceof Hn&&ce(this.Se,e.Se)}}function ds(n,e,t,r){const i=n.createContext(1,e,t);Wn("Data must be an object, but it was:",i,r);const s=[],o=W.empty();ot(r,(d,g)=>{const _=_s(e,d,t);g=M(g);const y=i.childContextForFieldPath(_);if(g instanceof qt)s.push(_);else{const w=je(g,y);w!=null&&(s.push(_),o.set(_,w))}});const l=new Ce(s);return new cs(o,l,i.fieldTransforms)}function fs(n,e,t,r,i,s){const o=n.createContext(1,e,t),l=[Dt(e,r,t)],d=[i];if(s.length%2!=0)throw new E(I.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let w=0;w<s.length;w+=2)l.push(Dt(e,s[w])),d.push(s[w+1]);const g=[],_=W.empty();for(let w=l.length-1;w>=0;--w)if(!ys(g,l[w])){const P=l[w];let S=d[w];S=M(S);const b=o.childContextForFieldPath(P);if(S instanceof qt)g.push(P);else{const v=je(S,b);v!=null&&(g.push(P),_.set(P,v))}}const y=new Ce(g);return new cs(_,y,o.fieldTransforms)}function je(n,e,t){if(gs(n=M(n)))return Wn("Unsupported field value:",e,n),ps(n,e);if(n instanceof ct)return function(i,s){if(!us(s.dataSource))throw s.createError(`${i._methodName}() can only be used with update() and set()`);if(!s.path)throw s.createError(`${i._methodName}() is not currently supported inside arrays`);const o=i._toFieldTransform(s);o&&s.fieldTransforms.push(o)}(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.createError("Nested arrays are not supported");return function(i,s){const o=[];let l=0;for(const d of i){let g=je(d,s.childContextForArray(l));g==null&&(g={nullValue:"NULL_VALUE"}),o.push(g),l++}return{arrayValue:{values:o}}}(n,e)}return function(i,s,o){if((i=M(i))===null)return{nullValue:"NULL_VALUE"};if(typeof i=="number")return Cu(s.serializer,i);if(typeof i=="boolean")return{booleanValue:i};if(typeof i=="string")return{stringValue:i};if(i instanceof Date){const l=k.fromDate(i);return{timestampValue:It(s.serializer,l)}}if(i instanceof k){const l=new k(i.seconds,1e3*Math.floor(i.nanoseconds/1e3));return{timestampValue:It(s.serializer,l)}}if(ms(i)){const l=k.fromInstant(i),d=new k(l.seconds,1e3*Math.floor(l.nanoseconds/1e3));return{timestampValue:It(s.serializer,d)}}if(i instanceof ee)return{geoPointValue:{latitude:i.latitude,longitude:i.longitude}};if(i instanceof j)return{bytesValue:Uu(s.serializer,i._byteString)};if(i instanceof D){const l=s.databaseId,d=i.firestore._databaseId;if(!d.isEqual(l))throw s.createError(`Document reference is for database ${d.projectId}/${d.database} but should be for database ${l.projectId}/${l.database}`);return{referenceValue:ns(i.firestore._databaseId||s.databaseId,i._key.path)}}if(i instanceof Y)return function(d,g){const _=d instanceof Y?d.toArray():d;return{mapValue:{fields:{[qi]:{stringValue:Gi},[Ki]:{arrayValue:{values:_.map(w=>{if(typeof w!="number")throw g.createError("VectorValues must only contain numeric values.");return Ji(g.serializer,w)})}}}}}}(i,s);if(is(i))return i._toProto(s.serializer);throw s.createError(`Unsupported field value: ${Mn(i)}`)}(n,e)}function ps(n,e){const t={};return function(i){for(const s in i)if(Object.prototype.hasOwnProperty.call(i,s))return!1;return!0}(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):ot(n,(r,i)=>{const s=je(i,e.childContextForField(r));s!=null&&(t[r]=s)}),{mapValue:{fields:t}}}function ms(n){if(typeof n!="object"||n===null)return!1;if(typeof Temporal<"u"&&typeof Temporal.Instant=="function"&&n instanceof Temporal.Instant)return!0;const e=n;return e[Symbol.toStringTag]==="Temporal.Instant"&&typeof e.Te=="bigint"}function gs(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof k||n instanceof ee||n instanceof j||n instanceof D||n instanceof ct||n instanceof Y||ms(n)||is(n))}function Wn(n,e,t){if(!gs(t)||!ji(t)){const r=Mn(t);throw r==="an object"?e.createError(n+" a custom object"):e.createError(n+" "+r)}}function Dt(n,e,t){if((e=M(e))instanceof Ht)return e._internalPath;if(typeof e=="string")return _s(n,e);throw Ot("Field path arguments must be of type string or ",n,!1,void 0,t)}const Xu=new RegExp("[~\\*/\\[\\]]");function _s(n,e,t){if(e.search(Xu)>=0)throw Ot(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new Ht(...e.split("."))._internalPath}catch{throw Ot(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function Ot(n,e,t,r,i){const s=r&&!r.isEmpty(),o=i!==void 0;let l=`Function ${e}() called with invalid data`;t&&(l+=" (via `toFirestore()`)"),l+=". ";let d="";return(s||o)&&(d+=" (found",s&&(d+=` in field ${r}`),o&&(d+=` in document ${i}`),d+=")"),new E(I.INVALID_ARGUMENT,l+n+d)}function ys(n,e){return n.some(t=>t.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vt{constructor(e,t,r,i,s){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=i,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new D(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new Yu(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){var e;return((e=this._document)==null?void 0:e.data.clone().value.mapValue.fields)??void 0}get(e){if(this._document){const t=this._document.data.field(Dt("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class Yu extends Vt{data(){return super.data()}}class Qu{convertValue(e,t="none"){switch(In(e)){case 0:return null;case 1:return e.booleanValue;case 2:return B(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(_n(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw N(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return ot(e,(i,s)=>{r[i]=this.convertValue(s,t)}),r}convertVectorValue(e){var r,i,s;const t=(s=(i=(r=e.fields)==null?void 0:r[Ki].arrayValue)==null?void 0:i.values)==null?void 0:s.map(o=>B(o.doubleValue));return new Y(t)}convertGeoPoint(e){return new ee(B(e.latitude),B(e.longitude))}convertArray(e,t){return(e.values||[]).map(r=>this.convertValue(r,t))}convertServerTimestamp(e,t){switch(t){case"previous":const r=Wi(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(yn(e));default:return null}}convertTimestamp(e){const t=Ye(e);return new k(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=O.fromString(e);H(rs(r),9688,{name:e});const i=new Je(r.get(1),r.get(3)),s=new z(r.popFirst(5));return i.isEqual(t)||xt(`A document reference to ${s} refers to a different database (${i.projectId}/${i.database}), which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Is(n,e,t){let r;return r=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,r}class ws extends Qu{constructor(e){super(),this.firestore=e}convertBytes(e){return new j(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new D(this.firestore,null,t)}}function on(n){const e=jt((n=st(n,D)).firestore),t=new ws(n.firestore);return ss(e,[n._key]).then(r=>{H(r.length===1,15618);const i=r[0];return new Vt(n.firestore,t,n._key,i.isFoundDocument()?i:null,n.converter)})}function Zu(n,e,t){const r=Is((n=st(n,D)).converter,e,t),i=ls(jn(n.firestore),"setDoc",n._key,r,n.converter!==null,t);return $n(jt(n.firestore),[i.toMutation(n._key,K.none())])}function el(n,e,t,...r){const i=jn((n=st(n,D)).firestore);let s;return s=typeof(e=M(e))=="string"||e instanceof Ht?fs(i,"updateDoc",n._key,e,t,r):ds(i,"updateDoc",n._key,e),$n(jt(n.firestore),[s.toMutation(n._key,K.exists(!0))])}function tl(...n){return new zn("arrayUnion",n)}function nl(...n){return new Hn("arrayRemove",n)}const Ur="4.17.2";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qn{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Es{constructor(e,t,r=1e3,i=1.5,s=6e4){this.t=e,this.timerId=t,this.i=r,this.o=i,this.h=s,this.u=0,this.l=null,this._=Date.now(),this.reset()}reset(){this.u=0}m(){this.u=this.h}A(e){this.cancel();const t=Math.floor(this.u+this.p()),r=Math.max(0,Date.now()-this._),i=Math.max(0,t-r);i>0&&ke("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.u} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.l=this.t.enqueueAfterDelay(this.timerId,i,()=>(this._=Date.now(),e())),this.u*=this.o,this.u<this.i&&(this.u=this.i),this.u>this.h&&(this.u=this.h)}T(){this.l!==null&&(this.l.skipDelay(),this.l=null)}cancel(){this.l!==null&&(this.l.cancel(),this.l=null)}p(){return(Math.random()-.5)*this.u}}function dt(n,e){if((n=M(n)).firestore!==e)throw new E(I.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let rl=class{constructor(e){this.datastore=e,this.readVersions=new Map,this.mutations=[],this.committed=!1,this.lastTransactionError=null,this.writtenDocs=new Set}async lookup(e){if(this.ensureCommitNotCalled(),this.mutations.length>0)throw this.lastTransactionError=new E(I.INVALID_ARGUMENT,"Firestore transactions require all reads to be executed before all writes."),this.lastTransactionError;const t=await ss(this.datastore,e);return t.forEach(r=>this.recordVersion(r)),t}set(e,t){this.write(t.toMutation(e,this.precondition(e))),this.writtenDocs.add(e.toString())}update(e,t){try{this.write(t.toMutation(e,this.preconditionForUpdate(e)))}catch(r){this.lastTransactionError=r}this.writtenDocs.add(e.toString())}delete(e){this.write(new es(e,this.precondition(e))),this.writtenDocs.add(e.toString())}async commit(){if(this.ensureCommitNotCalled(),this.lastTransactionError)throw this.lastTransactionError;const e=this.readVersions;this.mutations.forEach(t=>{e.delete(t.key.toString())}),e.forEach((t,r)=>{const i=z.fromPath(r);this.mutations.push(new ts(i,this.precondition(i)))}),await $n(this.datastore,this.mutations),this.committed=!0}recordVersion(e){let t;if(e.isFoundDocument())t=e.version;else{if(!e.isNoDocument())throw N(50498,{R:e.constructor.name});t=C.min()}const r=this.readVersions.get(e.key.toString());if(r){if(!t.isEqual(r))throw new E(I.ABORTED,"Document version changed between two reads.")}else this.readVersions.set(e.key.toString(),t)}precondition(e){const t=this.readVersions.get(e.toString());return!this.writtenDocs.has(e.toString())&&t?t.isEqual(C.min())?K.exists(!1):K.updateTime(t):K.none()}preconditionForUpdate(e){const t=this.readVersions.get(e.toString());if(!this.writtenDocs.has(e.toString())&&t){if(t.isEqual(C.min()))throw new E(I.INVALID_ARGUMENT,"Can't update a document that doesn't exist.");return K.updateTime(t)}return K.exists(!0)}write(e){this.ensureCommitNotCalled(),this.mutations.push(e)}ensureCommitNotCalled(){}};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const il={maxAttempts:5};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sl{constructor(e,t,r,i,s){this.asyncQueue=e,this.datastore=t,this.options=r,this.updateFunction=i,this.deferred=s,this.I=r.maxAttempts,this.P=new Es(this.asyncQueue,"transaction_retry")}V(){this.I-=1,this.D()}D(){this.P.A(async()=>{const e=new rl(this.datastore),t=this.v(e);t&&t.then(r=>{this.asyncQueue.enqueueAndForget(()=>e.commit().then(()=>{this.deferred.resolve(r)}).catch(i=>{this.F(i)}))}).catch(r=>{this.F(r)})})}v(e){try{const t=this.updateFunction(e);return!Tu(t)&&t.catch&&t.then?t:(this.deferred.reject(Error("Transaction callback must return a Promise")),null)}catch(t){return this.deferred.reject(t),null}}F(e){this.I>0&&this.B(e)?(this.I-=1,this.asyncQueue.enqueueAndForget(()=>(this.D(),Promise.resolve()))):this.deferred.reject(e)}B(e){if((e==null?void 0:e.name)==="FirebaseError"){const t=e.code;return t==="aborted"||t==="failed-precondition"||t==="already-exists"||!Au(t)}return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function an(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gn{constructor(e,t,r,i,s){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=i,this.removalCallback=s,this.deferred=new qn,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(o=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,i,s){const o=Date.now()+r,l=new Gn(e,t,o,i,s);return l.start(r),l}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new E(I.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fr="AsyncQueue";class ol{constructor(e=Promise.resolve()){this.k=[],this.O=!1,this.S=[],this.q=null,this.C=!1,this.M=!1,this.N=[],this.P=new Es(this,"async_queue_retry"),this.L=()=>{const r=an();r&&ke(Fr,"Visibility state changed to "+r.visibilityState),this.P.T()},this.W=e;const t=an();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.L)}get isShuttingDown(){return this.O}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.U(),this.j(e)}enterRestrictedMode(e){if(!this.O){this.O=!0,this.M=e||!1;const t=an();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.L)}}enqueue(e){if(this.U(),this.O)return new Promise(()=>{});const t=new qn;return this.j(()=>this.O&&this.M?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.k.push(e),this.$()))}async $(){if(this.k.length!==0){try{await this.k[0](),this.k.shift(),this.P.reset()}catch(e){if(!function(r){return r.name==="IndexedDbTransactionError"}(e))throw e;ke(Fr,"Operation failed with retryable error: "+e)}this.k.length>0&&this.P.A(()=>this.$())}}j(e){const t=this.W.then(()=>(this.C=!0,e().catch(r=>{this.q=r,this.C=!1;const i=xr(r);throw xt("INTERNAL UNHANDLED ERROR: ",i),r}).then(r=>(this.C=!1,r))));return this.W=t,t}enqueueAfterDelay(e,t,r){this.U(),this.N.indexOf(e)>-1&&(t=0);const i=Gn.createAndSchedule(this,e,t,r,s=>this.G(s));return this.S.push(i),i}U(){this.q&&N(47125,{H:xr(this.q)})}verifyOperationInProgress(){}async J(){let e;do e=this.W,await e;while(e!==this.W)}K(e){for(const t of this.S)if(t.timerId===e)return!0;return!1}X(e){return this.J().then(()=>{this.S.sort((t,r)=>t.targetTimeMs-r.targetTimeMs);for(const t of this.S)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.J()})}Y(e){this.N.push(e)}G(e){const t=this.S.indexOf(e);this.S.splice(t,1)}}function xr(n){let e=n.message||"";return n.stack&&(e=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class al{constructor(e,t){this._firestore=e,this._transaction=t,this._dataReader=jn(e)}get(e){const t=dt(e,this._firestore),r=new ws(this._firestore);return this._transaction.lookup([t._key]).then(i=>{if(!i||i.length!==1)return N(24041);const s=i[0];if(s.isFoundDocument())return new Vt(this._firestore,r,s.key,s,t.converter);if(s.isNoDocument())return new Vt(this._firestore,r,t._key,null,t.converter);throw N(18433,{doc:s})})}set(e,t,r){const i=dt(e,this._firestore),s=Is(i.converter,t,r),o=ls(this._dataReader,"Transaction.set",i._key,s,i.converter!==null,r);return this._transaction.set(i._key,o),this}update(e,t,r,...i){const s=dt(e,this._firestore);let o;return o=typeof(t=M(t))=="string"||t instanceof Ht?fs(this._dataReader,"Transaction.update",s._key,t,r,i):ds(this._dataReader,"Transaction.update",s._key,t),this._transaction.update(s._key,o),this}delete(e){const t=dt(e,this._firestore);return this._transaction.delete(t._key),this}}function $r(n,e,t){n=st(n,zt);const r=jt(n),i={...il,...t};(function(l){if(l.maxAttempts<1)throw new E(I.INVALID_ARGUMENT,"Max attempts must be at least 1")})(i);const s=new qn;return new sl(function(){return new ol}(),r,i,o=>e(new al(n,o)),s).V(),s.promise}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(function(){su(`${xe}_lite`),Me(new Re("firestore/lite",(e,{instanceIdentifier:t,options:r})=>{const i=e.getProvider("app").getImmediate(),s=new zt(new cu(e.getProvider("auth-internal")),new hu(i,e.getProvider("app-check-internal")),fu(i,t),i);return r&&s._setSettings(r),s},"PUBLIC").setMultipleInstances(!0)),we("firestore-lite",Ur,""),we("firestore-lite",Ur,"esm2020")})();const Br=1,jr=700*1024,cl=1e3*1e3,zr=400;let ft=null,Pe=null,Oe=null;function ze(){ft||(ft=ti(vs),Pe=ru(ft),Oe=Wu(ft))}function Kn(n){return{uid:n.uid,email:n.email||"",nome:n.displayName||""}}function _l(){ze()}async function yl(){return ze(),await Pe.authStateReady(),Pe.currentUser?Kn(Pe.currentUser):null}function Il(n){return ze(),Wa(Pe,e=>n(e?Kn(e):null))}async function wl(){ze();const n=new ie;n.setCustomParameters({prompt:"select_account"});const e=await dc(Pe,n);return Kn(e.user)}async function El(){ze(),await qa(Pe)}const Hr={"auth/popup-blocked":"O navegador bloqueou a janela de login. Permita pop-ups para este site e tente de novo.","auth/unauthorized-domain":"Este endereço não está autorizado no Firebase. Abra o app por meu-financeiro-app-kxb.pages.dev (ou adicione este domínio em Authentication → Configurações → Domínios autorizados).","auth/operation-not-allowed":"O login com Google não está ligado no Firebase (Authentication → Método de login → Google).","auth/configuration-not-found":"O Authentication ainda não foi ativado no Firebase (Authentication → Vamos começar).","auth/invalid-api-key":"A configuração do Firebase dentro do app está errada.","auth/api-key-not-valid.-please-pass-a-valid-api-key.":"A configuração do Firebase dentro do app está errada.","auth/too-many-requests":"Muitas tentativas seguidas. Espere alguns minutos e tente de novo.","auth/user-disabled":"Esta conta foi desativada no Firebase.","permission-denied":"A nuvem recusou o acesso. Confira se as Regras do Firestore foram publicadas.","not-found":"O banco de dados ainda não foi criado no Firebase (Firestore Database → Criar banco de dados).","resource-exhausted":"O limite grátis de hoje da nuvem acabou. Amanhã volta a sincronizar sozinho.","failed-precondition":"O banco de dados da nuvem ainda não está pronto. Tente de novo em alguns minutos."},ul=new Set(["unavailable","deadline-exceeded","auth/network-request-failed","auth/timeout"]),ll=new Set(["unauthenticated","auth/user-token-expired","auth/invalid-user-token","auth/requires-recent-login","auth/user-not-found"]),hl=new Set(["auth/popup-closed-by-user","auth/cancelled-popup-request","auth/user-cancelled"]);function Tl(n){const e=String((n==null?void 0:n.code)||"");return hl.has(e)?{tipo:"cancelado",texto:"Login cancelado."}:ul.has(e)||typeof navigator<"u"&&navigator.onLine===!1?{tipo:"offline",texto:"Sem conexão com a nuvem. Tento de novo sozinho."}:ll.has(e)?{tipo:"sessao",texto:"Entre de novo na sua conta para continuar sincronizando."}:Hr[e]?{tipo:"erro",texto:Hr[e]}:n!=null&&n.conflito?{tipo:"erro",texto:"A nuvem mudou várias vezes seguidas. Tento de novo daqui a pouco."}:{tipo:"erro",texto:`Não foi possível sincronizar${n!=null&&n.message?` (${String(n.message).slice(0,140)})`:""}.`}}function dl(){const n=typeof navigator<"u"?navigator.userAgent:"";return/Android/i.test(n)?"Android":/iPhone|iPad|iPod/i.test(n)?"iPhone":/Windows/i.test(n)?"Windows":/Mac OS X/i.test(n)?"Mac":/Linux/i.test(n)?"Linux":"outro aparelho"}function Wr(){const n=new Error("A nuvem mudou enquanto este aparelho enviava.");return n.conflito=!0,n}async function fl(n,e){if(!e)return new TextDecoder().decode(n);if(typeof DecompressionStream!="function")throw new Error("este navegador é antigo demais para ler os dados da nuvem");const t=new Blob([n]).stream().pipeThrough(new DecompressionStream("gzip"));return new Response(t).text()}function cn(n){return typeof n=="string"&&/^[A-Za-z0-9_.-]{1,200}$/.test(n)&&n!=="."&&n!==".."&&!/^__.*__$/.test(n)}function vl(n){ze();const e=sn(Oe,"usuarios",n),t=_=>sn(Oe,"usuarios",n,"partes",String(_)),r=_=>sn(Oe,"usuarios",n,"cupons",_);async function i(){const _=await on(e);if(!_.exists())return null;const y=_.data();return Number(y.versao)>0?{versao:Number(y.versao),partes:Number(y.partes)||0,gzip:y.gzip!==!1,formato:Number(y.formato)||1,fotos:Array.isArray(y.fotos)?y.fotos.filter(w=>typeof w=="string"):[],atualizadoEm:typeof y.atualizadoEm=="string"?y.atualizadoEm:null,aparelho:typeof y.aparelho=="string"?y.aparelho:""}:null}async function s(_){let y=_;for(let w=0;w<4;w+=1){if(y.formato>Br)throw new Error("os dados da nuvem são de uma versão mais nova do app; atualize a página");if(!(y.partes>0))throw new Error("dados da nuvem incompletos");const P=await Promise.all(Array.from({length:y.partes},(b,v)=>on(t(v))));if(P.every(b=>b.exists()&&Number(b.data().versao)===y.versao)){const b=P.map(x=>x.data().dados.toUint8Array()),v=new Uint8Array(b.reduce((x,ne)=>x+ne.length,0));let V=0;for(const x of b)v.set(x,V),V+=x.length;const U=await fl(v,y.gzip);return{versao:y.versao,dados:Ts(JSON.parse(U))}}y=await i()||y}throw Wr()}async function o(_,y){const w=new TextEncoder().encode(JSON.stringify(_)),P=!1,S=[];for(let b=0;b<w.length;b+=jr)S.push(w.slice(b,b+jr));return S.length||S.push(new Uint8Array(0)),$r(Oe,async b=>{const v=await b.get(e),V=v.exists()&&Number(v.data().versao)||0;if(V!==y)throw Wr();const U=V+1,x=v.exists()&&Number(v.data().partes)||0;S.forEach((fe,pe)=>b.set(t(pe),{versao:U,dados:j.fromUint8Array(fe)}));for(let fe=S.length;fe<x;fe+=1)b.delete(t(fe));const ne={versao:U,partes:S.length,gzip:P,formato:Br,atualizadoEm:new Date().toISOString(),aparelho:dl()};return v.exists()?b.update(e,ne):b.set(e,{...ne,fotos:[]}),U})}async function l(_,y){if(!cn(_))return!1;const w=new Uint8Array(await y.arrayBuffer());return!w.length||w.length>cl?!1:(await Zu(r(_),{tipo:y.type||"image/jpeg",dados:j.fromUint8Array(w),criadoEm:new Date().toISOString()}),await el(e,{fotos:tl(_)}),!0)}async function d(_){if(!cn(_))return null;const y=await on(r(_));if(!y.exists())return null;const w=y.data();return new Blob([w.dados.toUint8Array()],{type:w.tipo||"image/jpeg"})}async function g(_,y){let w=!0;for(let P=0;P<_.length;P+=zr){const S=_.slice(P,P+zr);await $r(Oe,async v=>{const V=await v.get(e);if(!V.exists()||Number(V.data().versao)!==y)return!1;for(const U of S)cn(U)&&v.delete(r(U));return v.update(e,{fotos:nl(...S)}),!0})||(w=!1)}return w}return{lerInfo:i,baixarDados:s,enviarDados:o,enviarFoto:l,baixarFoto:d,apagarFotos:g}}export{vl as criarAdaptador,wl as entrarComGoogle,Tl as mensagemDaNuvem,Il as observarUsuario,_l as prepararLogin,El as sairDaConta,yl as usuarioAtual};
