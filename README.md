# NexWay

Prova de conceito de localização de materiais em armazém com orientação por Realidade Aumentada em smartphone Android.

## Identificação

| Item | Informação |
|---|---|
| Equipe | NEXUS |
| Curso | Engenharia da Computação |
| Instituição | Centro Universitário Facens — Sorocaba, SP |
| Disciplina | UPX — Realidade Aumentada |
| Professor | Daniel Ohata, conforme o pacote documental fornecido pela equipe |
| Semestre | 2026.2 |

| Integrante | RA | Responsabilidades |
|---|---|---|
| Leonardo Godinho da Silva | 236764 | Catálogo, destinos, rotas, estado da navegação, GitHub/branches e implementação dos Marcos 2 a 5; pesquisa de negócio |
| Rafael de Souza Amorim | 223380 | Base mobile, ambiente React Native/ViroReact, cena AR, reconhecimento de marcadores, build Android e validação física |
| Beatriz Canaveze Fontolan Soares | 235099 | Pesquisa bibliográfica, documentação e artigo científico |
| João Pedro da Silva Ramos | 234911 | Pesquisa bibliográfica, documentação e artigo científico |
| Matheus Nicolas Arizono Ywamoto | 235912 | Pesquisa bibliográfica, documentação, artigo científico e gestão do Trello |
| Matheus Henrique Silva Marcolino | 161109 | Pesquisa bibliográfica, documentação e artigo científico |

A [divisão técnica](NexWay_Divisao_Desenvolvimento_Leonardo_Rafael.pdf) complementa as responsabilidades. A autoria dos marcos identifica commits, sem excluir a colaboração da equipe.

## Visão geral, problema e público-alvo

O NexWay permite selecionar um material de um catálogo local, consultar seu endereço na planta e receber direção e distância sobre a câmera. START estabelece a origem e a orientação da navegação; o endereço correto confirma a chegada depois dos checkpoints.

Conhecer o código de uma posição não significa saber chegar até ela. A proposta atende operadores pouco familiarizados com o layout e estudantes voluntários na avaliação planejada. A redução de tempo e erros em comparação com uma planta 2D é uma hipótese: o experimento com participantes ainda não foi executado.

## Objetivos

**Objetivo geral:** desenvolver e avaliar uma prova de conceito de orientação visual por RA em smartphone para localizar posições de armazenagem.

Objetivos técnicos implementados:

- buscar material e associá-lo ao rack destino;
- reconhecer START e calibrar a pose da câmera;
- calcular rota por busca em largura, evitando os bloqueios do mapa;
- acompanhar pose X/Z, direção, distância e checkpoints em ordem;
- liberar validação do rack somente depois do último checkpoint;
- registrar chegada uma única vez, sem aceitar endereço incorreto;
- verificar tipos e regras por testes automatizados.

A avaliação com participantes e a validação física específica da correção atual permanecem pendentes.

## Funcionalidades atuais

| Identificador | Funcionalidade | Descrição | Status |
|---|---|---|---|
| RF01 | Buscar e selecionar material | Catálogo local com quatro endereços reais; busca por código ou descrição | Implementado |
| RF02 | Identificar destino | SF01001A, SF01014A, SF01009B e SF01012B | Implementado |
| RF03 | Consultar planta | Mostra A/B paralelas e módulo/endereço destino | Implementado |
| RF04 | Simular percurso | Animação na planta, independente da câmera | Implementado |
| RF05 | Reconhecer START | START_HUAWEI no chão estabelece origem e direção | Implementado |
| RF06 | Navegar por checkpoints | Grade de 1 m; avanço sequencial dentro da tolerância | Implementado e testado |
| RF07 | Orientação relativa | Sobreposição 2D com direção, distância e X/Z | Implementado |
| RF08 | Validar chegada | Endereço correto somente após todos os checkpoints; registro único | Corrigido e testado; validação física específica pendente |
| RF09 | Rejeitar endereço incorreto | Exibe esperado e reconhecido, sem chegada | Testado; validação física específica pendente |
| RF10 | Suspender e recalibrar | Tracking limitado, pose inválida ou salto reiniciam a navegação | Testado; validação física específica pendente |
| RF11 | Destacar setor e prateleira na câmera | Indicação dentro do rack | Planejado |
| RF12 | Orientação 3D | Seta ou mapa 3D | Planejado |

## Tecnologias e arquitetura

| Tecnologia | Versão no projeto | Uso |
|---|---|---|
| React Native / React | 0.86.3 / 19.2.3 | Aplicativo e interface |
| TypeScript | ~6.0.3 | Tipagem |
| Expo | ~57.0.31 | Ferramentas e geração de projetos nativos |
| ViroReact | 3.0.3 | Cena AR, marcadores e pose |
| expo-camera | ~57.0.6 | Permissão da câmera |
| expo-dev-client | ~57.0.20 | Development Build |
| Node.js | 22; mínimo 22.13.0 | Ambiente de desenvolvimento |
| tsx | ^4.20.0 | Execução dos testes |
| ARCore | Integrado pelo ViroReact | Rastreamento em Android |

