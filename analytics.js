import {goatcounterCode} from './analytics-config.js';
const enabled=/^[a-z0-9][a-z0-9-]*$/i.test(goatcounterCode)&&!['localhost','127.0.0.1',''].includes(location.hostname);
const pending=[];
let ready=false;
export function trackEvent(name,title){
 if(!enabled)return;
 const event={path:'shuffleboard-'+name,title,event:true};
 try{if(ready&&typeof window.goatcounter?.count==='function')window.goatcounter.count(event);else if(pending.length<30)pending.push(event)}catch{/* Analytics must never interrupt a game. */}
}
if(enabled){
 window.goatcounter={};
 const script=document.createElement('script');script.async=true;script.src='https://gc.zgo.at/count.js';script.dataset.goatcounter='https://'+goatcounterCode+'.goatcounter.com/count';
 script.onload=()=>{ready=true;for(const event of pending.splice(0)){try{window.goatcounter?.count?.(event)}catch{}}};
 script.onerror=()=>{pending.length=0};document.head.appendChild(script);
}
