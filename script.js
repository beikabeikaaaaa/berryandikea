// script.js
// Images are in the REPO ROOT (no assets/ folder)
const LOCK_IMG_SRC = "./berryikea_lock.jpg";
const HOME_IMG_SRC = "./berryikea_home.jpg";

// Pick the nodes we need
const screenEl = document.getElementById("screen");
const lockLayer = document.getElementById("lockLayer");
const homeLayer = document.getElementById("homeLayer");
const lockImg = document.getElementById("lockImg");
const homeImg = document.getElementById("homeImg");
const knob = document.getElementById("knob");
const slideHint = document.getElementById("slideHint");
const fx = document.getElementById("fx");
const s1 = document.querySelector(".s1");
const s2 = document.querySelector(".s2");

// Add a cache-buster to avoid stale images on Pages
lockImg.src = LOCK_IMG_SRC + "?v=" + Date.now();
homeImg.src = HOME_IMG_SRC + "?v=" + Date.now();

// Lock screen clock
const tNow = document.getElementById("timeNow");
const dNow = document.getElementById("dateNow");
function refreshClock(){
  const d = new Date();
  tNow.textContent = d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  dNow.textContent = d.toLocaleDateString([], {weekday:'short', month:'short', day:'2-digit'});
}
refreshClock(); setInterval(refreshClock, 1000);

// Drag-to-unlock
let dragging=false,startX=0,knobX=0;
const knobMin=4;
const trackWidth = () => lockLayer.querySelector(".slider").clientWidth;
const knobMax = () => trackWidth() - knob.clientWidth - 4;
const unlockThreshold = () => trackWidth()*0.72;

knob.addEventListener("pointerdown",(e)=>{
  dragging=true;
  startX=e.clientX ?? e.touches?.[0]?.clientX;
  knob.setPointerCapture?.(e.pointerId);
  ripple(e);
});
window.addEventListener("pointermove",(e)=>{
  if(!dragging) return;
  const x=e.clientX ?? e.touches?.[0]?.clientX;
  const dx=x-startX;
  knobX=Math.max(knobMin,Math.min(knobMax(),knobMin+dx));
  knob.style.left=knobX+'px';
  slideHint.style.opacity=Math.max(0,1-knobX/unlockThreshold());
});
window.addEventListener("pointerup",()=>{
  if(!dragging) return; dragging=false;
  if(knobX>=unlockThreshold()) doUnlock();
  else {knobX=knobMin; knob.style.left=knobX+'px'; slideHint.style.opacity=1;}
});
window.addEventListener("keydown",(e)=>{
  if(e.code==='Space' && !homeLayer.classList.contains('active')) doUnlock();
});
function doUnlock(){
  homeLayer.classList.add("active");
  s1.style.color="#8b7f73";
  s2.style.color="#5a5046";
  lockLayer.style.opacity=0;
  confettiHearts(); setTimeout(()=>confettiPaws(),250);
}

// Click effects after unlock
screenEl.addEventListener("pointerdown",(e)=>{
  ripple(e);
  if(homeLayer.classList.contains("active")){
    for(let i=0;i<3;i++){
      setTimeout(()=>spawnPaw(e), i*80);
    }
  }
});
function ripple(e){
  const rect=screenEl.getBoundingClientRect();
  const x=(e.clientX ?? e.touches?.[0]?.clientX)-rect.left;
  const y=(e.clientY ?? e.touches?.[0]?.clientY)-rect.top;
  rippleAt(x,y);
}
function rippleAt(x,y){
  const r=document.createElement("span");
  r.className="ripple";
  r.style.left=`${x}px`; r.style.top=`${y}px`;
  fx.appendChild(r);
  r.addEventListener("animationend",()=>r.remove());
}
function spawnPaw(e){
  const rect=screenEl.getBoundingClientRect();
  const x=(e.clientX ?? e.touches?.[0]?.clientX)-rect.left + (Math.random()*20-10);
  const y=(e.clientY ?? e.touches?.[0]?.clientY)-rect.top + (Math.random()*10-5);
  const p=document.createElement("span");
  p.className="paw"; p.textContent="🐾";
  p.style.left=`${x}px`; p.style.top=`${y}px`;
  p.style.fontSize=(28+Math.random()*14)+'px';
  fx.appendChild(p);
  p.addEventListener("animationend",()=>p.remove());
}

// Simple confetti
function confettiHearts(){
  for(let i=0;i<12;i++){
    setTimeout(()=>{
      const span=document.createElement("span");
      span.textContent="❤️"; span.style.position="absolute";
      span.style.left=(Math.random()*0.6+0.2) * screenEl.clientWidth + 'px';
      span.style.top=(screenEl.clientHeight*0.7 + Math.random()*30) + 'px';
      span.style.fontSize=(16+Math.random()*12)+'px';
      span.style.transform='translate(-50%,-50%)';
      span.style.animation='heartUp 1200ms ease-out forwards';
      fx.appendChild(span);
      span.addEventListener('animationend',()=>span.remove());
    }, i*60);
  }
}
function confettiPaws(){
  for(let i=0;i<10;i++){
    setTimeout(()=>{
      const span=document.createElement("span");
      span.textContent="🐾"; span.style.position="absolute";
      span.style.left=(Math.random()*0.8+0.1) * screenEl.clientWidth + 'px';
      span.style.top=(screenEl.clientHeight*0.75 + Math.random()*20) + 'px';
      span.style.fontSize=(18+Math.random()*10)+'px';
      span.style.transform='translate(-50%,-50%)';
      span.style.animation='heartUp 1200ms ease-out forwards';
      fx.appendChild(span);
      span.addEventListener('animationend',()=>span.remove());
    }, i*70);
  }
}
const style=document.createElement('style');
style.textContent=`@keyframes heartUp{
  0%{opacity:.95; transform:translate(-50%,-50%) scale(.9)}
  70%{transform:translate(-50%,-120%) scale(1.15)}
  100%{opacity:0; transform:translate(-50%,-180%) scale(1)}
}`;
document.head.appendChild(style);
