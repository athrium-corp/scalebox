/* Aba "Desafio do braço": treino para decorar onde fica cada nota. Não precisa editar este arquivo. */
(function(){
const B=window.BRACO, $=id=>document.getElementById(id);
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const GTR=[40,45,50,55,59,64], N=6;
const NAT=[0,2,4,5,7,9,11];
const NOMES={0:["C"],1:["C#","Db"],2:["D"],3:["D#","Eb"],4:["E"],5:["F"],6:["F#","Gb"],7:["G"],8:["G#","Ab"],9:["A"],10:["A#","Bb"],11:["B"]};
let API=null, modo="achar", cordas=new Set([0,1,2,3,4,5]), q=null, resp=null, placar=null, relogio=null, travado=false, iniciado=false;

const cfg=()=>{const [lo,hi]=$("dsCasas").value.split("-").map(Number);return {lo,hi,todas:$("dsNotas").value==="todas",tempo:+$("dsTempo").value,som:$("dsSom").checked};};
const rot=()=>API?API.rotulo():"cifra";
function nomeDe(n){const t=B.TONICAS.find(x=>x.n===n);return rot()==="solf"?B.soletrar(t,"1",true):n.replace("#","♯").replace(/b$/,"♭");}
function nomePc(pc,grafia){const op=NOMES[pc];return nomeDe(grafia!=null?op[grafia%op.length]:op[0]);}
function botaoPc(pc){const op=NOMES[pc];return op.map(nomeDe).join(" / ");}
const novoPlacar=()=>({ok:0,erro:0,seq:0,melhor:0,tempos:[],inicio:performance.now(),fim:null});
function recorde(chave,v){try{const k="scalebox.desafio."+chave,a=+localStorage.getItem(k)||0;if(v!=null&&v>a){localStorage.setItem(k,String(v));return {valor:v,novo:true};}return {valor:a,novo:false};}catch(e){return {valor:0,novo:false};}}
const chaveRec=()=>{const c=cfg();return `${modo}.${c.lo}-${c.hi}.${c.todas?"t":"n"}.${c.tempo}.${[...cordas].sort().join("")}`;};

function sortear(){
  const c=cfg(), cs=[...cordas]; if(!cs.length) return null;
  for(let tent=0;tent<50;tent++){
    const s=cs[Math.floor(Math.random()*cs.length)], f=c.lo+Math.floor(Math.random()*(c.hi-c.lo+1)), pc=B.pc(GTR[s]+f);
    if(!c.todas&&!NAT.includes(pc)) continue;
    if(q&&q.s===s&&q.pc===pc) continue;
    return {s,f,pc,grafia:Math.floor(Math.random()*2),t0:performance.now()};
  }
  return null;
}
function posicoes(pc,s){const c=cfg(),out=[];for(let f=c.lo;f<=c.hi;f++)if(B.pc(GTR[s]+f)===pc)out.push(f);return out;}
function todasPosicoes(pc){const c=cfg(),out=[];for(let s=0;s<N;s++)for(let f=c.lo;f<=c.hi;f++)if(B.pc(GTR[s]+f)===pc)out.push({s,f});return out;}

function tocar(s,f){if(!cfg().som||!window.SOM)return;SOM.nota(GTR[s]+f,SOM.agora()+.01,{vel:.8});}
function responder(certo,extra){
  if(travado) return; travado=true;
  const dt=(performance.now()-q.t0)/1000;
  if(certo){placar.ok++;placar.seq++;placar.melhor=Math.max(placar.melhor,placar.seq);placar.tempos.push(dt);}
  else{placar.erro++;placar.seq=0;}
  resp={certo,...extra};
  render();
  setTimeout(()=>{if(!placar||placar.fim)return;resp=null;travado=false;q=sortear();render();},certo?650:1500);
}
function cliqueCasa(s,f){
  if(!placar||placar.fim||travado||modo!=="achar")return;
  tocar(s,f);
  if(s!==q.s) return; // só vale a corda destacada
  const certo=B.pc(GTR[s]+f)===q.pc;
  responder(certo,{s,f});
}
function cliqueNota(pc){
  if(!placar||placar.fim||travado||modo!=="nomear")return;
  tocar(q.s,q.f);
  responder(pc===q.pc,{pc});
}
function comecar(){
  placar=novoPlacar();q=sortear();resp=null;travado=false;iniciado=true;
  clearInterval(relogio);
  const c=cfg();
  if(c.tempo){relogio=setInterval(()=>{if(!placar)return;const r=c.tempo-(performance.now()-placar.inicio)/1000;
    const el=$("dsRelogio");if(el)el.textContent=Math.max(0,Math.ceil(r))+"s";
    if(r<=0){clearInterval(relogio);terminar();}},200);}
  render();
}
function terminar(){if(!placar)return;placar.fim=performance.now();clearInterval(relogio);travado=false;resp=null;render();}
function reiniciarPorConfig(){clearInterval(relogio);placar=null;q=null;resp=null;iniciado=false;render();}

function svgBraco(){
  const c=cfg(), dots=[];
  if(q&&modo==="nomear"&&!resp) dots.push({s:q.s,f:q.f,kind:"char",text:"?"});
  if(resp){
    if(modo==="achar"){
      if(!resp.certo) dots.push({s:resp.s,f:resp.f,kind:"extra",text:"✕"});
      todasPosicoes(q.pc).forEach(p=>dots.push({s:p.s,f:p.f,kind:p.s===q.s?"root":"dot",text:nomePc(q.pc,q.grafia)}));
    } else {
      todasPosicoes(q.pc).forEach(p=>dots.push({s:p.s,f:p.f,kind:p.s===q.s&&p.f===q.f?(resp.certo?"hi":"root"):"dot",text:nomePc(q.pc)}));
    }
  }
  let svg=B.desenhar({midi:GTR,lo:c.lo,hi:c.hi,min:c.hi-c.lo+1,dots,editavel:modo==="achar"&&!!placar&&!placar.fim,fw:c.hi-c.lo>8?54:72,label:"Braço do desafio"});
  // destaca a corda pedida
  if(q&&placar&&!placar.fim){
    const fw=c.hi-c.lo>8?54:72, nF=c.hi-c.lo+1, W=56+nF*fw+14, y=22+(N-1-q.s)*36;
    svg=svg.replace(/(<rect [^>]*fill="var\(--board\)"\/>)/,`$1<rect x="52" y="${y-15}" width="${W-62}" height="30" rx="8" fill="var(--accent)" opacity=".14"/>`);
  }
  return svg;
}
function render(){
  const out=$("dsOut"); if(!out) return;
  if(location.hash!=="#desafio"&&relogio&&placar&&!placar.fim){/* continua contando só na aba */}
  const c=cfg(), ins=B.INSTRUMENTOS.violao;
  let h="";
  if(!placar){
    const rec=recorde(chaveRec());
    h=`<article class="card campo-cab ds-intro">
      <div class="cc-head"><div><span class="eyebrow">Desafio do braço</span><span class="ac-grande">Decore o braço</span></div>${rec.valor?`<span class="badge-campo">Seu recorde: ${rec.valor}</span>`:""}</div>
      <p class="lead">${modo==="achar"?"O site pede uma nota numa corda e você clica na casa certa.":"Aparece uma bolinha no braço e você diz que nota é."} Comece com poucas cordas e só as notas naturais, e vá abrindo o braço aos poucos. Depois de cada resposta, o braço mostra todas as posições daquela nota para você memorizar os desenhos de oitava.</p>
      <div class="cur-acoes"><button class="btn primario ds-go" id="dsGo">▶ Começar</button></div>
    </article>
    <div class="card"><div class="board ds-braco">${svgBraco()}</div></div>`;
    out.innerHTML=h; $("dsGo").onclick=comecar; return;
  }
  const tot=placar.ok+placar.erro, prec=tot?Math.round(placar.ok/tot*100):0;
  const med=placar.tempos.length?(placar.tempos.reduce((a,b)=>a+b,0)/placar.tempos.length).toFixed(1):"—";
  if(placar.fim){
    const pontos=placar.ok*10+placar.melhor*2-placar.erro*3, rec=recorde(chaveRec(),c.tempo?Math.max(0,pontos):placar.melhor);
    h=`<article class="card campo-cab ds-fim">
      <div class="cc-head"><div><span class="eyebrow">Resultado</span><span class="ac-grande">${c.tempo?Math.max(0,pontos)+" pontos":placar.ok+" acertos"}</span></div>${rec.novo?`<span class="badge-campo ds-novo">Novo recorde!</span>`:`<span class="badge-campo">Recorde: ${rec.valor}</span>`}</div>
      <div class="ds-stats">${stat("Acertos",placar.ok)}${stat("Erros",placar.erro)}${stat("Precisão",prec+"%")}${stat("Melhor sequência",placar.melhor)}${stat("Tempo médio",med+"s")}</div>
      <div class="cur-acoes"><button class="btn primario" id="dsGo">▶ Jogar de novo</button></div></article>`;
    out.innerHTML=h; $("dsGo").onclick=comecar; return;
  }
  const corda=`${N-q.s}ª corda`;
  const pergunta=modo==="achar"?`Onde está o <b class="ds-alvo">${E(nomePc(q.pc,q.grafia))}</b> na <b>${corda}</b>?`:`Que nota é essa na <b>${corda}</b>, casa <b>${q.f}</b>?`;
  const fb=resp?(resp.certo?`<span class="ds-fb ok">Certo!</span>`:`<span class="ds-fb erro">${modo==="achar"?`Era na casa ${posicoes(q.pc,q.s).join(" ou ")}`:`Era ${E(botaoPc(q.pc))}`}</span>`):"";
  h=`<div class="ds-painel card">
      <div class="ds-pergunta"><span class="eyebrow">${modo==="achar"?"Encontre a nota":"Que nota é essa?"}</span><p>${pergunta}</p>${fb}</div>
      <div class="ds-stats">${c.tempo?`<div class="ds-stat ds-tempo"><b id="dsRelogio">${Math.max(0,Math.ceil(c.tempo-(performance.now()-placar.inicio)/1000))}s</b><small>restam</small></div>`:""}${stat("Acertos",placar.ok)}${stat("Erros",placar.erro)}${stat("Sequência",placar.seq)}${stat("Precisão",tot?prec+"%":"—")}</div>
    </div>
    <div class="card"><div class="board ds-braco${modo==="achar"?" ed-board":""}">${svgBraco()}</div>
    ${modo==="nomear"?`<div class="ds-notas">${(c.todas?[...Array(12).keys()]:NAT).map(pc=>`<button class="ds-nota${resp&&resp.pc===pc?(resp.certo?" ok":" erro"):""}${resp&&!resp.certo&&pc===q.pc?" certa":""}" data-pc="${pc}">${E(botaoPc(pc))}</button>`).join("")}</div>`:""}
    <div class="acoes"><button class="btn" id="dsParar">Encerrar</button><span class="nota">${modo==="achar"?"Clique na casa da corda destacada.":"Clique no nome da nota."}</span></div></div>`;
  out.innerHTML=h;
  out.querySelectorAll(".hit").forEach(r=>r.onclick=()=>cliqueCasa(+r.dataset.s,+r.dataset.f));
  out.querySelectorAll(".ds-nota").forEach(b=>b.onclick=()=>cliqueNota(+b.dataset.pc));
  $("dsParar").onclick=terminar;
}
const stat=(t,v)=>`<div class="ds-stat"><b>${E(String(v))}</b><small>${E(t)}</small></div>`;
function iniciar(api){
  API=api; if(!$("dsCordas")) return;
  $("dsCordas").insertAdjacentHTML("beforeend",[0,1,2,3,4,5].reverse().map(s=>`<button class="ds-corda" data-s="${s}" aria-pressed="true">${N-s}</button>`).join(""));
  $("dsCordas").querySelectorAll(".ds-corda").forEach(b=>b.onclick=()=>{const s=+b.dataset.s;
    if(cordas.has(s)){if(cordas.size===1)return;cordas.delete(s);}else cordas.add(s);
    b.setAttribute("aria-pressed",String(cordas.has(s)));reiniciarPorConfig();});
  document.querySelectorAll("#dsModo button").forEach(b=>b.onclick=()=>{modo=b.dataset.v;document.querySelectorAll("#dsModo button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));reiniciarPorConfig();});
  ["dsCasas","dsNotas","dsTempo"].forEach(id=>$(id).onchange=reiniciarPorConfig);
  window.addEventListener("hashchange",()=>{if(location.hash!=="#desafio"&&placar&&!placar.fim){clearInterval(relogio);placar=null;q=null;resp=null;}});
}
window.DESAFIO={iniciar,render};
})();
