# Desenvolvimento NexWay — ambiente Huawei

React Native 0.86.3, React 19.2.3, TypeScript ~6.0.3, Expo ~57.0.31 e ViroReact 3.0.3. Sem alteração de arquitetura, backend ou novas dependências de execução. Expo Go não suporta esta cena nativa.

## Base e responsabilidades

Branch: feat/huawei-warehouse-layout, a partir de main em 5196b3c1eab3a3648931f517bdd8d0c888166168. Essa base contém 21adbb7 (documentação) e 7acefc5 (checkpoints antes da chegada). Preservado o vínculo EAS existente. Não fazer merge automático para main.

Leonardo: catálogo, destinos, rotas e estado da navegação. Rafael: ambiente mobile, imagem/cena AR e validação física. Planejamento em [divisão técnica](../NexWay_Divisao_Desenvolvimento_Leonardo_Rafael.pdf).

## Fonte única de geometria

[src/navigation/warehouseLayout.ts](../src/navigation/warehouseLayout.ts) define escala, limites lógicos, START, A/B, módulos, destinos, markerPosition, accessPoint e markerTarget. O catálogo deriva dessa configuração; não inventa nomes de produtos.

- X cresce para a direita. y do mapa é Z físico, crescente rumo ao fundo.
- START (6,0); escala confirmada 1 metro/célula.
- A ocupa x=[0,12), Z=[3,4); B ocupa x=[0,12), Z=[6,7).
- Cada prateleira tem quatro módulos de 3 m; corredor livre de 2 m; START a 3 m de A.
- Grade inteira x=-2..13 e Z=-1..8. As margens possibilitam contorno e visualização; não são medições de paredes.
- Bloqueios discretos: A x=0..11/Z=3; B x=0..11/Z=6. BFS ortogonal retorna o menor caminho ao accessPoint de cada endereço. Nenhum destino está numa célula bloqueada.
- SF01001A → A/M1, acesso (1,2); SF01014A → A/M3, (7,2); SF01009B → B/M1, (1,5); SF01012B → B/M3, (7,5).
- Para B, o BFS usa x=-1 ou x=12 ao cruzar a profundidade de A. As células e as mudanças de direção são calculadas, não uma sequência manual de instruções.

## Fluxo ativo

App.tsx compartilha materialSession entre abas. NavigationScene recebe anchors e poses de ViroReact. materialMarker prioriza START, recusa destino antecipado e prioriza endereço correto somente após o percurso. materialRoute usa BFS e reduz a rota a START, curvas e acesso final. relativeNavigation converte a pose para metros relativos e avança apenas o checkpoint esperado.

A nomenclatura interna RackId/recognize-rack foi mantida para compatibilidade dos callbacks, mas seu tipo agora é a união dos **quatro endereços**, nunca apenas A ou B. A comparação de chegada é por identidade exata do endereço.

START → checkpoints em ordem → etiqueta correta → horário único. Endereço correto antecipado ou endereço errado da mesma prateleira não concluem. Tracking limitado, pose inválida, salto >2 m, ausência de pose >1,5 s, saída da câmera ou segundo plano exigem recalibração. Chegada já validada permanece idempotente. Trocar de endereço reinicia a sessão.

session.ts e markerSelection.ts são regras legadas, não conectadas à câmera atual. Seus testes de regressão permanecem, mas não representam a proteção de chegada do fluxo ativo.

## Imagens reais

[huaweiTargets.ts](../src/ar/huaweiTargets.ts) liga os cinco IDs a requires estáticos (Metro) dos PNGs em assets/markers/huawei. ViroARImageMarker reconhece as imagens; não há decodificação de QR. orientation: Up indica orientação dos pixels, não instalação vertical; o START real fica no piso.

O script [prepare-huawei-targets.py](../scripts/prepare-huawei-targets.py) usa Pillow somente como ferramenta de preparação: recorta e retifica os quatro cantos para 512×512 com interpolação bicúbica. Não redesenha QR, não altera texto, não faz reconstrução generativa nem aumenta a informação disponível na foto. Fotos originais e esboço ficam em docs/images/huawei. Nenhuma das cinco imagens está faltando.

Larguras físicas de 0,20 m em targetPhysicalWidths são **nominais**, pois não foram fornecidas medidas das etiquetas. Conferir largura externa do recorte físico e ajustar por ID antes de registrar validação. A escala do mapa não é provisória. O START tem resolução menor e SF01001A apresenta desgaste real; estabilidade e discriminação das imagens semelhantes dependem do teste no aparelho.

## Interface

Armazém virtual mostra B ao fundo, A mais próxima, quatro módulos por rack, corredor, START, quatro endereços selecionáveis e destaque exclusivo do módulo escolhido. O percurso é uma simulação, com pausa/retomada/reinício. A câmera mostra esperado/reconhecido, destino, checkpoints, direção, distância e X/Z. A planta da câmera é estática, não uma posição ao vivo.

## Verificações e execução

Execute npm run verify (typecheck e testes), git diff --check e npm run export:android. Os 29 testes anteriores foram mantidos/adaptados; 10 testes adicionais cobrem geometria, caminhos mínimos, pares de etiquetas, contorno, recalibração e assets. Export gera bundle/assets Android, **não APK**.

Use o Development Build instalado e npm start para servir o JS atual pelo Metro. Se necessário, compile com npm run build:android ou prebuild/Gradle descritos no README. Não é necessário adicionar dependências nativas para esta alteração. O projeto EAS da equipe já está configurado.

## Rastreabilidade e validação física

Siga [START-AR.md](START-AR.md). Registre commit, working tree limpa, resultado de testes, APK/Android/aparelho e Metro iniciado nessa mesma versão. O SHA-256 do APK identifica o shell nativo, não o JS servido pelo Metro. [BUILD_EVIDENCE.md](BUILD_EVIDENCE.md) e o artigo acadêmico são registros históricos, sem comprovar este novo layout.

Esta etapa é validação técnica em ambiente real de armazenagem. Não constitui experimento com participantes nem demonstra ganhos, precisão ou tempos. A rota evita obstáculos cadastrados; não detecta objetos móveis. Alinhamento inicial e deriva do tracking precisam ser observados fisicamente.
