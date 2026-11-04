/* Teoria musical e desenho do braço. Não precisa editar este arquivo. */
(function(){
const LETRAS=["C","D","E","F","G","A","B"];
const SOLF=["Dó","Ré","Mi","Fá","Sol","Lá","Si"];
const LPC=[0,2,4,5,7,9,11];
const TONICAS=[["C",0,0],["C#",1,0],["Db",1,1],["D",2,1],["Eb",3,2],["E",4,2],["F",5,3],["F#",6,3],["Gb",6,4],["G",7,4],["Ab",8,5],["A",9,5],["Bb",10,6],["B",11,6]]
  .map(([n,pc,l])=>({n,pc,l}));
const PADRAO=["1","b2","2","b3","3","4","b5","5","b6","6","b7","7"];
const INSTRUMENTOS={
  violao:{nome:"Violão / guitarra", midi:[40,45,50,55,59,64], casas:15},
  sete:{nome:"Violão 7 cordas (7ª em Dó)", midi:[36,40,45,50,55,59,64], casas:15},
  baixo4:{nome:"Baixo 4 cordas", midi:[28,33,38,43], casas:15},
  baixo5:{nome:"Baixo 5 cordas", midi:[23,28,33,38,43], casas:15},
  cavaco:{nome:"Cavaquinho (Ré Sol Si Ré)", midi:[50,55,59,62], casas:15},
  ukulele:{nome:"Ukulele (Sol Dó Mi Lá)", midi:[67,60,64,69], casas:12},
  bandolim:{nome:"Bandolim (Sol Ré Lá Mi)", midi:[55,62,69,76], casas:12},
};
const pc=m=>((m%12)+12)%12;
const tonica=n=>TONICAS.find(t=>t.n===n)||TONICAS[0];

function lerIntervalo(lb){
  const m=/^([b#♭♯]*)(\d{1,2})$/.exec(String(lb).trim());
  if(!m) return null;
  const d=+m[2]; if(d<1) return null;
  const acc=[...m[1]].reduce((a,c)=>a+((c==="#"||c==="♯")?1:-1),0);
  const off=(d-1)%7;
  return {semi:pc(LPC[off]+acc), off, lb:String(lb).trim()};
}
function soletrar(t,lb,solfejo){
  const iv=lerIntervalo(lb); if(!iv) return lb;
  const letra=(t.l+iv.off)%7, alvo=pc(t.pc+iv.semi);
  let d=pc(alvo-LPC[letra]); if(d>6) d-=12;
  return (solfejo?SOLF:LETRAS)[letra]+(d>0?"#".repeat(d):"b".repeat(-d));
}
function lerFormula(str){
  const lbs=String(str||"").trim().split(/[\s,]+/).filter(Boolean);
  if(!lbs.length) throw new Error("Escreva os intervalos, por exemplo: 1 2 b3 4 5 6 b7");
  const out=[],usados=new Map();
  for(const lb of lbs){
    const iv=lerIntervalo(lb);
    if(!iv) throw new Error(`"${lb}" não é um intervalo válido. Use números de 1 a 13 com b ou #.`);
    if(usados.has(iv.semi)) throw new Error(`"${lb}" e "${usados.get(iv.semi)}" são a mesma nota.`);
    usados.set(iv.semi,lb); out.push(iv);
  }
  if(out[0].semi!==0) throw new Error("A fórmula precisa começar com 1.");
  return out;
}
// notas de uma escala numa faixa de casas
function notasJanela(esc,midi,t,lo,hi,dedup){
  const seen=new Set(),dots=[];
  for(let s=0;s<midi.length;s++)for(let f=Math.max(0,lo);f<=hi;f++){
    const m=midi[s]+f, semi=pc(m-t.pc), iv=esc.ivs.find(i=>i.semi===semi);
    if(!iv) continue;
    if(dedup){ if(seen.has(m)) continue; seen.add(m); }
    dots.push({s,f,semi,lb:iv.lb});
  }
  return dots;
}
function casaTonica(midi,s,t,minOff){ let r=pc(t.pc-midi[s]); while(r+minOff<0) r+=12; return r; }
function posicao(esc,midi,s,t){
  const r=casaTonica(midi,s,t,-1), lo=r-1, hi=r+3;
  return {r,lo,hi,dots:notasJanela(esc,midi,t,lo,hi,true)};
}

/* desenho: dots = [{s,f,kind,text}], kind: root | dot | char | hi | extra */
function desenhar(o){
  const midi=o.midi, n=midi.length, lo=Math.max(0,o.lo), dHi=Math.max(o.hi, lo+(o.min||5)-1), nF=dHi-lo+1;
  const fw=o.fw||64, L=56, R=14, T=22, sg=36, B=58;
  const H=T+(n-1)*sg+B, W=L+nF*fw+R, base=T+(n-1)*sg;
  const sy=s=>T+(n-1-s)*sg;
  const mono='font-family="IBM Plex Mono,ui-monospace,monospace" font-weight="600"';
  let g=`<svg class="braco" viewBox="0 0 ${W} ${H}" style="max-width:${W}px" role="img" aria-label="${o.label||"Diagrama do braço"}, casas ${lo} a ${dHi}">`;
  g+=`<rect x="${L}" y="${T-10}" width="${W-L-R}" height="${base-T+20}" rx="4" fill="var(--board)"/>`;
  for(let i=0;i<=nF;i++){
    const x=L+i*fw, casa=lo+i-1, nut=(casa===0);
    if(i===0&&lo===0) continue;
    g+=`<line x1="${x}" y1="${T-10}" x2="${x}" y2="${base+10}" stroke="${nut?"var(--nut)":"var(--fret)"}" stroke-width="${nut?6:2}"/>`;
  }
  const marcas=[3,5,7,9,15,17,19,21];
  for(let f=lo;f<=dHi;f++){
    const x=L+(f-lo+.5)*fw;
    if(marcas.includes(f)) g+=`<circle cx="${x}" cy="${base+46}" r="4" fill="var(--fret)"/>`;
    if(f===12||f===24) g+=`<circle cx="${x-7}" cy="${base+46}" r="4" fill="var(--fret)"/><circle cx="${x+7}" cy="${base+46}" r="4" fill="var(--fret)"/>`;
    g+=`<text x="${x}" y="${base+32}" text-anchor="middle" ${mono} font-size="13" fill="var(--muted)">${f===0?"solta":f}</text>`;
  }
  for(let s=0;s<n;s++){
    const y=sy(s), esp=1+1.6*(n-1-s)/(n-1||1)*0+(s<n/2?0.8:0);
    g+=`<line x1="${L}" y1="${y}" x2="${W-R}" y2="${y}" stroke="var(--string)" stroke-width="${esp}"/>`;
    g+=`<text x="${L-14}" y="${y+5}" text-anchor="middle" ${mono} font-size="13" fill="var(--muted)">${n-s}</text>`;
    if(o.muted&&o.muted.includes(s)) g+=`<text x="${L-36}" y="${y+6}" text-anchor="middle" ${mono} font-size="17" fill="var(--fg)">×</text>`;
  }
  for(const d of o.dots){
    if(d.f<lo||d.f>dHi) continue;
    const x=L+(d.f-lo+.5)*fw, y=sy(d.s), t=d.text==null?"":String(d.text);
    let fill="var(--dot)",stroke="none",tc="var(--dot-fg)";
    if(d.kind==="root"){fill="var(--root)";tc="var(--on-color)";}
    else if(d.kind==="char"){fill="var(--char)";tc="var(--char-fg)";}
    else if(d.kind==="hi"){fill="var(--hi)";tc="var(--hi-fg)";}
    else if(d.kind==="extra"){fill="var(--extra-fill)";stroke="var(--extra-ring)";tc="var(--fg)";}
    g+=`<circle cx="${x}" cy="${y}" r="15.5" fill="${fill}" stroke="${stroke}" stroke-width="3"/>`;
    if(t) g+=`<text x="${x}" y="${y+5}" text-anchor="middle" ${mono} font-size="${t.length>3?10:t.length>2?11.5:14}" fill="${tc}">${esc(t)}</text>`;
  }
  if(o.editavel){
    for(let s=0;s<n;s++)for(let f=lo;f<=dHi;f++){
      g+=`<rect class="hit" data-s="${s}" data-f="${f}" x="${L+(f-lo)*fw}" y="${sy(s)-sg/2}" width="${fw}" height="${sg}" fill="transparent"><title>Corda ${n-s}, casa ${f}</title></rect>`;
    }
  }
  return g+"</svg>";
}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}

window.BRACO={LETRAS,SOLF,TONICAS,PADRAO,INSTRUMENTOS,pc,tonica,lerIntervalo,soletrar,lerFormula,notasJanela,casaTonica,posicao,desenhar,esc};
})();
