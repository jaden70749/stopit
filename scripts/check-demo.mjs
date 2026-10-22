import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import * as demo from '../demo.js';
const htmSource = await (await fetch('https://esm.sh/htm@3.1.1/es2022/htm.mjs')).text();
const { default: htm } = await import('data:text/javascript;base64,' + Buffer.from(htmSource).toString('base64'));
const source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8').replace(/^import .*;\n/gm, '').replace(/createRoot\(document.getElementById[\s\S]*$/, '');
const slots = []; let cursor = 0, dirty = false, pending = [], tree, id = 0, buzz = 0, gps = 0;
const intervals = new Map();
const same = (a,b) => a && b && a.length === b.length && a.every((v,i)=>Object.is(v,b[i]));
const state = initial => { const i=cursor++; if(!slots[i]) slots[i]={v:typeof initial==='function'?initial():initial}; return [slots[i].v, v=>{const n=typeof v==='function'?v(slots[i].v):v;if(!Object.is(n,slots[i].v)){slots[i].v=n;dirty=true}}]; };
const effect = (fn,deps) => { const i=cursor++;const prev=slots[i];if(!prev||!same(prev.deps,deps)){slots[i]={deps,cleanup:prev?.cleanup};pending.push(()=>{slots[i].cleanup?.();slots[i].cleanup=fn()});} };
const callback = (fn,deps) => {const i=cursor++;if(!slots[i]||!same(slots[i].deps,deps))slots[i]={v:fn,deps};return slots[i].v;};
class Audio { constructor(){this.currentTime=0;this.destination={}} resume(){return Promise.resolve()} createOscillator(){return {frequency:{},connect(){return this},start(){},stop(){}}} createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){return this}}} }
const context = {...demo,URLSearchParams,console,
  React:{createElement:(type,props,...children)=>({type,props:props||{},children}),Fragment:'fragment'},htm,
  useState:state,useEffect:effect,useCallback:callback,useRef:v=>{const i=cursor++;return slots[i]||(slots[i]={current:v})},
  localStorage:{getItem:()=>null,setItem(){}},
  window:{HACHABELL_CONFIG:{},location:{search:'?demo=1'},AudioContext:Audio},
  navigator:{vibrate:()=>buzz++,geolocation:{getCurrentPosition:()=>gps++,watchPosition:()=>gps++,clearWatch(){}}},
  setTimeout:()=>++id,clearTimeout(){},setInterval:fn=>{intervals.set(++id,fn);return id},clearInterval:i=>intervals.delete(i)
};
vm.createContext(context);vm.runInContext(source+'\nthis.renderApp=App;',context);
function flush(){let n=0;do{if(++n>30)throw Error('render loop');dirty=false;cursor=0;pending=[];tree=context.renderApp();pending.forEach(f=>f());}while(dirty)}
function text(n){return n==null?'':Array.isArray(n)?n.map(text).join(''):typeof n==='object'?text(n.children):String(n)}
function find(n,p){if(!n||typeof n!=='object')return null;if(Array.isArray(n)){for(const v of n){const r=find(v,p);if(r)return r}return null}return p(n)?n:find(n.children,p)}
function click(label){const b=find(tree,n=>n.type==='button'&&text(n).includes(label));assert.ok(b,label);b.props.onClick();flush()}
flush();await Promise.resolve();flush();assert.equal(gps,0);assert.ok(text(tree).includes('모의 GPS'));
click('경계 밖');assert.equal(buzz,0);assert.ok(text(tree).includes('420m'));
click('경계 안');assert.equal(buzz,1);assert.ok(text(tree).includes('하차 준비를 해주세요!'));
click('이동 재생');for(let i=0;i<8;i++){[...intervals.values()].forEach(f=>f());flush()}assert.equal(buzz,1);
click('처음으로');assert.ok(!text(tree).includes('하차 준비를 해주세요!'));assert.equal(intervals.size,0);
click('이동 재생');[...intervals.values()].forEach(f=>f());flush();click('일시정지');assert.equal(intervals.size,0);
click('이동 재생');for(let i=0;i<90;i++){[...intervals.values()].forEach(f=>f());flush()}assert.equal(buzz,2);assert.equal(intervals.size,0);
click('다시 재생');assert.equal(buzz,2);assert.ok(!text(tree).includes('하차 준비를 해주세요!'));
click('실제 GPS로 돌아가기');assert.equal(intervals.size,0);assert.equal(gps,1);
console.log('PASS: demo without GPS, 420m no alert, 380m alert, one-shot alert, pause, reset, complete replay, live GPS restore');
