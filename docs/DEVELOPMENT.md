# Desenvolvimento NexWay

O projeto usa **React Native 0.86.3, React 19.2.3, TypeScript ~6.0.3, Expo ~57.0.31 e ViroReact 3.0.3**, com aplicativo nativo próprio. O Expo fornece as ferramentas de desenvolvimento e o EAS permite compilar na nuvem. O aplicativo não roda no Expo Go.

O planejamento de referência está em `NexWay_Divisao_Desenvolvimento_Leonardo_Rafael.pdf`, com entrega prevista em 01/12/2026.

## Responsabilidades e integração

- Leonardo: catálogo, destinos, regras de navegação, integração de estado e métricas.
- Rafael: ambiente mobile, reconhecimento de imagens, cena AR e validação física.

Use `develop` para integração e `feat/*` ou `fix/*` para alterações. Abra PR com referência à issue ou ao card e peça revisão do outro desenvolvedor. `main` deve conter versões demonstráveis.

## Estado atual — Marco 5

- A câmera reconhece **START-01** e os racks **RACK-A, RACK-B e RACK-C**.
- Ao reconhecer o START, o app captura a pose da câmera, calcula a rota na grade 15 × 13 e acompanha a pose relativa X/Z com `onCameraTransformUpdate`.
- A sobreposição 2D mostra direção, distância e próximo checkpoint; a chegada só é validada pelo reconhecimento do rack correto.
- Rack incorreto mostra esperado × reconhecido, sem chegada. Tracking limitado, pose inválida ou salto superior a 2 m suspendem a orientação e exigem novo START.
- Seleção e confirmação ficam em `App`, compartilhadas entre as abas. Trocar de material exige novo START.
- Não há setor ou prateleira na câmera, seta 3D, VPS, Cloud Anchors, GPS indoor nem backend.
- `src/navigation/session.ts` e `src/ar/markerSelection.ts` são regras legadas (START → RACK) e não estão conectadas à câmera atual.

O roteiro vigente de teste Android/Xiaomi está em [START-AR.md](START-AR.md). A evidência do build está em [BUILD_EVIDENCE.md](BUILD_EVIDENCE.md).

## Estrutura de realidade aumentada

- `src/camera/CameraPreview.tsx`: entrada da experiência ViroReact e tratamento de erro de renderização.
- `src/ar/ViroExperience.tsx`: permissão da câmera, ciclo de vida e `ViroARSceneNavigator`.
- `src/ar/ARContext.ts`: estado compartilhado entre a navegação e a cena.
- `src/ar/NavigationScene.tsx`: cadastro dos targets, eventos de anchors e pose da câmera.
- `src/ar/materialMarker.ts`: qual marcador visível vale em cada fase.
- `src/navigation/materialSession.ts`, `materialRoute.ts` e `relativeNavigation.ts`: sessão, rota e navegação relativa.

`expo-camera` é usado somente para consultar e solicitar a permissão. O ViroReact renderiza a câmera. A câmera é desmontada ao sair da aba e ao entrar em segundo plano; a sessão fica em memória.

## Execução nativa

O README contém os comandos para gerar e instalar o APK. O perfil `development` em `eas.json` produz o aplicativo para dispositivo físico pelo EAS. Depois de instalar o NexWay, `npm start` inicia o Metro para o development client; use `npm run start:tunnel` quando a rede bloquear a conexão direta. Alterações em módulos nativos ou plugins exigem novo build.

`.easignore` exclui `android/` e `ios/` gerados localmente para o EAS criar projetos nativos a partir da configuração atual. Não há IPA gerado nem teste em iPhone.

## Validação física

Siga o roteiro de [START-AR.md](START-AR.md): imprimir os marcadores em 20 × 20 cm, instalar o APK debug, selecionar o material, reconhecer o START olhando para o corredor principal, seguir os checkpoints e reconhecer o rack. Registre aparelho, sistema e versão do build.

Os PNGs dos marcadores são candidatos de teste: sua qualidade no reconhecimento ainda não foi medida. Exportações JavaScript não comprovam a estabilidade do tracking.

## Armazém virtual e limites atuais

A planta fictícia tem três estantes e entrada START. O caminho é calculado em uma grade, evitando obstáculos, com indicador animado, pausa, retomada e reinício. O mapa virtual não define coordenadas do armazém real; escala e tolerância precisam ser ajustadas antes de uso operacional. O catálogo é fictício e a sessão fica em memória.

## Verificações

`npm run verify` executa TypeScript e os 29 testes automatizados. A automação também exporta bundles web, iOS e Android. `npm run doctor` verifica a configuração e a compatibilidade do SDK.

A árvore Expo/ViroReact apresenta alertas de dependências herdadas (`braces`, `node-forge`). Reavaliar atualizações compatíveis antes da distribuição; não forçar versões fora das faixas suportadas.

## Validação de chegada após checkpoints

A sessão guarda o progresso da navegação. O reducer só aceita chegada pelo rack correto com START calibrado e todos os checkpoints concluídos em ordem. Reconhecimento antecipado não conclui a sessão. Perda de tracking, pose inválida, salto ou troca de material reiniciam a navegação. A chegada permanece idempotente. Typecheck aprovado e 29 testes automatizados aprovados nesta correção; o BUILD_EVIDENCE anterior permanece como registro histórico, sem representar um novo APK desta versão.

## Rastreabilidade de execução

Versão funcional de referência: 7acefc534bc52615189aa3b9bb4f6e8ae9160ad8. O APK é um Development Build e o JS/TS é servido pelo Metro. O SHA-256 do APK comprova a integridade do shell nativo, não a versão JS em execução. Registrar em conjunto commit Git, working tree limpa, tipos e testes, build e instalação, Metro iniciado nessa mesma versão e validação física com aparelho e Android identificados. Não estender automaticamente a evidência histórica de f2e1c8f e 24 testes à correção atual de 29 testes.

O artigo atual é [NexWay_Artigo_Final_V5.docx](documents/NexWay_Artigo_Final_V5.docx), preservado como fornecido. Seu recorte histórico e a correção posterior estão esclarecidos no [índice documental](documents/LEIA-ME.txt). A revisão atual não executou Metro nem validação física.
