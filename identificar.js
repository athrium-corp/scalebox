/* Aba "Identificar": o usuário marca casas no braço e o site diz que acorde é. Não precisa editar este arquivo. */
(function(){
const B=window.BRACO, $=id=>document.getElementById(id);
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let API=null, instr="violao", marc={}, escolha=0;  // marc: {corda(índice do desenho): casa}

/* ---------- teoria ---------- */
const NOME_IV=["uníssono","2ª menor","2ª maior","3ª menor","3ª maior","4ª justa","trítono","5ª justa","6ª menor","6ª maior","7ª menor","7ª maior"];
const COMP={1:"9ª menor",2:"9ª maior",3:"10ª menor",4:"10ª maior",5:"11ª justa",6:"11ª aumentada",7:"12ª justa",8:"13ª menor",9:"13ª maior",10:"14ª menor",11:"14ª maior",0:"oitava"};
function nomeIntervalo(d){ if(d===0) return "uníssono"; if(d===12) return "oitava"; if(d<12) return NOME_IV[d]; if(d<24) return COMP[d-12]; return NOME_IV[d%12]+" (mais de duas oitavas)"; }

// rótulos de cada semitom, conforme o resto do acorde
function rotular(set){
  const has=x=>set.has(x), lb={};
  const terM=has(4), term=has(3)&&!terM, sus4=!has(3)&&!has(4)&&has(5);
  const temSetima=has(10)||has(11);
  lb[0]="1";
  if(has(1)) lb[1]="b9";
  if(has(2)) lb[2]=(!terM&&!term&&!sus4)?"2":"9";
  if(has(3)) lb[3]=terM?"#9":"b3";
  if(has(4)) lb[4]="3";
  if(has(5)) lb[5]=(terM||term)?"11":"4";
  if(has(6)) lb[6]=has(7)?"#11":"b5";
  if(has(7)) lb[7]="5";
  if(has(8)) lb[8]=(has(7)||term)?"b13":"#5";
  if(has(9)) lb[9]=temSetima?"13":(term&&has(6)&&!has(10)&&!has(11))?"bb7":"6";
  if(has(10)) lb[10]="b7";
  if(has(11)) lb[11]="7";
  return lb;
}
const ACID=n=>(n.match(/[#b]/g)||[]).length+((/bb|##/.test(n))?5:0);
function melhorRaiz(pc,lbs){
  const ops=B.TONICAS.filter(t=>t.pc===pc);
  let best=ops[0],bs=1e9;
  for(const t of ops){const s=lbs.reduce((a,l)=>a+ACID(B.soletrar(t,l)),ACID(t.n)*2); if(s<bs){bs=s;best=t;}}
  return best;
}
function cifra(n){return n.replace(/b/g,"♭").replace(/#/g,"♯").replace(/^([A-G])♭/,"$1♭");}

function interpretar(notas){
  const pcs=[...new Set(notas.map(n=>n.pc))], baixo=notas[0].pc;
  const out=[];
  const raizes=new Set(pcs);
  if(pcs.length>=4) for(let r=0;r<12;r++) raizes.add(r);
  for(const r of raizes){
    const set=new Set(pcs.map(p=>B.pc(p-r)));
    const semRaiz=!set.has(0);
    if(semRaiz){
      // só aceita leitura sem tônica quando há 3ª e 7ª e todas as notas são do acorde
      if(!(set.has(3)||set.has(4))||!(set.has(10)||set.has(11))) continue;
      if(set.has(5)&&!set.has(4)&&!set.has(3)) continue;
      const lbx=rotular(new Set([0,...set]));
      if([...set].some(x=>!["3","b3","5","7","b7","9","11","13","6"].includes(lbx[x]))) continue;
    }
    set.add(0);
    const lb=rotular(set), lbs=[...set].sort((a,b)=>a-b).map(s=>lb[s]);
    let suf=window.ACORDES.nomear(lbs);
    if(lbs.includes("b5")&&!/b5|°/.test(suf)) suf+="(b5)";
    if(lbs.includes("#5")&&!/#5|\+/.test(suf)) suf+="(#5)";
    if(semRaiz&&!/^(7M\(9\)|m7\(9\)|7\(9\)|7\(13\)|7\(9\)\(13\)|m6\(9\)|6\(9\))$/.test(suf)) continue;
    const so15=lbs.every(l=>l==="1"||l==="5");
    if(so15&&!semRaiz) suf="5";
    // pontuação: menor é melhor
    let p=0;
    if(r===baixo) p-=3;
    if(set.has(3)||set.has(4)) p-=2; else if(!so15) p+=1;
    if(set.has(7)) p-=1;
    if(!set.has(7)&&(lb[8]==="b13"||lb[8]==="#5")) p+=2.5;
    if(lb[1]==="b9"&&!(set.has(10)&&set.has(4))) p+=1.5;
    if(semRaiz) p+=3.5;
    for(const l of lbs){
      if(l==="b9") p+=2.2; else if(l==="#9") p+=1.6; else if(l==="b13") p+=1.6; else if(l==="#11") p+=1.1;
      else if(l==="9"||l==="11"||l==="13") p+=.6; else if(l==="b5"||l==="#5") p+=1; else if(l==="bb7") p+=.4;
      else if(l==="2"||l==="4") p+=.8;
    }
    if(lb[3]==="b3"&&set.has(4)) p+=1;
    const raiz=melhorRaiz(r,lbs);
    const bLb=lb[B.pc(baixo-r)];
    if(bLb!=="1"&&/^(Cb|Fb|E#|B#)|bb|##/.test(B.soletrar(raiz,bLb))) p+=1.5;
    out.push({r,raiz,set,lb,lbs,suf,semRaiz,p,baixoLb:bLb,nome:raiz.n+suf+(bLb!=="1"&&!semRaiz?"/"+B.soletrar(raiz,bLb):"")});
  }
  out.sort((a,b)=>a.p-b.p);
  const vistos=new Set(), uniq=out.filter(o=>{if(vistos.has(o.nome))return false;vistos.add(o.nome);return true;});
  if(!uniq.length) return [];
  const lim=uniq[0].p+4;
  const comRaiz=uniq.filter(o=>!o.semRaiz&&o.p<=lim).slice(0,6);
  const semRaiz=uniq.filter(o=>o.semRaiz).slice(0,2);
  return [...comRaiz,...semRaiz];
}
function inversao(o){
  const b=o.baixoLb;
  if(o.semRaiz) return "Sem a tônica no acorde";
  if(b==="1") return "Posição fundamental (tônica no baixo)";
  if(b==="3"||b==="b3") return "1ª inversão (3ª no baixo)";
  if(b==="5"||b==="b5"||b==="#5") return "2ª inversão (5ª no baixo)";
  if(b==="7"||b==="b7"||b==="bb7"||(b==="6"&&!o.set.has(10)&&!o.set.has(11))) return "3ª inversão (7ª no baixo)";
  return `Baixo na ${b}`;
}
function tipoShape(notas,pcs,o){
  if(notas.length===1) return "Nota isolada";
  if(pcs===1) return "Oitavas (mesma nota)";
  if(pcs===2) return o&&o.suf==="5"?"Power chord (tônica e 5ª)":"Double stop (duas notas)";
  const falta=[];
  if(o){
    if(o.semRaiz) falta.push("tônica");
    if(!o.set.has(3)&&!o.set.has(4)&&!/sus|^5$/.test(o.suf)) falta.push("3ª");
    if(!o.set.has(6)&&!o.set.has(7)&&!o.set.has(8)) falta.push("5ª");
  }
  const set7=o&&(o.set.has(10)||o.set.has(11)||o.lb[9]==="bb7"||o.lb[9]==="6");
  const tens=o&&o.lbs.some(l=>/9|11|13/.test(l));
  const base=tens?"Acorde com extensões":set7?"Tétrade":"Tríade";
  return falta.length?`${base} · fragmento (sem ${falta.join(" e ")})`:base;
}
function caracteristicas(o){
  const s=o.set, it=[], n=lb=>B.soletrar(o.raiz,lb);
  if(s.has(4)) it.push(["3",`3ª maior (${n("3")}): define o acorde como <b>maior</b>.`]);
  else if(s.has(3)) it.push(["b3",`3ª menor (${n("b3")}): define o acorde como <b>menor</b>.`]);
  else if(o.suf==="5") it.push(["",`Sem 3ª: é um <b>power chord</b>, nem maior nem menor.`]);
  else if(o.lb[5]==="4") it.push(["4",`4ª (${n("4")}) no lugar da 3ª: acorde <b>sus4</b>, som suspenso.`]);
  else if(o.lb[2]==="2") it.push(["2",`2ª (${n("2")}) no lugar da 3ª: acorde <b>sus2</b>, som aberto.`]);
  if(s.has(7)) it.push(["5",`5ª justa (${n("5")}): dá corpo, mas não muda o nome.`]);
  else if(o.lb[6]==="b5") it.push(["b5",`5ª diminuta (${n("b5")}): ${s.has(3)?"junto com a 3ª menor forma o som <b>diminuto</b>.":"tensão que pede resolução."}`]);
  else if(o.lb[8]==="#5") it.push(["#5",`5ª aumentada (${n("#5")}): som <b>aumentado</b>, de suspense.`]);
  else if(o.suf!=="5") it.push(["",`Sem 5ª: é a nota mais comum de ser omitida e não muda o nome do acorde.`]);
  if(s.has(11)) it.push(["7",`7ª maior (${n("7")}): som de <b>7M</b>, suave e estável.`]);
  else if(s.has(10)) it.push(["b7",s.has(4)?`7ª menor (${n("b7")}) com 3ª maior: acorde <b>dominante</b>, pede resolução.`:`7ª menor (${n("b7")}): completa a tétrade.`]);
  else if(o.lb[9]==="bb7") it.push(["bb7",`7ª diminuta (${n("bb7")}): forma o <b>diminuto</b> (°7), simétrico em 3ªs menores.`]);
  else if(o.lb[9]==="6") it.push(["6",`6ª maior (${n("6")}): acorde com <b>6</b>, cor clara e sem a tensão da 7ª.`]);
  const T={"9":"9ª: cor aberta e moderna","b9":"9ª menor: tensão forte, típica de dominante","#9":"9ª aumentada: som do “acorde Hendrix”","11":"11ª: cor de acorde menor ou sus","#11":"11ª aumentada: som lídio","13":"13ª: brilho de dominante ou 7M","b13":"13ª menor: tensão escura, comum em dominante alterado"};
  for(const l of ["9","b9","#9","11","#11","13","b13"]) if(o.lbs.includes(l)) it.push([l,`${T[l]} (${n(l)}).`]);
  if(o.semRaiz) it.push(["",`A tônica (${o.raiz.n}) não está no shape. Leitura comum em jazz e quando o baixista toca a tônica.`]);
  return it;
}
function acordesDoIntervalo(a,b){
  // acordes em que as duas notas aparecem
  const T=[["",[0,4,7]],["m",[0,3,7]],["7",[0,4,7,10]],["m7",[0,3,7,10]],["7M",[0,4,7,11]],["m7(b5)",[0,3,6,10]],["°",[0,3,6]]];
  const NM={0:"tônica",3:"3ª",4:"3ª",6:"5ª",7:"5ª",10:"7ª",11:"7ª"};
  const r=[];
  for(const [suf,iv] of T) for(let root=0;root<12;root++){
    const x=B.pc(a-root), y=B.pc(b-root);
    if(iv.includes(x)&&iv.includes(y)&&x!==y){
      const t=melhorRaiz(root,["1","3","5"]);
      r.push({nome:t.n+suf,papel:`${NM[x]} e ${NM[y]}`, ok:suf.length<=2});
    }
  }
  return r.filter(x=>x.ok).slice(0,10);
}

/* ---------- tela ---------- */
function notasMarcadas(){
  const ins=B.INSTRUMENTOS[instr];
  return Object.entries(marc).map(([s,f])=>({s:+s,f,midi:ins.midi[+s]+f,pc:B.pc(ins.midi[+s]+f)})).sort((a,b)=>a.midi-b.midi||a.s-b.s);
}
function txtNota(o,pc){const lb=o?o.lb[B.pc(pc-o.r)]:null;const rot=API?API.rotulo():"int";
  if(!o) return "";
  if(rot==="int") return lb;
  return B.soletrar(o.raiz,lb,rot==="solf");}
function nomeSolto(pc){const t=melhorRaiz(pc,["1"]);const rot=API?API.rotulo():"int";return rot==="solf"?B.soletrar(t,"1",true):t.n;}
function tabTxt(){const ins=B.INSTRUMENTOS[instr];return ins.midi.map((_,s)=>marc[s]==null?"x":String(marc[s])).join(ins.midi.some((_,s)=>(marc[s]||0)>9)?"-":"");}

function render(){
  const out=$("idOut"); if(!out) return;
  const ins=B.INSTRUMENTOS[instr], notas=notasMarcadas(), pcs=new Set(notas.map(n=>n.pc));
  const ints=notas.length>=2&&pcs.size>=2&&pcs.size<=7?interpretar(notas):[];
  if(escolha>=ints.length) escolha=0;
  const o=ints[escolha];
  const dots=notas.map(n=>{const lb=o?o.lb[B.pc(n.pc-o.r)]:null;
    return {s:n.s,f:n.f,kind:o&&lb==="1"?"root":o&&["3","b3","7","b7","bb7","6"].includes(lb)?"char":"dot",text:o?txtNota(o,n.pc):nomeSolto(n.pc)};});
  const muted=ins.midi.map((_,s)=>s).filter(s=>marc[s]==null&&notas.length);
  $("idBoard").innerHTML=B.desenhar({midi:ins.midi,lo:0,hi:ins.casas,dots,editavel:true,fw:54,muted,label:"Braço para marcar notas"});
  $("idBoard").querySelectorAll(".hit").forEach(h=>h.onclick=()=>{const s=+h.dataset.s,f=+h.dataset.f;if(marc[s]===f)delete marc[s];else marc[s]=f;escolha=0;$("idTab").value=tabTxt();render();});
  if(document.activeElement!==$("idTab")) $("idTab").value=notas.length?tabTxt():"";

  if(!notas.length){out.innerHTML=`<p class="aviso">Clique nas casas do braço para montar um acorde, um fragmento, uma inversão ou um double stop. Uma nota por corda. Clique de novo na mesma casa para apagar. Casa “solta” é a corda tocada sem apertar.</p>`;return;}
  const nm=pc=>{if(!o)return nomeSolto(pc);const rot=API?API.rotulo():"int";return B.soletrar(o.raiz,o.lb[B.pc(pc-o.r)],rot==="solf");};
  const lista=notas.map(n=>`<span>${E(nm(n.pc))}<small>${E(String(ins.midi.length-n.s))}ª corda</small></span>`).join("");
  if(pcs.size===1){
    out.innerHTML=`<article class="card campo-cab"><div class="cc-head"><div><span class="eyebrow">${E(tipoShape(notas,1))}</span><span class="ac-grande">${E(nomeSolto(notas[0].pc))}</span></div></div>
      <p class="lead">${notas.length>1?"As notas marcadas são a mesma nota em oitavas diferentes. Marque mais uma nota diferente para formar um intervalo ou acorde.":"Marque pelo menos mais uma nota para formar um intervalo ou acorde."}</p><div class="id-notas">${lista}</div></article>`;return;}

  const duas=pcs.size===2&&o.suf!=="5";
  const d2=duas?notas.find(n=>n.pc!==notas[0].pc).midi-notas[0].midi:0;
  let h=`<article class="card campo-cab">
    <div class="cc-head"><div><span class="eyebrow">${E(tipoShape(notas,pcs.size,o))}</span><span class="ac-grande">${E(duas?nm(notas[0].pc)+" + "+nm(notas.find(n=>n.pc!==notas[0].pc).pc):cifra(o.nome))}</span></div>
      <span class="badge-campo">${E(duas?nomeIntervalo(d2):inversao(o))}</span></div>`;
  if(pcs.size===2){
    const [a,b]=[notas[0],notas.find(n=>n.pc!==notas[0].pc)], d=b.midi-a.midi;
    const cs=acordesDoIntervalo(a.pc,b.pc);
    h+=`<p class="lead">Intervalo de <b>${E(nomeIntervalo(d))}</b> entre ${E(nm(a.pc))} (grave) e ${E(nm(b.pc))}. ${o.suf==="5"?"Com só tônica e 5ª, o acorde não é maior nem menor: é um power chord.":"Duas notas sozinhas não fecham um acorde. Elas sugerem vários, dependendo do baixo e da harmonia em volta."}</p>
      <dl class="fatos"><div class="larga"><dt>Pode ser parte de</dt><dd>${cs.map(c=>`<b>${E(cifra(c.nome))}</b> <span class="mini-t">(${E(c.papel)})</span>`).join(" · ")}</dd></div></dl>`;
  } else {
    h+=escolha===0?`<p class="lead">Com as notas marcadas, a leitura mais provável é <b>${E(cifra(o.nome))}</b>. ${ints.length>1?"As mesmas notas também podem ser lidas como outros acordes, listados abaixo.":""}</p>`
      :`<p class="lead">Lendo as mesmas notas como <b>${E(cifra(o.nome))}</b>. A leitura mais provável continua sendo <b>${E(cifra(ints[0].nome))}</b>.</p>`;
  }
  if(!duas) h+=`<dl class="fatos">
      <div><dt>Tônica</dt><dd>${E(o.raiz.n)}${o.semRaiz?" (fora do shape)":""}</dd></div>
      <div><dt>Baixo</dt><dd>${E(nm(notas[0].pc))}</dd></div>
      <div><dt>Intervalos</dt><dd class="mono">${E(o.lbs.filter(l=>o.semRaiz?l!=="1":true).join(" · "))}</dd></div>
      <div><dt>Tablatura</dt><dd class="mono">${E(tabTxt())}</dd></div>
      <div class="larga"><dt>Notas (grave → agudo)</dt><dd><div class="id-notas">${lista}</div></dd></div>
    </dl>
    `; if(!duas) h+=`<div><span class="eyebrow">O que caracteriza este acorde</span><ul class="id-carac">${caracteristicas(o).map(([l,t])=>`<li><b class="mono id-lb">${E(l||"—")}</b><span>${t}</span></li>`).join("")}</ul></div>`;
  const noDic=!duas&&window.ACORDES&&ACORDES._teste.TIPOS.some(t=>t.suf===o.suf)&&!o.semRaiz;
  if(noDic) h+=`<div class="cur-acoes"><button class="btn primario" id="idDic">Ver ${E(cifra(o.raiz.n+o.suf))} no dicionário de acordes →</button><button class="btn" id="idCampo">Ver o campo harmônico →</button></div>`;
  h+=`</article>`;
  if(ints.length>1&&pcs.size>2){
    h+=`<section class="card"><span class="eyebrow">Também pode ser lido como</span><p class="nota" style="margin:6px 0 12px">Mesmas notas, outra tônica. As leituras “sem tônica” supõem que o baixo (ou outro instrumento) toca a tônica. Clique para ver o braço com os intervalos de cada leitura.</p><div class="id-alts">`;
    ints.forEach((x,i)=>{h+=`<button class="id-alt${i===escolha?" on":""}" data-i="${i}"><b>${E(cifra(x.nome))}</b><small>${E(x.semRaiz?"sem tônica":inversao(x).split(" (")[0])}</small></button>`;});
    h+=`</div></section>`;
  }
  out.innerHTML=h;
  out.querySelectorAll(".id-alt").forEach(b=>b.onclick=()=>{escolha=+b.dataset.i;render();});
  if(noDic){
    const ir=(ton,tipo,hash)=>{const s=$(ton);const op=[...s.options].find(x=>x.value===o.raiz.n)||[...s.options].find(x=>B.tonica(x.value).pc===o.r);if(op)s.value=op.value;$(tipo).value=o.suf;location.hash=hash;window.scrollTo(0,0);};
    $("idDic").onclick=()=>ir("aTon","aTipo","acordes");
    $("idCampo").onclick=()=>ir("chTon","chTipo","campo");
  }
}
function lerTab(txt){
  const ins=B.INSTRUMENTOS[instr], n=ins.midi.length; txt=String(txt).trim().toLowerCase();
  let p=/[\s,\-\/]/.test(txt)?txt.split(/[\s,\-\/]+/).filter(Boolean):[...txt.replace(/\s/g,"")];
  if(p.length!==n) return false;
  const m={};
  for(let i=0;i<n;i++){const v=p[i];if(v==="x"||v==="-")continue;const f=+v;if(!Number.isInteger(f)||f<0||f>ins.casas)return false;m[i]=f;}
  marc=m;escolha=0;return true;
}
function iniciar(api){
  API=api;
  const sel=$("idInstr"); if(!sel) return;
  sel.innerHTML=B.opcoesInstr();
  sel.value=instr;
  sel.onchange=()=>{instr=sel.value;marc={};escolha=0;render();};
  $("idOuvir").onclick=()=>{const n=notasMarcadas();if(n.length&&window.SOM)SOM.acorde(n.map(x=>x.midi),SOM.agora()+.03,{espaco:.03});};
  $("idLimpar").onclick=()=>{marc={};escolha=0;$("idTab").value="";render();};
  $("idTab").oninput=()=>{const v=$("idTab").value;if(!v.trim()){marc={};render();return;}if(lerTab(v)){$("idTab").classList.remove("erro");render();}else $("idTab").classList.add("erro");};
  document.querySelectorAll("#idEx button").forEach(b=>b.onclick=()=>{instr="violao";sel.value="violao";lerTab(b.dataset.t);$("idTab").value=b.dataset.t;render();});
}
window.IDENT={iniciar,render,titulo:()=>{const n=notasMarcadas();if(n.length<2)return "Identificar acorde";const i=interpretar(n);return i.length?`Identificar acorde · ${i[Math.min(escolha,i.length-1)].nome}`:"Identificar acorde";},_teste:{interpretar}};
})();
