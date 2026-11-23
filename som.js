/* Som de violão (síntese de corda dedilhada, Karplus-Strong) e clique de metrônomo. Não precisa editar este arquivo. */
(function(){
let ctx=null, saida=null;
const cache=new Map();
function contexto(){
  if(!ctx){
    ctx=new (window.AudioContext||window.webkitAudioContext)();
    // "corpo" do violão: realce de graves e médios, agudos suaves
    const corpo=ctx.createBiquadFilter(); corpo.type="peaking"; corpo.frequency.value=110; corpo.Q.value=1.2; corpo.gain.value=4;
    const madeira=ctx.createBiquadFilter(); madeira.type="peaking"; madeira.frequency.value=2400; madeira.Q.value=.9; madeira.gain.value=-3;
    const brilho=ctx.createBiquadFilter(); brilho.type="lowpass"; brilho.frequency.value=6500; brilho.Q.value=.5;
    const comp=ctx.createDynamicsCompressor(); comp.threshold.value=-18; comp.ratio.value=3;
    saida=ctx.createGain(); saida.gain.value=.9;
    saida.connect(corpo); corpo.connect(madeira); madeira.connect(brilho); brilho.connect(comp); comp.connect(ctx.destination);
  }
  if(ctx.state==="suspended") ctx.resume();
  return ctx;
}
// gera (e guarda) o som de uma corda para a nota MIDI
function buffer(midi){
  const chave=midi; if(cache.has(chave)) return cache.get(chave);
  const sr=ctx.sampleRate, f=440*Math.pow(2,(midi-69)/12), dur=Math.min(4.5,2.2+220/f);
  const n=Math.floor(sr*dur), y=new Float32Array(n), P=sr/f;
  const t60=Math.max(1.5,5*Math.pow(110/f,.4)), perda=Math.pow(.001,1/(t60*f));
  // ataque: corda puxada em forma de triângulo (ponto de toque a 1/5 da corda) + um pouco de ruído da palheta
  const ini=Math.ceil(P)+2; let last=0;
  for(let i=0;i<ini;i++){const x=(i%P)/P, tri=x<.2?x/.2:(1-x)/.8; const r=Math.random()*2-1; last=last*.7+r*.3; y[i]=tri*.85+last*.35;}
  let md=0;for(let i=0;i<ini;i++)md+=y[i];md/=ini;for(let i=0;i<ini;i++)y[i]-=md;
  for(let i=1;i<ini;i++)y[i]=y[i]*.6+y[i-1]*.4;
  const ler=x=>{const i=Math.floor(x),fr=x-i;if(i<0)return 0;return y[i]*(1-fr)+(y[i+1]||0)*fr;};
  for(let i=ini;i<n;i++){
    y[i]=perda*(.25*ler(i-P+1)+.5*ler(i-P)+.25*ler(i-P-1));
  }
  // normaliza e faz um fade bem curto no fim
  let mx=0;for(let i=0;i<n;i++)mx=Math.max(mx,Math.abs(y[i]));
  const k=mx?.5/mx:1, fim=Math.floor(sr*.08);
  for(let i=0;i<n;i++){y[i]*=k;if(i>n-fim)y[i]*=(n-i)/fim;}
  const buf=ctx.createBuffer(1,n,sr); buf.copyToChannel?buf.copyToChannel(y,0):buf.getChannelData(0).set(y);
  cache.set(chave,buf); return buf;
}
// toca uma nota; devolve o ganho para poder abafar
function nota(midi,t,{vel=.8,dur=null,destino=null}={}){
  contexto();
  const src=ctx.createBufferSource(); src.buffer=buffer(midi);
  const g=ctx.createGain(); g.gain.value=vel*(.55+.45*Math.min(1,(midi-36)/40));
  src.connect(g); g.connect(destino||saida);
  src.start(t);
  if(dur){g.gain.setValueAtTime(g.gain.value,t+dur);g.gain.exponentialRampToValueAtTime(.0005,t+dur+.08);src.stop(t+dur+.1);}
  return g;
}
// batida: grave → agudo, com pequena variação de força
function acorde(midis,t,{dur=null,espaco=.022,vel=.75,destino=null}={}){
  contexto();
  const bus=ctx.createGain(); bus.gain.value=1; bus.connect(destino||saida);
  [...midis].sort((a,b)=>a-b).forEach((m,i)=>nota(m,t+i*espaco*(.8+Math.random()*.4),{vel:vel*(.85+Math.random()*.15),dur,destino:bus}));
  return bus;
}
function sessao(){contexto();const g=ctx.createGain();g.connect(saida);return g;}
function encerrar(g){if(!g)return;const t=ctx.currentTime;g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(0,t+.08);setTimeout(()=>{try{g.disconnect();}catch(e){}},200);}
function abafar(bus,t){if(!bus)return;bus.gain.setValueAtTime(bus.gain.value,t);bus.gain.exponentialRampToValueAtTime(.0005,t+.12);}
// clique de metrônomo (estilo woodblock)
function clique(t,forte,fraco){
  contexto();
  const o=ctx.createOscillator(), g=ctx.createGain(), bp=ctx.createBiquadFilter();
  o.type="square"; o.frequency.value=forte?1760:fraco?900:1180;
  bp.type="bandpass"; bp.frequency.value=forte?2400:fraco?1300:1700; bp.Q.value=4;
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(forte?.9:fraco?.25:.55,t+.001); g.gain.exponentialRampToValueAtTime(.0008,t+.045);
  o.connect(bp); bp.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+.06);
}
// prepara os sons com antecedência para o primeiro acorde não atrasar
function preparar(midis){contexto();midis.forEach(m=>buffer(m));}
window.SOM={contexto,nota,acorde,abafar,sessao,encerrar,clique,preparar,agora:()=>contexto().currentTime,_buffer:m=>{contexto();return buffer(m);}};
})();
