/* Aba Harmonia: do básico ao avançado. Usa BRACO (braco.js) e o HARM_API exposto por app.js. */
(function(){
const B=window.BRACO, $=id=>document.getElementById(id), E=B.esc;
const ROM=["I","II","III","IV","V","VI","VII"];
const TIPOS={
  "maior":{nome:"Maior",formula:"1 2 3 4 5 6 7",fam:"maior",off:0,func:["T","SD","T","SD","D","T","D"],menor:false},
  "menor":{nome:"Menor natural",formula:"1 2 b3 4 5 b6 b7",fam:"maior",off:5,func:["T","SD","T","SD","D","SD","D"],menor:true},
  "menor-harmonica":{nome:"Menor harmônica",formula:"1 2 b3 4 5 b6 7",fam:"menor-harmonica",off:0,func:["T","SD","T","SD","D","SD","D"],menor:true},
  "menor-melodica":{nome:"Menor melódica",formula:"1 2 b3 4 5 6 7",fam:"menor-melodica",off:0,func:["T","SD","T","SD","D","SD","D"],menor:true},
  "maior-harmonica":{nome:"Maior harmônica",formula:"1 2 3 4 5 b6 7",fam:"maior-harmonica",off:0,func:["T","SD","T","SD","D","T","D"],menor:false},
};
const FUNC={T:"Tônica",SD:"Subdominante",D:"Dominante"};
const TRI={"4,7":"","3,7":"m","3,6":"°","4,8":"+","4,6":"(b5)","3,8":"m(#5)"};
const TET={"4,7,11":"7M","3,7,10":"m7","4,7,10":"7","3,6,10":"m7(b5)","3,6,9":"°7","3,7,11":"m(7M)","4,8,11":"7M(#5)","4,8,10":"7(#5)","4,6,10":"7(b5)","3,8,10":"m7(#5)","4,6,11":"7M(b5)"};
const L3={3:"b3",4:"3"},L5={6:"b5",7:"5",8:"#5"},L7={9:"bb7",10:"b7",11:"7"};
const T9={1:"b9",2:"9",3:"#9"},T11={5:"11",6:"#11",4:"b11"},T13={8:"b13",9:"13",10:"#13"};

/* dicionário de acordes: [sufixo, fórmula, descrição, escalas sugeridas] */
const ACORDES=[
 ["Tríades",[
  ["","1 3 5","Maior. Som estável e alegre.",["jonio","lidio","mixolidio"]],
  ["m","1 b3 5","Menor. Som mais triste ou introspectivo.",["eolio","dorico","frigio"]],
  ["°","1 b3 b5","Diminuto. Tenso, pede resolução.",["locrio"]],
  ["+","1 3 #5","Aumentado. Suspenso, usado como passagem.",["tons-inteiros","lidio-aumentado"]],
  ["sus2","1 2 5","Sem terça, som aberto.",["mixolidio","dorico"]],
  ["sus4","1 4 5","Sem terça. A 4ª costuma resolver na 3ª.",["mixolidio"]]]],
 ["Tétrades (com 7ª)",[
  ["7M","1 3 5 7","Maior com sétima maior. Suave, muito usado em MPB e bossa nova.",["jonio","lidio"]],
  ["7","1 3 5 b7","Dominante. Pede resolução uma quinta abaixo.",["mixolidio","lidio-dominante"]],
  ["m7","1 b3 5 b7","Menor com sétima. O IIm, IIIm e VIm do campo maior.",["dorico","eolio","frigio"]],
  ["m7(b5)","1 b3 b5 b7","Meio-diminuto. O VII do campo maior e o II do campo menor.",["locrio","locrio-2"]],
  ["°7","1 b3 b5 bb7","Diminuto com sétima. Simétrico: o desenho se repete a cada 3 casas.",["diminuta-ts","ultralocrio"]],
  ["m(7M)","1 b3 5 7","Menor com sétima maior. O Im da menor harmônica e da melódica.",["menor-melodica","menor-harmonica"]],
  ["7M(#5)","1 3 #5 7","Maior aumentado com sétima maior. Aparece na menor harmônica e melódica.",["lidio-aumentado","jonio-5"]],
  ["6","1 3 5 6","Maior com sexta. Substitui o 7M no I grau.",["jonio"]],
  ["m6","1 b3 5 6","Menor com sexta. Som dórico, muito usado na bossa nova.",["dorico","menor-melodica"]],
  ["7sus4","1 4 5 b7","Dominante suspenso.",["mixolidio"]]]],
 ["Com tensões",[
  ["add9","1 3 5 9","Tríade maior com nona, sem sétima.",["jonio","lidio"]],
  ["6(9)","1 3 5 6 9","Acorde final típico da bossa nova.",["jonio","lidio"]],
  ["7M(9)","1 3 5 7 9","7M com nona. Brilhante.",["jonio","lidio"]],
  ["7M(#11)","1 3 5 7 #11","Som lídio.",["lidio"]],
  ["m7(9)","1 b3 5 b7 9","Menor com nona. Soul, R&B, MPB.",["dorico","eolio"]],
  ["m7(11)","1 b3 5 b7 11","Menor com décima primeira. Som aberto e moderno.",["dorico","eolio"]],
  ["7(9)","1 3 5 b7 9","Dominante com nona. Funk, soul, MPB.",["mixolidio","lidio-dominante"]],
  ["7(13)","1 3 5 b7 13","Dominante com décima terceira.",["mixolidio"]],
  ["7(#11)","1 3 5 b7 #11","Lídio dominante: a escala nordestina.",["lidio-dominante"]],
  ["7(b9)","1 3 5 b7 b9","Dominante que resolve em acorde menor.",["frigio-dominante","diminuta-st"]],
  ["7(#9)","1 3 5 b7 #9","Dominante com nona aumentada (o “acorde Hendrix”).",["alterada","diminuta-st"]],
  ["7(b13)","1 3 5 b7 b13","Dominante com décima terceira menor.",["mixolidio-b6","alterada"]],
  ["7(alt)","1 3 b7 b9 #9 #11 b13","Dominante alterado: todas as tensões alteradas.",["alterada"]]]],
];

let H=null; // api de app.js
const objNota=(nome)=>{const l=B.LETRAS.indexOf(nome[0]);let acc=0;for(const c of nome.slice(1))acc+=c==="#"?1:c==="b"?-1:0;return {n:nome,pc:B.pc([0,2,4,5,7,9,11][l]+acc),l};};
const nota=(t,lb)=>objNota(B.soletrar(t,lb,false));
const nomeN=(n)=>H.rotulo()==="solf"?B.soletrar(n,"1",true):n.n;
const labelSemi=(m,s)=>m[s]||null;

function campo(tipoId,t,modo){
  const tp=TIPOS[tipoId], ivs=B.lerFormula(tp.formula), s=ivs.map(i=>i.semi);
  const fam=H.familias().find(f=>f.id===tp.fam);
  return ivs.map((iv,d)=>{
    const rel=k=>B.pc(s[(d+k)%7]-s[d]);
    const r=nota(t,iv.lb), t3=rel(2),t5=rel(4),t7=rel(6);
    const acc=iv.lb.replace(/\d+/,"");
    const triSuf=TRI[`${t3},${t5}`]??"?", tetSuf=TET[`${t3},${t5},${t7}`]??"?";
    const suf=modo==="tri"?triSuf:tetSuf;
    const lbs=["1",L3[t3]||"3",L5[t5]||"5"]; if(modo!=="tri") lbs.push(L7[t7]||"7");
    let tens=[];
    if(modo==="ten"){
      const ct=[0,t3,t5,t7];
      [[rel(1),T9],[rel(3),T11],[rel(5),T13]].forEach(([x,m])=>{const lb=m[x];if(!lb)return;const evita=ct.some(c=>B.pc(x-c)===1);tens.push({lb,evita});});
    }
    const modoEsc=fam?fam.modos[(tp.off+d)%7]:null;
    return {d,grau:acc+ROM[d],suf,nome:r.n+suf,root:r,lbs,tens,func:tp.func[d],modo:modoEsc,triSuf,tetSuf};
  });
}
function acordeEsc(lbs){return {ivs:B.lerFormula(lbs.join(" ")),caract:[],base:null};}
function boards(root,lbs,tensLbs){
  const ins=H.instr($("hInstr").value), s=+$("hCorda").value;
  const esc=acordeEsc(lbs), p=B.posicao(esc,ins.midi,Math.min(s,ins.midi.length-1),root);
  const dots=p.dots.map(d=>({...d,kind:d.semi===0?"root":(tensLbs&&tensLbs.includes(d.lb))?"char":"dot",text:H.texto(root,d.lb)}));
  return B.desenhar({midi:ins.midi,lo:p.lo,hi:p.hi,dots});
}
const chipsF=lbs=>lbs.map(l=>`<b class="${l==="1"?"r":/^(b|#)?(9|11|13)$/.test(l)?"c":""}">${E(l)}</b>`).join("");
const fnChip=f=>`<span class="fn fn-${f}">${f} · ${FUNC[f]}</span>`;
const sec=(id,nivel,titulo,intro,corpo)=>`<section class="card hsec" id="${id}"><div class="hcab"><span class="nivel nv-${nivel[0]}">${nivel}</span><h2>${titulo}</h2></div><p class="nota">${intro}</p>${corpo}</section>`;
const acTxt=(c)=>`<span class="ac">${E(nomeN(c.root)+c.suf)}</span>`;

function render(){
  if(!H) return;
  const t=B.tonica($("hTon").value), tipoId=$("hTipo").value, tp=TIPOS[tipoId], modo=H.segHarm();
  const C=campo(tipoId,t,modo), C4=campo(tipoId,t,"tet");
  const tomNome=`${nomeN(t)} ${tp.nome.toLowerCase()}`;
  let html="";

  /* 1. intervalos */
  const INT=[["1","Uníssono","0"],["b2","2ª menor","1"],["2","2ª maior","2"],["b3","3ª menor","3"],["3","3ª maior","4"],["4","4ª justa","5"],["#4","4ª aumentada / 5ª diminuta","6"],["5","5ª justa","7"],["b6","6ª menor","8"],["6","6ª maior","9"],["b7","7ª menor","10"],["7","7ª maior","11"]];
  html+=sec("h-int","Básico","Intervalos","A distância entre duas notas. É a base de tudo: escalas e acordes são combinações de intervalos. Cada casa do braço é um semitom.",
   `<div class="tabwrap"><table class="tab"><thead><tr><th>Símbolo</th><th>Nome</th><th>Semitons</th><th>A partir de ${E(nomeN(t))}</th></tr></thead><tbody>${INT.map(([l,n,s])=>`<tr><td><b class="mono">${l}</b></td><td>${n}</td><td class="mono">${s}</td><td class="mono">${E(H.rotulo()==="solf"?B.soletrar(t,l,true):B.soletrar(t,l))}</td></tr>`).join("")}</tbody></table></div>
    <p class="nota">Tensões: a 9ª é a 2ª uma oitava acima, a 11ª é a 4ª e a 13ª é a 6ª. Por isso 9, 11 e 13 aparecem nos acordes com tensões.</p>`);

  /* 2. formação de acordes */
  const sel=$("hAcorde")?$("hAcorde").value:"7";
  let ac=null;ACORDES.forEach(([,l])=>l.forEach(a=>{if(a[0]===sel)ac=a;}));ac=ac||ACORDES[1][1][1];
  const acLbs=ac[1].split(" "), tensL=acLbs.filter(l=>/^(b|#)?(9|11|13)$/.test(l));
  const opts=ACORDES.map(([g,l])=>`<optgroup label="${g}">${l.map(a=>`<option value="${E(a[0])}"${a[0]===ac[0]?" selected":""}>${E(nomeN(t)+a[0])}</option>`).join("")}</optgroup>`).join("");
  const escs=ac[3].map(id=>H.escala(id)).filter(Boolean);
  html+=sec("h-ac","Básico → Avançado","Formação de acordes","Acordes são intervalos tocados juntos. Escolha um tipo e veja a fórmula, as notas, o arpejo no braço e as escalas que combinam com ele.",
   `<div class="hrow"><label>Acorde <select id="hAcorde">${opts}</select></label></div>
    <div class="info-ac"><div><h4>Fórmula</h4><div class="formula">${chipsF(acLbs)}</div></div>
    <div><h4>Notas</h4><div class="formula notas">${acLbs.map(l=>`<b>${E(H.rotulo()==="solf"?B.soletrar(t,l,true):B.soletrar(t,l))}</b>`).join("")}</div></div>
    <div><h4>Como soa</h4><p>${E(ac[2])}</p></div>
    <div><h4>Escalas que combinam</h4><p>${escs.map(e=>`<button class="link" data-esc="${E(e.id)}" data-ton="${E(t.n)}">${E(e.nome)}</button>`).join(" · ")||"—"}</p></div></div>
    <div class="board">${boards(t,acLbs,tensL)}</div>`);

  /* 3. campo harmônico */
  const modoTxt={tri:"tríades",tet:"tétrades (acordes com 7ª)",ten:"tétrades com tensões"}[modo];
  html+=sec("h-campo","Básico","Campo harmônico",`Os acordes que nascem de cada nota da escala, empilhando terças (1, 3, 5, 7). Aqui: ${E(tomNome)} em ${modoTxt}.`,
   `<div class="seq">${C.map(c=>`<div class="seq-i"><span class="mono">${E(c.grau+c.suf)}</span>${acTxt(c)}</div>`).join("")}</div>
    <div class="grid-campo">${C.map(c=>`<article class="campo-card">
      <div class="cc-top"><span class="mono grau">${E(c.grau+c.suf)}</span>${acTxt(c)}</div>
      <div class="cc-meta">${fnChip(c.func)}</div>
      <div class="formula">${chipsF(c.lbs)}</div>
      <p class="nota">Notas: <b>${c.lbs.map(l=>E(H.rotulo()==="solf"?B.soletrar(c.root,l,true):B.soletrar(c.root,l))).join(" ")}</b>${c.modo?` · Escala: <button class="link" data-esc="${E(c.modo.id)}" data-ton="${E(c.root.n)}">${E(c.modo.nome)}</button>`:""}</p>
      ${modo==="ten"?`<p class="nota">Tensões: ${c.tens.map(x=>`<span class="mono ${x.evita?"evita":"tens"}">${E(x.lb)}${x.evita?" (evitar)":""}</span>`).join(" ")}</p>`:""}
      <div class="board">${boards(c.root,modo==="ten"?c.lbs.concat(c.tens.filter(x=>!x.evita).map(x=>x.lb)):c.lbs,c.tens.map(x=>x.lb))}</div>
    </article>`).join("")}</div>`);

  /* 4. funções e cadências */
  const grupos=["T","SD","D"].map(f=>`<div class="fgrupo">${fnChip(f)}<div>${C4.filter(c=>c.func===f).map(c=>`<span class="pill"><span class="mono">${E(c.grau+c.suf)}</span> ${acTxt(c)}</span>`).join("")}</div></div>`).join("");
  const g=i=>C4[i];
  const V7=tp.menor?{grau:"V",suf:"7",root:C4[4].root}:g(4);
  const cad=[["Perfeita (autêntica)","V7 → I","A mais conclusiva. A dominante resolve na tônica.",[V7,g(0)]],
    ["Plagal","IV → I","O “amém” das igrejas. Mais suave que a perfeita.",[g(3),g(0)]],
    ["Interrompida (deceptiva)","V7 → VI","A dominante resolve no VI em vez do I. Cria surpresa.",[V7,g(5)]],
    ["Meia cadência","II → V","Termina na dominante. Soa como pergunta, pede continuação.",[g(1),V7]]];
  html+=sec("h-func","Intermediário","Funções harmônicas e cadências","Cada acorde tem uma função: tônica (repouso), subdominante (afastamento) e dominante (tensão que pede volta à tônica). Cadência é o jeito de terminar uma frase.",
   `<div class="fgrupos">${grupos}</div>
    <div class="tabwrap"><table class="tab"><thead><tr><th>Cadência</th><th>Graus</th><th>No tom</th><th>Efeito</th></tr></thead><tbody>${cad.map(([n,gr,ef,cs])=>`<tr><td><b>${n}</b></td><td class="mono">${gr}</td><td>${cs.map(acTxt).join(" → ")}</td><td>${ef}</td></tr>`).join("")}</tbody></table></div>
    ${tp.menor?`<p class="nota">No tom menor, o V vira acorde dominante (V7) pegando a 7ª maior da menor harmônica. Por isso as cadências usam ${E(nomeN(C4[4].root))}7.</p>`:""}`);

  /* 5. progressões */
  const PROG=tp.menor?[[[0,3,4],"Base de muitas músicas em tom menor."],[[1,4,0],"O II–V–I menor, comum no jazz e na bossa nova (use V7)."],[[0,5,2,6],"Pop e rock em tom menor."],[[0,6,5,4],"Cadência andaluza, típica do flamenco (use V7 no final)."],[[0,5,6,0],"Som épico, muito usado no rock e no metal."],[[0,3,0,4],"Blues menor simplificado."]]
    :[[[0,3,4],"A base do rock, do forró e do sertanejo."],[[0,4,5,3],"A progressão mais usada no pop."],[[1,4,0],"O II–V–I, a cadência principal do jazz e da bossa nova."],[[0,5,1,4],"Ciclo clássico dos standards e da música dos anos 50."],[[0,5,3,4],"Doo-wop e baladas."],[[3,4,2,5],"Comum no pop asiático e em baladas."],[[0,3,0,4],"Blues de 12 compassos em forma resumida."]];
  html+=sec("h-prog","Intermediário","Progressões comuns","Sequências de acordes que aparecem em muitas músicas. Toque cada uma no tom escolhido para treinar o ouvido e a troca de acordes.",
   `<div class="tabwrap"><table class="tab"><thead><tr><th>Graus</th><th>No tom</th><th>Onde aparece</th></tr></thead><tbody>${PROG.map(([ds,dsc])=>`<tr><td class="mono">${ds.map(d=>E(C[d].grau+C[d].suf)).join(" – ")}</td><td>${ds.map(d=>acTxt(C[d])).join(" – ")}</td><td>${dsc}</td></tr>`).join("")}</tbody></table></div>`);

  /* 6. tons vizinhos */
  const tonK=(n,menor)=>`${E(nomeN(n))} ${menor?"menor":"maior"}`;
  const rel=tp.menor?nota(t,"b3"):nota(t,"6"), dom=nota(t,"5"), sub=nota(t,"4");
  const viz=[["Relativo",tonK(rel,!tp.menor),"Mesmas notas, outra tônica."],["Homônimo",tonK(t,!tp.menor),"Mesma tônica, outro modo. Base do empréstimo modal."],["Dominante",tonK(dom,tp.menor),"Uma quinta acima. Modulação mais comum."],["Relativo da dominante",tonK(tp.menor?nota(dom,"b3"):nota(dom,"6"),!tp.menor),""],["Subdominante",tonK(sub,tp.menor),"Uma quarta acima."],["Relativo da subdominante",tonK(tp.menor?nota(sub,"b3"):nota(sub,"6"),!tp.menor),""]];
  html+=sec("h-viz","Intermediário","Tons vizinhos","Tons que compartilham quase todas as notas com o seu. São os caminhos mais naturais para modular (mudar de tom).",
   `<div class="tabwrap"><table class="tab"><tbody>${viz.map(([a,b,c])=>`<tr><td><b>${a}</b></td><td>${b}</td><td>${c}</td></tr>`).join("")}</tbody></table></div>`);

  /* 7. dominantes secundários, II–V e SubV */
  const alvos=C4.filter(c=>c.d!==0&&!/°|b5/.test(c.tetSuf));
  const linhas=alvos.map(a=>{
    const menorAlvo=/^m/.test(a.tetSuf);
    const d7=nota(a.root,"5"), ii=nota(d7,"5"), sv=nota(a.root,"b2");
    const vName=nomeN(d7)+(menorAlvo?"7(b9)":"7"), iiName=nomeN(ii)+(menorAlvo?"m7(b5)":"m7"), svName=nomeN(sv)+"7";
    return `<tr><td>${acTxt(a)} <span class="mono mini">${E(a.grau+a.suf)}</span></td><td><span class="ac">${E(vName)}</span> <span class="mono mini">V7/${E(a.grau)}</span></td><td><span class="ac">${E(iiName)}</span> → <span class="ac">${E(vName)}</span> → ${acTxt(a)}</td><td><span class="ac">${E(svName)}</span> → ${acTxt(a)}</td></tr>`;});
  html+=sec("h-dom","Avançado","Dominantes secundários, II–V e SubV","Qualquer acorde do campo (menos o diminuto) pode ganhar o seu próprio dominante. Ele fica uma quinta acima do alvo. O II–V prepara o alvo com dois acordes. O SubV (substituto tritônico) troca o dominante por um acorde 7 meio tom acima do alvo, com o mesmo trítono.",
   `<div class="tabwrap"><table class="tab"><thead><tr><th>Alvo</th><th>Dominante secundário</th><th>II–V do alvo</th><th>SubV</th></tr></thead><tbody>${linhas.join("")}</tbody></table></div>
    <p class="nota">Quando o alvo é menor, o dominante costuma levar b9 e o II vira meio-diminuto.</p>`);

  /* 8. empréstimo modal */
  const par=tp.menor?"maior":"menor", P=campo(par,t,"tet");
  const emp=P.filter((p,i)=>p.nome!==C4[i].nome);
  html+=sec("h-emp","Avançado","Empréstimo modal",`Acordes “emprestados” do tom homônimo (${tonK(t,!tp.menor)}). Dão cor sem mudar de tom. Muito usados no pop, rock, MPB e trilhas.`,
   `<div class="emp">${emp.map(p=>`<span class="pill"><span class="mono">${E(p.grau+p.suf)}</span> ${acTxt(p)}</span>`).join("")}</div>
    ${!tp.menor?`<p class="nota">Os mais usados: <b>${E(nomeN(P[3].root)+P[3].suf)}</b> (IVm), <b>${E(nomeN(P[6].root)+P[6].suf)}</b> (bVII) e <b>${E(nomeN(P[5].root)+P[5].suf)}</b> (bVI). Também aparece o bII7M (napolitano): <b>${E(nomeN(nota(t,"b2"))+"7M")}</b>.</p>`:`<p class="nota">No tom menor, os empréstimos mais comuns do maior são o IV7 (som dórico) e o V7 (já visto nas cadências).</p>`}`);

  /* 9. diminutos */
  let dimHtml="";
  if(!tp.menor){
    const D=[["#1",0,1,"Liga o I ao IIm subindo."],["#2",1,2,"Liga o IIm ao IIIm subindo."],["#4",3,4,"Liga o IV ao V subindo."],["#5",4,5,"Liga o V ao VIm subindo."],["b3",2,1,"Diminuto auxiliar: liga o IIIm ao IIm descendo."]];
    dimHtml=`<div class="tabwrap"><table class="tab"><thead><tr><th>Diminuto</th><th>Caminho</th><th>Uso</th></tr></thead><tbody>${D.map(([lb,a,b,u])=>{const r=nota(t,lb);return `<tr><td><span class="ac">${E(nomeN(r))}°7</span> <span class="mono mini">${lb.replace(/\d/,m=>ROM[+m-1])}°7</span></td><td>${acTxt(C4[a])} → <span class="ac">${E(nomeN(r))}°7</span> → ${acTxt(C4[b])}</td><td>${u}</td></tr>`;}).join("")}</tbody></table></div>`;
  } else {
    const r=nota(t,"7");
    dimHtml=`<p>No tom menor, o diminuto principal é o <b>${E(nomeN(r))}°7</b> (VII°7 da menor harmônica). Ele funciona como dominante e resolve em <b>${E(nomeN(t))}m</b>.</p>`;
  }
  html+=sec("h-dim","Avançado","Diminutos de passagem","O acorde diminuto com sétima (°7) liga dois acordes por meio tom. Ele funciona como um dominante sem a fundamental, por isso cria um movimento forte.",dimHtml+`<p class="nota">Dica: o °7 é simétrico. ${E(nomeN(t))}°7, ${E(nomeN(nota(t,"b3")))}°7, ${E(nomeN(nota(t,"b5")))}°7 e ${E(nomeN(nota(t,"6")))}°7 têm as mesmas notas.</p>`);

  $("hConteudo").innerHTML=html;
  const s=$("hAcorde"); if(s) s.onchange=render;
  $("hConteudo").querySelectorAll("[data-esc]").forEach(b=>b.onclick=()=>H.abrirEscala(b.dataset.esc,b.dataset.ton,$("hInstr").value));
}
function iniciar(api){
  H=api;
  $("hTipo").innerHTML=Object.entries(TIPOS).map(([k,v])=>`<option value="${k}">${v.nome}</option>`).join("");
  ["hTon","hTipo","hInstr","hCorda"].forEach(id=>$(id).onchange=()=>{if(id==="hInstr")cordas();render();});
  document.querySelectorAll("#hAc button").forEach(b=>b.onclick=()=>{document.querySelectorAll("#hAc button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));render();});
  document.querySelectorAll("#hNav button").forEach(b=>b.onclick=()=>{const el=$(b.dataset.alvo);if(el)el.scrollIntoView({behavior:"smooth",block:"start"});});
  cordas();
}
function cordas(){const ins=H.instr($("hInstr").value),n=ins.midi.length,v=$("hCorda").value;
  $("hCorda").innerHTML=ins.midi.slice(0,Math.min(3,n-1)).map((_,s)=>`<option value="${s}">${n-s}ª corda</option>`).join("");$("hCorda").value=(v&&+v<Math.min(3,n-1))?v:"0";}
function titulo(){const t=B.tonica($("hTon").value);return `Harmonia · ${t.n} ${TIPOS[$("hTipo").value].nome.toLowerCase()}`;}
window.HARMONIA={iniciar,render,titulo};
})();
