/* Aba "Ciclos": ciclo das quintas, das quartas, cromático, tons inteiros, terças menores, terças maiores e trítonos.
   Não precisa editar este arquivo. */
(function(){
const B=window.BRACO, $=id=>document.getElementById(id);
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const NOMES=["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"];
const pc=n=>{const l="CDEFGAB".indexOf(n[0]);let a=0;for(const c of n.slice(1))a+=c==="#"?1:c==="b"?-1:0;return(( [0,2,4,5,7,9,11][l]+a)%12+12)%12;};
const mod=x=>((x%12)+12)%12;
const gcd=(a,b)=>b?gcd(b,a%b):a;

const CICLOS=[
 {id:"quintas",nome:"Ciclo das quintas",passo:7,intervalo:"quinta justa (7 semitons)",
  oque:"O ciclo das quintas organiza os 12 tons pela distância de quinta justa. A cada passo no sentido horário, a armadura ganha um sustenido; no sentido anti-horário, um bemol. Tons vizinhos no círculo têm quase todas as notas em comum.",
  uso:"Memorizar as armaduras, achar os tons vizinhos para modular e entender por que o V7 resolve no I. Treine tocando a escala maior ou o acorde de cada tom na ordem do círculo."},
 {id:"quartas",nome:"Ciclo das quartas",passo:5,intervalo:"quarta justa (5 semitons)",
  oque:"É o ciclo das quintas no sentido contrário: cada nota fica uma quarta justa acima da anterior. É o movimento mais comum das fundamentais na música tonal (V → I, II → V → I).",
  uso:"O treino clássico do jazz, da bossa e da MPB: tocar II–V–I, dominantes ou qualquer acorde pelos 12 tons seguindo as quartas. Também é o caminho das cadeias de dominantes secundários (ex.: E7 – A7 – D7 – G7 – C)."},
 {id:"cromatico",nome:"Ciclo cromático",passo:1,intervalo:"semitom (1 semitom)",
  oque:"Todas as 12 notas, de semitom em semitom.",
  uso:"Aquecimento, exercícios de digitação, aproximações cromáticas e repetir um trecho meio tom acima (a modulação para o refrão final, comum no pop)."},
 {id:"tons",nome:"Ciclo de tons inteiros",passo:2,intervalo:"segunda maior (2 semitons)",
  oque:"Passos de tom inteiro. O ciclo divide as 12 notas em dois grupos de 6, que são as notas das duas escalas de tons inteiros.",
  uso:"Escala de tons inteiros, som impressionista (Debussy), acordes aumentados e dominantes 7(#5), e progressões que sobem ou descem de tom em tom."},
 {id:"tercas-menores",nome:"Ciclo de terças menores",passo:3,intervalo:"terça menor (3 semitons)",
  oque:"Passos de terça menor. O ciclo divide as 12 notas em três grupos de 4, e cada grupo forma um acorde diminuto com sétima (°).",
  uso:"Acordes diminutos e escala diminuta, dominantes que se substituem entre si (G7, Bb7, Db7 e E7) e modulações rápidas, comuns em trilhas."},
 {id:"tercas-maiores",nome:"Ciclo de terças maiores",passo:4,intervalo:"terça maior (4 semitons)",
  oque:"Passos de terça maior. O ciclo divide as 12 notas em quatro grupos de 3, e cada grupo forma um acorde aumentado.",
  uso:"Acordes aumentados e a base das “Coltrane changes” (Giant Steps), que giram o tom em terças maiores: B – G – Eb."},
 {id:"tritonos",nome:"Ciclo de trítonos",passo:6,intervalo:"trítono (6 semitons)",
  oque:"Passos de trítono: em dois passos a nota volta a si mesma. O ciclo divide as 12 notas em seis pares.",
  uso:"A substituição tritônica (SubV): dois dominantes a um trítono de distância têm o mesmo trítono interno (G7 e Db7) e podem trocar de lugar."},
];
const TIPOS=[["nota","Só a nota",[0]],["maior","Maior","",[0,4,7]],["menor","Menor","m",[0,3,7]],["7","Dominante (7)","7",[0,4,7,10]],["m7","Menor com 7ª (m7)","m7",[0,3,7,10]],["7M","Maior com 7ª maior (7M)","7M",[0,4,7,11]],["dim","Diminuto (°)","°",[0,3,6,9]],["251","II–V–I",null,null]];
const TIPO=Object.fromEntries(TIPOS.map(([id,n,suf,ivs])=>[id,{id,nome:n,suf:id==="nota"?"":suf,ivs:id==="nota"?[0]:ivs}]));
// armaduras (ciclo das quintas a partir de Dó)
const ORD_SUS=["F#","C#","G#","D#","A#","E#","B#"], ORD_BEM=["Bb","Eb","Ab","Db","Gb","Cb","Fb"];
const ARMADURA={0:0,7:1,2:2,9:3,4:4,11:5,6:6,1:-5,8:-4,3:-3,10:-2,5:-1};
const MAIOR_NOME={0:"C",7:"G",2:"D",9:"A",4:"E",11:"B",6:"F#/Gb",1:"Db",8:"Ab",3:"Eb",10:"Bb",5:"F"};
const MENOR_NOME={0:"Am",7:"Em",2:"Bm",9:"F#m",4:"C#m",11:"G#m",6:"D#m/Ebm",1:"Bbm",8:"Fm",3:"Cm",10:"Gm",5:"Dm"};
let API=null, tocando=null;

function solf(n){if(!API||API.rotulo()!=="solf")return n;return n.replace(/[A-G](?:#|b(?![a-z]))?/g,x=>B.SOLF["CDEFGAB".indexOf(x[0])]+x.slice(1));}
function estado(){const c=CICLOS.find(x=>x.id===$("ciTipo").value)||CICLOS[0];return{c,ini:$("ciTon").value,desce:$("ciDir").value==="desce",tipo:TIPO[$("ciAc").value]||TIPO.nota};}
function sequencia(st){
  const passo=st.desce?12-st.c.passo:st.c.passo, p0=pc(st.ini), n=12/gcd(st.c.passo,12);
  const pcs=Array.from({length:n+1},(_,i)=>mod(p0+i*passo));
  return pcs.map((p,i)=>({pc:p,nome:i===0||i===n?st.ini:NOMES[p]}));
}
function acordes(st,nota){
  if(st.tipo.id==="251"){const ii=NOMES[mod(nota.pc+2)],v=NOMES[mod(nota.pc+7)];return[{nome:ii+"m7",pc:mod(nota.pc+2),ivs:[0,3,7,10]},{nome:v+"7",pc:mod(nota.pc+7),ivs:[0,4,7,10]},{nome:nota.nome+"7M",pc:nota.pc,ivs:[0,4,7,11]}];}
  return[{nome:nota.nome+st.tipo.suf,pc:nota.pc,ivs:st.tipo.ivs}];
}
const armTxt=k=>k===0?"sem acidentes":k>0?`${k} ♯`:`${-k} ♭`;
const armNotas=k=>k>0?ORD_SUS.slice(0,k).join(" "):k<0?ORD_BEM.slice(0,-k).join(" "):"—";

/* desenho do círculo */
function circulo(st,seq){
  const S=560,C=S/2,R=200,quintas=st.c.id==="quintas"||st.c.id==="quartas";
  const ang=p=>{const k=quintas?mod(p*7):p;return(-90+k*30)*Math.PI/180;}; // posição de cada nota
  const xy=(p,r)=>[C+r*Math.cos(ang(p)),C+r*Math.sin(ang(p))];
  const ordem=new Map();seq.slice(0,-1).forEach((s,i)=>ordem.set(s.pc,i+1));
  let g=`<svg class="ci-svg" viewBox="0 0 ${S} ${S}" role="img" aria-label="${E(st.c.nome)}">`;
  g+=`<circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="var(--line)" stroke-width="2"/>`;
  if(quintas) g+=`<circle cx="${C}" cy="${C}" r="${R-72}" fill="none" stroke="var(--line)" stroke-width="1.5" stroke-dasharray="4 6"/>`;
  // outros grupos do mesmo ciclo (quando o ciclo não passa pelas 12 notas)
  const grupos=gcd(st.c.passo,12), cores=["var(--accent)","var(--char)","#2f9e44","#ae3ec9","#e8a400","#868e96"];
  if(grupos>1){for(let gI=1;gI<grupos;gI++){const pts=[];for(let i=0;i<12/grupos;i++)pts.push(xy(mod(pc(st.ini)+gI+i*st.c.passo),R));
    g+=pts.length===2?`<line x1="${pts[0][0]}" y1="${pts[0][1]}" x2="${pts[1][0]}" y2="${pts[1][1]}" stroke="${cores[gI%cores.length]}" stroke-width="3" opacity=".35"/>`
      :`<polygon points="${pts.map(p=>p.join(",")).join(" ")}" fill="none" stroke="${cores[gI%cores.length]}" stroke-width="3" opacity=".35"/>`;}}
  // caminho do ciclo escolhido
  const pts=seq.map(s=>xy(s.pc,R));
  g+=`<polyline class="ci-caminho" points="${pts.map(p=>p.join(",")).join(" ")}" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linejoin="round" opacity=".85"/>`;
  for(let p=0;p<12;p++){
    const [x,y]=xy(p,R), ord=ordem.get(p), on=ord!=null, ini=p===pc(st.ini);
    const nome=quintas?MAIOR_NOME[p]:(on?seq[ord-1].nome:NOMES[p]);
    g+=`<g class="ci-no${on?" on":""}" data-pc="${p}" data-ord="${ord||""}" style="cursor:pointer"><circle cx="${x}" cy="${y}" r="${nome.length>3?34:28}" fill="${ini?"var(--accent)":on?"var(--fg)":"var(--panel)"}" stroke="${on?"var(--fg)":"var(--line)"}" stroke-width="2"/>`;
    g+=`<text x="${x}" y="${y+6}" text-anchor="middle" font-family="var(--f-mono)" font-weight="700" font-size="${nome.length>3?14:18}" fill="${ini?"#fff":on?"var(--bg)":"var(--muted)"}">${E(solf(nome))}</text>`;
    if(on){const [bx,by]=xy(p,R+44);g+=`<text x="${bx}" y="${by+5}" text-anchor="middle" font-family="var(--f-body)" font-weight="700" font-size="13" fill="var(--accent)">${ord}</text>`;}
    if(quintas){const [mx,my]=xy(p,R-72), [ax,ay]=xy(p,R-122);
      g+=`<text x="${mx}" y="${my+5}" text-anchor="middle" font-family="var(--f-mono)" font-weight="600" font-size="${MENOR_NOME[p].length>4?11:14}" fill="var(--muted)">${E(solf(MENOR_NOME[p]))}</text>`;
      g+=`<text x="${ax}" y="${ay+4}" text-anchor="middle" font-family="var(--f-body)" font-size="11" fill="var(--muted)">${E(ARMADURA[p]===0?"0":ARMADURA[p]>0?ARMADURA[p]+"♯":-ARMADURA[p]+"♭")}</text>`;}
    g+=`</g>`;
  }
  if(quintas){g+=`<text x="${C}" y="${C-6}" text-anchor="middle" font-family="var(--f-body)" font-size="12" fill="var(--muted)">maiores (fora)</text><text x="${C}" y="${C+12}" text-anchor="middle" font-family="var(--f-body)" font-size="12" fill="var(--muted)">menores (dentro)</text>`;}
  return g+`</svg>`;
}

function render(){
  const out=$("ciOut"); if(!out) return;
  parar();
  const st=estado(), seq=sequencia(st), n=seq.length-1, grupos=gcd(st.c.passo,12);
  const quintas=st.c.id==="quintas"||st.c.id==="quartas";
  let h=`<article class="card campo-cab">
    <div class="cc-head"><div><span class="eyebrow">Ciclos</span><span class="ac-grande ci-titulo">${E(st.c.nome)}</span></div><span class="badge-campo">${E(st.c.intervalo)}</span></div>
    <div class="ci-grid"><div class="ci-roda">${circulo(st,seq)}</div>
    <div class="ci-info"><p class="lead">${E(st.c.oque)}</p>
      <div><span class="eyebrow">Para que serve</span><p class="ci-uso">${E(st.c.uso)}</p></div>
      ${grupos>1?`<p class="aviso">Este ciclo passa por ${n} notas. As outras ${12-n} formam ${grupos-1===1?"outro ciclo igual (mais claro no círculo)":`outros ${grupos-1} ciclos iguais (mais claros no círculo)`}.</p>`:`<p class="aviso">Este ciclo passa pelas 12 notas e volta ao começo.</p>`}
      <p class="nota">Clique numa nota do círculo para começar o ciclo por ela.</p>
    </div></div>
  </article>`;
  // sequência para tocar
  h+=`<section class="card"><div class="rg-prog-cab"><span class="eyebrow">Sequência para praticar</span>
    <div class="rg-play ci-play"><button class="btn primario" id="ciPlay">▶ Ouvir</button><label>Andamento <select id="ciBpm">${[60,72,84,96,110,124].map(b=>`<option${b===84?" selected":""}>${b}</option>`).join("")}</select></label></div></div>
    <ol class="ci-seq" id="ciSeq">${seq.map((s,i)=>`<li class="ci-passo${i===n?" volta":""}" data-i="${i}"><span class="ci-n">${i===n?"↺":i+1}</span><b class="mono">${E(solf(s.nome))}</b>${st.tipo.id==="nota"?"":`<span class="ci-acs">${acordes(st,s).map(a=>`<span class="mono">${E(solf(a.nome))}</span>`).join(" ")}</span>`}</li>`).join("")}</ol>
    <p class="nota" style="margin-top:12px">Dica: toque cada passo com o metrônomo, primeiro só a fundamental, depois o acorde e por fim a escala de cada tom.</p></section>`;
  // armaduras (ciclo das quintas/quartas)
  if(quintas){
    const linhas=seq.slice(0,-1).map(s=>{const k=ARMADURA[s.pc];return `<tr><td class="mono"><b>${E(solf(MAIOR_NOME[s.pc]))}</b></td><td class="mono">${E(solf(MENOR_NOME[s.pc]))}</td><td>${E(armTxt(k))}</td><td class="mono">${E(solf(armNotas(k)))}</td><td><button class="link" data-campo="${E(NOMES[s.pc])}">Ver o campo harmônico →</button></td></tr>`;}).join("");
    h+=`<section class="card"><span class="eyebrow">Armaduras de clave</span><p class="nota" style="margin:6px 0 12px">Sustenidos entram na ordem Fá Dó Sol Ré Lá Mi Si; bemóis na ordem contrária. Cada tom maior divide a armadura com o seu relativo menor.</p>
      <div class="tabwrap"><table class="tab"><thead><tr><th>Tom maior</th><th>Relativo menor</th><th>Armadura</th><th>Acidentes</th><th></th></tr></thead><tbody>${linhas}</tbody></table></div></section>`;
  }
  out.innerHTML=h;
  out.querySelectorAll(".ci-no").forEach(n=>n.onclick=()=>{const p=+n.dataset.pc;const t=B.TONICAS.find(x=>x.n===NOMES[p])||B.TONICAS.find(x=>x.pc===p);$("ciTon").value=t.n;render();});
  out.querySelectorAll("[data-campo]").forEach(b=>b.onclick=()=>{const v=b.dataset.campo;if($("hTon")){$("hTon").value=v;if($("hTipo"))$("hTipo").value="maior";}location.hash="harmonia";window.scrollTo(0,0);});
  $("ciPlay").onclick=()=>tocando?parar():ouvir(st,seq);
}
function parar(){
  if(!tocando) return;
  tocando.timers.forEach(clearTimeout); if(window.SOM) SOM.encerrar(tocando.ses);
  document.querySelectorAll(".ci-passo.on,.ci-no.atual").forEach(x=>x.classList.remove("on","atual"));
  tocando=null; const b=$("ciPlay"); if(b) b.textContent="▶ Ouvir";
}
function ouvir(st,seq){
  if(!window.SOM) return;
  SOM.liberar&&SOM.liberar();
  const bpm=+$("ciBpm").value, beat=60/bpm, t0=SOM.agora()+.15, timers=[], ses=SOM.sessao();
  const passos=[];seq.forEach((s,i)=>acordes(st,s).forEach(a=>passos.push({i,a})));
  const dur=st.tipo.id==="251"?beat*2:beat*2, midiDe=a=>a.ivs.map(x=>48+a.pc+x+(a.pc>6?-12:0)).map(m=>m<40?m+12:m);
  SOM.preparar(passos.flatMap(p=>midiDe(p.a)));
  let prev=null;
  passos.forEach((p,k)=>{const t=t0+k*dur;
    if(prev) SOM.abafar(prev,t-.02);
    prev=st.tipo.id==="nota"?SOM.acorde([48+p.a.pc+(p.a.pc>6?-12:0),60+p.a.pc+(p.a.pc>6?-12:0)],t,{vel:.85,destino:ses}):SOM.acorde(midiDe(p.a),t,{vel:.8,destino:ses});
    timers.push(setTimeout(()=>{document.querySelectorAll(".ci-passo.on,.ci-no.atual").forEach(x=>x.classList.remove("on","atual"));
      const li=document.querySelector(`.ci-passo[data-i="${p.i}"]`);if(li)li.classList.add("on");
      const no=document.querySelector(`.ci-no[data-pc="${seq[p.i].pc}"]`);if(no)no.classList.add("atual");},Math.max(0,(t-SOM.agora())*1000)));
  });
  timers.push(setTimeout(parar,(t0+passos.length*dur-SOM.agora())*1000+400));
  tocando={timers,ses}; $("ciPlay").textContent="■ Parar";
}
function iniciar(api){
  API=api; if(!$("ciTipo")) return;
  $("ciTipo").innerHTML=CICLOS.map(c=>`<option value="${c.id}">${E(c.nome)}</option>`).join("");
  $("ciTon").innerHTML=B.TONICAS.map(t=>`<option value="${t.n}">${E(B.soletrar(t,"1",true))} (${E(t.n)})</option>`).join("");
  $("ciTon").value="C";
  $("ciAc").innerHTML=TIPOS.map(([id,n])=>`<option value="${id}">${E(n)}</option>`).join("");
  ["ciTipo","ciTon","ciDir","ciAc"].forEach(id=>$(id).onchange=render);
}
window.CICLOS={iniciar,render,parar,titulo:()=>{const st=estado();return `${st.c.nome} · ${st.ini}`;},_teste:{sequencia,estado,CICLOS}};
})();