Dependências em [package.json](package.json), com versões resolvidas no [package-lock.json](package-lock.json).

![Arquitetura do NexWay](docs/diagrams/arquitetura.png)

A interface compartilha a sessão em App.tsx. O reducer da sessão mantém a navegação relativa. A cena ViroReact envia poses e eventos de marcadores; a sessão calcula o progresso pela rota local e decide quando aceitar o rack. Catálogo, mapa e sessão ficam no aplicativo; não há backend nem banco de dados.

## Estrutura do repositório

```text
Nexway/
├── App.tsx
├── index.ts
├── src/                      ar, camera, components, data, navigation, screens, warehouse
├── assets/markers/
├── tests/helpers/
├── scripts/
├── docs/
│   ├── diagrams/             quatro diagramas em MMD, SVG e PNG
│   ├── images/               oito capturas históricas
│   ├── documents/            artigo V5 e índice
│   ├── BUILD_EVIDENCE.md
│   ├── START-AR.md
│   ├── DEVELOPMENT.md
│   └── REVISAO_MERGE.md
├── README.md
├── CHANGELOG.md
├── .gitignore
├── .github/
├── package.json
├── package-lock.json
├── app.json
├── eas.json
├── .easignore
├── .nvmrc
├── tsconfig.json
└── NexWay_Divisao_Desenvolvimento_Leonardo_Rafael.pdf
```

src contém código organizado por responsabilidade; assets contém recursos usados pelo app; docs/images contém capturas documentais. android e ios são gerados pelo Expo e ignorados no Git.

## Como instalar e testar

Instale Git e Node 22. Para compilação local Android, configure Android Studio, SDK, ADB e JDK compatível com o projeto gerado. Use smartphone Android compatível com ARCore e depuração USB habilitada.

```powershell
git clone https://github.com/RafaAmorim-stack/Nexway.git
cd Nexway
git switch feat/huawei-warehouse-layout
npm ci
npm run typecheck
npm test
```

A base desta implementação é `5196b3c1eab3a3648931f517bdd8d0c888166168` (main), descendente de `21adbb7` e da correção `7acefc5`. Os 29 testes anteriores foram preservados/adaptados, com testes adicionais do layout Huawei. A proteção contra chegada antecipada permanece no reducer.

`npm run verify` reúne tipos e testes. `npm run export:web`, `npm run export:ios` e `npm run export:android` verificam bundles; não equivalem a APK/IPA nem a teste físico.

## Android Development Build e como executar

O NexWay não roda no Expo Go: ViroReact exige módulos nativos próprios.

Para gerar localmente no Windows e instalar no aparelho conectado:

```powershell
npx expo prebuild --platform android
cd android
.\gradlew.bat assembleDebug
cd ..
adb devices
adb install -r "android/app/build/outputs/apk/debug/app-debug.apk"
npm start
```

`npm start` inicia o Metro com --dev-client. Abra o NexWay instalado e conecte ao Metro na mesma rede; use `npm run start:tunnel` se necessário. Alterações em módulos nativos ou plugins exigem novo build. A prévia `npm run web` não executa a câmera AR nativa.

Alternativa pelo perfil development de [eas.json](eas.json), com developmentClient habilitado, distribuição interna e APK Android:

```powershell
npx eas-cli@latest login
npm run build:android
```

O app.json já está vinculado ao projeto EAS da equipe; preserve esse vínculo. Instale o APK disponibilizado pelo EAS e execute `npm start`. Não versione credenciais. O perfil também prevê iOS, mas não há validação em iPhone.

## Marcadores e utilização

O **ambiente Huawei de validação técnica** usa as etiquetas fotografadas como image targets do ViroReact. O app reconhece a imagem completa; não decodifica o QR. Não utilize o conjunto antigo de impressão A/B/C.

![Layout Huawei](docs/images/huawei/layout-huawei.png)

- Escala medida: **1 quadrado = 1 metro**; START no chão em **(6,0)**.
- A: **12 × 1 m**, x=0..12 e Z=3..4. B: **12 × 1 m**, x=0..12 e Z=6..7.
- Quatro módulos de 3 m por prateleira; START a 3 m da face da A; corredor livre de 2 m entre A/B.
- Fonte única: [warehouseLayout.ts](src/navigation/warehouseLayout.ts). No código 2D, y corresponde a Z físico, crescendo para o fundo.

| Endereço | Prateleira / módulo | Marker (X,Z) | Access point (X,Z) |
|---|---|---|---|
| SF01001A | A / 1 | (1,5; 3) | (1; 2) |
| SF01014A | A / 3 | (7,5; 3) | (7; 2) |
| SF01009B | B / 1 | (1,5; 6) | (1; 5) |
| SF01012B | B / 3 | (7,5; 6) | (7; 5) |

