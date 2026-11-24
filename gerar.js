/* Monta o site publicado na pasta dist/ (a Cloudflare roda este arquivo a cada push).
   - copia o site como está;
   - cria um endereço para cada idioma (/en/, /es/, /fr/, /ja/), cada aba e cada escala,
     com título, descrição, prévia para redes sociais e as ligações entre idiomas (hreflang);
   - cria sitemap.xml, robots.txt, 404.html e site.webmanifest.
   Rodar no computador: node scripts/gerar.js   (não precisa instalar nada)
   Não precisa editar este arquivo, exceto para mudar textos de título/descrição (tabela TXT abaixo). */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm"), crypto = require("crypto");

// funciona com o script em scripts/gerar.js ou solto na raiz do repositório (gerar.js)
const RAIZ = path.basename(__dirname) === "scripts" ? path.resolve(__dirname, "..") : __dirname, DIST = path.join(RAIZ, "dist");
const SITE = "https://scalebox.app.br";
const LANGS = ["pt", "en", "es", "fr", "ja"];
const HREFLANG = { pt: "pt-BR", en: "en", es: "es", fr: "fr", ja: "ja" };
const OG_LOCALE = { pt: "pt_BR", en: "en_US", es: "es_ES", fr: "fr_FR", ja: "ja_JP" };
const IGNORAR = new Set(["dist", "scripts", "node_modules", ".git", ".github", ".wrangler", "README.md", "gerar.js", "wrangler.jsonc", "wrangler.toml", "package.json", "package-lock.json", ".gitignore", ".DS_Store"]);

/* ---------- arquivos (funciona com pastas css/js/dados/img ou tudo na raiz) ---------- */
const todos = [];
(function varre(dir, rel) {
  for (const n of fs.readdirSync(dir)) {
    if (!rel && IGNORAR.has(n)) continue;
    if (n.startsWith(".") && n !== ".nojekyll") continue;
    const p = path.join(dir, n), r = rel ? rel + "/" + n : n;
    if (fs.statSync(p).isDirectory()) varre(p, r); else todos.push(r);
  }
})(RAIZ, "");
const acha = nome => todos.find(f => f === nome || f.endsWith("/" + nome)) || null;
const ler = nome => { const f = acha(nome); if (!f) throw new Error("Arquivo não encontrado: " + nome); return fs.readFileSync(path.join(RAIZ, f), "utf8"); };
const url = nome => { const f = acha(nome); return f ? "/" + f : null; };

/* ---------- dados e traduções ---------- */
function contexto(lang) {
  const doc = { documentElement: { getAttribute: () => null, hasAttribute: () => false, lang: "" }, currentScript: null, addEventListener() {}, write() {}, querySelector: () => null, getElementById: () => null, title: "" };
  const ctx = { console, URLSearchParams, URL, document: doc, location: { search: "?lang=" + lang, href: SITE + "/?lang=" + lang, hash: "" }, navigator: { languages: [lang], userAgent: "node" }, localStorage: { getItem: () => null, setItem() {} }, MutationObserver: class { observe() {} disconnect() {} } };
  ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(ler("i18n.js"), ctx);
  if (lang !== "pt") vm.runInContext(ler(`i18n-${lang}.js`), ctx);
  vm.runInContext(ler("escalas.js"), ctx);
  try { ctx.BRACO = {}; vm.runInContext(ler("ciclos.js"), ctx); } catch (e) { }
  try { vm.runInContext(ler("escalas-extra.js"), ctx); } catch (e) { ctx.ESCALAS_EXTRA = []; }
  return ctx;
}
const CTX = Object.fromEntries(LANGS.map(l => [l, contexto(l)]));
const T = (lang, s) => { if (lang === "pt" || !s) return s; const r = CTX[lang].I18N.tr(s, true); return r == null ? s : r; };
const ESCALAS = [...CTX.pt.ESCALAS, ...(CTX.pt.ESCALAS_EXTRA || [])].filter(e => e && e.id && e.formula);

