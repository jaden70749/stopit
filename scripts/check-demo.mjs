import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createReplay,replayPosition} from '../demo.js';
const live=await(await fetch('https://hachabell-stopit.vercel.app/api/transit?start_x=127.11119217&start_y=37.39477123&end_x=127.12628814&end_y=37.41993056')).json();
const route=live.routes.find(r=>r.properties.type==='BUS');
const replay=createReplay(route);assert.ok(replay?.segments.length>0);
assert.deepEqual(replayPosition(replay,1),{lat:replay.target.lat,lng:replay.target.lng});
assert.equal(createReplay({steps:[]}),null);
const htmSource=await(await fetch('https://esm.sh/htm@3.1.1/es2022/htm.mjs')).text();
const {default:htm}=await import('data:text/javascript;base64,'+Buffer.from(htmSource).toString('base64'));
const source=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replace(/createRoot\(document.getElementById[\s\S]*$/,'');
const slots=[];let cursor=0,dirty=false,pending=[],tree,id=0,buzz=0,gps=0,watch=0,now=0;
const intervals=new Map(),timeouts=new Map();
const same=(a,b)=>a&&b&&a.length===b.length&&a.every((v,i)=>Object.is(v,b[i]));
const state=initial=>{const i=cursor++;if(!slots[i])slots[i]={v:typeof initial==='function'?initial():initial};return[slots[i].v,v=>{const n=typeof v==='function'?v(slots[i].v):v;if(!Object.is(n,slots[i].v)){slots[i].v=n;dirty=true}}]};
const effect=(fn,deps)=>{const i=cursor++;const prev=slots[i];if(!prev||!same(prev.deps,deps)){slots[i]={deps,cleanup:prev?.cleanup};pending.push(()=>{slots[i].cleanup?.();slots[i].cleanup=fn()})}};
const callback=(fn,deps)=>{const i=cursor++;if(!slots[i]||!same(slots[i].deps,deps))slots[i]={v:fn,deps};return slots[i].v};
class Audio{constructor(){this.currentTime=0;this.destination={}}resume(){return Promise.resolve()}createOscillator(){return{frequency:{},connect(){return this},start(){},stop(){}}}createGain(){return{gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){return this}}}}
const context={createReplay,replayPosition,URLSearchParams,AbortController,console,performance:{now:()=>now},
 React:{createElement:(type,props,...children)=>({type,props:props||{},children}),Fragment:'fragment'},htm,useState:state,useEffect:effect,useCallback:callback,useRef:v=>{const i=cursor++;return slots[i]||(slots[i]={current:v})},
 localStorage:{getItem:()=>null,setItem(){}},window:{HACHABELL_CONFIG:{},location:{search:'?demo=1'},AudioContext:Audio},
 navigator:{vibrate:()=>buzz++,geolocation:{getCurrentPosition:cb=>{gps++;cb({coords:{latitude:37.39477,longitude:127.11119,accuracy:10}})},watchPosition:()=>watch++,clearWatch(){}}},
 fetch:async()=>({ok:true,headers:{get:()=> 'application/json'},json:async()=>({routes:[route]})}),
 setTimeout:fn=>{timeouts.set(++id,fn);return id},clearTimeout:i=>timeouts.delete(i),setInterval:fn=>{intervals.set(++id,fn);return id},clearInterval:i=>intervals.delete(i)};
vm.createContext(context);vm.runInContext(source+'\nthis.renderApp=App;',context);
function flush(){let n=0;do{if(++n>30)throw Error('render loop');dirty=false;cursor=0;pending=[];tree=context.renderApp();pending.forEach(f=>f())}while(dirty)}
function text(n){return n==null?'':Array.isArray(n)?n.map(text).join(''):typeof n==='object'?text(n.children):String(n)}
function find(n,p){if(!n||typeof n!=='object')return null;if(Array.isArray(n)){for(const v of n){const r=find(v,p);if(r)return r}return null}return p(n)?n:find(n.children,p)}
async function click(label){const b=find(tree,n=>n.type==='button'&&text(n).includes(label));assert.ok(b,label);await b.props.onClick();flush()}
flush();await Promise.resolve();flush();assert.equal(gps,1);assert.ok(!text(tree).includes('SIMULATION'));
const input=find(tree,n=>n.type==='input'&&n.props.id==='destination-search');assert.ok(!input.props.disabled);input.props.onInput({target:{value:'서울시청'}});flush();
for(const f of [...timeouts.values()])await f();flush();await click('서울시청');
const options=find(tree,n=>typeof n.type==='function'&&n.type.name==='TransitOptions');assert.ok(options);await options.props.onSearch();flush();
await click('이 목적지 하차 알림 설정');await click('하차 알림 시작');assert.equal(watch,0);assert.equal(intervals.size,1);
for(let i=0;i<46;i++){now+=1000;[...intervals.values()].forEach(f=>f());flush()}
assert.equal(buzz,1);assert.equal(intervals.size,0);assert.ok(text(tree).includes('남은 거리 0m'));assert.ok(text(tree).includes('하차 준비'));
await click('하차 알림 끄기');await click('하차 알림 시작');assert.equal(intervals.size,1);assert.equal(buzz,1);
await click('하차 알림 끄기');assert.equal(intervals.size,0);
console.log('PASS: original UI, destination search, real route selection, path GPS playback, one alert at alighting stop, stop/restart');
