# Scalebox

Escalas, modos e arpejos no braço.

Site estático (HTML, CSS e JavaScript puros) com:

- **Escalas**: mais de 50 escalas, cada uma com fórmula, notas, origem e uso. Mostra os desenhos por posição e no braço inteiro.
- **Famílias de modos**: os 7 modos da escala maior, da menor harmônica, da menor melódica e da maior harmônica.
- **Harmonia**: do básico ao avançado: intervalos, formação de acordes, campo harmônico (tríades, tétrades e tensões), funções e cadências, progressões, tons vizinhos, dominantes secundários, II–V, SubV, empréstimo modal e diminutos.
- **Acordes**: dicionário completo com desenhos gerados automaticamente (tônica na 6ª, 5ª e 4ª corda), todas as inversões, fragmentos em todas as regiões, acordes relativos, notas opcionais nos desenhos com baixo na 5ª corda. Para adicionar tipos de acorde, edite a lista TIPOS no início de `acordes.js`.
- **Campo harmônico**: escolha qualquer acorde (tríade, tétrade ou com tensões) e veja o campo da própria nota escolhida (o acorde é sempre o I grau; nos campos maior e menor também aparece o relativo), montado com a mesma estrutura, em todas as inversões e com a tônica na 6ª, 5ª ou 4ª corda. Inclui um dicionário de double stops (3ªs, 6ªs, 4ªs, 5ªs, 10ªs e oitavas) para cada campo.
- **Arpejos**: para qualquer acorde e suas variações, o arpejo no braço inteiro, por região do CAGED, pela corda da tônica, em 2 oitavas e os arpejos de substituição.
- **CAGED**: escala maior com acordes maj7 e escala menor com acordes m7, com arpejos, e o CAGED reduzido (cada forma recortada nas cordas agudas) para qualquer acorde.
- **Shapes do professor**: desenhos criados no Modo edição e publicados no site.
- **Modo edição**: o professor desenha shapes clicando no braço e cria escalas novas.

Funciona com violão/guitarra, violão 7 cordas, baixo 4 e 5 cordas, cavaquinho, ukulele e bandolim.

## Publicar no GitHub Pages

1. Crie uma conta em github.com (se ainda não tiver).
2. Clique em **New repository**. Dê um nome, por exemplo `escalas`, marque **Public** e crie.
3. Na página do repositório, clique em **Add file → Upload files**.
4. Clique em **choose your files**, selecione **todos os arquivos** desta pasta (Ctrl+A ou Cmd+A) e confirme. Não há subpastas, então tudo vai de uma vez.
5. Clique em **Commit changes**.
6. Vá em **Settings → Pages**. Em *Branch*, escolha `main` e a pasta `/ (root)`. Clique em **Save**.
7. Em um ou dois minutos o site fica no ar em `https://SEU-USUARIO.github.io/escalas/`.

Para testar no computador antes de publicar, basta abrir o `index.html` no navegador.

## Como publicar shapes (fluxo do professor)

1. Abra o site e vá em **Modo edição**.
2. Crie o shape: escolha instrumento e tônica, use **Preencher a partir de uma escala** ou clique no braço.
3. Clique em **Salvar**. O shape fica guardado **só no seu navegador**.
4. Quando quiser publicar, clique em **Exportar shapes.js**. O arquivo baixado já inclui os shapes publicados antes mais os seus rascunhos.
5. No GitHub, na página principal do repositório, clique em **Add file → Upload files**, envie o `shapes.js` baixado (ele substitui o antigo) e faça o commit.
6. Em instantes os alunos veem os shapes na aba **Shapes do professor**.

O mesmo vale para escalas novas: botão **Exportar escalas-extra.js** e envie o `escalas-extra.js` da mesma forma.

Dica: guarde uma cópia do `shapes.js` exportado. Se você limpar os dados do navegador, use **Importar arquivo** para recuperar seus shapes.

## Imprimir ou salvar em PDF

O botão **Imprimir / PDF** no topo imprime a aba aberta, sempre com fundo branco e um cabeçalho com a escala, o tom e o instrumento. Para gerar PDF, escolha **Salvar como PDF** no lugar da impressora. Se o braço inteiro ficar pequeno, mude a orientação para **Paisagem** na janela de impressão.

## Ferramentas do editor

| Ferramenta | Uso |
|---|---|
| Tônica | bolinha laranja (também muda o tom do shape) |
| Nota | bolinha escura |
| Característica | bolinha azul |
| Destaque | bolinha verde (ex.: notas do arpejo, notas-alvo) |
| Passagem | bolinha vazada |
| Texto | escreve um texto livre na bolinha (ex.: dedo 1, i, m, a) |
| Apagar | remove a bolinha |

Clicar de novo com a mesma ferramenta remove a bolinha. **Desfazer** (ou Ctrl+Z) volta um passo.
Marque **Esconder os rótulos** para criar exercícios: o aluno vê só as bolinhas.
Os rótulos seguem o botão do topo: intervalos, notas em cifra (C D E) ou em solfejo (Dó Ré Mi).
**Baixar PNG / SVG** gera uma imagem do shape para apostilas e slides. A caixa **Comentários** (dicas, digitação, andamento) vai junto na imagem e na impressão.

## Editar o conteúdo à mão

Os arquivos de conteúdo são estes:

| Arquivo | O que tem |
|---|---|
| `config.js` | título do site, nome do professor, mostrar ou esconder o Modo edição |
| `escalas.js` | biblioteca de escalas, com origem e uso (comentários explicam cada campo) |
| `escalas-extra.js` | escalas criadas no Modo edição |
| `shapes.js` | shapes publicados |

Para esconder o Modo edição dos alunos, mude `mostrarEditor: false` em `config.js`.
Você continua acessando o editor pelo endereço `.../#editor`.

Para adicionar uma escala, copie um bloco em `escalas.js` e troque nome e fórmula, por exemplo:

```js
{ id:"minha-escala", nome:"Minha escala", grupo:"Minhas escalas",
  formula:"1 2 3 #4 5 6 b7", caract:["#4"],
  origem:"De onde ela vem.", uso:"Para que usar." },
```

Use `b` para bemol, `#` para sustenido e `bb` para dobrado bemol. A fórmula sempre começa com `1`.