/* ---------- endereços ---------- */
const slug = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const PREFIXO = l => (l === "pt" ? "/" : `/${l}/`);
const ABAS = {           // aba do app → endereço em cada idioma
  familias:    { pt: "familias-de-modos", en: "mode-families", es: "familias-de-modos", fr: "familles-de-modes", ja: "mode-families" },
  caged:       { pt: "caged", en: "caged", es: "caged", fr: "caged", ja: "caged" },
  acordes:     { pt: "dicionario-de-acordes", en: "chord-dictionary", es: "diccionario-de-acordes", fr: "dictionnaire-d-accords", ja: "chord-dictionary" },
  arpejos:     { pt: "arpejos", en: "arpeggios", es: "arpegios", fr: "arpeges", ja: "arpeggios" },
  identificar: { pt: "identificar-acorde", en: "chord-finder", es: "identificar-acorde", fr: "identifier-un-accord", ja: "chord-finder" },
  harmonia:    { pt: "teoria-musical", en: "music-theory", es: "teoria-musical", fr: "theorie-musicale", ja: "music-theory" },
  campo:       { pt: "campo-harmonico", en: "harmonic-field", es: "campo-armonico", fr: "champ-harmonique", ja: "harmonic-field" },
  regiao:      { pt: "tocar-por-regiao", en: "play-by-region", es: "tocar-por-region", fr: "jouer-par-region", ja: "play-by-region" },
  ciclos:      { pt: "ciclos", en: "cycles", es: "ciclos", fr: "cycles", ja: "cycles" },
  desafio:     { pt: "desafio-do-braco", en: "fretboard-challenge", es: "desafio-del-mastil", fr: "defi-du-manche", ja: "fretboard-challenge" },
};
const PASTA_ESC = { pt: "escalas", en: "scales", es: "escalas", fr: "gammes", ja: "scales" };
const PASTA_TOM = { pt: "campo-harmonico", en: "harmonic-field", es: "campo-armonico", fr: "champ-harmonique", ja: "harmonic-field" };

