/* Metrônomo flutuante, disponível em todas as abas. Não precisa editar este arquivo. */
(function(){
const $=id=>document.getElementById(id);
const COMP={"2/4":[2,1],"3/4":[3,1],"4/4":[4,1],"6/8":[6,2],"5/4":[5,1],"7/8":[7,2]};
let bpm=80, comp="4/4", sub=1, acento=true, rodando=false, prox=0, batida=0, timer=null, toques=[];
try{const s=JSON.parse(localStorage.getItem("scalebox.metronomo")||"{}");if(s.bpm)bpm=s.bpm;if(s.comp&&COMP[s.comp])comp=s.comp;if(s.sub)sub=s.sub;if(s.acento===false)acento=false;}catch(e){}
const salvar=()=>{try{localStorage.setItem("scalebox.metronomo",JSON.stringify({bpm,comp,sub,acento}));}catch(e){}};
const NOMES=[[40,"Grave"],[60,"Largo"],[66,"Adagio"],[76,"Andante"],[108,"Moderato"],[120,"Allegro"],[168,"Presto"],[200,"Prestissimo"]];
const andamento=b=>{let n=NOMES[0][1];for(const [v,t] of NOMES)if(b>=v)n=t;return n;};

function montar(){
  const p=document.createElement("aside");
  p.id="metro";p.className="metro";p.hidden=true;p.setAttribute("aria-label","Metrônomo");
  p.innerHTML=`
    <div class="metro-cab"><span class="eyebrow">Metrônomo</span><button class="metro-x" id="mtFechar" aria-label="Fechar metrônomo">×</button></div>
    <div class="metro-bpm"><button class="metro-pm" id="mtMenos" aria-label="Diminuir">−</button>
      <div><output id="mtVal">${bpm}</output><small>BPM · <span id="mtNome">${andamento(bpm)}</span></small></div>
      <button class="metro-pm" id="mtMais" aria-label="Aumentar">+</button></div>
    <input type="range" id="mtSlider" min="30" max="240" value="${bpm}" aria-label="Andamento">
    <div class="metro-dots" id="mtDots"></div>
    <div class="metro-ops">
      <label>Compasso <select id="mtComp">${Object.keys(COMP).map(c=>`<option${c===comp?" selected":""}>${c}</option>`).join("")}</select></label>
      <label>Divisão <select id="mtSub"><option value="1">♩ semínimas</option><option value="2">♫ colcheias</option><option value="3">tercinas</option><option value="4">semicolcheias</option></select></label>
      <label class="chk"><input type="checkbox" id="mtAc"${acento?" checked":""}> Acentuar o 1º tempo</label>
    </div>
    <div class="metro-acoes"><button class="btn primario metro-play" id="mtPlay">▶ Iniciar</button><button class="btn" id="mtTap">Tap</button></div>`;
  document.body.appendChild(p);
  $("mtSub").value=String(sub);
  pontos();
  $("mtFechar").onclick=()=>{p.hidden=true;$("btnMetro").setAttribute("aria-expanded","false");};
  $("mtMenos").onclick=()=>muda(bpm-1); $("mtMais").onclick=()=>muda(bpm+1);
  $("mtSlider").oninput=e=>muda(+e.target.value);
  $("mtComp").onchange=e=>{comp=e.target.value;batida=0;pontos();salvar();};
  $("mtSub").onchange=e=>{sub=+e.target.value;salvar();};
  $("mtAc").onchange=e=>{acento=e.target.checked;salvar();};
  $("mtPlay").onclick=alternar;
  $("mtTap").onclick=tap;
  const b=$("btnMetro");
  if(b) b.onclick=()=>{p.hidden=!p.hidden;b.setAttribute("aria-expanded",String(!p.hidden));};
}
function pontos(){const [n]=COMP[comp];$("mtDots").innerHTML=Array.from({length:n},(_,i)=>`<i class="${i===0?"um":""}"></i>`).join("");}
function muda(v){bpm=Math.max(30,Math.min(240,Math.round(v)));$("mtVal").value=bpm;$("mtVal").textContent=bpm;$("mtSlider").value=bpm;$("mtNome").textContent=andamento(bpm);salvar();}
function tap(){const t=performance.now();toques=toques.filter(x=>t-x<2500);toques.push(t);
  if(toques.length>=2){const d=(toques[toques.length-1]-toques[0])/(toques.length-1);muda(60000/d);}}
function agendar(){
  const ctx=SOM.contexto(), [n,grupo]=COMP[comp];
  while(prox<ctx.currentTime+.12){
    const pulso=60/bpm/(grupo===2?2:1); // em 6/8 e 7/8 o clique é na colcheia
    const tempoEm=batida%(n*sub), forte=acento&&tempoEm===0, principal=tempoEm%sub===0;
    if(principal) SOM.clique(prox,forte); else SOM.clique(prox,false,true);
    if(principal){const idx=Math.floor(tempoEm/sub), quando=(prox-ctx.currentTime)*1000;
      setTimeout(()=>{const ds=document.querySelectorAll("#mtDots i");ds.forEach((d,i)=>d.classList.toggle("on",i===idx));$("btnMetro")&&$("btnMetro").classList.toggle("pulso",true);setTimeout(()=>$("btnMetro")&&$("btnMetro").classList.remove("pulso"),90);},Math.max(0,quando));}
    prox+=pulso/sub; batida++;
  }
}
function alternar(){
  rodando=!rodando;
  if(rodando){SOM.liberar&&SOM.liberar();const ctx=SOM.contexto();
    const comecar=()=>{if(!rodando||timer)return;batida=0;prox=ctx.currentTime+.1;timer=setInterval(agendar,25);agendar();};
    if(ctx.state==="running") comecar(); else { ctx.resume().then(comecar,comecar); setTimeout(comecar,300); }}
  else{clearInterval(timer);timer=null;document.querySelectorAll("#mtDots i").forEach(d=>d.classList.remove("on"));}
  $("mtPlay").textContent=rodando?"■ Parar":"▶ Iniciar";
  $("btnMetro")&&$("btnMetro").classList.toggle("ativo",rodando);
}
document.addEventListener("keydown",e=>{const p=$("metro");if(!p||p.hidden)return;if(/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;
  if(e.key===" "&&document.activeElement.closest&&document.activeElement.closest("#metro")===null){e.preventDefault();alternar();}});
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",montar); else montar();
})();