Centros de módulo são referências visuais, não medições individuais da etiqueta. O BFS usa células inteiras e acessos livres. A bloqueia x=0..11/Z=3; B bloqueia x=0..11/Z=6. Para B, o caminho passa pela lateral livre de A e entra no corredor; não atravessa o estoque. As margens laterais da grade são espaço lógico de circulação, não paredes medidas.

1. Selecione um dos quatro endereços; nomes de materiais não foram inventados.
2. Abra Câmera AR e permita a câmera.
3. Posicione-se no START, voltado para A. Incline o telefone para enquadrar o marcador no piso sem alterar a direção horizontal. A origem é a pose da câmera, não uma localização absoluta obtida da etiqueta.
4. Siga os checkpoints em ordem (tolerância de 0,45 m). O aplicativo mostra direção, distância e X/Z.
5. Ao concluir o percurso, reconheça a etiqueta exata. SF01009B não valida SF01012B, mesmo sendo a mesma prateleira. Reconhecimento correto antecipado não conclui.
6. Tracking perdido exige retorno ao START e reinício do percurso. Chegada validada registra horário apenas uma vez.

Os cinco targets reais estão em [assets/markers/huawei](assets/markers/huawei); as fotos originais e o esboço em [docs/images/huawei](docs/images/huawei). Nenhuma imagem está faltando. Recorte/retificação reproduzível em [scripts/prepare-huawei-targets.py](scripts/prepare-huawei-targets.py); nenhum QR foi redesenhado.

**Antes do teste físico:** medir a largura externa de cada etiqueta/START e ajustar [huaweiTargets.ts](src/ar/huaweiTargets.ts). O valor 0,20 m é nominal, não uma medida extraída das fotos. A escala confirmada do mapa permanece 1 m/célula. Seguir o [roteiro Xiaomi](docs/START-AR.md).

![Fluxo técnico da RA](docs/diagrams/fluxo-ra.png)

## Rastreabilidade do Development Build

O APK é um **Development Build**: o código JS/TS executado é servido pelo **Metro**. O SHA-256 verifica a integridade do APK nativo, mas **não identifica sozinho qual JavaScript foi executado**. Alterações JS/TS podem manter o mesmo hash do APK.

[BUILD_EVIDENCE.md](docs/BUILD_EVIDENCE.md) permanece como registro histórico da equipe para f2e1c8f64edbc95b048caf2964bd6e298f33444a, com 24 testes e hash do APK. Não estende automaticamente sua validação física à correção 7acefc534bc52615189aa3b9bb4f6e8ae9160ad8. A demonstração de 25/10/2026 não teve o build exato registrado.

A rastreabilidade funcional deve associar no mesmo registro:

- commit Git e working tree limpa, comprovada por `git status --porcelain` vazio antes do teste;
- resultados dos testes e typecheck dessa versão;
- comando e resultado do build, instalação e SHA-256 do APK;
- Metro iniciado a partir dessa mesma working tree, com commit e terminal registrados;
- aparelho, versão Android e validação física dos cenários da versão corrigida.

Esta implementação deve ser verificada por tipos, testes e export Android; esses resultados não equivalem a instalação ou validação física. O relato histórico da equipe não comprova por si só essa associação completa para a versão atual.

## Limitações atuais

- Quatro posições reais, sem nomes de materiais. Mapa métrico confirmado; tolerância e reconhecimento dos recortes ainda precisam de validação no aparelho.
- Pose sujeita a deriva, dependente de alinhamento no START, iluminação e marcadores.
- A rota evita apenas bloqueios cadastrados; não detecta obstáculos novos.
- Sobreposição 2D, sem seta 3D, GPS indoor, VPS ou Cloud Anchors.
- Sem destaque de setor/prateleira na câmera, confirmação de retirada ou exportação de métricas na interface atual. Regras legadas não significam funções disponíveis.
- Demonstrações históricas em Xiaomi e ambiente doméstico, sem aferição de precisão, teste em iPhone ou experimento com participantes.
- A correção de checkpoints tem cobertura automatizada; falta registrar validação física específica com a cadeia de rastreabilidade acima.

## Documentação adicional

- [Relatório da implementação Huawei](docs/HUAWEI_IMPLEMENTATION.md), com coordenadas, rotas, arquivos e verificações.

- [Desenvolvimento](docs/DEVELOPMENT.md) e [revisão documental](docs/REVISAO_MERGE.md).
- [Roteiro Huawei START-AR](docs/START-AR.md), a usar junto das condições atuais deste README.
- [Diagramas](docs/diagrams/): arquitetura, caso de uso, navegação e fluxo RA em MMD, SVG e PNG.
- [Capturas](docs/images/): oito imagens de 25/10/2026; não comprovam a correção posterior.
- [Artigo acadêmico V5](docs/documents/NexWay_Artigo_Final_V5.docx) e [índice documental](docs/documents/LEIA-ME.txt), com nota sobre seu recorte histórico.
- [Histórico de alterações](CHANGELOG.md).

Projeto acadêmico educacional. Não há licença de software formal declarada.