/* ---------- textos de título e descrição ---------- */
const TXT = {
  pt: { site: "Scalebox", home: ["Scalebox: escalas, acordes e harmonia no braço da guitarra e do violão", "Estude 57 escalas e modos, acordes, arpejos, CAGED e campo harmônico no braço da guitarra, do violão, do baixo, do cavaquinho e do ukulele. Grátis, direto no navegador."],
    familias: ["Famílias de modos: modos gregos e da menor harmônica e melódica", "Veja os 7 modos da escala maior, da menor harmônica, da menor melódica e da maior harmônica lado a lado, com o intervalo característico de cada um."],
    caged: ["Sistema CAGED: as 5 formas no braço da guitarra e do violão", "As 5 formas do CAGED com acorde, arpejo e escala na mesma região. Escolha o tom e veja como as formas se emendam pelo braço."],
    acordes: ["Dicionário de acordes para guitarra e violão: formação e desenhos", "Fórmula, notas, inversões, fragmentos e drop 2 de cada acorde, com as escalas que combinam. Tríades, tétrades e acordes com tensões."],
    arpejos: ["Arpejos no braço da guitarra: todos os desenhos", "Arpejos de tríades e tétrades no braço inteiro, por região do CAGED, por corda e em duas oitavas, com arpejos de substituição."],
    identificar: ["Identificar acorde pelo braço da guitarra e do violão", "Marque as casas no braço ou digite a tablatura e descubra o nome do acorde, a inversão, o que o caracteriza e outras leituras possíveis."],
    harmonia: ["Teoria musical: intervalos, campo harmônico, cadências e progressões", "Do básico ao avançado: intervalos, formação de acordes, campo harmônico, funções, cadências, dominantes secundários, SubV e empréstimo modal."],
    campo: ["Campo harmônico de qualquer acorde", "Escolha um acorde e veja o campo harmônico montado com a mesma estrutura, os acordes relativos e as tríades que cabem dentro dele."],
    regiao: ["Tocar por região: campo harmônico sem sair do lugar no braço", "Todos os acordes do tom dentro de 5 casas, nas inversões que deixam a mão quase parada. Estilo animado (inversões) ou worship (fragmentos), com áudio."],
    ciclos: ["Ciclos musicais: ciclo das quintas, das quartas e outros", "Ciclo das quintas e das quartas com armaduras e relativos menores, além dos ciclos cromático, de tons inteiros, de terças e de trítonos. Com sequência para praticar e áudio."],
    ciclo: (n) => `${n}: o que é, para que serve e como praticar`,
    desafio: ["Desafio do braço: decore as notas da guitarra e do violão", "Treino para memorizar onde está cada nota no braço. Encontre a nota ou diga qual é, com placar, tempo e níveis do básico ao avançado."],
    escala: (n, f) => [`${n}: escala no braço da guitarra e do violão, fórmula e posições`, `${n}: fórmula ${f}. `],
    tom: (n) => [`Campo harmônico de ${n}: acordes, funções e cadências`, `Os acordes do campo harmônico de ${n} em tríades, tétrades e com tensões, com funções, cadências, progressões e tons vizinhos.`],
    maior: "maior", menor: "menor", todasEsc: "Escalas no braço", todosTons: "Campo harmônico por tom" },
  en: { site: "Scalebox", home: ["Scalebox: scales, chords and harmony on the guitar fretboard", "Study 57 scales and modes, chords, arpeggios, CAGED and the harmonic field on guitar, bass, cavaquinho and ukulele. Free, right in your browser."],
    familias: ["Mode families: modes of major, harmonic minor and melodic minor", "See the 7 modes of the major, harmonic minor, melodic minor and harmonic major scales side by side, with each mode's characteristic interval."],
    caged: ["CAGED system: the 5 shapes on the guitar fretboard", "The 5 CAGED shapes with chord, arpeggio and scale in the same region. Pick a key and see how the shapes connect along the neck."],
    acordes: ["Guitar chord dictionary: chord construction and shapes", "Formula, notes, inversions, fragments and drop 2 voicings for every chord, plus the scales that fit. Triads, seventh chords and extended chords."],
    arpejos: ["Guitar arpeggios: every shape on the fretboard", "Triad and seventh-chord arpeggios across the whole neck, by CAGED region, by string and in two octaves, with substitution arpeggios."],
    identificar: ["Guitar chord finder: name any chord from the fretboard", "Mark the frets or type the tab and find the chord name, its inversion, what characterizes it and other possible readings."],
    harmonia: ["Music theory: intervals, harmonic field, cadences and progressions", "From basic to advanced: intervals, chord construction, diatonic chords, functions, cadences, secondary dominants, tritone substitution and modal interchange."],
    campo: ["Harmonic field of any chord", "Pick a chord and see the harmonic field built with the same structure, its relative chords and the triads that fit inside it."],
    regiao: ["Play by region: diatonic chords without leaving your spot on the neck", "Every chord in the key inside 5 frets, in the inversions that keep your hand almost still. Upbeat (inversions) or worship (fragments) style, with audio."],
    ciclos: ["Music cycles: circle of fifths, cycle of fourths and more", "The circle of fifths and cycle of fourths with key signatures and relative minors, plus the chromatic, whole-step, third and tritone cycles. With a practice sequence and audio."],
    ciclo: (n) => `${n}: what it is, what it's for and how to practice it`,
    desafio: ["Fretboard challenge: memorize the notes on the guitar neck", "A trainer to learn where every note is on the neck. Find the note or name it, with score, timer and levels from basic to advanced."],
    escala: (n, f) => [`${n} scale on guitar: formula, notes and positions`, `${n}: formula ${f}. `],
    tom: (n) => [`${n} harmonic field: diatonic chords, functions and cadences`, `The diatonic chords of ${n} as triads, seventh chords and with tensions, with functions, cadences, progressions and neighboring keys.`],
    maior: "major", menor: "minor", todasEsc: "Scales on the fretboard", todosTons: "Diatonic chords by key" },
  es: { site: "Scalebox", home: ["Scalebox: escalas, acordes y armonía en el mástil de la guitarra", "Estudia 57 escalas y modos, acordes, arpegios, CAGED y campo armónico en guitarra, bajo, cavaquinho y ukelele. Gratis, directo en el navegador."],
    familias: ["Familias de modos: modos griegos, de la menor armónica y melódica", "Los 7 modos de la escala mayor, la menor armónica, la menor melódica y la mayor armónica lado a lado, con el intervalo característico de cada uno."],
    caged: ["Sistema CAGED: las 5 formas en el mástil de la guitarra", "Las 5 formas del CAGED con acorde, arpegio y escala en la misma región. Elige el tono y mira cómo las formas se unen por el mástil."],
    acordes: ["Diccionario de acordes para guitarra: formación y dibujos", "Fórmula, notas, inversiones, fragmentos y drop 2 de cada acorde, con las escalas que combinan. Tríadas, cuatríadas y acordes con tensiones."],
    arpejos: ["Arpegios en la guitarra: todos los dibujos en el mástil", "Arpegios de tríadas y cuatríadas en todo el mástil, por región del CAGED, por cuerda y en dos octavas, con arpegios de sustitución."],
    identificar: ["Identificar acordes en el mástil de la guitarra", "Marca los trastes o escribe la tablatura y descubre el nombre del acorde, la inversión, qué lo caracteriza y otras lecturas posibles."],
    harmonia: ["Teoría musical: intervalos, campo armónico, cadencias y progresiones", "De lo básico a lo avanzado: intervalos, formación de acordes, campo armónico, funciones, cadencias, dominantes secundarios, SubV y préstamo modal."],
    campo: ["Campo armónico de cualquier acorde", "Elige un acorde y mira el campo armónico armado con la misma estructura, los acordes relativos y las tríadas que caben dentro de él."],
    regiao: ["Tocar por región: el campo armónico sin moverte del mástil", "Todos los acordes del tono dentro de 5 trastes, en las inversiones que dejan la mano casi quieta. Estilo animado (inversiones) o worship (fragmentos), con audio."],
    ciclos: ["Ciclos musicales: círculo de quintas, ciclo de cuartas y más", "El círculo de quintas y el ciclo de cuartas con armaduras y relativos menores, además de los ciclos cromático, de tonos enteros, de terceras y de tritonos. Con secuencia para practicar y audio."],
    ciclo: (n) => `${n}: qué es, para qué sirve y cómo practicarlo`,
    desafio: ["Desafío del mástil: memoriza las notas de la guitarra", "Entrenamiento para memorizar dónde está cada nota en el mástil. Encuentra la nota o di cuál es, con marcador, tiempo y niveles."],
    escala: (n, f) => [`${n}: escala en la guitarra, fórmula, notas y posiciones`, `${n}: fórmula ${f}. `],
    tom: (n) => [`Campo armónico de ${n}: acordes, funciones y cadencias`, `Los acordes del campo armónico de ${n} en tríadas, cuatríadas y con tensiones, con funciones, cadencias, progresiones y tonos vecinos.`],
    maior: "mayor", menor: "menor", todasEsc: "Escalas en el mástil", todosTons: "Campo armónico por tono" },
  fr: { site: "Scalebox", home: ["Scalebox : gammes, accords et harmonie sur le manche de la guitare", "Étudiez 57 gammes et modes, accords, arpèges, CAGED et champ harmonique à la guitare, à la basse, au cavaquinho et au ukulélé. Gratuit, dans le navigateur."],
    familias: ["Familles de modes : modes grecs, de la mineure harmonique et mélodique", "Les 7 modes des gammes majeure, mineure harmonique, mineure mélodique et majeure harmonique côte à côte, avec l'intervalle caractéristique de chacun."],
    caged: ["Système CAGED : les 5 formes sur le manche de la guitare", "Les 5 formes du CAGED avec accord, arpège et gamme dans la même région. Choisissez la tonalité et voyez comment les formes s'enchaînent sur le manche."],
    acordes: ["Dictionnaire d'accords pour guitare : construction et formes", "Formule, notes, renversements, fragments et drop 2 de chaque accord, avec les gammes compatibles. Triades, accords de septième et accords avec tensions."],
    arpejos: ["Arpèges à la guitare : toutes les formes sur le manche", "Arpèges de triades et d'accords de septième sur tout le manche, par région CAGED, par corde et sur deux octaves, avec arpèges de substitution."],
    identificar: ["Identifier un accord sur le manche de la guitare", "Marquez les cases ou tapez la tablature pour trouver le nom de l'accord, son renversement, ce qui le caractérise et d'autres lectures possibles."],
    harmonia: ["Théorie musicale : intervalles, champ harmonique, cadences et progressions", "Du niveau débutant à avancé : intervalles, construction des accords, champ harmonique, fonctions, cadences, dominantes secondaires, substitution tritonique et emprunt modal."],
    campo: ["Champ harmonique de n'importe quel accord", "Choisissez un accord et voyez le champ harmonique construit avec la même structure, les accords relatifs et les triades qu'il contient."],
    regiao: ["Jouer par région : le champ harmonique sans bouger sur le manche", "Tous les accords de la tonalité dans 5 cases, dans les renversements qui gardent la main presque immobile. Style entraînant ou worship, avec audio."],
    ciclos: ["Cycles musicaux : cycle des quintes, des quartes et autres", "Le cycle des quintes et des quartes avec armures et relatifs mineurs, ainsi que les cycles chromatique, par tons, par tierces et par tritons. Avec séquence à travailler et audio."],
    ciclo: (n) => `${n} : ce que c'est, à quoi ça sert et comment le travailler`,
    desafio: ["Défi du manche : mémorisez les notes de la guitare", "Un entraînement pour retenir où se trouve chaque note sur le manche. Trouvez la note ou nommez-la, avec score, chrono et niveaux."],
    escala: (n, f) => [`${n} : gamme à la guitare, formule, notes et positions`, `${n} : formule ${f}. `],
    tom: (n) => [`Champ harmonique de ${n} : accords, fonctions et cadences`, `Les accords du champ harmonique de ${n} en triades, accords de septième et avec tensions, avec fonctions, cadences, progressions et tonalités voisines.`],
    maior: "majeur", menor: "mineur", todasEsc: "Gammes sur le manche", todosTons: "Champ harmonique par tonalité" },
  ja: { site: "Scalebox", home: ["Scalebox:ギター指板で学ぶスケール・コード・ハーモニー", "57のスケールとモード、コード、アルペジオ、CAGED、ダイアトニックコードをギター、ベース、カヴァキーニョ、ウクレレの指板で学べます。無料、ブラウザですぐ使えます。"],
    familias: ["モードのファミリー:チャーチモード、ハーモニック/メロディック・マイナーのモード", "メジャー、ハーモニック・マイナー、メロディック・マイナー、ハーモニック・メジャーの7つのモードを、特徴音程付きで並べて比較できます。"],
    caged: ["CAGEDシステム:ギター指板の5つのフォーム", "CAGEDの5つのフォームを、コード、アルペジオ、スケールと同じポジションで表示。キーを選んでフォームのつながりを確認できます。"],
    acordes: ["ギター・コード辞典:構成音とフォーム", "各コードの構成式、構成音、転回形、フラグメント、ドロップ2と、合うスケール。トライアド、4和音、テンションコード。"],
    arpejos: ["ギターのアルペジオ:指板上のすべての形", "トライアドと4和音のアルペジオを指板全体、CAGEDのポジション別、弦別、2オクターブで。代理アルペジオも。"],
    identificar: ["ギターのコード判定:指板からコード名を調べる", "フレットをマークするかタブ譜を入力すると、コード名、転回形、特徴、別の解釈を表示します。"],
    harmonia: ["音楽理論:音程、ダイアトニックコード、カデンツ、コード進行", "基礎から上級まで:音程、コードの構成、ダイアトニックコード、機能、カデンツ、セカンダリー・ドミナント、裏コード、モーダル・インターチェンジ。"],
    campo: ["あらゆるコードのダイアトニックコード", "コードを選ぶと、同じ構成で作ったダイアトニックコード、関係コード、含まれるトライアドを表示します。"],
    regiao: ["ポジション内で弾く:手を動かさずにダイアトニックコード", "キーのすべてのコードを5フレット内に、手がほとんど動かない転回形で。アップテンポ(転回形)またはワーシップ(フラグメント)、音声付き。"],
    ciclos: ["音楽のサイクル:5度圏、4度サイクルなど", "調号と平行短調付きの5度圏と4度サイクル、クロマチック、全音、3度、トライトーンのサイクル。練習用シーケンスと音声付き。"],
    ciclo: (n) => `${n}:仕組み・使い方・練習方法`,
    desafio: ["指板チャレンジ:ギターの音名を覚えよう", "指板上の音の位置を覚えるトレーニング。音を探す、または音名を答える。スコア、タイマー、レベル付き。"],
    escala: (n, f) => [`${n}スケール:ギター指板の構成音とポジション`, `${n}:構成式 ${f}。`],
    tom: (n) => [`${n}のダイアトニックコード:機能とカデンツ`, `${n}のダイアトニックコードをトライアド、4和音、テンション付きで。機能、カデンツ、コード進行、近親調も。`],
    maior: "メジャー", menor: "マイナー", todasEsc: "スケール一覧", todosTons: "キー別ダイアトニックコード" },
};

