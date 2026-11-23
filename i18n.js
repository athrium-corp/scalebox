/* Idiomas do Scalebox. Os textos de cada idioma ficam em i18n-en.js, i18n-es.js, i18n-fr.js e i18n-ja.js.
   Cada dicionário liga o texto em português ao texto traduzido. Texto sem tradução continua em português.
   Não precisa editar este arquivo. */
(function(){
const LANGS={pt:"Português",en:"English",es:"Español",fr:"Français",ja:"日本語"};
const params=new URLSearchParams(location.search);
let lang=params.get("lang");
if(!LANGS[lang]){try{lang=localStorage.getItem("scalebox.lang");}catch(e){}}
if(!LANGS[lang]){const nav=(navigator.languages||[navigator.language||"pt"]).map(x=>String(x).slice(0,2).toLowerCase());lang=nav.find(x=>LANGS[x])||"pt";}
document.documentElement.lang=lang==="pt"?"pt-BR":lang;
const coletar=params.has("i18n");
const dict={}, pats=[], faltando=new Map(), feitos=new Set(); // feitos: textos já traduzidos (não traduz de novo)
const I=window.I18N={lang,LANGS,dict,pats,faltando,
  add(obj){Object.assign(dict,obj);},
  addPat(list){pats.push(...list);},
  set(l){try{localStorage.setItem("scalebox.lang",l);}catch(e){} const u=new URL(location.href);u.searchParams.delete("lang");location.href=u.toString();},
  t, tr};
window.t=t;
// carrega o dicionário do idioma antes dos outros scripts
if(lang!=="pt"){
  const base=(document.currentScript&&document.currentScript.src||"").replace(/[^\/]*$/,"");
  document.write(`<script src="${base}i18n-${lang}.js"><\/script>`);
}
/* t("texto com {0}", valor) para textos montados no código */
function t(s,...a){
  let out=lang==="pt"?s:(dict[s]!=null?dict[s]:s);
  if(lang!=="pt"&&dict[s]==null&&coletar) anota(s);
  return a.length?out.replace(/\{(\d)\}/g,(m,i)=>a[+i]!=null?a[+i]:""):out;
}
/* traduz um texto da página. Partes que variam (notas, acordes, números, tablaturas, graus)
   viram {0}, {1}... para que uma tradução sirva para todas as combinações. */
const AC="(?:##|bb|#|b|♯|♭)?";
const RE_TOK=new RegExp([
  "(?:Dó|Do|Ré|Re|Mi|Fá|Fa|Sol|Lá|La|Si|ド|レ|ミ|ファ|ソ|ラ|シ)"+AC+" \\([A-G]"+AC+"\\)",
  "\\d+[ªº]",
  "(?:[x\\d]+-)+[x\\d]+|(?<![A-Za-z])(?=[x\\d]*\\d)(?=[x\\d]*x)[x\\d]{3,}(?![A-Za-z])",
  "(?<![A-Za-zÀ-ÿ])(?:bb|b|#|♭|♯|♮)?\\d+(?:[.,]\\d+)?%?",
  "(?<![A-Za-zÀ-ÿ])[A-G]"+AC+"(?:m(?![a-zà-ÿ])|maj|sus|add|dim|aug|M|°|ø|\\+|\\d|\\([^)\\s]*\\)|\\/[A-G]"+AC+")*(?![a-zà-ÿA-Z])",
  "(?<![\\wÀ-ÿ])(?:VII|VI|IV|III|II|V|I|vii|vi|iv|iii|ii|v)°?(?![\\wÀ-ÿ])"
].join("|"),"g");
function ordinal(v,mod){
  const n=+v.replace(/\D/g,""), fem=mod==="m"?false:mod==="f"?true:/ª/.test(v);
  if(mod==="n") return String(n);
  if(lang==="en") return n+(n%100>=11&&n%100<=13?"th":["th","st","nd","rd"][n%10]||"th");
  if(lang==="es") return n+(fem?".ª":".º");
  if(lang==="fr") return n===1?(fem?"1re":"1er"):n+"e";
  if(lang==="ja") return n+"度";
  return v;
}
function tokeniza(texto,ambiguo){
  const toks=[];
  const k=texto.replace(RE_TOK,(m,off,str)=>{
    if(!ambiguo&&/^(A|E|Em|É)$/.test(m)&&/^ [a-zà-ÿ]/.test(str.slice(off+m.length))) return m;
    toks.push(m);return "{"+(toks.length-1)+"}";
  });
  return {k,toks};
}
function normaliza(s,ambiguo){
  if(s.indexOf("<")<0) return tokeniza(s,ambiguo);
  const toks=[];let k="";
  for(const parte of s.split(/(<[^>]+>)/)){
    if(parte.startsWith("<")){k+=parte;continue;}
    const r=tokeniza(parte,ambiguo);
    k+=r.k.replace(/\{(\d+)\}/g,(m,i)=>"{"+(toks.push(r.toks[+i])-1)+"}");
  }
  return {k,toks};
}
const render=(v,mod)=>/^\d+[ªº]$/.test(v)?ordinal(v,mod):v;
function tr(s,semRegistro){
  if(lang==="pt"&&!coletar) return null;
  const k=s.replace(/\s+/g," ").trim();
  if(!k||feitos.has(k)) return null;
  if(dict[k]!=null) return dict[k];
  for(const [re,rep] of pats){const m=k.match(re);if(m) return typeof rep==="function"?rep(m,tr):k.replace(re,rep);}
  for(const amb of [true,false]){
    const n=normaliza(k,amb);
    if(!/[A-Za-zÀ-ÿ]{2,}/.test(n.k.replace(/<[^>]+>|\{\d+\}/g,""))) return null;
    const d=dict[n.k];
    if(d!=null) return d.replace(/\{(\d+)(?::([mfn]))?\}/g,(m,i,mod)=>n.toks[+i]!=null?render(n.toks[+i],mod):"");
  }
  if(k.indexOf("<")<0&&k.indexOf(" · ")>0){
    const partes=k.split(" · ");let algum=false;
    const res=partes.map(p=>{const r=tr(p,semRegistro);if(r!=null){algum=true;return r;}return p;});
    if(algum) return res.join(" · ");
    return null;
  }
  if(coletar&&!semRegistro) anota(normaliza(k,false).k);
  return null;
}
const NOTACAO=/^(?:[\s()\/\-–—+°ø#b\d]|\{\d+\}|add|sus|maj|dim|aug|m|M|VII|VI|IV|III|II|V|I|[A-G])*$/;
function anota(k){if(NOTACAO.test(k)||/^(?:Dó|Do|Ré|Re|Mi|Fá|Fa|Sol|Lá|La|Si)(?:#|b)?$/.test(k))return; if(/[A-Za-zÀ-ÿ]{2,}/.test(k.replace(/<[^>]+>|\{\d+\}/g,"")))faltando.set(k,(faltando.get(k)||0)+1);}
const INLINE=new Set(["B","STRONG","I","EM","SMALL","CODE","A","BR","KBD","SPAN","SUP","SUB"]);
const ATTRS=["title","placeholder","aria-label","alt"];
function trTexto(node,quieto){
  const v=node.nodeValue; if(!v||!/[A-Za-zÀ-ÿ]/.test(v)) return;
  const r=tr(v,quieto);
  if(r!=null){feitos.add(r.replace(/\s+/g," ").trim());const lead=v.match(/^\s*/)[0],tail=v.match(/\s*$/)[0];const nv=lead+r+tail;if(nv!==v)node.nodeValue=nv;}

}
function rico(el){
  // elemento com texto e só marcações simples dentro (ex.: <p>texto <b>x</b> texto</p>): traduz como frase inteira
  if(!el.firstChild||el.closest("svg")) return false;
  let temTexto=false,temEl=false;
  for(const c of el.childNodes){
    if(c.nodeType===3){if(/[A-Za-zÀ-ÿ]{2,}/.test(c.nodeValue))temTexto=true;}
    else if(c.nodeType===1){if(!INLINE.has(c.tagName)||c.querySelector("svg,button,select,input"))return false;temEl=true;}
  }
  if(!temTexto||!temEl) return false;
  const k=el.innerHTML.replace(/\s+/g," ").trim();
  if(feitos.has(k)) return true;
  const r=tr(k,true);
  if(r==null&&coletar){const n=normaliza(k,false).k;if(dict[n]==null)anota("§"+n);}
  if(r!=null){el.innerHTML=r;feitos.add(el.innerHTML.replace(/\s+/g," ").trim());return true;}
  return "falhou";
}
function trEl(root,quieto){
  if(lang==="pt"&&!coletar) return;
  if(root.nodeType===3){trTexto(root,quieto);return;}
  if(root.nodeType!==1) return;
  if(root.tagName==="SCRIPT"||root.tagName==="STYLE"||root.closest&&root.closest("[data-sem-traducao]")) return;
  for(const a of ATTRS){const v=root.getAttribute&&root.getAttribute(a);if(v){const r=tr(v);if(r!=null){feitos.add(r.replace(/\s+/g," ").trim());root.setAttribute(a,r);}}}
  const rc=quieto?false:rico(root);
  if(rc===true) return;
  for(const c of [...root.childNodes]) trEl(c,quieto||rc==="falhou");
}
I.traduzir=trEl;
if(lang!=="pt"||coletar){
  const obs=new MutationObserver(ms=>{
    obs.disconnect();
    for(const m of ms){
      if(m.type==="characterData") trTexto(m.target);
      else if(m.type==="attributes") trEl(m.target);
      else m.addedNodes.forEach(n=>trEl(n.nodeType===3&&n.parentNode&&rico(n.parentNode)?n.parentNode:n));
    }
    liga();
  });
  const liga=()=>obs.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTRS});
  liga();
  document.addEventListener("DOMContentLoaded",()=>{const r=tr(document.title);if(r)document.title=r;});
}
/* seletor de idioma no topo */
document.addEventListener("DOMContentLoaded",()=>{
  const sel=document.getElementById("selIdioma"); if(!sel) return;
  sel.innerHTML=Object.entries(LANGS).map(([k,v])=>`<option value="${k}"${k===lang?" selected":""}>${v}</option>`).join("");
  sel.onchange=()=>I.set(sel.value);
});
})();
