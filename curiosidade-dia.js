/* Curiosidade do dia + aba Curiosidades. Dados em curiosidades.js (pasta dados) */
(function(){
const L=window.CURIOSIDADES||[], G=window.GUITARRISTAS||{}, B=window.BRACO;
const $=id=>document.getElementById(id);
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
if(!L.length) return;
function diaDoAno(d){d=d||new Date();const i=new Date(d.getFullYear(),0,0);return Math.floor((new Date(d.getFullYear(),d.getMonth(),d.getDate())-i)/864e5);}
const hoje=()=>(diaDoAno()-1)%L.length;
function iniciais(n){const p=n.replace(/[^\p{L}\d ]/gu," ").split(/\s+/).filter(Boolean);return ((p[0]||"?")[0]+(p.length>1?p[p.length-1][0]:"")).toUpperCase();}
function cor(n){let h=0;for(const c of n)h=(h*31+c.charCodeAt(0))%360;return h;}
function avatar(n,grande){const g=G[n]||{};const cls="cur-av"+(grande?" grande":"");
  if(g.foto) return `<img class="${cls}" src="${E(g.foto)}" alt="${E(n)}" loading="lazy">`;
  return `<span class="${cls}" style="--h:${cor(n)}" aria-hidden="true">${E(iniciais(n))}</span>`;}
const NOMES={escalas:"Escalas",acordes:"Acordes",campo:"Campo harmônico",arpejos:"Arpejos",caged:"CAGED",harmonia:"Harmonia",familias:"Famílias de modos"};
function rotuloTema(t){const [a,ton,suf]=t.split(":");
  if(a==="escalas"){const e=(window.ESCALAS||[]).concat(window.ESCALAS_EXTRA||[]).find(x=>x.id===ton);return "Escala · "+(e?e.nome:ton);}
  if(ton!==undefined) return `${NOMES[a]} · ${ton}${suf||""}`;
  return NOMES[a]||a;}
function pcDe(n){const l="CDEFGAB".indexOf(n[0]);let a=0;for(const c of n.slice(1))a+=c==="#"?1:c==="b"?-1:0;return (([0,2,4,5,7,9,11][l]+a)%12+12)%12;}
function setTon(sel,n){const s=$(sel);if(!s)return;const o=[...s.options].find(x=>x.value===n)||[...s.options].find(x=>B&&B.tonica(x.value)&&B.tonica(x.value).pc===pcDe(n));if(o)s.value=o.value;}
function irTema(t){const [a,ton,suf]=t.split(":");
  if(a==="escalas"){if($("eEscala"))$("eEscala").value=ton;}
  else if(a==="acordes"){setTon("aTon",ton);$("aTipo").value=suf||"";}
  else if(a==="campo"){setTon("chTon",ton);$("chTipo").value=suf||"";}
  else if(a==="arpejos"){setTon("arTon",ton);$("arTipo").value=suf||"";}
  if(location.hash==="#"+a) window.dispatchEvent(new HashChangeEvent("hashchange")); else location.hash=a;
  window.scrollTo(0,0);}
function ytId(u){const m=String(u||"").match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);return m?m[1]:"";}
function yt(n,tit){return "https://www.youtube.com/results?search_query="+encodeURIComponent(n+" "+tit);}
function vidDe(i){if(L[i][5])return L[i][5];const g=G[L[i][0]]||{};let v=g.video;if(Array.isArray(v)){const k=L.slice(0,i).filter(c=>c[0]===L[i][0]).length;v=v[k%v.length];}return ytId(v)||(/^[\w-]{11}$/.test(v||"")?v:"");}
function video(i){const id=vidDe(i);return id?`<div class="cur-video"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="${E(L[i][4]||(G[L[i][0]]||{}).musica||L[i][0])}" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`:"";}
function cartao(i){const [n,tit,txt,tema]=L[i];const g=G[n]||{};const mus=L[i][4]||g.musica||"",vid=vidDe(i);
  const rot=i===hoje()?"Curiosidade do dia · Dia "+(i+1)+" de "+L.length:"Dia "+(i+1)+" de "+L.length;
  return `<article class="cur-card grande">
    <div class="cur-quem">${avatar(n,true)}<div><strong>${E(n)}</strong><span>${E(g.desc||"")}</span></div></div>
    <div class="cur-corpo"><p class="eyebrow">${rot}</p><h3>${E(tit)}</h3><p>${E(txt)}</p>
    ${video(i)}
    ${mus?`<p class="cur-musica">♪ ${E(mus)}</p>`:""}
    <div class="cur-acoes"><button class="btn primario" data-tema="${E(tema)}">Estudar: ${E(rotuloTema(tema))} →</button>${vid?"":`<a class="btn" href="${yt(n,mus||tit)}" target="_blank" rel="noopener">▶ Procurar no YouTube</a>`}</div></div>
  </article>`;}
function liga(el){el.querySelectorAll("[data-tema]").forEach(b=>b.onclick=()=>irTema(b.dataset.tema));}
let atual=hoje(), filtro="";
function render(){const o=$("curOut");if(!o)return;
  const sel=$("curFiltro");
  if(sel&&!sel.options.length){sel.innerHTML=`<option value="">Todos os guitarristas</option>`+Object.keys(G).sort((a,b)=>a.localeCompare(b,"pt")).map(n=>`<option>${E(n)}</option>`).join("");sel.onchange=()=>{filtro=sel.value;render();};
    $("curAnt").onclick=()=>{atual=(atual-1+L.length)%L.length;render();};$("curProx").onclick=()=>{atual=(atual+1)%L.length;render();};$("curHojeBtn").onclick=()=>{atual=hoje();render();};}
  const idx=L.map((_,i)=>i).filter(i=>!filtro||L[i][0]===filtro);
  o.innerHTML=cartao(atual)+`<h3 class="cur-lista-tit">${filtro?E(filtro)+" · "+idx.length+" curiosidades":"Todas as "+L.length+" curiosidades"}</h3><ol class="cur-lista">${idx.map(i=>`<li${i===atual?' class="atual"':""}><button data-i="${i}"><span class="cur-n">${i+1}</span>${avatar(L[i][0])}<span><strong>${E(L[i][1])}</strong><small>${E(L[i][0])}${i===hoje()?" · hoje":""}</small></span></button></li>`).join("")}</ol>`;
  liga(o);o.querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>{atual=+b.dataset.i;render();o.scrollIntoView({behavior:"smooth"});});}
window.CURIOS={render,titulo:()=>`Curiosidade · Dia ${atual+1} · ${L[atual][0]}`};
})();