/* ---------- tons para as páginas de campo harmônico ---------- */
const NOTA_NOME = {
  pt: { C: "Dó", D: "Ré", E: "Mi", F: "Fá", G: "Sol", A: "Lá", B: "Si", "#": " sustenido", b: " bemol" },
  es: { C: "Do", D: "Re", E: "Mi", F: "Fa", G: "Sol", A: "La", B: "Si", "#": " sostenido", b: " bemol" },
  fr: { C: "Do", D: "Ré", E: "Mi", F: "Fa", G: "Sol", A: "La", B: "Si", "#": " dièse", b: " bémol" },
  en: { C: "C", D: "D", E: "E", F: "F", G: "G", A: "A", B: "B", "#": "-sharp", b: "-flat" },
};
const nomeTom = (lang, n, modo) => {
  if (lang === "ja") return `${n}${modo === "maior" ? "メジャー" : "マイナー"}`;
  const N = NOTA_NOME[lang], base = N[n[0]] + (n[1] ? N[n[1]] : "");
  const nome = lang === "en" ? base.replace("-", " ") : base;
  return `${nome} ${TXT[lang][modo]}` + (lang === "en" ? "" : ` (${n}${modo === "menor" ? "m" : ""})`);
};
const slugTom = (lang, n, modo) => slug((lang === "ja" ? NOTA_NOME.en[n[0]] + (n[1] ? NOTA_NOME.en[n[1]] : "") + " " + (modo === "maior" ? "major" : "minor") : nomeTom(lang, n, modo).replace(/\(.*\)/, "")));
const TONS = [];
for (const n of ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]) TONS.push([n, "maior"]);
for (const n of ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]) TONS.push([n, "menor"]);

