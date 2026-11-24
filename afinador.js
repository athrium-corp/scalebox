/* Aba "Afinador": afina pelo microfone, em qualquer afinação do site. Não precisa editar este arquivo. */
(function(){
const B=window.BRACO, $=id=>document.getElementById(id);
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const NOMES=["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"];
let API=null, mic=null, raf=0, hist=[], alvoFixo=null, ultimo=0;

const freqDe=m=>440*Math.pow(2,(m-69)/12);
const nomeMidi=m=>NOMES[((m%12)+12)%12]+(Math.floor(m/12)-1);
function solf(n){if(!API||API.rotulo()!=="solf")return n;return n.replace(/[A-G](?:#|b(?![a-z]))?/g,x=>B.SOLF["CDEFGAB".indexOf(x[0])]+x.slice(1));}
const ins=()=>B.INSTRUMENTOS[$("afInstr").value]||B.INSTRUMENTOS.violao;

/* detecção da altura: autocorrelação normalizada (estilo YIN) com interpolação */
function detectar(buf0,sr0){
  // reduz pela metade a taxa de amostragem (média de pares): 4x menos contas, sem perder as notas graves
  const buf=new Float32Array(buf0.length>>1); for(let i=0;i<buf.length;i++) buf[i]=(buf0[2*i]+buf0[2*i+1])*.5;
  const sr=sr0/2, n=buf.length; let rms=0; for(let i=0;i<n;i++) rms+=buf[i]*buf[i]; rms=Math.sqrt(rms/n);
  if(rms<0.008) return null;
  const minP=Math.floor(sr/1400), maxP=Math.min(Math.floor(sr/27), Math.floor(n/2));
  const w=n-maxP, d=new Float32Array(maxP+1);
  for(let tau=minP;tau<=maxP;tau++){let s=0;for(let i=0;i<w;i++){const x=buf[i]-buf[i+tau];s+=x*x;}d[tau]=s;}
  // diferença média normalizada acumulada
  let soma=0; const cm=new Float32Array(maxP+1); cm[minP]=1;
  for(let tau=minP+1;tau<=maxP;tau++){soma+=d[tau];cm[tau]=d[tau]*(tau-minP)/(soma||1);}
  let tau=-1;
  for(let t=minP+2;t<maxP;t++){ if(cm[t]<0.12){ while(t+1<maxP&&cm[t+1]<cm[t]) t++; tau=t; break; } }
  if(tau<0){ let mi=1e9; for(let t=minP+2;t<maxP;t++) if(cm[t]<mi){mi=cm[t];tau=t;} if(mi>0.35) return null; }
  const a=cm[tau-1], b=cm[tau], c=cm[tau+1], den=a-2*b+c, desloc=den?(a-c)/(2*den):0;
  return sr/(tau+desloc);
}

function ponteiro(cents,ok){
  const ang=Math.max(-50,Math.min(50,cents))*1.6;
  return `<svg class="af-medidor" viewBox="0 0 300 170" aria-hidden="true">
    <path d="M30 150 A120 120 0 0 1 270 150" fill="none" stroke="var(--line)" stroke-width="14" stroke-linecap="round"/>
    <path d="M136 31 A120 120 0 0 1 164 31" fill="none" stroke="var(--ok)" stroke-width="14"/>
    ${[-50,-25,0,25,50].map(c=>{const r=(c*1.6-90)*Math.PI/180;return `<line x1="${150+100*Math.cos(r)}" y1="${150+100*Math.sin(r)}" x2="${150+88*Math.cos(r)}" y2="${150+88*Math.sin(r)}" stroke="var(--muted)" stroke-width="2"/><text x="${150+72*Math.cos(r)}" y="${154+72*Math.sin(r)}" text-anchor="middle" font-size="11" fill="var(--muted)" font-family="var(--f-mono)">${c>0?"+"+c:c}</text>`;}).join("")}
    <g class="af-agulha" style="transform:rotate(${ang}deg)"><line x1="150" y1="150" x2="150" y2="40" stroke="${ok?"var(--ok)":"var(--accent)"}" stroke-width="4" stroke-linecap="round"/></g>
    <circle cx="150" cy="150" r="9" fill="${ok?"var(--ok)":"var(--accent)"}"/></svg>`;
}

function render(){
  const out=$("afOut"); if(!out) return;
  const I=ins();
  out.innerHTML=`<article class="card af-card">
    <div class="af-topo"><span class="eyebrow">Afinador</span><button class="btn primario af-liga" id="afLiga">${mic?"■ Desligar microfone":"🎤 Ligar microfone"}</button></div>
    <div class="af-visor" id="afVisor">
      <div class="af-nota" id="afNota">${mic?"…":"—"}</div>
      <div class="af-freq" id="afFreq">${mic?"Toque uma corda solta":"Ligue o microfone e toque uma corda solta"}</div>
      <div id="afMedidor">${ponteiro(0,false)}</div>
      <div class="af-dica" id="afDica"></div>
    </div>
    <div><span class="eyebrow">Cordas</span><p class="nota" style="margin:4px 0 10px">Toque numa corda para ouvir a nota de referência. Com o microfone ligado, o afinador acha sozinho a corda mais próxima.</p>
      <div class="af-cordas" id="afCordas">${I.midi.map((m,i)=>`<button class="af-corda" data-i="${i}" data-m="${m}"><small>${I.midi.length-i}ª</small><b>${E(solf(NOMES[m%12]))}</b><span>${E(nomeMidi(m))} · ${freqDe(m).toFixed(1)} Hz</span></button>`).reverse().join("")}</div>
    </div>
    <p class="aviso" id="afErro" hidden></p>
  </article>
  <section class="card"><span class="eyebrow">Dicas</span><ul class="af-dicas">
    <li>Afine num lugar silencioso, com o celular perto do instrumento.</li>
    <li>Toque uma corda por vez e deixe soar. O ponteiro no meio e verde quer dizer afinado.</li>
    <li>Se a nota estiver abaixo, aperte a tarraxa (a corda sobe). Se estiver acima, afrouxe um pouco e suba de novo até o ponto, que assim a corda segura melhor a afinação.</li>
    <li>Para trocar de afinação (Drop D, meio tom abaixo, DADGAD…), escolha acima. As outras abas do site usam a mesma lista.</li>
  </ul></section>`;
  $("afLiga").onclick=()=>mic?desligar():ligar();
  out.querySelectorAll(".af-corda").forEach(b=>b.onclick=()=>{
    const m=+b.dataset.m; if(window.SOM){SOM.liberar&&SOM.liberar();SOM.nota(m,SOM.agora()+.02,{vel:.9});}
    alvoFixo=alvoFixo===m?null:m; marcarCorda(m);
  });
}
function marcarCorda(m){document.querySelectorAll(".af-corda").forEach(b=>b.classList.toggle("on",+b.dataset.m===m));}

async function ligar(){
  const erro=$("afErro");
  try{
    if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia) throw new Error("sem-suporte");
    try{ if(navigator.audioSession) navigator.audioSession.type="play-and-record"; }catch(e){}
    const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
    const ctx=SOM.contexto(); if(ctx.state!=="running") await ctx.resume().catch(()=>{});
    const src=ctx.createMediaStreamSource(stream), an=ctx.createAnalyser(); an.fftSize=4096; src.connect(an);
    mic={stream,src,an,buf:new Float32Array(an.fftSize),ctx}; hist=[];
    render(); laco();
  }catch(e){
    try{ if(navigator.audioSession) navigator.audioSession.type="playback"; }catch(x){}
    if(erro){erro.hidden=false;erro.textContent=e&&e.name==="NotAllowedError"?"O navegador não deixou usar o microfone. Libere o acesso ao microfone para este site nas configurações do navegador e tente de novo.":
      e&&e.message==="sem-suporte"?"Este navegador não tem acesso ao microfone. Tente no Chrome ou no Safari atualizados.":"Não foi possível ligar o microfone.";}
  }
}
function desligar(){
  if(!mic) return; cancelAnimationFrame(raf);
  try{mic.src.disconnect();}catch(e){} mic.stream.getTracks().forEach(t=>t.stop()); mic=null;
  try{ if(navigator.audioSession) navigator.audioSession.type="playback"; }catch(e){}
  if($("afOut")) render();
}
function laco(){
  raf=requestAnimationFrame(laco);
  const agora=performance.now(); if(agora-ultimo<45) return; ultimo=agora; // ~20 leituras por segundo (leve no celular)
  mic.an.getFloatTimeDomainData(mic.buf);
  const f=detectar(mic.buf,mic.ctx.sampleRate);
  if(!f){ if(hist.length&&agora-hist.t>1200){hist=[];} return; }
  hist.push(f); if(hist.length>5) hist.shift(); hist.t=agora;
  const fm=[...hist].sort((a,b)=>a-b)[Math.floor(hist.length/2)];
  const midiF=69+12*Math.log2(fm/440);
  // corda alvo: a escolhida ou a mais próxima da afinação
  const I=ins(); let alvo=alvoFixo;
  if(alvo==null){alvo=I.midi.reduce((a,m)=>Math.abs(m-midiF)<Math.abs(a-midiF)?m:a,I.midi[0]); if(Math.abs(alvo-midiF)>2.5) alvo=Math.round(midiF);}
  const cents=Math.round((midiF-alvo)*100), ok=Math.abs(cents)<=5, perto=Math.round(midiF);
  $("afNota").textContent=solf(NOMES[((alvo%12)+12)%12]);
  $("afNota").className="af-nota"+(ok?" ok":"");
  $("afFreq").textContent=`${fm.toFixed(1)} Hz · ${solf(nomeMidi(perto))} · ${cents>0?"+":""}${cents} cents`;
  $("afMedidor").innerHTML=ponteiro(cents,ok);
  $("afDica").textContent=ok?t("Afinado!"):Math.abs(midiF-alvo)>2.5?t("Longe da corda: confira a afinação escolhida"):cents<0?t("Abaixo: aperte a corda"):t("Acima: afrouxe a corda");
  $("afDica").className="af-dica"+(ok?" ok":cents<0?" baixo":" alto");
  marcarCorda(alvo);
}
const t=s=>window.t?window.t(s):s;
function iniciar(api){
  API=api; if(!$("afInstr")) return;
  $("afInstr").innerHTML=B.opcoesInstr(); $("afInstr").value="violao";
  $("afInstr").onchange=()=>{alvoFixo=null;render();};
  document.addEventListener("visibilitychange",()=>{if(document.hidden)desligar();});
}
window.AFINADOR={iniciar,render,parar:desligar,titulo:()=>`Afinador · ${ins().nome}`,_teste:{detectar}};
})();
