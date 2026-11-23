/* Aba "Tocar por região": campo harmônico tocado numa só região do braço. Não precisa editar este arquivo. */
(function(){
const B=window.BRACO, $=id=>document.getElementById(id);
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const GTR=[40,45,50,55,59,64], N=6, SPAN=5;
let API=null, prog=[0,4,5,3], tocando=null;

/* graus: [romano, intervalo da tônica, tríade(suf, ivs), tétrade(suf, ivs), qualidade] */
const MAJ="maj",MIN="min",DOM="dom",DIM="dim";
const CAMPOS={
  maior:{nome:"Maior",graus:[
    ["I","1","",["1","3","5"],"7M",["1","3","5","7"],MAJ],
    ["ii","2","m",["1","b3","5"],"m7",["1","b3","5","b7"],MIN],
    ["iii","3","m",["1","b3","5"],"m7",["1","b3","5","b7"],MIN],
    ["IV","4","",["1","3","5"],"7M",["1","3","5","7"],MAJ],
    ["V","5","",["1","3","5"],"7",["1","3","5","b7"],DOM],
    ["vi","6","m",["1","b3","5"],"m7",["1","b3","5","b7"],MIN],
    ["vii°","7","°",["1","b3","b5"],"m7(b5)",["1","b3","b5","b7"],DIM]],
   presets:[["I – V – vi – IV",[0,4,5,3]],["I – vi – IV – V",[0,5,3,4]],["vi – IV – I – V",[5,3,0,4]],["IV – I – V – vi",[3,0,4,5]],["ii – V – I",[1,4,0]],["I – iii – IV – V",[0,2,3,4]]]},
  menor:{nome:"Menor",graus:[
    ["i","1","m",["1","b3","5"],"m7",["1","b3","5","b7"],MIN],
    ["ii°","2","°",["1","b3","b5"],"m7(b5)",["1","b3","b5","b7"],DIM],
    ["III","b3","",["1","3","5"],"7M",["1","3","5","7"],MAJ],
    ["iv","4","m",["1","b3","5"],"m7",["1","b3","5","b7"],MIN],
    ["v","5","m",["1","b3","5"],"m7",["1","b3","5","b7"],MIN],
    ["VI","b6","",["1","3","5"],"7M",["1","3","5","7"],MAJ],
    ["VII","b7","",["1","3","5"],"7",["1","3","5","b7"],DOM],
    ["V7","5","",["1","3","5"],"7",["1","3","5","b7"],DOM]],
   presets:[["i – VI – III – VII",[0,5,2,6]],["i – iv – V7 – i",[0,3,7,0]],["i – VII – VI – V7",[0,6,5,7]],["VI – VII – i",[5,6,0]],["ii° – V7 – i",[1,7,0]],["i – iv – VII – III",[0,3,6,2]]]}
};
const SETS_TRI=[[0,1,2],[1,2,3],[2,3,4],[3,4,5]];
const SETS_TET=[[1,2,3,4],[2,3,4,5],[0,2,3,4],[1,3,4,5]];
const SETS_WOR=[[3,4,5],[2,3,4],[2,3,4,5]];
const NOME_SET={"0,1,2":"6-5-4","1,2,3":"5-4-3","2,3,4":"4-3-2","3,4,5":"3-2-1","1,2,3,4":"5-4-3-2","2,3,4,5":"4-3-2-1","0,2,3,4":"6-4-3-2 (drop 3)","1,3,4,5":"5-3-2-1 (drop 3)"};

const semi=lb=>B.lerIntervalo(lb).semi;
function estado(){
  return {ton:B.tonica($("rgTon").value), modo:$("rgModo").value, lo:+$("rgReg").value, estilo:$("rgEst").value, tet:$("rgTipo").value==="tet", soltas:$("rgSoltas").checked&&$("rgEst").value==="worship"};
}
function acordeDoGrau(st,i){
  const g=CAMPOS[st.modo].graus[i];
  const raizPc=B.pc(st.ton.pc+semi(g[1])), raizNome=B.soletrar(st.ton,g[1]);
  const raiz=B.TONICAS.find(t=>t.n===raizNome)||objNota(raizNome);
  return {rom:g[0],raiz,raizPc,tri:{suf:g[2],ivs:g[3]},tet:{suf:g[4],ivs:g[5]},q:g[6]};
}
function objNota(n){const l="CDEFGAB".indexOf(n[0]);let a=0;for(const c of n.slice(1))a+=c==="#"?1:-1;return {n,pc:B.pc([0,2,4,5,7,9,11][l]+a),l};}

/* tons permitidos por estilo */
function alvo(ac,st){
  if(st.estilo==="worship"){
    const base={maj:["1","3","5","9"],min:["1","b3","5","b7","9"],dom:["1","3","5","b7","9","4"],dim:["1","b3","b5","b7"]}[ac.q];
    return {permitidos:base,exatos:null};
  }
  const t=st.tet?ac.tet:ac.tri;
  return {permitidos:t.ivs,exatos:t.ivs};
}
function vozes(ac,st){
  const {permitidos,exatos}=alvo(ac,st), mapa=new Map(permitidos.map(l=>[B.pc(ac.raizPc+semi(l)),l]));
  const hi=st.lo+SPAN-1, sets=st.estilo==="worship"?SETS_WOR:(st.tet?SETS_TET:SETS_TRI);
  const out=[];
  for(const set of sets){
    const opts=set.map(s=>{const fs=[];for(let f=Math.max(0,st.lo);f<=hi;f++){const p=B.pc(GTR[s]+f);if(mapa.has(p))fs.push(f);}
      if(st.soltas&&st.lo>0&&st.lo<=5){const p=B.pc(GTR[s]);if(mapa.has(p))fs.unshift(0);}return fs;});
    const rec=(i,acc)=>{
      if(i===set.length){avaliar(set,acc.slice());return;}
      for(const f of opts[i]){acc.push(f);rec(i+1,acc);acc.pop();}
    };
    const avaliar=(set,fr)=>{
      const pres=fr.filter(f=>f>0), mn=Math.min(...pres), mx=Math.max(...pres);
      if(pres.length&&mx-mn>3) return;
      // dedos: notas na menor casa podem ser pestana
      const dedos=pres.length?1+pres.filter(f=>f!==mn).length:0; if(dedos>4) return;
      const notas=set.map((s,k)=>({s,f:fr[k],midi:GTR[s]+fr[k]}));
      const lbs=notas.map(n=>mapa.get(B.pc(n.midi)));
      const uniq=new Set(lbs);
      let q=0;
      if(exatos){ if(exatos.some(l=>!uniq.has(l))) return; if(uniq.size!==exatos.length) return; }
      else {
        const temTerca=uniq.has("3")||uniq.has("b3");
        const sus=ac.q===DOM&&uniq.has("4")&&!temTerca;
        if(!temTerca&&!sus) return;
        if(uniq.has("4")&&temTerca) return;
        if(uniq.size<3) return;
        if(ac.q===DIM&&!uniq.has("b5")) return;
        if(uniq.has("9")) q-=.7;
        if(!uniq.has("1")) q+=.3;
        q-=.25*Math.max(...set);
        q+=.25*(lbs.length-uniq.size);
        if(sus) q-=.2;
        if(pres.length<2) return;
        if(["9","4","b7"].includes(lbs[0])) q+=.6;
      }
      q+=fr.filter(f=>f===0).length*(st.estilo==="worship"?-.15:.1);
      q+=pres.length?(mx-mn)*.15:0;
      out.push({set,fr,notas,lbs,q,ac});
    };
    rec(0,[]);
  }
  return out.sort((a,b)=>a.q-b.q).slice(0,60);
}
function nomeVoz(v,st){
  const ac=v.ac, uniq=[...new Set(v.lbs)];
  let suf;
  if(st.estilo==="worship"){
    const lbs=uniq.includes("1")?uniq:["1",...uniq];
    suf=window.ACORDES.nomear(lbs);
    if(ac.q===DOM&&uniq.includes("b7")&&!/7/.test(suf)) suf="7"+suf;
  } else suf=st.tet?ac.tet.suf:ac.tri.suf;
  const baixo=v.lbs[0];
  const slash=baixo!=="1"&&st.estilo!=="worship"?"/"+B.soletrar(ac.raiz,baixo):"";
  return {nome:ac.raiz.n+suf+slash, base:ac.raiz.n+suf, suf};
}
function inv(v,st){
  const b=v.lbs[0], semRaiz=!v.lbs.includes("1");
  if(st.estilo==="worship") return (semRaiz?"sem tônica · ":"")+`voz grave: ${b==="1"?"tônica":b}`;
  if(b==="1")return "fundamental"; if(b==="3"||b==="b3")return "1ª inversão"; if(b==="5"||b==="b5")return "2ª inversão"; return "3ª inversão";
}
// custo de ir de uma voz para outra: soma do movimento das vozes, com peso extra na voz mais aguda
function mov(a,b){
  const x=a.notas.map(n=>n.midi).sort((p,q)=>p-q), y=b.notas.map(n=>n.midi).sort((p,q)=>p-q);
  let c=0;const k=Math.min(x.length,y.length);
  for(let i=1;i<=k;i++) c+=Math.abs(x[x.length-i]-y[y.length-i]);
  c+=Math.abs(x.length-y.length)*2;
  c+=Math.abs(x[x.length-1]-y[y.length-1])*.6;
  if(a.set.join()!==b.set.join()) c+=1.5;
  return c;
}
function melhorCaminho(cands){
  // programação dinâmica: menor movimento total + qualidade de cada voz
  const n=cands.length; if(!n) return [];
  if(cands.some(c=>!c.length)) return cands.map(c=>c[0]||null);
  let custo=cands[0].map(v=>v.q*3), de=[];
  for(let i=1;i<n;i++){
    const nc=[],nd=[];
    cands[i].forEach((v,j)=>{let best=1e9,bk=0;cands[i-1].forEach((u,k)=>{const c=custo[k]+mov(u,v);if(c<best){best=c;bk=k;}});nc[j]=best+v.q*3;nd[j]=bk;});
    custo=nc;de.push(nd);
  }
  let j=custo.indexOf(Math.min(...custo));const out=[cands[n-1][j]];
  for(let i=n-1;i>0;i--){j=de[i-1][j];out.unshift(cands[i-1][j]);}
  return out;
}

/* ---------- desenho ---------- */
function texto(raiz,lb){return API?API.texto(raiz,lb):lb;}
function cifra(n){if(!API||API.rotulo()!=="solf")return n;return n.replace(/[A-G][#b]?/g,x=>B.soletrar(B.TONICAS.find(t=>t.n===x)||objNota(x),"1",true));}
function tab(v){return GTR.map((_,s)=>{const k=v.set.indexOf(s);return k<0?"x":String(v.fr[k]);}).join(v.fr.some(f=>f>9)?"-":"");}
function diagrama(v,st){
  const dots=v.notas.map((n,k)=>({s:n.s,f:n.f,kind:v.lbs[k]==="1"?"root":["3","b3"].includes(v.lbs[k])?"char":"dot",text:texto(v.ac.raiz,v.lbs[k])}));
  const muted=GTR.map((_,s)=>s).filter(s=>!v.set.includes(s));
  const lo=st.lo===0||(st.soltas&&st.lo<=5)?0:st.lo;
  return B.desenhar({midi:GTR,lo,hi:st.lo+SPAN-1,min:SPAN,dots,muted,fw:46});
}
function cardVoz(v,st,i,extra){
  if(!v) return `<article class="ac-card vazio-ac"><h4>—</h4><p class="nota">Sem desenho nesta região. Tente outra região ou outro estilo.</p></article>`;
  const nm=nomeVoz(v,st);
  return `<article class="ac-card rg-card" data-i="${i}">
    <div class="rg-tit"><span class="mono rg-rom">${E(v.ac.rom)}</span><h4>${E(cifra(nm.nome))}</h4></div>
    <p class="nota">${E(inv(v,st))} · cordas ${E(NOME_SET[v.set.join()]||v.set.map(s=>6-s).join("-"))}${extra?` · ${E(extra)}`:""}</p>
    <div class="board">${diagrama(v,st)}</div>
    <p class="tabn">${E(tab(v))}</p></article>`;
}

/* ---------- som ---------- */
let ctx=null;
function tocarAcorde(v,t0,dur){
  const f=m=>440*Math.pow(2,(m-69)/12);
  v.notas.map(n=>n.midi).sort((a,b)=>a-b).forEach((m,k)=>{
    const t=t0+k*.035, o=ctx.createOscillator(), o2=ctx.createOscillator(), gn=ctx.createGain(), lp=ctx.createBiquadFilter();
    o.type="triangle";o2.type="sine";o.frequency.value=f(m);o2.frequency.value=f(m)*2;
    lp.type="lowpass";lp.frequency.setValueAtTime(3200,t);lp.frequency.exponentialRampToValueAtTime(900,t+dur);
    gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(.16,t+.01);gn.gain.exponentialRampToValueAtTime(.001,t+dur);
    const g2=ctx.createGain();g2.gain.value=.25;o2.connect(g2);g2.connect(gn);
    o.connect(gn);gn.connect(lp);lp.connect(ctx.destination);o.start(t);o2.start(t);o.stop(t+dur+.05);o2.stop(t+dur+.05);
  });
}
function ouvir(seq){
  if(tocando){clearTimeout(tocando.fim);tocando.timers.forEach(clearTimeout);document.querySelectorAll(".rg-card.on").forEach(x=>x.classList.remove("on"));tocando=null;$("rgPlay").textContent="▶ Ouvir";return;}
  ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();
  if(ctx.state==="suspended") ctx.resume();
  const bpm=+$("rgBpm").value, dur=60/bpm*4, t0=ctx.currentTime+.1, timers=[];
  const cards=[...document.querySelectorAll("#rgProg .rg-card")];
  seq.forEach((v,i)=>{if(!v)return;tocarAcorde(v,t0+i*dur,dur*.95);
    timers.push(setTimeout(()=>{cards.forEach(c=>c.classList.remove("on"));cards[i]&&cards[i].classList.add("on");},(i*dur+.1)*1000));});
  tocando={timers,fim:setTimeout(()=>{cards.forEach(c=>c.classList.remove("on"));tocando=null;$("rgPlay").textContent="▶ Ouvir";},(seq.length*dur+.2)*1000)};
  $("rgPlay").textContent="■ Parar";
}

/* ---------- tela ---------- */
let seqAtual=[];
function render(){
  const out=$("rgOut"); if(!out) return;
  const st=estado(), C=CAMPOS[st.modo];
  $("rgTipo").disabled=st.estilo==="worship";
  $("rgSoltasL").hidden=st.estilo!=="worship";
  prog=prog.filter(i=>i<C.graus.length);
  const acs=C.graus.map((_,i)=>acordeDoGrau(st,i));
  const cands=acs.map(ac=>vozes(ac,st));
  // mapa da região
  const esc={ivs:B.lerFormula(st.modo==="maior"?"1 2 3 4 5 6 7":"1 2 b3 4 5 b6 b7")};
  const dots=B.notasJanela(esc,GTR,st.ton,st.lo,st.lo+SPAN-1,false).map(d=>({...d,kind:d.semi===0?"root":"dot",text:texto(st.ton,d.lb)}));
  const regTxt=st.lo===0?"casas 0 a 4 (com cordas soltas)":`casas ${st.lo} a ${st.lo+SPAN-1}`;
  const nomeTom=`${st.ton.n} ${C.nome.toLowerCase()}`;
  let h=`<article class="card campo-cab">
    <div class="cc-head"><div><span class="eyebrow">Tocar por região</span><span class="ac-grande">${E(cifra(nomeTom))}</span></div><span class="badge-campo">${E(regTxt)}</span></div>
    <p class="lead">${st.estilo==="worship"
      ?"Estilo worship: fragmentos de 3 ou 4 notas nas cordas agudas (4, 3, 2 e 1), com 9ª e sus quando cabem e cordas soltas soando junto. A tônica fica com o baixo ou o violão base. As vozes andam o mínimo possível de um acorde para o outro."
      :`Estilo animado: ${st.tet?"tétrades":"tríades"} completas e suas inversões, sempre dentro da região. A inversão de cada acorde é escolhida para a mão quase não sair do lugar.`}</p>
    <div><span class="eyebrow">Notas da escala na região</span><div class="board rg-mapa">${B.desenhar({midi:GTR,lo:st.lo,hi:st.lo+SPAN-1,min:SPAN,dots,fw:60})}</div></div>
  </article>`;
  // progressão
  h+=`<section class="card"><div class="rg-prog-cab"><span class="eyebrow">Progressão</span>
      <div class="rg-presets">${C.presets.map(([n,p])=>`<button class="chip-b${p.join()===prog.join()?" on":""}" data-p="${p.join()}">${E(n)}</button>`).join("")}</div>
      <div class="rg-graus"><span class="mini">Monte a sua:</span>${acs.map((a,i)=>`<button class="chip-b" data-g="${i}" title="Adicionar ${E(a.raiz.n+(st.tet?a.tet.suf:a.tri.suf))}">${E(a.rom)}</button>`).join("")}<button class="link" id="rgLimpaProg">limpar</button></div>
      <div class="rg-play"><button class="btn primario" id="rgPlay">▶ Ouvir</button><label>Andamento <select id="rgBpm">${[60,72,84,96,110,124].map(b=>`<option${b===84?" selected":""}>${b}</option>`).join("")}</select></label><span class="nota">Um acorde por compasso.</span></div></div>`;
  seqAtual=prog.length?melhorCaminho(prog.map(i=>cands[i])):[];
  h+=prog.length?`<div class="ac-grid rg-grid" id="rgProg">${seqAtual.map((v,i)=>cardVoz(v,st,i)).join("")}</div>`:`<p class="aviso">Escolha uma progressão pronta ou clique nos graus para montar a sua.</p>`;
  h+=`</section>`;
  // campo inteiro
  h+=`<section class="card"><span class="eyebrow">Campo harmônico nesta região</span><p class="nota" style="margin:6px 0 12px">Até 3 desenhos de cada grau, todos dentro da mesma região.</p>`;
  acs.forEach((ac,i)=>{
    const vs=[], vist=new Set();
    for(const v of cands[i]){const k=v.lbs[0]+"|"+v.set.join();if(vist.has(k))continue;vist.add(k);vs.push(v);if(vs.length===3)break;}
    const nm=ac.raiz.n+(st.estilo==="worship"?"":(st.tet?ac.tet.suf:ac.tri.suf));
    h+=`<div class="rg-linha"><div class="rg-grau"><span class="mono">${E(ac.rom)}</span><b>${E(cifra(nm))}</b></div><div class="ac-grid">${vs.length?vs.map(v=>cardVoz(v,st,-1)).join(""):cardVoz(null)}</div></div>`;
  });
  h+=`</section>`;
  out.innerHTML=h;
  out.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>{prog=b.dataset.p.split(",").map(Number);parar();render();});
  out.querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>{if(prog.length>=8)prog=[];prog.push(+b.dataset.g);parar();render();});
  $("rgLimpaProg").onclick=()=>{prog=[];parar();render();};
  $("rgPlay").onclick=()=>ouvir(seqAtual);
}
function parar(){if(tocando)ouvir([]);}
function iniciar(api){
  API=api; if(!$("rgTon")) return;
  $("rgTon").innerHTML=B.TONICAS.map(t=>`<option value="${t.n}">${E(B.soletrar(t,"1",true))} (${E(t.n)})</option>`).join("");
  $("rgTon").value="G";
  $("rgReg").innerHTML=Array.from({length:12},(_,i)=>`<option value="${i}">${i===0?"Casas 0 a 4 (cordas soltas)":`Casas ${i} a ${i+SPAN-1}`}</option>`).join("");
  $("rgReg").value="2";
  ["rgTon","rgReg","rgEst","rgTipo","rgSoltas"].forEach(id=>$(id).onchange=()=>{parar();render();});
  $("rgModo").onchange=()=>{prog=CAMPOS[$("rgModo").value].presets[0][1].slice();parar();render();};
}
window.REGIAO={iniciar,render,titulo:()=>{const st=estado();return `Tocar por região · ${st.ton.n} ${CAMPOS[st.modo].nome.toLowerCase()} · casas ${st.lo}–${st.lo+SPAN-1}`;},_teste:{vozes,acordeDoGrau,melhorCaminho,nomeVoz,estado}};
})();