/* ---------- lista de páginas ---------- */
const PAGINAS = [];   // {id, v, sel, por idioma: {url, titulo, desc}}
const pag = (id, v, sel, f, alvo) => PAGINAS.push({ id, v, sel, alvo, l: Object.fromEntries(LANGS.map(l => [l, f(l)])) });
pag("home", "escalas", null, l => ({ url: PREFIXO(l), titulo: TXT[l].home[0], desc: TXT[l].home[1] }));
for (const v of Object.keys(ABAS)) pag(v, v, null, l => ({ url: PREFIXO(l) + ABAS[v][l] + "/", titulo: TXT[l][v][0] + " | Scalebox", desc: TXT[l][v][1] }));
const curto = (s, n = 158) => { s = s.replace(/\s+/g, " ").trim(); if (s.length <= n) return s; const c = s.slice(0, n - 1); return c.slice(0, Math.max(c.lastIndexOf(" "), n - 20)).replace(/[,;:.]$/, "") + "…"; };
const usadosEsc = {};
for (const e of ESCALAS) {
  pag("esc-" + e.id, "escalas", { eEscala: e.id }, l => {
    const nome = T(l, e.nome), [tit, ini] = TXT[l].escala(nome, e.formula);
    let s = slug(l === "ja" ? T("en", e.nome) : nome) || e.id;
    const k = l + "/" + s; if (usadosEsc[k]) s += "-" + e.id; usadosEsc[k] = 1;
    return { url: PREFIXO(l) + PASTA_ESC[l] + "/" + s + "/", titulo: tit + " | Scalebox", desc: curto(ini + T(l, e.uso || e.origem || "")), nome };
  });
}
const CICLOS_LISTA = (CTX.pt.CICLOS && CTX.pt.CICLOS._teste.CICLOS) || [];
for (const c of CICLOS_LISTA) {
  pag("ciclo-" + c.id, "ciclos", { ciTipo: c.id }, l => {
    const nome = T(l, c.nome);
    return { url: PREFIXO(l) + ABAS.ciclos[l] + "/" + (slug(l === "ja" ? T("en", c.nome) : nome) || c.id) + "/", titulo: TXT[l].ciclo(nome) + " | Scalebox", desc: curto(T(l, c.oque) + " " + T(l, c.uso)), nome };
  });
}
for (const [n, modo] of TONS) {
  pag(`tom-${n}-${modo}`, "harmonia", { hTon: n, hTipo: modo === "maior" ? "maior" : "menor" }, l => {
    const nome = nomeTom(l, n, modo), [tit, desc] = TXT[l].tom(nome);
    return { url: PREFIXO(l) + PASTA_TOM[l] + "/" + slugTom(l, n, modo) + "/", titulo: tit + " | Scalebox", desc, nome };
  }, "h-campo");
}

