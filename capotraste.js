/* Aba "Capotraste": calcula o tom real com capotraste, a casa certa para um tom e transpõe acordes.
   Não precisa editar este arquivo. */
(function(){
const B=window.BRACO, $=id=>document.getElementById(id);
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const SUS=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"], BEM=["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
const pcDe=n=>{const l="CDEFGAB".indexOf(n[0]);let a=0;for(const c of n.slice(1))a+=c==="#"?1:c==="b"?-1:0;return(([0,2,4,5,7,9,11][l]+a)%12+12)%12;};
const mod=x=>((x%12)+12)%12;
let API=null, tocando=null;
function solf(n){if(!API||API.rotulo()!=="solf")return n;return n.replace(/[A-G](?:#|b(?![a-z]))?/g,x=>B.SOLF["CDEFGAB".indexOf(x[0])]+x.slice(1));}

/* acordes: "G D/F# Em7 C(add9)" → [{raiz, resto, baixo}] */
const RE_AC=/^([A-G])(#|b)?([^/\s]*)(?:\/([A-G])(#|b)?)?$/;
function lerAcordes(txt){
  return String(txt).replace(/[|,;]/g," ").split(/\s+/).filter(Boolean).map(tk=>{
    const m=tk.match(RE_AC); if(!m) return {erro:tk};
    return {raiz:pcDe(m[1]+(m[2]||"")),resto:m[3]||"",baixo:m[4]?pcDe(m[4]+(m[5]||"")):null,orig:tk};
  });
}
// usa bemóis nos tons de Fá, Sib, Mib, Láb, Réb (maiores) e seus relativos; sustenidos nos outros
function preferirBemol(pc,menor){const p=menor?mod(pc+3):pc;return [5,10,3,8,1].includes(p);}
function escrever(ac,n,bem){if(ac.erro)return ac.erro;const N=bem?BEM:SUS;return N[mod(ac.raiz+n)]+ac.resto+(ac.baixo!=null?"/"+N[mod(ac.baixo+n)]:"");}
function transpor(lista,n){
  const prim=lista.find(a=>!a.erro); const bem=prim?preferirBemol(mod(prim.raiz+n),/^m(?!aj)/.test(prim.resto)):false;
  return lista.map(a=>escrever(a,n,bem));
}
// intervalos para ouvir (aproximado pelo nome do acorde)
function ivs(resto){
  let b=/^(m(?!aj)|min)/.test(resto)?[0,3,7]:[0,4,7];
  if(/dim|°/.test(resto))b=[0,3,6]; if(/aug|\+|#5/.test(resto))b=[0,4,8]; if(/sus4/.test(resto))b=[0,5,7]; if(/sus2/.test(resto))b=[0,2,7];
  if(/7M|maj7|Δ/.test(resto))b.push(11); else if(/°7|dim7/.test(resto))b.push(9); else if(/7/.test(resto))b.push(10);
  if(/(^|[^1])6/.test(resto))b.push(9); if(/9/.test(resto))b.push(14);
  return b;
}
const FORMAS=[["C",false],["A",false],["G",false],["E",false],["D",false],["Am",true],["Em",true],["Dm",true]];

function braco(casa){
  // desenho simples do braço com o capotraste na casa escolhida
  const W=560,H=120,L=26,R=10,nCasas=12,fw=(W-L-R)/nCasas;
  let g=`<svg class="cp-braco" viewBox="0 0 ${W} ${H}" role="img" aria-label="Capotraste na casa ${casa}"><rect x="${L}" y="18" width="${W-L-R}" height="${H-36}" rx="6" fill="var(--board)"/>`;
  for(let i=0;i<=nCasas;i++){const x=L+i*fw;g+=`<line x1="${x}" y1="18" x2="${x}" y2="${H-18}" stroke="${i===0?"var(--nut)":"var(--fret)"}" stroke-width="${i===0?6:2}"/>`;}
  for(let s=0;s<6;s++){const y=24+s*((H-48)/5);g+=`<line x1="${L}" y1="${y}" x2="${W-R}" y2="${y}" stroke="var(--string)" stroke-width="${1+s*.35}"/>`;}
  [3,5,7,9].forEach(c=>g+=`<circle cx="${L+(c-.5)*fw}" cy="${H/2}" r="5" fill="var(--fret)" opacity=".6"/>`);
  g+=`<circle cx="${L+11.5*fw}" cy="${H/2-14}" r="5" fill="var(--fret)" opacity=".6"/><circle cx="${L+11.5*fw}" cy="${H/2+14}" r="5" fill="var(--fret)" opacity=".6"/>`;
  if(casa>0){const x=L+(casa-.5)*fw;g+=`<rect class="cp-capo" x="${x-9}" y="8" width="18" height="${H-16}" rx="7" fill="var(--accent)"/>`;}
  for(let i=1;i<=nCasas;i++)g+=`<text x="${L+(i-.5)*fw}" y="${H-3}" text-anchor="middle" font-size="11" font-family="var(--f-mono)" fill="${i===casa?"var(--accent)":"var(--muted)"}" font-weight="${i===casa?700:400}">${i}</text>`;
  return g+`</svg>`;
}

function render(){
  const out=$("cpOut"); if(!out) return;
  parar();
  const casa=+$("cpCasa").value, formas=$("cpFormas").value, lista=lerAcordes(formas);
  const soa=transpor(lista,casa), erros=lista.filter(a=>a.erro).map(a=>a.erro);
  const tom=$("cpTom").value, tomPc=pcDe(tom.replace(/m$/,"")), tomMenor=/m$/.test(tom);
  const opc=FORMAS.map(([f,m])=>{const c=mod(tomPc-pcDe(f.replace(/m$/,"")));return {f,m,c};})
    .filter(o=>o.m===tomMenor&&o.c<=9).sort((a,b)=>a.c-b.c);
  const n=+$("cpN").value, tr=transpor(lerAcordes($("cpTr").value),n);
  out.innerHTML=`<article class="card campo-cab">
    <div class="cc-head"><div><span class="eyebrow">Capotraste</span><span class="ac-grande cp-titulo">${casa?`Casa ${casa}`:"Sem capotraste"}</span></div><span class="badge-campo">${casa?`+${casa} ${casa===1?"semitom":"semitons"}`:"tom original"}</span></div>
    <div class="board cp-board">${braco(casa)}</div>
    <div class="cp-res">
      <div><span class="eyebrow">Você toca (formas)</span><div class="cp-acs">${lista.map(a=>`<span class="mono">${E(solf(a.erro||a.orig))}</span>`).join("")||"—"}</div></div>
      <div class="cp-seta" aria-hidden="true">→</div>
      <div><span class="eyebrow">Soa como</span><div class="cp-acs cp-soa">${soa.map(x=>`<span class="mono">${E(solf(x))}</span>`).join("")||"—"}</div></div>
    </div>
    ${erros.length?`<p class="aviso">${E((window.t||(x=>x))("Não entendi: {0}. Use cifras como G, Em7, D/F#, C(add9), Bb7M.").replace("{0}",erros.join(", ")))}</p>`:""}
    <div class="rg-play"><button class="btn primario" id="cpOuvir">▶ Ouvir como soa</button></div>
  </article>
  <section class="card"><span class="eyebrow">Qual casa usar?</span>
    <p class="nota" style="margin:6px 0 12px">Escolha o tom da música e veja em que casa pôr o capotraste para tocar com as formas abertas que você já sabe.</p>
    <div class="cp-tabela">${opc.map(o=>`<button class="cp-op${o.c===casa&&lista[0]&&!lista[0].erro&&mod(lista[0].raiz)===pcDe(o.f.replace(/m$/,""))?" on":""}" data-f="${E(o.f)}" data-c="${o.c}"><span class="mono cp-forma">${E(solf(o.f))}</span><span>${o.c===0?"sem capotraste":`capotraste na casa ${o.c}`}</span></button>`).join("")}</div>
  </section>`;
  $("cpTrOut").innerHTML=`<section class="card"><span class="eyebrow">Resultado</span><div class="cp-acs cp-tr">${tr.map(x=>`<span class="mono">${E(solf(x))}</span>`).join("")||"—"}</div></section>`;
  out.querySelectorAll(".cp-op").forEach(b=>b.onclick=()=>{
    const f=b.dataset.f, menor=/m$/.test(f), r=f.replace(/m$/,"");
    // monta uma sequência simples nas formas escolhidas (I – V – vi – IV ou i – VI – III – VII)
    const p=pcDe(r), S=preferirBemol(p,menor)?BEM:SUS;
    $("cpFormas").value=menor?[S[p]+"m",S[mod(p+8)],S[mod(p+3)],S[mod(p+10)]].join(" "):[S[p],S[mod(p+7)],S[mod(p+9)]+"m",S[mod(p+5)]].join(" ");
    $("cpCasa").value=b.dataset.c; render();
  });
  $("cpOuvir").onclick=()=>tocando?parar():ouvir(lista.filter(a=>!a.erro),casa);
}
function parar(){if(!tocando)return;tocando.timers.forEach(clearTimeout);if(window.SOM)SOM.encerrar(tocando.ses);tocando=null;const b=$("cpOuvir");if(b)b.textContent="▶ Ouvir como soa";}
function ouvir(lista,casa){
  if(!window.SOM||!lista.length) return; SOM.liberar&&SOM.liberar();
  const ses=SOM.sessao(), t0=SOM.agora()+.12, d=1.1, timers=[]; let prev=null;
  lista.forEach((a,i)=>{const r=mod(a.raiz+casa), base=48+r-(r>5?12:0), ms=ivs(a.resto).map(x=>base+x);
    if(a.baixo!=null){const bb=36+mod(a.baixo+casa);ms.unshift(bb<base?bb:bb-12);}
    const t=t0+i*d; if(prev)SOM.abafar(prev,t-.02); prev=SOM.acorde(ms,t,{vel:.8,destino:ses});
    timers.push(setTimeout(()=>{document.querySelectorAll(".cp-soa span").forEach((s,k)=>s.classList.toggle("on",k===i));},Math.max(0,(t-SOM.agora())*1000)));});
  timers.push(setTimeout(()=>{document.querySelectorAll(".cp-soa span.on").forEach(s=>s.classList.remove("on"));parar();},(t0+lista.length*d-SOM.agora())*1000+300));
  tocando={ses,timers}; $("cpOuvir").textContent="■ Parar";
}
function iniciar(api){
  API=api; if(!$("cpCasa")) return;
  $("cpCasa").innerHTML=Array.from({length:12},(_,i)=>`<option value="${i}">${i===0?"Sem capotraste":`Casa ${i}`}</option>`).join("");
  $("cpCasa").value="2";
  $("cpTom").innerHTML=[...BEM.map(n=>n==="Gb"?"F#":n),...BEM.map(n=>(n==="Gb"?"F#":n==="Db"?"C#":n==="Ab"?"G#":n==="Eb"?"Eb":n)+"m")].map(n=>`<option value="${n}">${E(n)}</option>`).join("");
  $("cpTom").value="A";
  $("cpN").innerHTML=Array.from({length:23},(_,i)=>i-11).map(n=>`<option value="${n}"${n===0?"":""}>${n>0?"+"+n:n} ${Math.abs(n)===1?"semitom":"semitons"}</option>`).join("");
  $("cpN").value="2";
  ["cpCasa","cpTom","cpN"].forEach(id=>$(id).onchange=render);
  let tmr; ["cpFormas","cpTr"].forEach(id=>$(id).oninput=()=>{clearTimeout(tmr);tmr=setTimeout(render,250);});
}
window.CAPO={iniciar,render,parar,titulo:()=>`Capotraste · casa ${$("cpCasa").value}`,_teste:{lerAcordes,transpor}};
})();
