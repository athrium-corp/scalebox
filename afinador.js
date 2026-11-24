/* Aba "Afinador": afina pelo microfone, em qualquer afinação do site. Não precisa editar este arquivo.
   Desempenho: filtros antes da análise, busca só na faixa de notas do instrumento, buffers reaproveitados
   e a tela é atualizada só no que muda (sem redesenhar o afinador a cada leitura). */
(function(){
const B=window.BRACO, $=id=>document.getElementById(id);
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const T=s=>window.t?window.t(s):s;
const NOMES=["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"];
let API=null, mic=null, raf=0, alvoFixo=null, ultimo=0, la=440, wake=null;
let hist=[], suave=null, ultimoSinal=0, rmsAnt=0, pularAtaque=0, okDesde=0;
const afinadas=new Set();

const freqDe=m=>la*Math.pow(2,(m-69)/12);
const nomeMidi=m=>NOMES[((m%12)+12)%12];
const oitava=m=>Math.floor(m/12)-1;
function solf(n){if(!API||API.rotulo()!=="solf")return n;return n.replace(/[A-G](?:#|b(?![a-z]))?/g,x=>B.SOLF["CDEFGAB".indexOf(x[0])]+x.slice(1));}
const ins=()=>B.INSTRUMENTOS[$("afInstr").value]||B.INSTRUMENTOS.violao;

/* ---------- detecção (YIN) com buffers reaproveitados ---------- */
let dec=null, dif=null, cmn=null;
function detectar(buf0,sr0,fMin,fMax){
  const n=buf0.length>>1, sr=sr0/2;
  if(!dec||dec.length!==n) dec=new Float32Array(n);
  let rms=0;
  for(let i=0;i<n;i++){const v=(buf0[2*i]+buf0[2*i+1])*.5;dec[i]=v;rms+=v*v;}
  rms=Math.sqrt(rms/n);
  if(rms<0.006) return {f:null,rms};
  const minP=Math.max(2,Math.floor(sr/(fMax||1400))), maxP=Math.min(Math.ceil(sr/(fMin||27)), (n>>1)+(n>>2));
  const w=n-maxP; if(w<64) return {f:null,rms};
  if(!dif||dif.length<maxP+2){dif=new Float32Array(maxP+2);cmn=new Float32Array(maxP+2);}
  for(let tau=1;tau<=maxP;tau++){
    if(tau<minP-1){continue;}
    let s=0; for(let i=0;i<w;i++){const x=dec[i]-dec[i+tau];s+=x*x;} dif[tau]=s;
  }
  let soma=0; const ini=Math.max(1,minP-1); cmn[ini]=1;
  for(let tau=ini+1;tau<=maxP;tau++){soma+=dif[tau];cmn[tau]=dif[tau]*(tau-ini)/(soma||1);}
  let tau=-1;
  for(let k=ini+2;k<maxP;k++){ if(cmn[k]<0.15){ while(k+1<maxP&&cmn[k+1]<cmn[k]) k++; tau=k; break; } }
  if(tau<0){ let mi=1e9; for(let k=ini+2;k<maxP;k++) if(cmn[k]<mi){mi=cmn[k];tau=k;} if(mi>0.3) return {f:null,rms}; }
  const a=cmn[tau-1], b=cmn[tau], c=cmn[tau+1], den=a-2*b+c, desl=den?(a-c)/(2*den):0;
  return {f:sr/(tau+desl),rms,conf:1-b};
}

/* ---------- tela ---------- */
function render(){
  const out=$("afOut"); if(!out) return;
  const I=ins(), cordas=I.midi.map((m,i)=>({m,i,num:I.midi.length-i}));
  out.innerHTML=`<article class="card af-card${mic?" ligado":""}" id="afCard">
    <div class="af-head">
      <div class="seg af-modo" role="group" aria-label="Modo"><button data-modo="auto" aria-pressed="${alvoFixo==null}">Automático</button><button data-modo="fixo" aria-pressed="${alvoFixo!=null}">Corda escolhida</button></div>
      <span class="af-cont" id="afCont">${afinadas.size}/${I.midi.length} ${E(T("afinadas"))}</span>
    </div>
    <div class="af-palco">
      ${mic?"":`<button class="af-comecar" id="afComecar"><span class="af-mic" aria-hidden="true"><svg viewBox="0 0 24 24" width="34" height="34"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span><b>Começar a afinar</b><small>Toque para ligar o microfone</small></button>`}
      <div class="af-visor" id="afVisor" data-sem-traducao aria-live="polite">
        <span class="af-seta esq" aria-hidden="true">◀</span>
        <div class="af-anel"><b id="afNota">${mic?"·":"—"}</b><small id="afOit"></small></div>
        <span class="af-seta dir" aria-hidden="true">▶</span>
      </div>
      <div class="af-barra" aria-hidden="true"><div class="af-zona"></div>${[-50,-25,0,25,50].map(c=>`<i style="left:${50+c}%"><em>${c>0?"+"+c:c}</em></i>`).join("")}<div class="af-marca" id="afMarca"></div></div>
      <div class="af-leitura" data-sem-traducao><span id="afCents">— cents</span><span id="afHz">— Hz</span></div>
      <p class="af-dica" id="afDica" data-sem-traducao>${E(T(mic?"Toque uma corda solta":"Ligue o microfone e toque uma corda solta"))}</p>
    </div>
    <div class="af-cordas" id="afCordas">${cordas.map(c=>`<button class="af-corda${afinadas.has(c.i)?" feita":""}${alvoFixo===c.m?" on":""}" data-i="${c.i}" data-m="${c.m}" aria-label="${c.num}ª ${nomeMidi(c.m)}"><small>${c.num}ª</small><b>${E(solf(nomeMidi(c.m)))}</b><span>${freqDe(c.m).toFixed(1)} Hz</span><i class="af-ok" aria-hidden="true">✓</i></button>`).join("")}</div>
    <div class="af-acoes">${mic?`<button class="btn" id="afLiga">■ Desligar microfone</button>`:""}<button class="link" id="afZera">Recomeçar a contagem</button></div>
    <p class="aviso" id="afErro" hidden></p>
  </article>
  <section class="card"><span class="eyebrow">Dicas</span><ul class="af-dicas">
    <li>Afine num lugar silencioso, com o celular perto do instrumento.</li>
    <li>Toque uma corda por vez e deixe soar. Quando o círculo fica verde, a corda está afinada.</li>
    <li>Se a nota estiver abaixo, aperte a tarraxa (a corda sobe). Se estiver acima, afrouxe um pouco e suba de novo até o ponto, que assim a corda segura melhor a afinação.</li>
    <li>Para trocar de afinação (Drop D, meio tom abaixo, DADGAD…), escolha acima. As outras abas do site usam a mesma lista.</li>
  </ul></section>`;
  if($("afComecar")) $("afComecar").onclick=ligar;
  if($("afLiga")) $("afLiga").onclick=desligar;
  $("afZera").onclick=()=>{afinadas.clear();render();};
  out.querySelectorAll("[data-modo]").forEach(b=>b.onclick=()=>{if(b.dataset.modo==="auto"){alvoFixo=null;}else if(alvoFixo==null){alvoFixo=ins().midi[0];}render();});
  out.querySelectorAll(".af-corda").forEach(b=>b.onclick=()=>{
    const m=+b.dataset.m; alvoFixo=m; hist=[]; suave=null;
    if(window.SOM){SOM.liberar&&SOM.liberar();SOM.nota(m,SOM.agora()+.02,{vel:.9});}
    render();
  });
}
let ultimoEstado="";
function mostrar(nota,oit,cents,hz,estado,dica,alvo){
  const v=$("afVisor"); if(!v) return;
  if(estado!==ultimoEstado){v.className="af-visor "+estado;$("afCard").classList.toggle("certo",estado==="ok");ultimoEstado=estado;}
  $("afNota").textContent=nota; $("afOit").textContent=oit;
  $("afMarca").style.left=`${50+Math.max(-50,Math.min(50,cents==null?0:cents))}%`;
  $("afCents").textContent=cents==null?"— cents":`${cents>0?"+":""}${Math.round(cents)} cents`;
  $("afHz").textContent=hz?`${hz.toFixed(1)} Hz`:"— Hz";
  $("afDica").textContent=dica;
  $("afDica").className="af-dica "+estado;
  document.querySelectorAll(".af-corda").forEach(b=>b.classList.toggle("alvo",+b.dataset.m===alvo));
}

/* ---------- microfone ---------- */
async function ligar(){
  const erro=$("afErro");
  try{
    if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia) throw new Error("sem-suporte");
    try{ if(navigator.audioSession) navigator.audioSession.type="play-and-record"; }catch(e){}
    const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
    const ctx=SOM.contexto(); if(ctx.state!=="running") await ctx.resume().catch(()=>{});
    const I=ins(), fMin=freqDe(Math.min(...I.midi))*0.75;
    const src=ctx.createMediaStreamSource(stream);
    const hp=ctx.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=Math.max(20,fMin*0.6); hp.Q.value=.7;
    const lp=ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=1600; lp.Q.value=.7;
    const an=ctx.createAnalyser(); an.fftSize=4096; an.smoothingTimeConstant=0;
    src.connect(hp); hp.connect(lp); lp.connect(an);
    mic={stream,src,hp,lp,an,buf:new Float32Array(an.fftSize),ctx}; hist=[]; suave=null; ultimoEstado="";
    try{ if(navigator.wakeLock) wake=await navigator.wakeLock.request("screen"); }catch(e){}
    render(); laco();
  }catch(e){
    try{ if(navigator.audioSession) navigator.audioSession.type="playback"; }catch(x){}
    if(erro){erro.hidden=false;erro.textContent=e&&e.name==="NotAllowedError"?"O navegador não deixou usar o microfone. Libere o acesso ao microfone para este site nas configurações do navegador e tente de novo.":
      e&&e.message==="sem-suporte"?"Este navegador não tem acesso ao microfone. Tente no Chrome ou no Safari atualizados.":"Não foi possível ligar o microfone.";}
  }
}
function desligar(){
  if(!mic) return; cancelAnimationFrame(raf);
  try{mic.src.disconnect();mic.hp.disconnect();mic.lp.disconnect();}catch(e){} mic.stream.getTracks().forEach(t=>t.stop()); mic=null;
  try{ if(wake){wake.release();wake=null;} }catch(e){}
  try{ if(navigator.audioSession) navigator.audioSession.type="playback"; }catch(e){}
  if($("afOut")) render();
}
function laco(){
  raf=requestAnimationFrame(laco);
  const agora=performance.now(); if(agora-ultimo<33) return; ultimo=agora; // ~30 leituras por segundo
  const I=ins();
  const lo=Math.min(...I.midi), hi=Math.max(...I.midi);
  const fMin=freqDe(alvoFixo!=null?alvoFixo-5:lo-5), fMax=freqDe(alvoFixo!=null?alvoFixo+5:hi+7);
  mic.an.getFloatTimeDomainData(mic.buf);
  const r=detectar(mic.buf,mic.ctx.sampleRate,fMin,fMax);
  // ataque da palheta: ignora as primeiras leituras depois de um golpe forte
  if(r.rms>rmsAnt*2.2&&r.rms>0.02) pularAtaque=2; rmsAnt=r.rms*.6+rmsAnt*.4;
  if(pularAtaque>0){pularAtaque--;return;}
  if(!r.f){
    if(agora-ultimoSinal>1500&&ultimoEstado!=="vazio"){hist=[];suave=null;mostrar("·","",null,null,"vazio",T("Toque uma corda solta"),null);}
    else if(agora-ultimoSinal>350&&ultimoEstado!=="vazio") $("afVisor").classList.add("parado");
    return;
  }
  let midiF=69+12*Math.log2(r.f/la);
  // corda alvo
  let alvo=alvoFixo;
  if(alvo==null){
    alvo=I.midi.reduce((a,m)=>Math.abs(m-midiF)<Math.abs(a-midiF)?m:a,I.midi[0]);
    // harmônico de oitava: dobra para a oitava da corda se ficar bem perto
    if(Math.abs(midiF-alvo)>2.5){for(const k of [-12,12]){const c=I.midi.reduce((a,m)=>Math.abs(m-(midiF+k))<Math.abs(a-(midiF+k))?m:a,I.midi[0]);if(Math.abs(midiF+k-c)<0.6){midiF+=k;alvo=c;break;}}}
  }
  // nova corda tocada: recomeça a média para responder rápido
  if(hist.length&&Math.abs(midiF-hist[hist.length-1])>0.8) {hist=[];suave=null;}
  hist.push(midiF); if(hist.length>7) hist.shift();
  const med=[...hist].sort((a,b)=>a-b)[hist.length>>1];
  suave=suave==null?med:suave*0.65+med*0.35;
  ultimoSinal=agora;
  const longe=Math.abs(suave-alvo)>2.5, nAlvo=longe?Math.round(suave):alvo, cents=(suave-nAlvo)*100;
  const ok=!longe&&Math.abs(cents)<=4;
  const estado=longe?"longe":ok?"ok":cents<0?"baixo":"alto";
  const dica=ok?T("Afinado!"):longe?T("Longe da corda: confira a afinação escolhida"):cents<0?T("Abaixo: aperte a corda"):T("Acima: afrouxe a corda");
  mostrar(solf(nomeMidi(nAlvo)),String(oitava(nAlvo)),cents,la*Math.pow(2,(suave-69)/12),estado,dica,longe?null:alvo);
  // corda afinada por mais de meio segundo: marca ✓ e vibra de leve
  if(ok){ if(!okDesde) okDesde=agora; else if(agora-okDesde>600){const i=I.midi.indexOf(alvo); if(i>=0&&!afinadas.has(i)){afinadas.add(i);try{navigator.vibrate&&navigator.vibrate(30);}catch(e){}
      const b=document.querySelector(`.af-corda[data-i="${i}"]`); if(b)b.classList.add("feita"); const ct=$("afCont"); if(ct) ct.textContent=`${afinadas.size}/${I.midi.length} ${T("afinadas")}`;}}}
  else okDesde=0;
}
function iniciar(api){
  API=api; if(!$("afInstr")) return;
  $("afInstr").innerHTML=B.opcoesInstr(); $("afInstr").value="violao";
  $("afInstr").onchange=()=>{alvoFixo=null;afinadas.clear();const lig=!!mic;if(lig)desligar();render();if(lig)ligar();};
  if($("afLa")){ $("afLa").innerHTML=[432,435,438,439,440,441,442,443,444,446].map(f=>`<option value="${f}">Lá = ${f} Hz</option>`).join(""); $("afLa").value="440";
    $("afLa").onchange=()=>{la=+$("afLa").value;hist=[];suave=null;render();}; }
  document.addEventListener("visibilitychange",()=>{if(document.hidden)desligar();});
}
window.AFINADOR={iniciar,render,parar:desligar,titulo:()=>`Afinador · ${ins().nome}`,_teste:{detectar}};
})();