/* ---------- montagem do HTML ---------- */
const esc = s => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
let BASE = ler("index.html");
/* desempenho: junta todos os scripts do fim da página num arquivo só e o CSS em outro,
   com um código no nome (muda quando o conteúdo muda), para o navegador guardar em cache por muito tempo */
const PACOTES = {};
function pacote(ext, conteudo) {
  const h = crypto.createHash("sha1").update(conteudo).digest("hex").slice(0, 10), nome = `assets/sb-${h}.${ext}`;
  PACOTES[nome] = conteudo; return "/" + nome;
}
{
  const locais = [...BASE.matchAll(/<script src="(?!https?:)([^"]+)"><\/script>\s*/g)].filter(m => !/i18n/.test(m[1]));
  if (locais.length) {
    const js = locais.map(m => `/* ${m[1].split("/").pop()} */\n` + ler(m[1].split("/").pop())).join("\n;\n");
    const tag = `<script src="${pacote("js", js)}"></script>\n`;
    locais.forEach((m, i) => { BASE = BASE.replace(m[0], i === locais.length - 1 ? tag : ""); });
  }
  BASE = BASE.replace(/<link rel="stylesheet" href="(?!https?:)([^"]+\.css)">/g, (m, f) => `<link rel="stylesheet" href="${pacote("css", ler(f.split("/").pop()))}">`);
}
const OG = l => url(`og-${l}.png`) || url("og-pt.png");
const ICONE512 = url("icone-512.png"), ICONE180 = url("icone-180.png");

