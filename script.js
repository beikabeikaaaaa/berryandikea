// ===== Auto-fallback image paths: works with or without assets/ =====
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
const bgPaws = document.getElementById("bgPaws");

// 
function setWithFallback(imgEl, candidates) {
  let i = 0;
  function tryNext() {
    if (i >= candidates.length) return; 
    const url = candidates[i] + (candidates[i].includes("?") ? "" : `?v=${Date.now()}`); 
    imgEl.onerror = () => { i++; tryNext(); };
    imgEl.src = url;
  }
  tryNext();
}

// 
setWithFallback(lockImg, [
  "assets/berryikea_lock.jpg",
  "assets/berryikea_lock.JPG",
  "berryikea_lock.jpg",
  "berryikea_lock.JPG"
]);
setWithFallback(homeImg, [
  "assets/berryikea_home.jpg",
  "assets/berryikea_home.JPG",
  "berryikea_home.jpg",
  "berryikea_home.JPG"
]);

// 
const tNow = document.getElementById("timeNow");
const dNow = document.getElementById("dateNow");
function refreshClock(){
  const d = new Date();
  if (tNow) tNow.textContent = d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  if (dNow) dNow.textContent = d.toLocaleDateString([], {weekday:'short', month:'short', day:'2-digit'});
}
refreshClock(); setInterval(refreshClock, 1000);

let dragging = false, startX = 0, knobX = 0;
const knobMin = 4;
const trackWidth = () => lockLayer.querySelector(".slider").clientWidth;
const knobMax = () => trackWidth() - knob.clientWidth - 4;
const unlockThreshold = () => trackWidth() * 0.72;

knob.addEventListener("pointerdown", (e) => {
  dragging = true;
  startX = e.clientX ?? e.touches?.[0]?.clientX;
  knob.setPointerCapture?.(e.pointerId);
  ripple(e);
});
window.addEventListener("pointermove", (e) => {
  if(!dragging) return;
  const x = e.clientX ?? e.touches?.[0]?.clientX;
  const dx = x - startX;
  knobX = Math.max(knobMin, Math.min(knobMax(), knobMin + dx));
  knob.style.left = knobX + "px";
  slideHint.style.opacity = Math.max(0, 1 - knobX / unlockThreshold());
});
window.addEventListener("pointerup", () => {
  if(!dragging) return;
  dragging = false;
  if (knobX >= unlockThreshold()){
    doUnlock();
  } else {
    knobX = knobMin; knob.style.left = knobX + "px"; slideHint.style.opacity = 1;
  }
});
window.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !homeLayer.classList.contains("active")) doUnlock();
});

function doUnlock(){
  homeLayer.classList.add("active");
  s1.style.color = "#8b7f73";
  s2.style.color = "#5a5046";
  lockLayer.style.opacity = 0;
  confettiHearts(); setTimeout(()=>confettiPaws(), 250);
}

screenEl.addEventListener("pointerdown", (e) => {
  ripple(e);
  if(homeLayer.classList.contains("active")){
    for(let i=0;i<3;i++) setTimeout(()=>spawnPaw(e, i), i*80);
  }
});

// ---- effects ----
function ripple(e){
  const rect = screenEl.getBoundingClientRect();
  const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
  const y = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;
  rippleAt(x, y);
}
function rippleAt(x, y){
  const r = document.createElement("span");
  r.className = "ripple";
  r.style.left = `${x}px`; r.style.top = `${y}px`;
  fx.appendChild(r);
  r.addEventListener("animationend", ()=> r.remove());
}
function spawnPaw(e){
  const rect = screenEl.getBoundingClientRect();
  const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left + (Math.random()*20-10);
  const y = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top + (Math.random()*10-5);
  const p = document.createElement("span");
  p.className = "paw"; p.textContent = "🐾";
  p.style.left = `${x}px`; p.style.top = `${y}px`;
  p.style.fontSize = (28 + Math.random()*14) + "px";
  fx.appendChild(p);
  p.addEventListener("animationend", ()=> p.remove());
}
function confettiHearts(){
  for(let i=0;i<12;i++){
    setTimeout(()=>{
      const span = document.createElement("span");
      span.textContent = "❤️"; span.style.position = "absolute";
      span.style.left = (Math.random()*0.6 + 0.2) * screenEl.clientWidth + "px";
      span.style.top = (screenEl.clientHeight*0.7 + Math.random()*30) + "px";
      span.style.fontSize = (16 + Math.random()*12) + "px";
      span.style.transform = "translate(-50%,-50%)";
      span.style.animation = "heartUp 1200ms ease-out forwards";
      fx.appendChild(span);
      span.addEventListener("animationend", ()=> span.remove());
    }, i*60);
  }
}
function confettiPaws(){
  for(let i=0;i<10;i++){
    setTimeout(()=>{
      const span = document.createElement("span");
      span.textContent = "🐾"; span.style.position = "absolute";
      span.style.left = (Math.random()*0.8 + 0.1) * screenEl.clientWidth + "px";
      span.style.top = (screenEl.clientHeight*0.75 + Math.random()*20) + "px";
      span.style.fontSize = (18 + Math.random()*10) + "px";
      span.style.transform = "translate(-50%,-50%)";
      span.style.animation = "heartUp 1200ms ease-out forwards";
      fx.appendChild(span);
      span.addEventListener("animationend", ()=> span.remove());
    }, i*70);
  }
}
const style = document.createElement('style');
style.textContent = `@keyframes heartUp{
  0%{opacity:.95; transform:translate(-50%,-50%) scale(.9)}
  70%{transform:translate(-50%,-120%) scale(1.15)}
  100%{opacity:0; transform:translate(-50%,-180%) scale(1)}
}`;
document.head.appendChild(style);
