/* Aba Acordes: dicionário com desenhos gerados automaticamente, worship e groove gospel.
   Para adicionar um tipo de acorde, copie uma linha de TIPOS.
   f = fórmula completa, v = 4 notas usadas no violão (quando a fórmula tem mais de 4), d = descrição, e = escalas que combinam. */
(function(){
const B=window.BRACO, $=id=>document.getElementById(id), E=B.esc;
const GTR=[40,45,50,55,59,64];
const NOMES=["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"];
let H=null;

const TIPOS=[
 {suf:"",g:"Tríades",f:"1 3 5",d:"Maior. Som estável e alegre.",e:["jonio","lidio","mixolidio"]},
 {suf:"m",g:"Tríades",f:"1 b3 5",d:"Menor. Som mais introspectivo.",e:["eolio","dorico","frigio"]},
 {suf:"°",g:"Tríades",f:"1 b3 b5",d:"Diminuto. Tenso, pede resolução.",e:["locrio"]},
 {suf:"+",g:"Tríades",f:"1 3 #5",d:"Aumentado. Usado como passagem.",e:["tons-inteiros"]},
 {suf:"sus2",g:"Tríades",f:"1 2 5",d:"Sem terça, som aberto. Muito usado no worship.",e:["mixolidio","jonio"]},
 {suf:"sus4",g:"Tríades",f:"1 4 5",d:"Sem terça. A 4ª costuma resolver na 3ª.",e:["mixolidio"]},
 {suf:"7M",g:"Tétrades",f:"1 3 5 7",d:"Maior com sétima maior. Suave, base da MPB e da bossa nova.",e:["jonio","lidio"]},
 {suf:"7",g:"Tétrades",f:"1 3 5 b7",d:"Dominante. Pede resolução uma quinta abaixo.",e:["mixolidio","lidio-dominante"]},
 {suf:"m7",g:"Tétrades",f:"1 b3 5 b7",d:"Menor com sétima. O IIm, IIIm e VIm do campo maior.",e:["dorico","eolio","frigio"]},
 {suf:"m7(b5)",g:"Tétrades",f:"1 b3 b5 b7",d:"Meio-diminuto. VII do campo maior, II do campo menor.",e:["locrio","locrio-2"]},
 {suf:"°7",g:"Tétrades",f:"1 b3 b5 bb7",d:"Diminuto com sétima. Simétrico: repete a cada 3 casas.",e:["diminuta-ts"]},
 {suf:"m(7M)",g:"Tétrades",f:"1 b3 5 7",d:"Menor com sétima maior. Im da menor harmônica e melódica.",e:["menor-melodica","menor-harmonica"]},
 {suf:"7M(#5)",g:"Tétrades",f:"1 3 #5 7",d:"Maior aumentado com sétima maior.",e:["lidio-aumentado"]},
 {suf:"7(#5)",g:"Tétrades",f:"1 3 #5 b7",d:"Dominante aumentado.",e:["tons-inteiros"]},
 {suf:"7(b5)",g:"Tétrades",f:"1 3 b5 b7",d:"Dominante com quinta diminuta.",e:["tons-inteiros","alterada"]},
 {suf:"6",g:"Tétrades",f:"1 3 5 6",d:"Maior com sexta. Substitui o 7M no I grau.",e:["jonio"]},
 {suf:"m6",g:"Tétrades",f:"1 b3 5 6",d:"Menor com sexta. Som dórico.",e:["dorico","menor-melodica"]},
 {suf:"7sus4",g:"Tétrades",f:"1 4 5 b7",d:"Dominante suspenso.",e:["mixolidio"]},
 {suf:"add9",g:"Com tensões",f:"1 3 5 9",d:"Maior com nona, sem sétima (o “2” do worship).",e:["jonio","lidio"]},
 {suf:"m(add9)",g:"Com tensões",f:"1 b3 5 9",d:"Menor com nona, sem sétima.",e:["eolio","dorico"]},
 {suf:"6(9)",g:"Com tensões",f:"1 3 5 6 9",v:"1 3 6 9",d:"Acorde final típico da bossa e do gospel.",e:["jonio","lidio"]},
 {suf:"m6(9)",g:"Com tensões",f:"1 b3 5 6 9",v:"1 b3 6 9",d:"Menor com sexta e nona. Som dórico sofisticado.",e:["dorico"]},
 {suf:"7M(9)",g:"Com tensões",f:"1 3 5 7 9",v:"1 3 7 9",d:"7M com nona. Brilhante, muito usado no groove gospel.",e:["jonio","lidio"]},
 {suf:"7M(#11)",g:"Com tensões",f:"1 3 5 7 #11",v:"1 3 7 #11",d:"Som lídio.",e:["lidio"]},
 {suf:"m7(9)",g:"Com tensões",f:"1 b3 5 b7 9",v:"1 b3 b7 9",d:"Menor com nona. Soul, R&B, gospel.",e:["dorico","eolio"]},
 {suf:"m7(11)",g:"Com tensões",f:"1 b3 5 b7 11",v:"1 b3 b7 11",d:"Menor com décima primeira. Aberto e moderno.",e:["dorico","eolio"]},
 {suf:"m(7M)(9)",g:"Com tensões",f:"1 b3 5 7 9",v:"1 b3 7 9",d:"Menor com sétima maior e nona.",e:["menor-melodica"]},
 {suf:"7(9)",g:"Com tensões",f:"1 3 5 b7 9",v:"1 3 b7 9",d:"Dominante com nona. Funk, soul, gospel.",e:["mixolidio","lidio-dominante"]},
 {suf:"7(13)",g:"Com tensões",f:"1 3 5 b7 13",v:"1 3 b7 13",d:"Dominante com décima terceira.",e:["mixolidio"]},
 {suf:"7sus4(9)",g:"Com tensões",f:"1 4 5 b7 9",v:"1 4 b7 9",d:"Dominante suspenso com nona, o “7(4)(9)”. Soa igual ao IV/V (ex.: F/G).",e:["mixolidio","dorico"]},
 {suf:"7(b9)",g:"Com tensões",f:"1 3 5 b7 b9",v:"1 3 b7 b9",d:"Dominante que resolve em acorde menor.",e:["frigio-dominante","diminuta-st"]},
 {suf:"7(#9)",g:"Com tensões",f:"1 3 5 b7 #9",v:"1 3 b7 #9",d:"Dominante com nona aumentada.",e:["alterada","diminuta-st"]},
 {suf:"7(#11)",g:"Com tensões",f:"1 3 5 b7 #11",v:"1 3 b7 #11",d:"Lídio dominante (escala nordestina).",e:["lidio-dominante"]},
 {suf:"7(b13)",g:"Com tensões",f:"1 3 5 b7 b13",v:"1 3 b7 b13",d:"Dominante com décima terceira menor. Muito usado no gospel para ir a um acorde menor.",e:["mixolidio-b6","alterada"]},
 {suf:"m7(9)(11)",g:"Com tensões",f:"1 b3 5 b7 9 11",v:"1 b3 b7 11",d:"Menor com nona e décima primeira (m11). Som aberto, muito usado no gospel e no soul.",e:["dorico","eolio"]},
 {suf:"7M(9)(#11)",g:"Com tensões",f:"1 3 5 7 9 #11",v:"1 3 7 #11",d:"Maior lídio completo.",e:["lidio"]},
 {suf:"7(9)(13)",g:"Com tensões",f:"1 3 5 b7 9 13",v:"1 3 b7 13",d:"Dominante com nona e décima terceira (o “13” completo).",e:["mixolidio"]},
 {suf:"7sus4(9)(13)",g:"Com tensões",f:"1 4 5 b7 9 13",v:"1 4 b7 13",d:"Dominante suspenso com nona e décima terceira.",e:["mixolidio"]},
 {suf:"7(b9)(b13)",g:"Com tensões",f:"1 3 5 b7 b9 b13",v:"1 3 b7 b13",d:"Dominante alterado que resolve em menor.",e:["frigio-dominante","alterada"]},
 {suf:"7(#9)(b13)",g:"Com tensões",f:"1 3 5 b7 #9 b13",v:"1 3 b7 #9",d:"Dominante alterado com nona aumentada e décima terceira menor.",e:["alterada"]},
 {suf:"m7(b5)(11)",g:"Com tensões",f:"1 b3 b5 b7 11",v:"1 b3 b5 b7",d:"Meio-diminuto com décima primeira.",e:["locrio","locrio-2"]},
 {suf:"m7(b5)(9)",g:"Com tensões",f:"1 b3 b5 b7 9",v:"1 b3 b5 b7",d:"Meio-diminuto com nona (som do Lócrio ♮2).",e:["locrio-2"]},
];
const TMAP=new Map(TIPOS.map(t=>[t.suf,t]));
const tons=t=>B.lerFormula(t.v||t.f);
const isTens=lb=>/^(b|#)?(9|11|13)$/.test(lb);
const objNota=n=>{const l=B.LETRAS.indexOf(n[0]);let a=0;for(const c of n.slice(1))a+=c==="#"?1:c==="b"?-1:0;return {n,pc:B.pc([0,2,4,5,7,9,11][l]+a),l};};
const nomeN=n=>H.rotulo()==="solf"?B.soletrar(n,"1",true):n.n;

/* ---------- gerador de voicings ---------- */
function resolver(cordas,tns,raizPc,baixoLb,maxSpan,f0){
  if(f0===undefined) f0=1;
  const n=cordas.length, sol=[];
  const cand=cordas.map(s=>{const a=[];for(let f=f0;f<=17;f++){const semi=B.pc(GTR[s]+f-raizPc);const t=tns.find(x=>x.semi===semi);if(t)a.push({f,lb:t.lb,m:GTR[s]+f});}return a;});
  const rec=(i,acc)=>{
    if(i===n){
      const us=new Set(acc.map(a=>a.lb));
      if(us.size!==tns.length) return;
      if(tns.length<n){const c={};for(const a of acc){c[a.lb]=(c[a.lb]||0)+1;if(c[a.lb]>1&&a.lb!=="1")return;}}
      const fr=acc.map(a=>a.f), fp=fr.filter(x=>x>0), mn=fp.length?Math.min(...fp):0, mx=Math.max(...fr);
      sol.push({acc:acc.slice(),fr,min:mn,max:mx,span:mx-mn,cordas});return;
    }
    for(const c of cand[i]){
      if(i===0&&c.lb!==baixoLb) continue;
      if(i>0&&c.m<=acc[i-1].m) continue;
      if(tns.length>=n&&acc.some(a=>a.lb===c.lb)) continue;
      if(acc.length&&acc.some(a=>Math.abs(a.f-c.f)>maxSpan)) continue;
      acc.push(c);rec(i+1,acc);acc.pop();
    }
  };
  rec(0,[]);return sol;
}
function melhor(cordas,tns,raizPc,baixoLb){
  for(const sp of [3,4]){
    const s=resolver(cordas,tns,raizPc,baixoLb,sp).filter(x=>x.min<=12);
    if(s.length){s.sort((a,b)=>a.span-b.span||a.min-b.min);return s[0];}
  }
  return null;
}
/* notas do acorde que cabem no desenho nas cordas livres (acima do baixo), dentro das casas já usadas */
function extras(v,raizPc,full){
  if(!v||v.cordas[0]!==1) return v;
  const usados=v.cordas.map((s,i)=>({s,f:v.fr[i],lb:v.acc[i].lb,m:GTR[s]+v.fr[i]}));
  const add=[];
  for(let s=v.cordas[0]+1;s<6;s++){
    if(v.cordas.includes(s)) continue;
    const todosU=[...usados,...add].sort((a,b)=>a.s-b.s);
    const baixo=[...todosU].reverse().find(x=>x.s<s), cima=todosU.find(x=>x.s>s);
    for(let f=v.min;f<=v.max;f++){
      const m=GTR[s]+f, iv=full.find(i=>i.semi===B.pc(m-raizPc));
      if(!iv) continue;
      if(baixo&&m<=baixo.m) continue; if(cima&&m>=cima.m) continue;
      // precisa caber na mão: notas na casa mais baixa contam como pestana (1 dedo)
      const fr=[...v.fr,...add.map(x=>x.f),f], dedos=fr.filter(x=>x>v.min).length+(fr.some(x=>x===v.min)?1:0);
      if(dedos>4) continue;
      add.push({s,f,lb:iv.lb,m});break;
    }
  }
  return {...v,extras:add};
}
function todos(cordas,tns,raizPc,baixoLb){return resolver(cordas,tns,raizPc,baixoLb,4).filter(x=>x.min<=12).sort((a,b)=>a.span-b.span||a.min-b.min);}

/* ---------- desenho ---------- */
function tabTxt(cordas,fr,ex){return [0,1,2,3,4,5].map(s=>{const i=cordas.indexOf(s);if(i>=0)return String(fr[i]);const x=(ex||[]).find(y=>y.s===s);return x?`(${x.f})`:"x";}).join(" ");}
function card(v,raiz,titulo,sub){
  if(!v) return `<article class="ac-card vazio-ac"><h4>${E(titulo)}</h4><p class="nota">Sem desenho confortável nesta combinação.</p></article>`;
  const lo=v.min>1?v.min-1:1, hi=Math.max(lo+4,v.max);
  const ex=v.extras||[];
  const dots=v.acc.map((a,i)=>({s:v.cordas[i],f:a.f,kind:a.lb==="1"?"root":isTens(a.lb)?"char":"dot",text:H.texto(raiz,a.lb)}))
    .concat(ex.map(x=>({s:x.s,f:x.f,kind:"extra",text:H.texto(raiz,x.lb)})));
  const muted=[0,1,2,3,4,5].filter(s=>!v.cordas.includes(s)&&!ex.some(x=>x.s===s));
  return `<article class="ac-card"><h4>${E(titulo)}</h4>${sub?`<p class="nota">${E(sub)}</p>`:""}
    <div class="board">${B.desenhar({midi:GTR,lo,hi,dots,muted,fw:54})}</div>
    <p class="tabn" title="Casas da 6ª à 1ª corda. Entre parênteses: nota opcional.">${E(tabTxt(v.cordas,v.fr,ex))}</p></article>`;
}
function nomeCifra(n){if(H.rotulo()!=="solf")return n;return n.replace(/[A-G][#b]?/g,x=>B.soletrar(objNota(x),"1",true));}

/* ---------- relativos ---------- */
function relativos(raiz,tipo){
  const pcs=new Set(B.lerFormula(tipo.f).map(i=>B.pc(raiz.pc+i.semi)));
  const iguais=[],tri=[];
  for(let r=0;r<12;r++)for(const t of TIPOS){
    if(r===raiz.pc&&t===tipo) continue;
    const s=new Set(B.lerFormula(t.f).map(i=>B.pc(r+i.semi)));
    if(s.size===pcs.size&&[...s].every(x=>pcs.has(x))) iguais.push(NOMES[r]+t.suf);
  }
  for(let r=0;r<12;r++)for(const [suf,f] of [["","1 3 5"],["m","1 b3 5"],["°","1 b3 b5"],["+","1 3 #5"]]){
    if(r===raiz.pc&&suf===tipo.suf) continue;
    if(B.lerFormula(f).every(i=>pcs.has(B.pc(r+i.semi)))) tri.push(NOMES[r]+suf);
  }
  let rel="";
  const nota=lb=>B.soletrar(raiz,lb);
  if(/^(7M|6|add9|6\(9\)|7M\(9\)|)$/.test(tipo.suf)) rel=`${nota("6")}${/^(7M|6)/.test(tipo.suf)?"m7":"m"} (relativo menor)`;
  if(/^m(7|6|\(add9\)|7\(9\)|7\(11\))?$/.test(tipo.suf)) rel=`${nota("b3")} (relativo maior)`;
  return {iguais,tri,rel};
}


/* ---------- campo harmônico por estrutura ---------- */
const ESC_CAMPO=[["maior","Maior","1 2 3 4 5 6 7",[0,4,1,5,3,2,6]],["menor","Menor natural","1 2 b3 4 5 b6 b7",[0,3,4,1,2,5,6]],["menor-harmonica","Menor harmônica","1 2 b3 4 5 b6 7",[0,4,6,3,1,2,5]],["menor-melodica","Menor melódica","1 2 b3 4 5 6 7",[0,3,6,4,1,2,5]],["maior-harmonica","Maior harmônica","1 2 3 4 5 b6 7",[0,4,3,1,2,5,6]]];
const ROM=["I","II","III","IV","V","VI","VII"];
const NAT=[0,2,4,5,7,9,11];
const passo=lb=>parseInt(lb.replace(/[b#]/g,""),10);
function rotulo(n,semi){const nat=NAT[(n-1)%7];let d=semi-nat;while(d>6)d-=12;while(d<-6)d+=12;return (d>0?"#".repeat(d):"b".repeat(-d))+n;}
function nomear(lbs){
  const get=n=>lbs.find(l=>passo(l)===n);
  const t3=get(3),t5=get(5),t7=get(7),t6=get(6),t2=get(2),t4=get(4),t9=get(9),t11=get(11),t13=get(13);
  const sus=!t3?(t4?(t4==="4"?"sus4":"sus"+t4):t2?(t2==="2"?"sus2":"sus"+t2):""):"";
  const min=t3==="b3"; let base;
  if(t7){
    if(sus) base=(t7==="7"?"7M":"7")+sus;
    else if(min) base=t5==="b5"?(t7==="bb7"?"°7":t7==="b7"?"m7(b5)":"m(7M)(b5)"):t5==="#5"?(t7==="b7"?"m7(#5)":"m(7M)(#5)"):(t7==="b7"?"m7":t7==="bb7"?"m(bb7)":"m(7M)");
    else base=t5==="#5"?(t7==="7"?"7M(#5)":"7(#5)"):t5==="b5"?(t7==="7"?"7M(b5)":"7(b5)"):(t7==="7"?"7M":t7==="bb7"?"(bb7)":"7");
  } else {
    if(sus) base=sus; else if(min) base=t5==="b5"?"°":t5==="#5"?"m(#5)":"m"; else base=t5==="#5"?"+":t5==="b5"?"(b5)":"";
    if(t6) base=(min?"m":"")+(t6==="6"?"6":"("+t6+")")+(sus&&!min?sus:"")+(min&&t5==="b5"?"(b5)":"");
  }
  const tens=[t9,t11,t13].filter(Boolean);
  if(!t7&&!t6&&tens.length===1&&t9==="9"&&!t11&&!t13) return min?"m(add9)":sus?base+"(9)":base+"add9";
  return base+tens.map(x=>`(${x})`).join("");
}
function vozDe(lbs){
  const get=n=>lbs.find(l=>passo(l)===n);
  const terc=get(3)||get(4)||get(2), set=get(7)||get(6), tens=[get(13),get(11),get(9)].filter(Boolean);
  const v=["1"]; if(terc) v.push(terc); if(set) v.push(set);
  if(tens.length&&v.length<4) v.push(tens[0]);
  for(const x of [get(5),...tens.slice(1)]) if(x&&v.length<4&&!v.includes(x)) v.push(x);
  return lbs.filter(l=>v.includes(l));
}
function tonDe(raiz,o){const sm=B.lerFormula(o.form).map(x=>x.semi),lt=(raiz.l-o.d+7)%7;let a=B.pc(raiz.pc-sm[o.d]-NAT[lt]);if(a>6)a-=12;return objNota(B.LETRAS[lt]+(a>0?"#".repeat(a):"b".repeat(-a)));}
function grafiaRuim(raiz,o){const ton=tonDe(raiz,o);return B.lerFormula(o.form).some(iv=>/bb|##|^(Fb|Cb|E#|B#)$/.test(B.soletrar(ton,iv.lb)));}
// modos de 7 notas, na ordem de preferência. O acorde escolhido é sempre o I grau do campo.
const PREF=["jonio","eolio","mixolidio","dorico","lidio","frigio","locrio","menor-harmonica","menor-melodica","maior-harmonica"];
function modos7(){
  const todos=(window.ESCALAS||[]).filter(e=>e.familia&&B.lerFormula(e.formula).length===7);
  const ord=id=>{const i=PREF.indexOf(id);return i<0?100:i;};
  return todos.sort((x,y)=>ord(x.id)-ord(y.id));
}
const NOMEM=m=>({jonio:"maior",eolio:"menor natural"})[m.id]||m.nome;
function camposPossiveis(raiz,tipo){
  const f=B.lerFormula(tipo.f), passos=f.map(i=>passo(i.lb));
  let principal=null, nucleo=null;
  for(const m of modos7()){
    const sm=B.lerFormula(m.formula).map(i=>i.semi);
    const ok=k=>B.pc(sm[(passos[k]-1)%7])===f[k].semi;
    if(!principal&&f.every((_,k)=>ok(k))) principal={id:m.id,nome:NOMEM(m),form:m.formula,d:0};
    if(!nucleo&&f.every((x,k)=>passos[k]>7||ok(k))) nucleo={id:m.id,nome:NOMEM(m),form:m.formula,d:0,alterado:true};
  }
  const op=principal||nucleo; if(!op) return [];
  const out=[op];
  // só os relativos dos campos maior e menor
  if(op.id==="jonio") out.push({id:"rel",nome:"menor natural (relativo)",form:"1 2 b3 4 5 b6 b7",d:2,relativo:true});
  if(op.id==="eolio") out.push({id:"rel",nome:"maior (relativo)",form:"1 2 3 4 5 6 7",d:5,relativo:true});
  return out;
}

/* ---------- double stops ---------- */
const DS={
  "3":{nome:"3ªs",passo:2,oit:0,pares:[[4,5],[3,4],[2,3],[1,2],[0,1]],ac:[[1,3],[3,5],[5,7]],dica:"O double stop mais usado: soa doce e cantado. Ótimo para frases de soul, country e louvor."},
  "6":{nome:"6ªs",passo:5,oit:0,pares:[[3,5],[2,4],[1,3],[0,2]],ac:[[3,8],[5,10],[7,12]],dica:"Pulando uma corda. Som aberto, típico de soul, R&B e gospel (estilo Curtis Mayfield)."},
  "4":{nome:"4ªs",passo:3,oit:0,pares:[[4,5],[3,4],[2,3],[1,2],[0,1]],ac:[[5,8],[7,10]],dica:"Som moderno e “oco”. Muito usado em fills e no rock."},
  "5":{nome:"5ªs",passo:4,oit:0,pares:[[4,5],[3,4],[2,3],[1,2],[0,1]],ac:[[1,5],[3,7]],dica:"A base do power chord. Neutra, sem definir maior ou menor."},
  "10":{nome:"10ªs",passo:9,oit:1,pares:[[0,3],[1,4],[2,5]],ac:[[1,10],[3,12],[5,14]],dica:"Uma 3ª uma oitava acima. Som cheio, ótimo com dedo (polegar no grave)."},
  "8":{nome:"Oitavas",passo:7,oit:1,pares:[[0,2],[1,3],[2,4],[3,5]],ac:[[1,8],[3,10],[5,12]],dica:"Mesma nota em duas alturas. Engrossa melodias (estilo Wes Montgomery e George Benson)."},
};
const NOME_CORDA=s=>`${6-s}ª`;
let dsInt="3", dsPar=0;
function posicoesDS(s1,s2,pcA,dist){
  const out=[];
  for(let f1=0;f1<=15;f1++){ if(B.pc(GTR[s1]+f1)!==pcA) continue;
    const f2=GTR[s1]+f1+dist-GTR[s2]; if(f2<0||f2>17||Math.abs(f2-f1)>4) continue; out.push([f1,f2]); }
  return out;
}
function renderDS(ton,op,graus){
  const D=DS[dsInt]; if(dsPar>=D.pares.length) dsPar=0;
  const [s1,s2]=D.pares[dsPar], ivs=B.lerFormula(op.form), sm=ivs.map(i=>i.semi);
  // mapa do braço: harmonização da escala no intervalo escolhido
  const dots=[], lista=[];
  ivs.forEach((iv,d)=>{
    const e=(d+D.passo)%7, dist=B.pc(sm[e]-sm[d])+12*D.oit+(D.passo===7?12:0)*0;
    const distF=D.passo===7?12:dist;
    const pA=B.pc(ton.pc+sm[d]);
    posicoesDS(s1,s2,pA,distF).forEach(([f1,f2])=>{
      dots.push({s:s1,f:f1,kind:d===0?"root":"dot",text:iv.lb});
      dots.push({s:s2,f:f2,kind:e===0?"root":"dot",text:ivs[e].lb});
    });
    lista.push(`${iv.lb}–${ivs[e].lb}`);
  });
  let h=`<h2 class="sub">Double stops deste campo</h2>
   <p class="nota">Duas notas tocadas juntas, sempre dentro da escala de ${E(nomeN(ton))} ${E(op.nome.toLowerCase())}. Escolha o intervalo e o par de cordas.</p>
   <div class="controls"><label>Intervalo <select id="dsInt">${Object.entries(DS).map(([k,v])=>`<option value="${k}"${k===dsInt?" selected":""}>${v.nome}</option>`).join("")}</select></label>
   <label>Cordas <select id="dsPar">${D.pares.map(([a,b],i)=>`<option value="${i}"${i===dsPar?" selected":""}>${NOME_CORDA(b)} e ${NOME_CORDA(a)}</option>`).join("")}</select></label>
   <span class="nota">${E(D.dica)}</span></div>
   <div class="card"><h3 class="ac-h3">Escala em ${E(D.nome.toLowerCase())} no braço inteiro</h3>
   <p class="nota">Os números são os graus da escala. Suba o braço tocando os pares em sequência: ${E(lista.join(", "))}.</p>
   <div class="board ds-braco">${B.desenhar({midi:GTR,lo:0,hi:15,dots,fw:52,muted:[0,1,2,3,4,5].filter(x=>x!==s1&&x!==s2)})}</div></div>
   <h3 class="ac-h3">Para cada acorde do campo</h3>
   <p class="nota">Pares formados só com notas do acorde: tocando qualquer um deles por cima do acorde, o som fica certo.</p>
   <div class="ac-grid campo7">`;
  graus.forEach(gr=>{
    const lbPasso=n=>gr.lbs.find(l=>passo(l)===((n-1)%7)+1)||(((n-1)%7)+1===1?"1":null);
    const itens=[];
    D.ac.forEach(([a,b])=>{
      const la=lbPasso(a), lb=lbPasso(b); if(!la||!lb) return;
      const ia=B.lerIntervalo(la).semi, ib=B.lerIntervalo(lb).semi;
      let dist=B.pc(ib-ia); if(D.oit||dist===0) dist+=12;
      const pos=posicoesDS(s1,s2,B.pc(gr.r.pc+ia),dist).filter(([f1,f2])=>Math.min(f1,f2)>=0);
      if(pos.length) itens.push({la,lb,pos});
    });
    if(!itens.length){h+=`<article class="ac-card vazio-ac"><h4>${E(nomeCifra(gr.r.n+gr.suf))}</h4><p class="nota">Sem pares deste tipo nas notas do acorde.</p></article>`;return;}
    // escolhe uma posição de cada par perto da primeira
    // escolhe a região onde todos os pares ficam mais juntos (de preferência sem corda solta)
    let esc=null,melhorNota=1e9;
    itens.flatMap(it=>it.pos).forEach(bp=>{
      const b=Math.min(...bp);
      const tentativa=itens.map(it=>it.pos.slice().sort((x,y)=>Math.abs(Math.min(...x)-b)-Math.abs(Math.min(...y)-b))[0]);
      const fr=tentativa.flat(), nota=(Math.max(...fr)-Math.min(...fr))*10+(fr.includes(0)?5:0)+Math.min(...fr)*0.1;
      if(nota<melhorNota){melhorNota=nota;esc=tentativa;}
    });
    const fr=esc.flat(), mn=Math.min(...fr), mx=Math.max(...fr);
    const lo=mn>1?mn-1:(mn===0?0:1), hi=Math.max(lo+4,mx);
    const dd=[];itens.forEach((it,i)=>{const [f1,f2]=esc[i];dd.push({s:s1,f:f1,kind:it.la==="1"?"root":"dot",text:H.texto(gr.r,it.la)});dd.push({s:s2,f:f2,kind:it.lb==="1"?"root":"dot",text:H.texto(gr.r,it.lb)});});
    h+=`<article class="ac-card${gr.d===op.d?" atual":""}"><h4>${E(nomeCifra(gr.r.n+gr.suf))}</h4><p class="nota">${E(gr.rom)}</p>
      <div class="board">${B.desenhar({midi:GTR,lo,hi,dots:dd,fw:54,muted:[0,1,2,3,4,5].filter(x=>x!==s1&&x!==s2)})}</div>
      <p class="tabn">${itens.map((it,i)=>`${it.la}–${it.lb}: ${esc[i][0]}/${esc[i][1]}`).join(" · ")}</p></article>`;
  });
  return h+`</div>`;
}

let campoSet=0, campoIdx=0, campoChave="";
function renderCampoAba(){
  let raiz=B.tonica($("chTon").value), tipo=TMAP.get($("chTipo").value)||TMAP.get("7M");
  const chave=raiz.n+"|"+tipo.suf; if(chave!==campoChave){campoChave=chave;campoIdx=0;}
  let ops=camposPossiveis(raiz,tipo), notaDim="";
  if(!ops.length){$("chOut").innerHTML=`<div class="card"><p>${E(raiz.n+tipo.suf)} tem notas que não cabem juntas em nenhuma das escalas usadas aqui (maior, menores e maior harmônica). Escolha outro acorde.</p></div>`;return;}
  const op=ops[Math.min(campoIdx,ops.length-1)];
  const ivs=B.lerFormula(op.form), sm=ivs.map(i=>i.semi);
  const ton=tonDe(raiz,op);
  const passos=B.lerFormula(tipo.f).map(i=>passo(i.lb));
  const graus=ivs.map((iv,d)=>{
    const lbs=passos.map(n=>rotulo(n,B.pc(sm[(d+n-1)%7]-sm[d])));
    const r=objNota(B.soletrar(ton,iv.lb)), suf=nomear(lbs);
    return {d,r,suf,lbs,voz:vozDe(lbs),rom:iv.lb.replace(/\d+/,"")+ROM[d]+suf};
  });
  const [cs,tSet,dSet]=SETS4[campoSet];
  // escala-mãe (mesmas notas) e acorde relativo
  const modo=(window.ESCALAS||[]).find(e=>e.id===op.id);
  let mae="";
  if(op.relativo){ mae=`Mesmas notas do campo de ${nomeN(raiz)} (relativo).`; }
  else if(modo&&modo.familia){
    const pai=(window.ESCALAS||[]).find(e=>e.familia===modo.familia&&e.grau===1);
    if(pai&&modo.grau>1){
      const ps=B.lerFormula(pai.formula).map(i=>i.semi), g=modo.grau-1, lt=(ton.l-g+7)%7;
      let a2=B.pc(ton.pc-ps[g]-NAT[lt]); if(a2>6) a2-=12;
      const pt=objNota(B.LETRAS[lt]+(a2>0?"#".repeat(a2):"b".repeat(-a2)));
      const nomePai=pai.id==="jonio"?"maior":pai.nome.toLowerCase();
      mae=`Mesmas notas de ${nomeN(pt)} ${nomePai}: ${nomeN(ton)} ${op.nome.toLowerCase()} é o ${modo.grau}º modo dessa escala.`;
    } else if(pai) mae=op.id==="jonio"?"É a escala-mãe: os outros modos (dórico, frígio…) saem dela.":`É a escala-mãe dos modos da ${pai.nome.toLowerCase()}.`;
  }
  const rel=relativos(raiz,tipo);
  const relTxt=[rel.rel?`<b>${E(nomeCifra(rel.rel))}</b>`:"",rel.iguais.length?`Mesmas notas: ${rel.iguais.map(x=>`<b>${E(nomeCifra(x))}</b>`).join(", ")}`:""].filter(Boolean).join(" · ")
    ||`Sem relativo direto. Tríades dentro dele: ${rel.tri.map(x=>`<b>${E(nomeCifra(x))}</b>`).join(", ")||"—"}`;
  const relCampo=ops.length>1?`<div class="emp">${ops.map((o,i)=>{const tn=tonDe(raiz,o).n;return `<button class="pill pbtn${i===Math.min(campoIdx,ops.length-1)?" on":""}" data-op="${i}"><span class="mono">${E(ROM[o.d])}</span> ${E(nomeCifra(tn))} ${E(o.nome.toLowerCase())}</button>`;}).join("")}</div>`:`<span class="nota">Campo relativo só existe nos campos maior e menor.</span>`;
  let h=`<article class="card campo-cab">
    <div class="cc-head"><div><span class="eyebrow">Campo harmônico</span><span class="ac-grande">${E(nomeCifra(raiz.n+tipo.suf))}</span></div>
      <span class="badge-campo">${E(nomeN(ton))} ${E(op.nome.toLowerCase())}</span></div>
    <p class="lead">É o <b>${E(graus[op.d].rom)}</b> do campo de <b>${E(nomeN(ton))} ${E(op.nome.toLowerCase())}</b>. Cada acorde abaixo foi montado com a mesma estrutura, usando só as notas da escala.</p>
    ${op.alterado?`<p class="aviso">As tensões de ${E(raiz.n+tipo.suf)} não cabem em nenhuma escala de 7 notas. O campo mostra as tensões naturais do tom, e o seu acorde é uma alteração do I grau.</p>`:""}
    <dl class="fatos">
      <div><dt>Tônica</dt><dd>${E(nomeN(ton))}</dd></div>
      <div><dt>Escala</dt><dd>${E(op.nome.replace(/^./,c=>c.toUpperCase()))}</dd></div>
      <div><dt>Estrutura</dt><dd class="mono">${E(passos.join(" · "))}</dd></div>
      <div><dt>Notas</dt><dd class="mono">${ivs.map(iv=>E(H.rotulo()==="solf"?B.soletrar(ton,iv.lb,true):B.soletrar(ton,iv.lb))).join(" ")}</dd></div>
      <div class="larga"><dt>Escala-mãe</dt><dd>${E(mae||"—")}</dd></div>
      <div class="larga"><dt>Acorde relativo</dt><dd>${relTxt}</dd></div>
      <div class="larga"><dt>Campo relativo</dt><dd>${relCampo}</dd></div>
    </dl>
    <div class="seq">${graus.map(g=>`<div class="seq-i${g.d===op.d?" on":""}"><span class="mono">${E(g.rom)}</span><span class="ac">${E(nomeCifra(g.r.n+g.suf))}</span></div>`).join("")}</div></article>
    <div class="controls"><label>Grupo de cordas <select id="chSet">${SETS4.map(([,t,d],i)=>`<option value="${i}"${i===campoSet?" selected":""}>${E(t)} · ${E(d)}</option>`).join("")}</select></label>
    <span class="nota">Nos acordes com mais de 4 notas, o desenho usa as 4 principais. As outras aparecem como bolinha vazada quando cabem (baixo na 5ª corda).</span></div>`;
  const nInv=graus[0].voz.length;
  const nomesInv=["Fundamental","1ª inversão","2ª inversão","3ª inversão"];
  for(let k=0;k<nInv;k++){
    h+=`<h3 class="ac-h3">${E(nomesInv[k])}${k?` <span class="mini mono">(baixo no ${E(graus[0].voz[k].replace(/[b#]/g,""))}º grau do acorde)</span>`:""}</h3><div class="ac-grid campo7">${graus.map(gr=>{
      const tv=B.lerFormula(gr.voz.join(" ")), full=B.lerFormula(gr.lbs.join(" ")), bass=gr.voz[k];
      const v=extras(melhor(cs,tv,gr.r.pc,bass),gr.r.pc,full);
      const nome=gr.r.n+gr.suf+(k?"/"+B.soletrar(gr.r,bass):"");
      const link=TMAP.has(gr.suf)?`<button class="link" data-dic="${E(gr.r.n)}|${E(gr.suf)}">Ver no dicionário</button>`:"";
      return card(v,gr.r,nomeCifra(nome),gr.rom).replace('class="ac-card"',gr.d===op.d?'class="ac-card atual"':'class="ac-card"').replace("</article>",link+"</article>");
    }).join("")}</div>`;
  }
  h+=renderDS(ton,op,graus);
  $("chOut").innerHTML=h;
  const di=$("dsInt"),dp=$("dsPar"),keep=()=>{const y=window.scrollY;renderCampoAba();window.scrollTo(0,y);};
  di.onchange=()=>{dsInt=di.value;dsPar=0;keep();}; dp.onchange=()=>{dsPar=+dp.value;keep();};
  const st=$("chSet"); st.onchange=()=>{campoSet=+st.value;const y=window.scrollY;renderCampoAba();window.scrollTo(0,y);};
  $("chOut").querySelectorAll("[data-op]").forEach(b=>b.onclick=()=>{campoIdx=+b.dataset.op;renderCampoAba();});
  $("chOut").querySelectorAll("[data-dic]").forEach(b=>b.onclick=()=>{const [n,suf]=b.dataset.dic.split("|");const t=B.TONICAS.find(x=>x.n===n)||B.TONICAS.find(x=>x.pc===objNota(n).pc);$("aTon").value=t.n;$("aTipo").value=suf;location.hash="acordes";window.scrollTo(0,0);});
}


/* ---------- CAGED reduzido ---------- */
// regiões das 5 formas, relativas à tônica numa corda de referência (0 = 6ª, 1 = 5ª, 2 = 4ª)
const FORMAS=[{n:"C",str:1,lo:-3,hi:0},{n:"A",str:1,lo:-1,hi:3},{n:"G",str:0,lo:-4,hi:0},{n:"E",str:0,lo:-1,hi:3},{n:"D",str:2,lo:-1,hi:3}];
// formas completas do CAGED (casa relativa à tônica na corda de referência; null = corda não tocada)
const TPL={
  "":{C:[1,[null,0,-1,-3,-2,-3]],A:[1,[null,0,2,2,2,0]],G:[0,[0,-1,-3,-3,-3,0]],E:[0,[0,2,2,1,0,0]],D:[2,[null,null,0,2,3,2]]},
  "m":{C:[1,[null,0,-2,-3,-2,-4]],A:[1,[null,0,2,2,1,0]],G:[0,[0,-2,-3,-3,0,0]],E:[0,[0,2,2,0,0,0]],D:[2,[null,null,0,2,3,1]]},
};
function cagedReduzido(raiz,tv,suf){
  const sets=tv.length>=4?[[[2,3,4,5],"Cordas 4-3-2-1"]]:[[[3,4,5],"Cordas 3-2-1"],[[2,3,4],"Cordas 4-3-2"]];
  const tpl=TPL[suf];
  if(tpl){
    // recorte exato de cada forma completa
    return ["C","A","G","E","D"].map(n=>{
      const [ref,t]=tpl[n], mn=Math.min(...t.filter(x=>x!==null));
      let r=B.pc(raiz.pc-GTR[ref]); while(r+mn<0) r+=12;
      const full=t.map(x=>x===null?null:r+x), fr=full.filter(x=>x!==null);
      const R={F:{n},lo:Math.min(...fr),hi:Math.max(...fr),full};
      const cards=sets.map(([c,nome])=>{
        const cs=c.filter(s=>full[s]!==null); if(cs.length<c.length) return {nome,v:null};
        const acc=cs.map(s=>{const f=full[s],semi=B.pc(GTR[s]+f-raiz.pc);const iv=tv.find(i=>i.semi===semi);return {f,lb:iv?iv.lb:B.PADRAO[semi]};});
        const fs=acc.map(x=>x.f), fp=fs.filter(x=>x>0);
        return {nome,v:{cordas:cs,fr:fs,acc,min:fp.length?Math.min(...fp):0,max:Math.max(...fs)}};
      });
      return {R,cards};
    }).sort((x,y)=>x.R.lo-y.R.lo);
  }
  // outros acordes: procura o desenho dentro da região de cada forma, sem repetir desenho
  const regioes=FORMAS.map(F=>{let r=B.pc(raiz.pc-GTR[F.str]);while(r+F.lo<0)r+=12;return {F,lo:r+F.lo,hi:r+F.hi};}).sort((a,b)=>a.lo-b.lo);
  const usados=new Set();
  return regioes.map(R=>{
    const cards=sets.map(([c,nome])=>{
      let sols=[];tv.forEach(iv=>{sols=sols.concat(resolver(c,tv,raiz.pc,iv.lb,4,0));});
      const dentro=(v,folga)=>v.fr.every(f=>f>=R.lo-folga&&f<=R.hi+folga)&&(R.lo<=0||v.fr.every(f=>f>0));
      const chave=v=>c.join("")+":"+v.fr.join(",");
      let pool=sols.filter(v=>dentro(v,0)&&!usados.has(chave(v))); if(!pool.length) pool=sols.filter(v=>dentro(v,1)&&!usados.has(chave(v)));
      pool.sort((a,b)=>a.span-b.span||a.max-b.max);
      const v=pool[0]||null; if(v) usados.add(chave(v));
      return {nome,v};
    });
    return {R,cards};
  });
}
function cardCaged(v,raiz,titulo,sub){
  if(!v) return `<article class="ac-card vazio-ac"><h4>${E(titulo)}</h4><p class="nota">${E(sub)} · sem desenho nesta região.</p></article>`;
  const temSolta=v.fr.includes(0), mx=Math.max(...v.fr);
  const lo=temSolta?0:(v.min>1?v.min-1:1), hi=Math.max(lo+4,mx);
  const dots=v.acc.map((a,i)=>({s:v.cordas[i],f:a.f,kind:a.lb==="1"?"root":isTens(a.lb)?"char":"dot",text:H.texto(raiz,a.lb)}));
  const muted=[0,1,2,3,4,5].filter(s=>!v.cordas.includes(s));
  const baixo=v.acc[0].lb;
  return `<article class="ac-card"><h4>${E(titulo)}</h4><p class="nota">${E(sub)} · ${E(baixo==="1"?"tônica no baixo":"baixo no "+baixo)}</p>
    <div class="board">${B.desenhar({midi:GTR,lo,hi,dots,muted,fw:54})}</div><p class="tabn">${E(tabTxt(v.cordas,v.fr))}</p></article>`;
}


function renderCagedRed(){
  if(!H||!$("crOut")) return;
  const raiz=B.tonica($("crTon").value), tipo=TMAP.get($("crTipo").value)||TMAP.get(""), tv=tons(tipo);
  let h=`<p class="nota">${TPL[tipo.suf]!==undefined?"Cada forma do CAGED (C, A, G, E, D) recortada só nas cordas agudas: as mesmas casas da forma completa, sem a pestana.":"O acorde dentro de cada uma das 5 regiões do CAGED, só nas cordas agudas."} São desenhos menores e mais leves, ótimos para tocar com banda e trocar de região rápido. Estão na ordem em que sobem pelo braço.</p><div class="ac-grid">`;
  cagedReduzido(raiz,tv,tipo.suf).forEach(({R,cards})=>{cards.forEach(({nome,v})=>{h+=cardCaged(v,raiz,`Forma ${R.F.n} · ${nomeCifra(raiz.n+tipo.suf)}`,`${nome} · casas ${Math.max(0,R.lo)}–${R.hi}`);});});
  $("crOut").innerHTML=h+`</div>`;
}

/* ---------- dicionário ---------- */
const SETS4=[[[0,2,3,4],"Tônica na 6ª corda","cordas 6, 4, 3 e 2 (drop 3)"],[[1,2,3,4],"Tônica na 5ª corda","cordas 5, 4, 3 e 2 (drop 2, forma de Lá)"],[[2,3,4,5],"Tônica na 4ª corda","cordas 4, 3, 2 e 1 (drop 2)"],[[1,3,4,5],"Tônica na 5ª corda (aberta)","cordas 5, 3, 2 e 1 (drop 3)"]];
const SETS3=[[[3,4,5],"Cordas 3-2-1"],[[2,3,4],"Cordas 4-3-2"],[[1,2,3],"Cordas 5-4-3"],[[0,1,2],"Cordas 6-5-4"]];
const NOMEBAIXO={"1":"Fundamental","3":"Baixo na 3ª","b3":"Baixo na 3ª","5":"Baixo na 5ª","b5":"Baixo na 5ª","#5":"Baixo na 5ª","7":"Baixo na 7ª","b7":"Baixo na 7ª","bb7":"Baixo na 7ª","6":"Baixo na 6ª"};
function nomeInv(raiz,tipo,lb){const base=raiz.n+tipo.suf;return lb==="1"?base:`${base}/${B.soletrar(raiz,lb)}`;}

function renderDic(){
  const raiz=B.tonica($("aTon").value), tipo=TMAP.get($("aTipo").value)||TMAP.get("7M");
  const nome=raiz.n+tipo.suf, f=B.lerFormula(tipo.f), tv=tons(tipo), r=relativos(raiz,tipo);
  const quatro=tv.length>=4;
  const chips=f.map(i=>`<b class="${i.lb==="1"?"r":isTens(i.lb)?"c":""}">${E(i.lb)}</b>`).join("");
  const notas=f.map(i=>`<b>${E(H.rotulo()==="solf"?B.soletrar(raiz,i.lb,true):B.soletrar(raiz,i.lb))}</b>`).join("");
  const escs=tipo.e.map(id=>H.escala(id)).filter(Boolean);
  let h=`<article class="card ac-cab"><div class="ac-nome"><span class="ac-grande">${E(nomeCifra(nome))}</span><span class="alias">${E(tipo.g)}</span></div>
    <div class="info-ac"><div><h4>Fórmula</h4><div class="formula">${chips}</div>${tipo.v?`<p class="nota">No violão: ${E(tipo.v)} (a 5ª costuma ser omitida)</p>`:""}</div>
    <div><h4>Notas</h4><div class="formula notas">${notas}</div></div>
    <div><h4>Como soa</h4><p>${E(tipo.d)}</p></div>
    <div><h4>Escalas que combinam</h4><p>${escs.map(e=>`<button class="link" data-esc="${E(e.id)}">${E(e.nome)}</button>`).join(" · ")||"—"}</p></div>
    <div><h4>Mesmas notas (acordes relativos)</h4><p>${r.iguais.length?r.iguais.map(x=>`<span class="pill">${E(nomeCifra(x))}</span>`).join(" "):"Nenhum outro nome com exatamente as mesmas notas."}</p>${r.rel?`<p class="nota">Relativo: <b>${E(nomeCifra(r.rel))}</b></p>`:""}</div>
    <div><h4>Tríades dentro dele</h4><p>${r.tri.length?r.tri.map(x=>`<span class="pill">${E(nomeCifra(x))}</span>`).join(" "):"—"}</p><p class="nota">Tocar uma dessas tríades por cima do baixo ${E(raiz.n)} gera o som de ${E(nome)}.</p></div></div></article>`;

  // formas principais
  h+=`<h2 class="sub">Formas principais</h2><p class="nota">A tônica no baixo, na 6ª, na 5ª e na 4ª corda.${quatro?"":" Nas tríades, a tônica aparece dobrada."} Nos desenhos com baixo na 5ª corda, a <b>bolinha vazada</b> é uma nota do acorde que cabe na mão e pode ser tocada junto (na cifra, entre parênteses).</p><div class="ac-grid">`;
  SETS4.slice(0,3).forEach(([c,t,s])=>{h+=card(extras(melhor(c,tv,raiz.pc,"1"),raiz.pc,f),raiz,t,s);});
  h+=`</div>`;

  // inversões
  h+=`<h2 class="sub">Inversões</h2><p class="nota">Cada nota do acorde no baixo, em cada grupo de cordas. A cifra mostra o baixo depois da barra.</p>`;
  if(quatro){
    SETS4.forEach(([c,t,s])=>{h+=`<h3 class="ac-h3">${E(s)}</h3><div class="ac-grid">${tv.map(iv=>card(extras(melhor(c,tv,raiz.pc,iv.lb),raiz.pc,f),raiz,nomeCifra(nomeInv(raiz,tipo,iv.lb)),NOMEBAIXO[iv.lb]||`Baixo no ${iv.lb}`)).join("")}</div>`;});
  } else {
    SETS3.forEach(([c,s])=>{h+=`<h3 class="ac-h3">${E(s)}</h3><div class="ac-grid">${tv.map(iv=>card(melhor(c,tv,raiz.pc,iv.lb),raiz,nomeCifra(nomeInv(raiz,tipo,iv.lb)),NOMEBAIXO[iv.lb]||`Baixo no ${iv.lb}`)).join("")}</div>`;});
  }

  // fragmentos
  h+=`<h2 class="sub">Fragmentos em todas as regiões</h2>`;
  if(quatro){
    const guia=tv.filter(i=>/^(b|#)?(3|7)$|^bb7$|^4$|^6$/.test(i.lb)&&i.lb!=="6"||(tipo.suf.includes("6")&&i.lb==="6"));
    const guiaLbs=new Set(guia.map(i=>i.lb));
    const subs=tv.filter(i=>!guiaLbs.has(i.lb)).map(fora=>tv.filter(i=>i!==fora));
    h+=`<p class="nota">Pedaços de 3 notas do acorde em cada grupo de 3 cordas, do grave ao agudo. Cada um mantém as notas-guia (${E([...guiaLbs].join(" e "))}), que definem o som do acorde. Use para tocar com baixista ou tecladista, ou para variar a região.</p>`;
    subs.forEach(sub=>{
      h+=`<h3 class="ac-h3">Notas ${E(sub.map(i=>i.lb).join(" · "))}</h3>`;
      SETS3.forEach(([c,s])=>{h+=`<p class="ac-sub">${E(s)}</p><div class="ac-grid">${sub.map(iv=>card(melhor(c,sub,raiz.pc,iv.lb),raiz,`${s} · baixo no ${iv.lb}`,"")).join("")}</div>`;});
    });
  } else {
    h+=`<p class="nota">Nas tríades, as inversões acima já são os fragmentos: cada grupo de 3 cordas mostra a tríade nas três posições, cobrindo o braço todo.</p>`;
  }

  // braço inteiro
  const esc={ivs:f,caract:[],base:null};
  const dots=B.notasJanela(esc,GTR,raiz,0,15,false).map(d=>({...d,kind:d.semi===0?"root":isTens(d.lb)?"char":"dot",text:H.texto(raiz,d.lb)}));
  h+=`<h2 class="sub">Todas as notas do acorde no braço</h2><div class="card"><div class="board" id="aBraco">${B.desenhar({midi:GTR,lo:0,hi:15,dots,fw:52})}</div></div>`;
  $("aDicOut").innerHTML=h;
  $("aDicOut").querySelectorAll("[data-esc]").forEach(b=>b.onclick=()=>H.abrirEscala(b.dataset.esc,raiz.n,"violao"));
}

/* ---------- controle ---------- */
function render(){ if(!H) return; renderDic(); }
function iniciar(api){
  H=api;
  const gr=new Map();TIPOS.forEach(t=>{if(!gr.has(t.g))gr.set(t.g,[]);gr.get(t.g).push(t);});
  $("aTipo").innerHTML=[...gr].map(([g,l])=>`<optgroup label="${g}">${l.map(t=>`<option value="${E(t.suf)}">${E(t.suf===""?"Maior":t.suf)}</option>`).join("")}</optgroup>`).join("");
  $("aTipo").value="7M";
  ["aTon","aTipo"].forEach(id=>$(id).onchange=render);
  if($("crTipo")){$("crTipo").innerHTML=$("aTipo").innerHTML;$("crTipo").value="";["crTon","crTipo"].forEach(id=>$(id).onchange=renderCagedRed);}
  if($("chTipo")){$("chTipo").innerHTML=$("aTipo").innerHTML;$("chTipo").value="7M";["chTon","chTipo"].forEach(id=>$(id).onchange=()=>renderCampoAba());}
}
function titulo(){return `Acordes · ${$("aTon").value}${$("aTipo").value}`;}
window.CAMPO={render:()=>{if(H)renderCampoAba();},titulo:()=>`Campo harmônico · ${$("chTon").value}${$("chTipo").value}`};
window.ACORDES={iniciar,render,titulo,renderCaged:()=>renderCagedRed(),nomear,_teste:{resolver,melhor,extras,TIPOS,objNota,GTR}};
})();
