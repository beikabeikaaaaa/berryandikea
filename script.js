// Images in repo ROOT
const LOCK_IMG_SRC = "./ikeaberry.png";
const HOME_IMG_SRC = "./back.png";

// Elements
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
const homebar = document.getElementById("homebar");
const lockBackBtn = document.getElementById("lockBackBtn");

// Camera
const camBtn = document.getElementById("camBtn");
const camOverlay = document.getElementById("camera");
const videoEl = document.getElementById("video");
const shutterBtn = document.getElementById("shutter");
const closeCamBtn = document.getElementById("closeCam");
const shotCanvas = document.getElementById("shot");
let mediaStream = null;

// Load images (cache-busting)
lockImg.src = LOCK_IMG_SRC + "?v=" + Date.now();
homeImg.src = HOME_IMG_SRC + "?v=" + Date.now();

// Lock clock (iOS18 big)
const tNow = document.getElementById("timeNow");
const dNow = document.getElementById("dateNow");
function refreshClock(){
  const d = new Date();
  tNow.textContent = d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  dNow.textContent = d.toLocaleDateString([], {weekday:'short', month:'short', day:'2-digit'});
}
refreshClock(); setInterval(refreshClock, 1000);

// ---- Unlock via knob (still works) ----
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

// ---- Full-screen edge swipe to unlock (mobile friendly) ----
let swipeActive=false, swipeStartX=0, swipeStartY=0;
const SWIPE_EDGE = 0.25;     // must start within left 25% of screen
const SWIPE_DISTANCE = 0.5;  // need to move over 50% width
const SWIPE_SLOP = 70;       // ignore if vertical move too large

lockLayer.addEventListener("pointerdown",(e)=>{
  const rect = lockLayer.getBoundingClientRect();
  const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
  const y = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;
  if(x <= rect.width * SWIPE_EDGE){ swipeActive = true; swipeStartX = x; swipeStartY = y; }
});
lockLayer.addEventListener("pointermove",(e)=>{
  if(!swipeActive) return;
  const rect = lockLayer.getBoundingClientRect();
  const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
  const y = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;
  if(Math.abs(y - swipeStartY) > SWIPE_SLOP){ swipeActive=false; return; }
  const progress = Math.max(0, Math.min(1, (x - swipeStartX) / (rect.width * SWIPE_DISTANCE)));
  const kx = knobMin + (knobMax()-knobMin) * progress;
  knob.style.left = kx + 'px';
  slideHint.style.opacity = Math.max(0, 1 - progress);
});
lockLayer.addEventListener("pointerup",(e)=>{
  if(!swipeActive) return; swipeActive=false;
  const rect = lockLayer.getBoundingClientRect();
  const endX = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
  const dist = endX - swipeStartX;
  if(dist >= rect.width * SWIPE_DISTANCE) doUnlock();
  else { knob.style.left = knobMin + 'px'; slideHint.style.opacity = 1; }
});

// ---- Keyboard shortcuts ----
window.addEventListener("keydown",(e)=>{
  if(e.code==='Space' && !homeLayer.classList.contains('active')) doUnlock();
  if(e.code==='KeyL') reLock(); // return to lock
});

// Long-press homebar to relock (mobile)
let holdTimer=null;
homebar.addEventListener("pointerdown", ()=>{
  if(!homeLayer.classList.contains('active')) return;
  holdTimer = setTimeout(()=> reLock(), 600);
});
homebar.addEventListener("pointerup", ()=> clearTimeout(holdTimer));
homebar.addEventListener("pointerleave", ()=> clearTimeout(holdTimer));

// Button to relock
lockBackBtn.addEventListener("click", reLock);

// ---- State ----
function doUnlock(){
  homeLayer.classList.add("active");
  s1.style.color="#7b6f64";
  s2.style.color="#2b2018";
  lockLayer.style.opacity=0;
  confettiHearts(); setTimeout(()=>confettiPaws(),250);
}
function reLock(){
  homeLayer.classList.remove("active");
  lockLayer.style.opacity=1;
  knobX = knobMin; knob.style.left = knobX + 'px';
  slideHint.style.opacity = 1;
}

// ---- Camera: lock screen quick capture ----
camBtn.addEventListener("click", async ()=>{
  try{
    mediaStream = await navigator.mediaDevices.getUserMedia({video:true, audio:false});
    videoEl.srcObject = mediaStream;
    camOverlay.classList.add("active");
  }catch(err){
    alert("Camera permission denied or unavailable.");
  }
});
closeCamBtn.addEventListener("click", ()=>{
  if(mediaStream){
    mediaStream.getTracks().forEach(t=>t.stop());
    mediaStream = null;
  }
  camOverlay.classList.remove("active");
  shotCanvas.style.display = "none";
  videoEl.style.display = "block";
});
shutterBtn.addEventListener("click", ()=>{
  if(!mediaStream) return;
  const ctx = shotCanvas.getContext("2d");
  const vw = videoEl.videoWidth, vh = videoEl.videoHeight;
  shotCanvas.width = vw; shotCanvas.height = vh;
  ctx.drawImage(videoEl, 0, 0, vw, vh);
  // show snapshot
  videoEl.style.display = "none";
  shotCanvas.style.display = "block";
  setTimeout(()=>{ // return to live preview
    shotCanvas.style.display = "none";
    videoEl.style.display = "block";
  }, 1000);
});

// ---- Effects ----
screenEl.addEventListener("pointerdown",(e)=>{
  ripple(e);
  if(homeLayer.classList.contains("active")){
    for(let i=0;i<3;i++) setTimeout(()=>spawnPaw(e), i*80);
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