function linksRodape(lang) {
  const P = PAGINAS.filter(p => p.id.startsWith("esc-")), K = PAGINAS.filter(p => p.id.startsWith("tom-")), CI = PAGINAS.filter(p => p.id.startsWith("ciclo-"));
  const li = p => `<li><a href="${p.l[lang].url}">${esc(p.l[lang].nome)}</a></li>`;
  return `<div class="wrap rodape-links" data-sem-traducao>
  <nav aria-label="${esc(TXT[lang].todasEsc)}"><details><summary>${esc(TXT[lang].todasEsc)}</summary><ul>${P.map(li).join("")}</ul></details></nav>
  <nav aria-label="${esc(TXT[lang].todosTons)}"><details><summary>${esc(TXT[lang].todosTons)}</summary><ul>${K.map(li).join("")}</ul></details>${CI.length ? `<details><summary>${esc(TXT[lang].ciclos[0].split(/:| :/)[0])}</summary><ul class="ul-ciclos">${CI.map(li).join("")}</ul></details>` : ""}</nav>
</div>`;
}

function montar(p, lang) {
  const me = p.l[lang], abs = SITE + me.url;
  let h = BASE;
  // caminhos relativos → absolutos (as páginas ficam em subpastas)
  // e procura cada arquivo pelo nome, então funciona com ou sem as pastas css/, js/, dados/, img/
  h = h.replace(/(\s(?:src|href)=")(?!https?:|\/|#|data:|mailto:)([^"]+)"/g, (m, a, b) => `${a}${url(b.split("/").pop()) || "/" + b}"`);
  h = h.replace(/<html[^>]*>/, `<html lang="${HREFLANG[lang]}" data-lang="${lang}"${p.id === "home" && lang === "pt" ? " data-inicio" : ""}>`);
  if (p.id !== "home") h = h.replace(/<h1 id="tituloSite">([\s\S]*?)<\/h1>/, '<p class="marca-nome" id="tituloSite">$1</p>');
  h = h.replace(/<title>[\s\S]*?<\/title>\s*/, "").replace(/<meta name="description"[^>]*>\s*/, "");
  const alt = LANGS.map(l => `<link rel="alternate" hreflang="${HREFLANG[l]}" href="${SITE + p.l[l].url}">`).join("\n") + `\n<link rel="alternate" hreflang="x-default" href="${SITE + p.l.pt.url}">`;
  const og = SITE + OG(lang);
  const ld = p.id === "home"
    ? { "@context": "https://schema.org", "@type": "WebApplication", name: "Scalebox", url: abs, description: me.desc, inLanguage: HREFLANG[lang], applicationCategory: "EducationalApplication", operatingSystem: "Web", isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" }, image: og }
    : { "@context": "https://schema.org", "@type": "WebPage", name: me.titulo.replace(/ \| Scalebox$/, ""), url: abs, description: me.desc, inLanguage: HREFLANG[lang], isPartOf: { "@type": "WebSite", name: "Scalebox", url: SITE + PREFIXO(lang) } };
  const cab = `<title>${esc(me.titulo)}</title>
<meta name="description" content="${esc(me.desc)}">
<link rel="canonical" href="${abs}">
${alt}
<meta name="theme-color" content="#12161b">
<link rel="manifest" href="/site.webmanifest">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Scalebox">
<meta property="og:title" content="${esc(me.titulo)}">
<meta property="og:description" content="${esc(me.desc)}">
<meta property="og:url" content="${abs}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="${OG_LOCALE[lang]}">
${LANGS.filter(l => l !== lang).map(l => `<meta property="og:locale:alternate" content="${OG_LOCALE[l]}">`).join("\n")}
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<script>window.SB_INICIO=${JSON.stringify({ v: p.v, sel: p.sel || undefined, alvo: p.alvo })};</script>
`;
  h = h.replace(/(<meta name="viewport"[^>]*>\s*)/, `$1${cab}`);
  // rodapé: links reais para as páginas (bom para o Google e para quem navega)
  h = h.replace(/(<footer[\s\S]*?<\/footer>)/, f => f.replace(/href="#(\w+)"/g, (m, v) => (ABAS[v] ? `href="${PREFIXO(lang)}${ABAS[v][lang]}/"` : v === "escalas" ? `href="${PREFIXO(lang)}"` : m))
    .replace(/(\s*<div class="wrap rodape-base">)/, "\n" + linksRodape(lang) + "$1"));
  return h;
}

/* ---------- gravar ---------- */
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
for (const f of todos) { const d = path.join(DIST, f); fs.mkdirSync(path.dirname(d), { recursive: true }); fs.copyFileSync(path.join(RAIZ, f), d); }
let n = 0;
for (const p of PAGINAS) for (const l of LANGS) {
  const d = path.join(DIST, p.l[l].url, "index.html");
  fs.mkdirSync(path.dirname(d), { recursive: true }); fs.writeFileSync(d, montar(p, l)); n++;
}
// sitemap com as versões de cada idioma
const hoje = new Date().toISOString().slice(0, 10);
const sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'];
for (const p of PAGINAS) for (const l of LANGS) {
  sm.push(`<url><loc>${SITE + p.l[l].url}</loc><lastmod>${hoje}</lastmod>` + LANGS.map(x => `<xhtml:link rel="alternate" hreflang="${HREFLANG[x]}" href="${SITE + p.l[x].url}"/>`).join("") + `<xhtml:link rel="alternate" hreflang="x-default" href="${SITE + p.l.pt.url}"/></url>`);
}
sm.push("</urlset>");
fs.writeFileSync(path.join(DIST, "sitemap.xml"), sm.join("\n"));
for (const [nome, conteudo] of Object.entries(PACOTES)) { const d = path.join(DIST, nome); fs.mkdirSync(path.dirname(d), { recursive: true }); fs.writeFileSync(d, conteudo); }
// cache: pacotes com código no nome ficam guardados 1 ano; dicionários 1 dia; imagens 1 semana; páginas sempre conferidas
fs.writeFileSync(path.join(DIST, "_headers"), [
  "/assets/*", "  Cache-Control: public, max-age=31536000, immutable", "",
  ...[...new Set(todos.filter(f => /(^|\/)i18n[^/]*\.js$/.test(f)).map(f => "/" + f))].flatMap(f => [f, "  Cache-Control: public, max-age=3600, stale-while-revalidate=86400", ""]),
  ...[...new Set(todos.filter(f => /\.(png|svg|jpg|webp|ico)$/.test(f)).map(f => "/" + f))].flatMap(f => [f, "  Cache-Control: public, max-age=604800, stale-while-revalidate=2592000", ""]),
  "/sitemap.xml", "  Cache-Control: public, max-age=3600", "",
].join("\n"));
fs.writeFileSync(path.join(DIST, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
fs.writeFileSync(path.join(DIST, "site.webmanifest"), JSON.stringify({ name: "Scalebox", short_name: "Scalebox", description: TXT.pt.home[1], start_url: "/", display: "standalone", background_color: "#12161b", theme_color: "#12161b", icons: [ICONE180 && { src: ICONE180, sizes: "180x180", type: "image/png" }, ICONE512 && { src: ICONE512, sizes: "512x512", type: "image/png" }, url("icone.svg") && { src: url("icone.svg"), sizes: "any", type: "image/svg+xml" }].filter(Boolean) }, null, 2));
const LOGO = url("logo.svg") || url("icone.svg") || url("favicon.svg");
fs.writeFileSync(path.join(DIST, "404.html"), `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Página não encontrada · Scalebox</title><link rel="icon" href="${url("favicon.svg") || ""}">
<style>:root{color-scheme:light dark}body{margin:0;min-height:100vh;display:grid;place-items:center;font:16px/1.5 system-ui,sans-serif;background:#f4f6f8;color:#1b2430;text-align:center;padding:24px}@media (prefers-color-scheme:dark){body{background:#12161b;color:#e8ecf0}}img{width:72px;height:72px}h1{font-size:28px;margin:16px 0 6px}p{margin:4px 0;opacity:.75}a{display:inline-block;margin-top:18px;padding:10px 20px;border-radius:999px;background:#e8590c;color:#fff;text-decoration:none;font-weight:600}</style></head>
<body><main>${LOGO ? `<img src="${LOGO}" alt="">` : ""}<h1>Página não encontrada</h1><p>Page not found · Página no encontrada · Page introuvable · ページが見つかりません</p><a href="/">Scalebox</a></main></body></html>`);
console.log(`dist/ pronto: ${n} páginas (${PAGINAS.length} × ${LANGS.length} idiomas), sitemap com ${PAGINAS.length * LANGS.length} endereços.`);
