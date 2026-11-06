/* Interface do site. Para editar conteúdo use os arquivos dos arquivos .js de dados. */
(function(){
const B=window.BRACO, $=id=>document.getElementById(id), E=B.esc;
const CFG=Object.assign({titulo:"Scalebox",subtitulo:"",professor:"",mostrarEditor:true,instrumentoPadrao:"violao"},window.CONFIG||{});
const store={
  get(k,d){try{const v=localStorage.getItem("shapes:"+k);return v?JSON.parse(v):d;}catch(e){return d;}},
  set(k,v){try{localStorage.setItem("shapes:"+k,JSON.stringify(v));return true;}catch(e){return false;}}
};
let rotulo=store.get("rotulo","int");
const STR=n=>n+"ª";

/* ---------- escalas ---------- */
let minhasEscalas=store.get("escalas",[]);
let ESC=[], ESCMAP=new Map(), errosEscalas=[];
function compilar(){
  ESCMAP=new Map(); errosEscalas=[];
  const fontes=[...(window.ESCALAS||[]),...(window.ESCALAS_EXTRA||[]),...minhasEscalas.map(e=>({...e,_local:true}))];
  for(const e of fontes){
    try{
      const ivs=B.lerFormula(e.formula);
      ESCMAP.set(e.id,{...e,grupo:e.grupo||"Minhas escalas",ivs,lbs:ivs.map(i=>i.lb),caract:e.caract||[],base:e.base||null});
    }catch(err){errosEscalas.push(`${e.nome||e.id}: ${err.message}`);}
  }
  ESC=[...ESCMAP.values()];
}
const escala=id=>ESCMAP.get(id)||ESC[0];
function preencherEscalas(sel,val){
  const grupos=new Map();
  for(const e of ESC){if(!grupos.has(e.grupo))grupos.set(e.grupo,[]);grupos.get(e.grupo).push(e);}
  sel.innerHTML=[...grupos].map(([g,l])=>`<optgroup label="${E(g)}">${l.map(e=>`<option value="${E(e.id)}">${E(e.nome)}</option>`).join("")}</optgroup>`).join("");
  sel.value=ESCMAP.has(val)?val:ESC[0].id;
}
function preencherTonicas(sel,val){sel.innerHTML=B.TONICAS.map(t=>`<option value="${t.n}">${E(nomeNota(t.n))}</option>`).join("");sel.value=val;}
function preencherInstr(sel,val){sel.innerHTML=Object.entries(B.INSTRUMENTOS).map(([k,v])=>`<option value="${k}">${E(v.nome)}</option>`).join("");sel.value=B.INSTRUMENTOS[val]?val:"violao";}
function nomeNota(n){const t=B.tonica(n);const solf=B.soletrar(t,"1",true);return `${solf} (${n})`;}

/* ---------- rótulos ---------- */
const texto=(t,lb)=>rotulo==="int"?lb:B.soletrar(t,lb,rotulo==="solf");
function tipo(e,lb,semi){
  if(semi===0) return "root";
  if(e.caract.includes(lb)) return "char";
  if(e.base&&!e.base.includes(lb)) return "extra";
  return "dot";
}
function rotular(e,t,dots){return dots.map(d=>({...d,kind:tipo(e,d.lb,d.semi),text:texto(t,d.lb)}));}
function chips(e){return e.lbs.map(lb=>`<b class="${lb==="1"?"r":e.caract.includes(lb)?"c":(e.base&&!e.base.includes(lb))?"x":""}">${E(lb)}</b>`).join("");}
function legenda(el,tipoL){
  const L={
    escala:[["k-root","Tônica"],["k-char","Intervalo característico"],["k-dot","Nota da escala"],["k-extra","Nota fora do 'esqueleto' (quando houver)"]],
    modo:[["k-root","Tônica"],["k-char","Intervalo característico"],["k-dot","Nota da pentatônica"],["k-extra","Outra nota"]],
    "caged-maior":[["k-root","Tônica"],["k-dot","Nota do arpejo (1 3 5 7)"],["k-extra","Nota de passagem"]],
    "caged-menor":[["k-root","Tônica"],["k-dot","Nota do arpejo (1 b3 5 b7)"],["k-extra","Nota de passagem"]],
  }[tipoL];
  el.innerHTML=L.map(([c,t])=>`<span><i class="sw ${c}"></i>${E(t)}</span>`).join("");
}

/* ---------- aba Escalas ---------- */
function cordasTonica(ins){const n=ins.midi.length;return n>=6?[0,1,2]:[0,1];}
function renderEscalas(){
  const e=escala($("eEscala").value), t=B.tonica($("eTonica").value), ins=B.INSTRUMENTOS[$("eInstr").value];
  const notas=e.lbs.map(lb=>`<b>${E(B.soletrar(t,lb,rotulo==="solf"))}</b>`).join("");
  $("eInfo").innerHTML=`<div class="cab"><h2>${E(e.nome)}</h2>${e.outros?`<span class="alias">${E(e.outros)}</span>`:""}</div>
    <div><h4>Fórmula</h4><div class="formula">${chips(e)}</div></div>
    <div><h4>Notas em ${E(nomeNota(t.n))}</h4><div class="formula notas">${notas}</div></div>
    ${e.caract.length?`<div><h4>Característico</h4><p><strong style="color:var(--char);font-family:var(--f-mono)">${E(e.caract.join(" e "))}</strong></p></div>`:""}
    <div><h4>Grupo</h4><p>${E(e.grupo)}</p></div>
    ${e.origem?`<div><h4>De onde vem</h4><p>${E(e.origem)}</p></div>`:""}
    ${e.uso?`<div><h4>Para que usar</h4><p>${E(e.uso)}</p></div>`:""}`;
  const n=ins.midi.length;
  $("ePos").innerHTML=cordasTonica(ins).map(s=>{
    const p=B.posicao(e,ins.midi,s,t);
    return `<div class="card"><div class="lbl">Tônica na ${STR(n-s)} corda</div><div class="board">${B.desenhar({midi:ins.midi,lo:p.lo,hi:p.hi,dots:rotular(e,t,p.dots)})}</div>
      <div class="cap"><span>${E(nomeNota(t.n))} ${E(e.nome.toLowerCase())} · casa ${p.r}</span><button class="link" data-edit="${s}">Abrir no editor</button></div></div>`;
  }).join("");
  const hi=ins.casas;
  $("eBraco").innerHTML=B.desenhar({midi:ins.midi,lo:0,hi,dots:rotular(e,t,B.notasJanela(e,ins.midi,t,0,hi,false)),fw:52});
  $("ePos").querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>{
    const s=+b.dataset.edit, p=B.posicao(e,ins.midi,s,t);
    abrirNoEditor({titulo:`${t.n} ${e.nome} · tônica na ${STR(n-s)} corda`,descricao:"",instrumento:$("eInstr").value,tonica:t.n,casaInicial:p.lo,casas:5,semRotulo:false,dots:dotsDeEscala(e,p.dots)});
  });
}
function dotsDeEscala(e,dots){return dots.map(d=>({s:d.s,f:d.f,lb:d.lb,k:d.semi===0?"r":e.caract.includes(d.lb)?"c":"n"}));}

/* ---------- aba Famílias ---------- */
function familias(){
  const m=new Map();
  for(const e of ESC) if(e.familia){ if(!m.has(e.familia)) m.set(e.familia,{id:e.familia,nome:e.grupo,modos:[]}); m.get(e.familia).modos.push(e); }
  for(const f of m.values()) f.modos.sort((a,b)=>(a.grau||0)-(b.grau||0));
  return [...m.values()];
}
const INTRO_FAM={
  "maior":"Os 7 modos nascem da escala maior: cada modo começa em um grau diferente. Bolinhas cheias formam a pentatônica do modo; as vazadas são as duas notas a mais.",
  "menor-harmonica":"Os 7 modos da menor harmônica (menor natural com a 7ª maior). Muito usados em música erudita, metal neoclássico, flamenco e jazz.",
  "menor-melodica":"Os 7 modos da menor melódica (menor com 6ª e 7ª maiores). São a base de vários sons do jazz moderno, como a escala alterada e o Lídio dominante (escala nordestina).",
  "maior-harmonica":"Os 7 modos da maior harmônica (maior com a 6ª menor)."
};
function renderFamilias(){
  const fams=familias(), f=fams.find(x=>x.id===$("fFam").value)||fams[0];
  if(!f){$("fTbl").innerHTML=`<div class="vazio">Nenhuma família cadastrada.</div>`;return;}
  const ins=B.INSTRUMENTOS[$("fInstr").value], n=ins.midi.length;
  const tA=B.tonica($("fTonA").value), tB=B.tonica($("fTonB").value);
  $("fLbA").textContent=`Tônica ${STR(n)} corda`; $("fLbB").textContent=`Tônica ${STR(n-1)} corda`;
  $("fIntro").textContent=INTRO_FAM[f.id]||"";
  $("fTbl").innerHTML=f.modos.map(e=>{
    const a=B.posicao(e,ins.midi,0,tA), b=B.posicao(e,ins.midi,1,tB);
    return `<div class="linha">
      <div><p class="nome-modo">${E(e.nome)}</p>${e.outros?`<p class="desc-modo">${E(e.outros)}</p>`:`<p class="desc-modo"></p>`}
        <div class="formula">${chips(e)}</div>
        ${e.caract.length?`<p class="charline">Característico: <strong>${E(e.caract.join(" e "))}</strong></p>`:""}
        ${e.uso?`<p class="desc-modo">${E(e.uso)}</p>`:""}
        <button class="link" data-ver="${E(e.id)}">Ver detalhes da escala</button></div>
      <div><div class="lbl">Tônica na ${STR(n)} corda</div><div class="board">${B.desenhar({midi:ins.midi,lo:a.lo,hi:a.hi,dots:rotular(e,tA,a.dots)})}</div><div class="cap"><span>${E(tA.n)} ${E(e.nome.toLowerCase())} · casa ${a.r}</span></div></div>
      <div><div class="lbl">Tônica na ${STR(n-1)} corda</div><div class="board">${B.desenhar({midi:ins.midi,lo:b.lo,hi:b.hi,dots:rotular(e,tB,b.dots)})}</div><div class="cap"><span>${E(tB.n)} ${E(e.nome.toLowerCase())} · casa ${b.r}</span></div></div>
    </div>`;}).join("");
  $("fTbl").querySelectorAll("[data-ver]").forEach(b=>b.onclick=()=>{$("eEscala").value=b.dataset.ver;$("eTonica").value=tA.n;$("eInstr").value=$("fInstr").value;location.hash="escalas";});
}

/* ---------- aba CAGED ---------- */
const VIOLAO=B.INSTRUMENTOS.violao.midi;
const CAGED_MAIOR={formula:"1 2 3 4 5 6 7",ct:["1","3","5","7"],suf:"maj7",formas:[
  {n:"C",str:1,lo:-3,hi:0,ch:[null,0,-1,-3,-3,null]},
  {n:"A",str:1,lo:-1,hi:3,ch:[null,0,2,1,2,0]},
  {n:"G",str:0,lo:-4,hi:0,ch:[0,-1,-3,-3,-3,-1]},
  {n:"E",str:0,lo:-1,hi:3,ch:[0,2,1,1,0,0]},
  {n:"D",str:2,lo:-1,hi:3,ch:[null,null,0,2,2,2]}]};
const CAGED_MENOR={formula:"1 2 b3 4 5 b6 b7",ct:["1","b3","5","b7"],suf:"m7",formas:[
  {n:"Am",str:1,lo:0,hi:3,ch:[null,0,2,0,1,0],rel:"C"},
  {n:"Gm",str:0,lo:-3,hi:1,ch:[0,-2,0,-3,0,null],rel:"A"},
  {n:"Em",str:0,lo:-1,hi:3,ch:[0,2,0,0,0,0],rel:"G"},
  {n:"Dm",str:2,lo:0,hi:4,ch:[null,null,0,2,1,1],rel:"E"},
  {n:"Cm",str:1,lo:-3,hi:1,ch:[null,0,-2,0,-2,null],rel:"D"}]};
function renderCaged(sys,selId,tblId,menor){
  const t=B.tonica($(selId).value), ivs=B.lerFormula(sys.formula), e={ivs,caract:[],base:sys.ct};
  const nome=t.n+sys.suf;
  const kind=(d)=>d.semi===0?"root":sys.ct.includes(d.lb)?"dot":"extra";
  const formas=sys.formas.map(F=>{
    const r=B.casaTonica(VIOLAO,F.str,t,F.lo), lo=r+F.lo, hi=r+F.hi;
    const esc=B.notasJanela(e,VIOLAO,t,lo,hi,true).map(d=>({...d,kind:kind(d),text:texto(t,d.lb)}));
    const arp=esc.filter(d=>sys.ct.includes(d.lb));
    const muted=[],chord=[];
    F.ch.forEach((o,s)=>{ if(o===null){muted.push(s);return;}
      const f=r+o, semi=B.pc(VIOLAO[s]+f-t.pc), iv=ivs.find(i=>i.semi===semi);
      chord.push({s,f,semi,lb:iv.lb,kind:semi===0?"root":"dot",text:texto(t,iv.lb)}); });
    return {F,r,lo,hi,esc,arp,chord,muted};
  }).sort((a,b)=>a.lo-b.lo);
  let relMaior="";
  if(menor){const rel=B.TONICAS.find(x=>x.pc===B.pc(t.pc+3)&&x.l===(t.l+2)%7)||B.TONICAS.find(x=>x.pc===B.pc(t.pc+3)); relMaior=rel.n;}
  $(tblId).innerHTML=formas.map(sh=>`<div class="linha tres">
    <div class="cabeca"><p class="nome-modo">Forma ${sh.F.n}</p><span class="acorde">${E(nome)}</span>
      <span class="desc-modo">Tônica na ${STR(6-sh.F.str)} corda, casa ${sh.r} · casas ${sh.lo}–${Math.max(sh.hi,sh.lo+4)}${menor?` · mesmo desenho da forma ${sh.F.rel} de ${relMaior} maior`:""}</span></div>
    <div><div class="lbl">Acorde ${E(nome)}</div><div class="board">${B.desenhar({midi:VIOLAO,lo:sh.lo,hi:sh.hi,dots:sh.chord,muted:sh.muted})}</div></div>
    <div><div class="lbl">Arpejo ${E(nome)}</div><div class="board">${B.desenhar({midi:VIOLAO,lo:sh.lo,hi:sh.hi,dots:sh.arp})}</div></div>
    <div><div class="lbl">Escala ${menor?"menor":"maior"}</div><div class="board">${B.desenhar({midi:VIOLAO,lo:sh.lo,hi:sh.hi,dots:sh.esc})}</div></div>
  </div>`).join("");
}

/* ---------- shapes do professor ---------- */
let meusShapes=store.get("meus",[]);
const KIND={r:"root",n:"dot",c:"char",d:"hi",p:"extra"};
function dotsDoShape(sh,mostrarSempre){
  const ins=B.INSTRUMENTOS[sh.instrumento]||B.INSTRUMENTOS.violao, t=B.tonica(sh.tonica);
  return sh.dots.filter(d=>d.s<ins.midi.length).map(d=>{
    const semi=B.pc(ins.midi[d.s]+d.f-t.pc);
    const iv=d.lb&&B.lerIntervalo(d.lb);
    const lb=(iv&&iv.semi===semi)?d.lb:B.PADRAO[semi];
    let text=d.t?d.t:texto(t,lb);
    if(sh.semRotulo&&!mostrarSempre&&!d.t) text="";
    return {s:d.s,f:d.f,kind:KIND[d.k]||"dot",text};
  });
}
function svgShape(sh,editavel){
  const ins=B.INSTRUMENTOS[sh.instrumento]||B.INSTRUMENTOS.violao;
  if(editavel) return B.desenhar({midi:ins.midi,lo:0,hi:ins.casas,dots:dotsDoShape(sh,true),editavel:true,fw:60,label:sh.titulo});
  return B.desenhar({midi:ins.midi,lo:sh.casaInicial,hi:sh.casaInicial+sh.casas-1,min:4,dots:dotsDoShape(sh,false),editavel:false,fw:58,label:sh.titulo});
}
/* região do desenho para salvar, imprimir e exportar */
function recorte(sh){
  const ins=B.INSTRUMENTOS[sh.instrumento]||B.INSTRUMENTOS.violao, n=ins.midi.length;
  const dots=sh.dots.filter(d=>d.s<n&&d.f<=ins.casas);
  if(sh.area==="todo"||!dots.length) return {...sh,dots,casaInicial:0,casas:sh.area==="todo"?ins.casas+1:5};
  const fs=dots.map(d=>d.f), mn=Math.min(...fs), mx=Math.max(...fs);
  const lo=mn<=1?0:mn-1, hi=Math.min(ins.casas,Math.max(mx+1,lo+4));
  return {...sh,dots,casaInicial:lo,casas:hi-lo+1};
}
function cardShape(sh,local){
  const ins=B.INSTRUMENTOS[sh.instrumento]||B.INSTRUMENTOS.violao;
  return `<article class="card shape-card"><h3>${E(sh.titulo||"Sem título")}</h3>
    ${sh.descricao?`<p class="nota">${E(sh.descricao)}</p>`:""}
    <div class="board">${svgShape(sh,false)}</div>
    ${sh.comentarios?`<div class="coment-card">${E(sh.comentarios)}</div>`:""}
    <div class="cap"><span>${E(ins.nome)} · tom ${E(sh.tonica)}</span></div>
    <div class="acoes">${local?`<button class="btn" data-abrir="${E(sh.id)}" data-local="1">Editar</button>`:`<button class="btn" data-abrir="${E(sh.id)}">Editar no editor</button>`}</div>
  </article>`;
}
function renderProfessor(){
  const pub=window.SHAPES||[];
  $("pIntro").textContent=CFG.professor?`Shapes preparados por ${CFG.professor}.`:"Shapes preparados pelo professor.";
  $("pPub").innerHTML=pub.length?pub.map(s=>cardShape(s,false)).join(""):`<div class="vazio">Ainda não há shapes publicados.</div>`;
  const mostrarLocal=meusShapes.length&&editorVisivel();
  $("pLocalWrap").hidden=!mostrarLocal;
  $("pLocal").innerHTML=mostrarLocal?meusShapes.map(s=>cardShape(s,true)).join(""):"";
  document.querySelectorAll("#v-professor [data-abrir]").forEach(b=>b.onclick=()=>{
    const fonte=b.dataset.local?meusShapes:pub, sh=fonte.find(x=>x.id===b.dataset.abrir);
    if(sh) abrirNoEditor(JSON.parse(JSON.stringify(sh)));
  });
  if(!editorVisivel()) document.querySelectorAll("#v-professor .acoes").forEach(a=>a.remove());
}

/* ---------- editor ---------- */
let ED=null, hist=[], ferramenta="n";
function novoShape(){return {id:null,titulo:"",descricao:"",comentarios:"",instrumento:CFG.instrumentoPadrao,tonica:"A",casaInicial:4,casas:5,semRotulo:false,dots:[]};}
function abrirNoEditor(sh){ED=Object.assign(novoShape(),sh);hist=[];sincronizarForm();location.hash="editor";renderEditor();status("");}
function snap(){hist.push(JSON.stringify(ED));if(hist.length>80)hist.shift();}
function sincronizarForm(){
  $("edTitulo").value=ED.titulo||""; $("edDesc").value=ED.descricao||""; $("edComent").value=ED.comentarios||"";
  $("edInstr").value=ED.instrumento; $("edTonica").value=ED.tonica;
  $("edArea").value=ED.area==="todo"?"todo":"auto"; $("edSemRot").checked=!!ED.semRotulo;
  preencherCordas();
}
function preencherCordas(){
  const ins=B.INSTRUMENTOS[ED.instrumento], n=ins.midi.length, v=$("gCorda").value;
  $("gCorda").innerHTML=ins.midi.map((_,s)=>`<option value="${s}">${STR(n-s)} corda</option>`).join("");
  $("gCorda").value=(v!==""&&+v<n)?v:"0";
}
function renderEditor(){
  $("edBoard").innerHTML=svgShape(ED,true);
  $("edPrint").innerHTML=`${ED.titulo?`<h3>${E(ED.titulo)}</h3>`:""}${ED.descricao?`<p>${E(ED.descricao)}</p>`:""}`+svgShape(recorte(ED),false)+`<div class="coment-print" id="edPrintComent">${E(ED.comentarios||"")}</div>`;
  const ul=$("edLista");
  ul.innerHTML=meusShapes.length?meusShapes.map(s=>`<li><span>${E(s.titulo||"Sem título")}</span><div>
    <button class="btn" data-a="abrir" data-id="${E(s.id)}">Abrir</button>
    <button class="btn" data-a="dup" data-id="${E(s.id)}">Duplicar</button>
    <button class="btn perigo" data-a="del" data-id="${E(s.id)}">Excluir</button></div></li>`).join(""):`<li><span class="nota">Nenhum shape salvo ainda.</span></li>`;
  ul.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{
    const sh=meusShapes.find(x=>x.id===b.dataset.id); if(!sh) return;
    if(b.dataset.a==="abrir") abrirNoEditor(JSON.parse(JSON.stringify(sh)));
    if(b.dataset.a==="dup"){const c=JSON.parse(JSON.stringify(sh));c.id=novoId();c.titulo=(c.titulo||"")+" (cópia)";meusShapes.push(c);salvarLista();renderEditor();}
    if(b.dataset.a==="del"){ if(b.dataset.ok){meusShapes=meusShapes.filter(x=>x.id!==sh.id);salvarLista();if(ED.id===sh.id)ED.id=null;renderEditor();status("Shape excluído.","ok");}
      else{b.dataset.ok="1";b.textContent="Confirmar";setTimeout(()=>{if(b.isConnected){delete b.dataset.ok;b.textContent="Excluir";}},3000);} }
  });
}
function status(msg,tipo){const el=$("edStatus");el.textContent=msg;el.className="status"+(tipo?" "+tipo:"");}
const novoId=()=>"s"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
function salvarLista(){ if(!store.set("meus",meusShapes)) status("Não foi possível salvar neste navegador. Exporte o arquivo para não perder o trabalho.","erro"); }
function lerForm(){
  ED.titulo=$("edTitulo").value.trim(); ED.descricao=$("edDesc").value.trim(); ED.comentarios=$("edComent").value.trim();
  ED.area=$("edArea").value;
  ED.semRotulo=$("edSemRot").checked;
}
function salvar(comoNovo){
  lerForm();
  const limpo=recorte(ED);
  if(!limpo.titulo) limpo.titulo="Shape sem título";
  if(comoNovo||!limpo.id) limpo.id=novoId();
  const i=meusShapes.findIndex(x=>x.id===limpo.id);
  if(i>=0) meusShapes[i]=limpo; else meusShapes.push(limpo);
  ED=JSON.parse(JSON.stringify(limpo)); $("edTitulo").value=ED.titulo;
  salvarLista(); renderEditor(); status(`"${limpo.titulo}" salvo neste navegador.`,"ok");
}
function clicarCasa(s,f){
  snap();
  const i=ED.dots.findIndex(d=>d.s===s&&d.f===f), d=ED.dots[i];
  if(ferramenta==="x"){ if(i>=0) ED.dots.splice(i,1); else hist.pop(); }
  else if(ferramenta==="txt"){
    const t=$("edTxt").value.trim();
    if(d){ if(t) d.t=t; else delete d.t; } else if(t) ED.dots.push({s,f,k:"n",t});
  } else {
    if(d&&d.k===ferramenta) ED.dots.splice(i,1);
    else if(d) d.k=ferramenta;
    else ED.dots.push({s,f,k:ferramenta});
    if(ferramenta==="r"&&!(d&&d.k==="r"&&false)){
      const ins=B.INSTRUMENTOS[ED.instrumento], alvo=B.pc(ins.midi[s]+f), atual=B.tonica(ED.tonica);
      if(atual.pc!==alvo){
        const bemol=/b/.test(atual.n), op=B.TONICAS.filter(x=>x.pc===alvo);
        const t=op.find(x=>bemol?/b/.test(x.n):!/b/.test(x.n))||op[0];
        ED.tonica=t.n; $("edTonica").value=t.n; status(`Tom do shape mudou para ${nomeNota(t.n)}.`,"ok");
      }
    }
  }
  renderEditor();
}
function gerar(){
  const e=escala($("gEscala").value), ins=B.INSTRUMENTOS[ED.instrumento], t=B.tonica(ED.tonica), s=+$("gCorda").value;
  snap(); lerForm();
  if($("gArea").value==="todo"){ ED.casaInicial=0; ED.casas=ins.casas+1; ED.dots=dotsDeEscala(e,B.notasJanela(e,ins.midi,t,0,ins.casas,false)); }
  else { const p=B.posicao(e,ins.midi,s,t); ED.casaInicial=p.lo; ED.casas=5; ED.dots=dotsDeEscala(e,p.dots); }
  if(!ED.titulo){ED.titulo=`${t.n} ${e.nome}`;}
  sincronizarForm(); renderEditor(); status(`Preenchido com ${e.nome} em ${nomeNota(t.n)}.`,"ok");
}
function baixar(nome,conteudo,tipoMime){
  const blob=conteudo instanceof Blob?conteudo:new Blob([conteudo],{type:tipoMime||"text/plain;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=nome;document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);
}
const slug=s=>(s||"shape").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"shape";
function quebrar(txt,max){
  const out=[];
  String(txt||"").split(/\n/).forEach(par=>{let l="";par.split(/\s+/).forEach(w=>{if(!w)return;if((l+" "+w).trim().length>max){if(l)out.push(l);l=w;}else l=(l+" "+w).trim();});out.push(l);});
  while(out.length&&!out[out.length-1]) out.pop();
  return out;
}
function svgParaArquivo(){
  lerForm();
  const tmp=document.createElement("div");tmp.innerHTML=svgShape(recorte(ED),false);
  const svg=tmp.querySelector("svg"), vb=svg.viewBox.baseVal, cs=getComputedStyle(document.documentElement);
  const cor=v=>cs.getPropertyValue("--"+v).trim()||"#000";
  let interno=svg.outerHTML.replace(/var\(--([\w-]+)\)/g,(m,v)=>cor(v)).replace(/ style="[^"]*"/,"").replace(/ role="img"/,"");
  const W=Math.max(vb.width,520), pad=24, fonte='font-family="IBM Plex Sans,Arial,sans-serif"';
  let y=pad, partes="";
  if(ED.titulo){partes+=`<text x="${pad}" y="${y+22}" ${fonte} font-size="22" font-weight="700" fill="${cor("fg")}">${E(ED.titulo)}</text>`;y+=34;}
  if(ED.descricao){quebrar(ED.descricao,Math.floor((W-pad*2)/7.5)).forEach(l=>{partes+=`<text x="${pad}" y="${y+14}" ${fonte} font-size="14" fill="${cor("muted")}">${E(l)}</text>`;y+=20;});y+=6;}
  const xD=Math.round((W-vb.width)/2);
  interno=interno.replace("<svg",`<svg x="${xD}" y="${y}" width="${vb.width}" height="${vb.height}"`);
  y+=vb.height;
  const linhas=quebrar(ED.comentarios,Math.floor((W-pad*2-24)/7.6));
  if(linhas.length){
    const hBox=linhas.length*21+44;
    partes+=`<rect x="${pad}" y="${y+8}" width="${W-pad*2}" height="${hBox}" rx="10" fill="${cor("chip")}"/>`;
    partes+=`<text x="${pad+14}" y="${y+32}" ${fonte} font-size="12" font-weight="700" letter-spacing="1.2" fill="${cor("muted")}">COMENTÁRIOS</text>`;
    linhas.forEach((l,i)=>{partes+=`<text x="${pad+14}" y="${y+56+i*21}" ${fonte} font-size="15" fill="${cor("fg")}">${E(l)}</text>`;});
    y+=hBox+16;
  }
  const H=y+pad;
  const s=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${ED.titulo?`<title>${E(ED.titulo)}</title>`:""}<rect width="100%" height="100%" fill="${cor("panel")}"/>${partes}${interno}</svg>`;
  return {s,w:W,h:H};
}
function baixarPng(){
  const {s,w,h}=svgParaArquivo(), img=new Image();
  img.onload=()=>{const c=document.createElement("canvas");c.width=w*2;c.height=h*2;const x=c.getContext("2d");x.scale(2,2);x.drawImage(img,0,0);
    c.toBlob(b=>b?baixar(slug(ED.titulo)+".png",b):status("Não foi possível gerar o PNG.","erro"),"image/png");};
  img.onerror=()=>status("Não foi possível gerar o PNG.","erro");
  img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(s);
}
function exportarShapes(){
  const m=new Map((window.SHAPES||[]).map(s=>[s.id,s])); meusShapes.forEach(s=>m.set(s.id,s));
  const lista=[...m.values()];
  baixar("shapes.js",`/*\n  SHAPES PUBLICADOS PELO PROFESSOR\n  Gerado pelo Modo edição em ${new Date().toLocaleString("pt-BR")}.\n  Substitua shapes.js por este arquivo e envie para o GitHub.\n  Para tirar um shape do site, apague o bloco dele aqui.\n*/\nwindow.SHAPES = ${JSON.stringify(lista,null,2)};\n`,"text/javascript;charset=utf-8");
  status(`Arquivo shapes.js exportado com ${lista.length} shape(s).`,"ok");
}
function importar(file){
  const r=new FileReader();
  r.onload=()=>{
    try{
      const txt=String(r.result), a=txt.indexOf("["), z=txt.lastIndexOf("]");
      const arr=JSON.parse(txt.slice(a,z+1));
      if(!Array.isArray(arr)) throw 0;
      let n=0;
      for(const sh of arr){ if(!sh||!Array.isArray(sh.dots)) continue; if(!sh.id) sh.id=novoId();
        const i=meusShapes.findIndex(x=>x.id===sh.id); if(i>=0) meusShapes[i]=sh; else meusShapes.push(sh); n++; }
      salvarLista(); renderEditor(); status(`${n} shape(s) importado(s).`,"ok");
    }catch(e){status("Não consegui ler o arquivo. Use um shapes.js exportado por este site.","erro");}
  };
  r.readAsText(file);
}

/* nova escala */
function previewEscala(){
  const el=$("nsPrev"), f=$("nsFormula").value;
  if(!f.trim()){el.textContent="";el.className="status";return null;}
  try{const ivs=B.lerFormula(f);const t=B.tonica("C");
    el.textContent=`Em Dó: ${ivs.map(i=>B.soletrar(t,i.lb)).join(" ")} (${ivs.length} notas)`;el.className="status ok";return ivs;}
  catch(e){el.textContent=e.message;el.className="status erro";return null;}
}
function salvarEscala(){
  const nome=$("nsNome").value.trim(), ivs=previewEscala();
  if(!nome){$("nsPrev").textContent="Dê um nome para a escala.";$("nsPrev").className="status erro";return;}
  if(!ivs) return;
  const lbs=ivs.map(i=>i.lb), caract=$("nsCaract").value.trim().split(/[\s,]+/).filter(Boolean);
  const ruim=caract.find(c=>!lbs.includes(c));
  if(ruim){$("nsPrev").textContent=`"${ruim}" não está na fórmula.`;$("nsPrev").className="status erro";return;}
  let id="u-"+slug(nome); while(ESCMAP.has(id)&&!minhasEscalas.find(x=>x.id===id)) id+="-2";
  const nova={id,nome,grupo:$("nsGrupo").value.trim()||"Minhas escalas",formula:lbs.join(" "),caract,origem:$("nsOrigem").value.trim(),uso:$("nsUso").value.trim()};
  const i=minhasEscalas.findIndex(x=>x.id===id); if(i>=0) minhasEscalas[i]=nova; else minhasEscalas.push(nova);
  store.set("escalas",minhasEscalas); compilar(); atualizarSelectsEscala(); renderListaEscalas();
  $("nsPrev").textContent=`Escala "${nome}" salva. Ela já aparece nas listas de escalas.`;$("nsPrev").className="status ok";
}
function renderListaEscalas(){
  $("nsLista").innerHTML=minhasEscalas.map(e=>`<li><span>${E(e.nome)} <span class="mini">${E(e.formula)}</span></span><div>
    <button class="btn" data-ea="edit" data-id="${E(e.id)}">Editar</button><button class="btn perigo" data-ea="del" data-id="${E(e.id)}">Excluir</button></div></li>`).join("");
  $("nsLista").querySelectorAll("[data-ea]").forEach(b=>b.onclick=()=>{
    const e=minhasEscalas.find(x=>x.id===b.dataset.id); if(!e) return;
    if(b.dataset.ea==="edit"){$("nsNome").value=e.nome;$("nsGrupo").value=e.grupo;$("nsFormula").value=e.formula;$("nsCaract").value=(e.caract||[]).join(" ");$("nsOrigem").value=e.origem||"";$("nsUso").value=e.uso||"";previewEscala();}
    else{ if(b.dataset.ok){minhasEscalas=minhasEscalas.filter(x=>x.id!==e.id);store.set("escalas",minhasEscalas);compilar();atualizarSelectsEscala();renderListaEscalas();}
      else{b.dataset.ok="1";b.textContent="Confirmar";} }
  });
  $("nsGrupos").innerHTML=[...new Set(ESC.map(e=>e.grupo))].map(g=>`<option value="${E(g)}">`).join("");
}
function exportarEscalas(){
  const m=new Map((window.ESCALAS_EXTRA||[]).map(e=>[e.id,e])); minhasEscalas.forEach(e=>m.set(e.id,e));
  baixar("escalas-extra.js",`/*\n  ESCALAS EXTRAS\n  Gerado pelo Modo edição em ${new Date().toLocaleString("pt-BR")}.\n  Substitua escalas-extra.js por este arquivo e envie para o GitHub.\n*/\nwindow.ESCALAS_EXTRA = ${JSON.stringify([...m.values()],null,2)};\n`,"text/javascript;charset=utf-8");
}
function atualizarSelectsEscala(){
  preencherEscalas($("eEscala"),$("eEscala").value); preencherEscalas($("gEscala"),$("gEscala").value);
  const fams=familias(); const v=$("fFam").value;
  $("fFam").innerHTML=fams.map(f=>`<option value="${E(f.id)}">${E(f.nome)}</option>`).join(""); if(fams.find(f=>f.id===v)) $("fFam").value=v;
}

/* ---------- navegação ---------- */
const VIEWS=["curiosidades","escalas","familias","harmonia","acordes","campo","arpejos","caged","professor","editor"];
function editorVisivel(){return CFG.mostrarEditor||location.hash==="#editor"||store.get("editorDesbloqueado",false);}
function rota(){
  let v=location.hash.slice(1); if(!VIEWS.includes(v)) v="escalas";
  if(v==="editor") store.set("editorDesbloqueado",true);
  $("abaEditor").hidden=!editorVisivel();
  VIEWS.forEach(x=>{$("v-"+x).hidden=x!==v;});
  document.querySelectorAll(".abas a").forEach(a=>a.classList.toggle("ativa",a.dataset.v===v));
  renderAtual(v);
}
function renderAtual(v){
  v=v||location.hash.slice(1)||"escalas";
  if(v==="escalas") renderEscalas();
  else if(v==="curiosidades") window.CURIOS&&CURIOS.render();
  else if(v==="familias") renderFamilias();
  else if(v==="harmonia") window.HARMONIA&&HARMONIA.render();
  else if(v==="acordes") window.ACORDES&&ACORDES.render();
  else if(v==="campo") window.CAMPO&&CAMPO.render();
  else if(v==="arpejos") window.ARPEJOS&&ARPEJOS.render();
  else if(v==="caged"){renderCaged(CAGED_MAIOR,"cMaj","cTblM",false);renderCaged(CAGED_MENOR,"cMin","cTblm",true);window.ACORDES&&ACORDES.renderCaged();}
  else if(v==="professor") renderProfessor();
  else if(v==="editor") renderEditor();
  else renderEscalas();
}
function renderSeg(){document.querySelectorAll("#segRotulo button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.v===rotulo)));}

/* ---------- início ---------- */
function iniciar(){
  document.title=CFG.titulo; {const m=/^(.*?)(box)$/i.exec(CFG.titulo);$("tituloSite").innerHTML=m?`${E(m[1])}<span class="box">${E(m[2])}</span>`:E(CFG.titulo);} $("subtitulo").textContent=CFG.subtitulo||"";
  $("rodapeCopy").textContent=`© ${new Date().getFullYear()} ${CFG.titulo}`+(CFG.professor?` · Material de ${CFG.professor}`:"");
  $("rodapeSite").textContent=CFG.site||"scalebox.app.br";
  compilar();
  if(errosEscalas.length) console.warn("Escalas com erro:",errosEscalas);
  preencherEscalas($("eEscala"),"dorico"); preencherEscalas($("gEscala"),"dorico");
  document.querySelectorAll(".sel-instr").forEach(s=>preencherInstr(s,CFG.instrumentoPadrao));
  preencherTonicas($("eTonica"),"A"); preencherTonicas($("fTonA"),"G"); preencherTonicas($("fTonB"),"C");
  preencherTonicas($("cMaj"),"C"); preencherTonicas($("cMin"),"A"); preencherTonicas($("edTonica"),"A");
  atualizarSelectsEscala(); $("fFam").value="maior";
  document.querySelectorAll(".legenda").forEach(l=>legenda(l,l.dataset.tipo));
  ["eEscala","eTonica","eInstr"].forEach(id=>$(id).onchange=renderEscalas);
  ["fFam","fInstr","fTonA","fTonB"].forEach(id=>$(id).onchange=renderFamilias);
  $("cMaj").onchange=$("cMin").onchange=()=>renderAtual("caged");
  document.querySelectorAll("#segRotulo button").forEach(b=>b.onclick=()=>{rotulo=b.dataset.v;store.set("rotulo",rotulo);renderSeg();renderAtual();});
  renderSeg();
  $("pImprimir").onclick=()=>window.print();
  $("btnImprimir").onclick=()=>{prepararImpressao();window.print();};
  window.addEventListener("beforeprint",prepararImpressao);

  // editor
  ED=store.get("rascunho",null)||Object.assign(novoShape(),{titulo:"",tonica:"A"});
  if(!ED.dots.length){const e=escala("dorico"),t=B.tonica("A"),p=B.posicao(e,B.INSTRUMENTOS[ED.instrumento].midi,0,t);ED.casaInicial=p.lo;ED.dots=dotsDeEscala(e,p.dots);}
  sincronizarForm();
  document.querySelectorAll(".tool").forEach(b=>b.onclick=()=>{ferramenta=b.dataset.t;
    document.querySelectorAll(".tool").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));
    $("txtWrap").hidden=ferramenta!=="txt"; if(ferramenta==="txt") $("edTxt").focus();});
  document.querySelector('.tool[data-t="n"]').setAttribute("aria-pressed","true");
  document.querySelectorAll('.tool:not([data-t="n"])').forEach(b=>b.setAttribute("aria-pressed","false"));
  $("edBoard").addEventListener("click",ev=>{const h=ev.target.closest(".hit");if(h)clicarCasa(+h.dataset.s,+h.dataset.f);});
  $("edTitulo").oninput=$("edDesc").oninput=()=>{lerForm();guardarRascunho();};
  $("edComent").oninput=()=>{lerForm();guardarRascunho();$("edPrintComent").textContent=ED.comentarios||"";};
  $("edSemRot").onchange=()=>{lerForm();renderEditor();};
  $("edArea").onchange=()=>{lerForm();renderEditor();};
  $("edInstr").onchange=()=>{snap();ED.instrumento=$("edInstr").value;preencherCordas();renderEditor();};
  $("edTonica").onchange=()=>{snap();ED.tonica=$("edTonica").value;renderEditor();};
  $("edDesfazer").onclick=()=>{const h=hist.pop();if(h){ED=JSON.parse(h);sincronizarForm();renderEditor();}else status("Nada para desfazer.");};
  document.addEventListener("keydown",ev=>{if((ev.ctrlKey||ev.metaKey)&&ev.key==="z"&&location.hash==="#editor"&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){ev.preventDefault();$("edDesfazer").click();}});
  $("edLimpar").onclick=()=>{snap();ED.dots=[];renderEditor();status("Bolinhas apagadas. Use Desfazer se precisar.");};
  $("edNovo").onclick=()=>{snap();const i=ED.instrumento;ED=novoShape();ED.instrumento=i;sincronizarForm();renderEditor();status("Novo shape em branco.");};
  $("edSalvar").onclick=()=>salvar(false);
  $("edSalvarNovo").onclick=()=>salvar(true);
  $("edPng").onclick=baixarPng;
  $("edSvg").onclick=()=>baixar(slug(ED.titulo)+".svg",svgParaArquivo().s,"image/svg+xml");
  $("edExport").onclick=exportarShapes;
  $("edImport").onchange=ev=>{const f=ev.target.files[0];if(f)importar(f);ev.target.value="";};
  $("gBtn").onclick=gerar;
  $("nsFormula").oninput=previewEscala; $("nsSalvar").onclick=salvarEscala; $("nsExport").onclick=exportarEscalas;
  renderListaEscalas();

  if(window.HARMONIA){
    preencherTonicas($("hTon"),"C");
    const API=({rotulo:()=>rotulo,texto,familias,escala:id=>ESCMAP.get(id),instr:k=>B.INSTRUMENTOS[k]||B.INSTRUMENTOS.violao,
      segHarm:()=>{const b=document.querySelector("#hAc button[aria-pressed=true]");return b?b.dataset.v:"tet";},
      abrirEscala:(id,ton,ins)=>{if(!ESCMAP.has(id))return;$("eEscala").value=id;const t=B.TONICAS.find(x=>x.n===ton)||B.TONICAS.find(x=>x.pc===B.tonica(ton).pc)||B.TONICAS.find(x=>x.pc===(()=>{const l=B.LETRAS.indexOf(ton[0]);let a=0;for(const c of ton.slice(1))a+=c==="#"?1:-1;return B.pc([0,2,4,5,7,9,11][l]+a);})());if(t)$("eTonica").value=t.n;$("eInstr").value=ins;location.hash="escalas";window.scrollTo(0,0);}});
    HARMONIA.iniciar(API);
    if(window.ACORDES){preencherTonicas($("aTon"),"C");preencherTonicas($("chTon"),"C");preencherTonicas($("crTon"),"C");preencherTonicas($("arTon"),"C");ACORDES.iniciar(API);}
  }
  window.addEventListener("hashchange",rota);
  rota();
}
function prepararImpressao(){
  const v=location.hash.slice(1)||"escalas", ins=id=>B.INSTRUMENTOS[$(id).value].nome;
  let t="";
  if(v==="escalas"){const e=escala($("eEscala").value);t=`${nomeNota($("eTonica").value)} · ${e.nome} · ${ins("eInstr")}`;}
  else if(v==="familias"){const f=familias().find(x=>x.id===$("fFam").value);t=`${f?f.nome:"Famílias de modos"} · ${ins("fInstr")}`;}
  else if(v==="harmonia"){t=HARMONIA.titulo();}
  else if(v==="acordes"){t=ACORDES.titulo();}
  else if(v==="campo"){t=CAMPO.titulo();}
  else if(v==="arpejos"){t=ARPEJOS.titulo();}
  else if(v==="caged"){t=`CAGED · ${nomeNota($("cMaj").value)} maior e ${nomeNota($("cMin").value)} menor`;}
  else if(v==="curiosidades"){t=window.CURIOS?CURIOS.titulo():"Curiosidades";}
  else if(v==="professor"){t=CFG.professor?`Shapes de ${CFG.professor}`:"Shapes do professor";}
  else if(v==="editor"){lerForm();t=ED.titulo||"Shape";}
  $("printTitulo").textContent=t;
  $("printRodape").textContent=`${CFG.titulo} · ${location.host||""}${location.pathname.replace(/index\.html$/,"")}`.replace(/ · $/,"");
}
function guardarRascunho(){store.set("rascunho",ED);}
const _render=renderEditor; renderEditor=function(){_render();guardarRascunho();};
iniciar();
})();
