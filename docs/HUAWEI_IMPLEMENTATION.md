# Entrega — layout Huawei

Branch: feat/huawei-warehouse-layout. Base: 5196b3c1eab3a3648931f517bdd8d0c888166168 (main, com 21adbb7 e 7acefc5). Nenhum merge para main.

## Configuração e mapa

warehouseLayout.ts centraliza escala (1 m/célula), START (6,0), prateleiras, módulos, limites, destinos, markerPosition, accessPoint e markerTarget. y do mapa equivale a Z físico.

A: x=[0,12), Z=[3,4). B: x=[0,12), Z=[6,7). Bloqueios discretos: x=0..11 em Z=3 e Z=6. Quatro módulos de 3 m por rack, START a 3 m de A, corredor livre de 2 m. Os limites x=-2..13/Z=-1..8 são margens lógicas de circulação/visualização.

| Endereço | Rack/módulo | Marker X/Z | Acesso X/Z | Checkpoints calculados X/Z |
|---|---|---|---|---|
| SF01001A | A/1 | 1,5 / 3 | 1 / 2 | (6,0) → (6,2) → (1,2) |
| SF01014A | A/3 | 7,5 / 3 | 7 / 2 | (6,0) → (6,2) → (7,2) |
| SF01009B | B/1 | 1,5 / 6 | 1 / 5 | (6,0) → (6,2) → (-1,2) → (-1,5) → (1,5) |
| SF01012B | B/3 | 7,5 / 6 | 7 / 5 | (6,0) → (6,2) → (12,2) → (12,5) → (7,5) |

Esses checkpoints são derivados pelo BFS, não hardcoded. Rota para B/M1 contorna A pela esquerda; para B/M3, pela direita. Acesso permanece fora das células bloqueadas. Centros dos módulos são referências visuais.

## Targets e evidências

START_HUAWEI, SF01001A, SF01014A, SF01009B e SF01012B usam as cinco fotografias reais fornecidas. Nenhuma imagem está faltando. Assets em assets/markers/huawei; originais, ambiente e esboço em docs/images/huawei. Script reproduzível de recorte/retificação em scripts/prepare-huawei-targets.py. Sem geração ou decodificação de QR.

Larguras físicas de 0,20 m são nominais: medir e atualizar targetPhysicalWidths em huaweiTargets.ts antes do teste. Qualidade/discriminação dos targets só será confirmada no Xiaomi.

## Verificações executadas

| Verificação | Resultado |
|---|---|
| npm run typecheck | Aprovado |
| npm test | 39/39 aprovados, zero falhas/skips |
| npm run verify | Tipos e testes aprovados |
| git diff --check | Sem erros |
| npm run export:android | Aprovado; bundle Hermes e cinco targets incluídos |
| npm run export:web | Aprovado, conferência complementar do bundle |
| Inspeção visual da interface | Não concluída: navegador não acessou localhost |
| APK / instalação / teste físico | Não executados nesta sessão |

No Windows, a primeira tentativa de Hermes falhou por permissão no TEMP do sandbox; a exportação passou com TEMP/TMP direcionados à pasta temporária do projeto, sem alterar dependências nem desativar Hermes. Os avisos do compilador sobre globais React Native não impediram a exportação.

## Arquivos

Criados (além deste relatório):

- assets/markers/huawei/SF01001A.png
- assets/markers/huawei/SF01009B.png
- assets/markers/huawei/SF01012B.png
- assets/markers/huawei/SF01014A.png
- assets/markers/huawei/start-huawei.png
- docs/images/huawei/SF01001A.jpg
- docs/images/huawei/SF01009B.jpg
- docs/images/huawei/SF01012B.jpg
- docs/images/huawei/SF01014A.jpg
- docs/images/huawei/ambiente-huawei.jpg
- docs/images/huawei/layout-huawei.png
- docs/images/huawei/start-huawei.jpg
- scripts/prepare-huawei-targets.py
- src/ar/huaweiTargets.ts
- src/navigation/warehouseLayout.ts
- tests/huaweiLayout.test.ts

Alterados:

- README.md
- docs/DEVELOPMENT.md
- docs/START-AR.md
- src/ar/NavigationScene.tsx
- src/ar/ViroExperience.tsx
- src/ar/markerSelection.ts
- src/ar/materialMarker.ts
- src/components/WarehouseMap.tsx
- src/data/catalog.ts
- src/navigation/materialRoute.ts
- src/navigation/materialSession.ts
- src/navigation/relativeNavigation.ts
- src/navigation/session.ts
- src/screens/CameraExperience.tsx
- src/screens/WarehouseSimulation.tsx
- src/warehouse/layout.ts
- tests/ar.test.ts
- tests/arrivalGate.test.ts
- tests/materialRoute.test.ts
- tests/materialSession.test.ts
- tests/rackRecognition.test.ts
- tests/relativeNavigation.test.ts
- tests/session.test.ts
- tests/warehouse.test.ts

## Validação física e limites

Seguir [START-AR.md](START-AR.md), com preparação da branch/Metro, largura das etiquetas, posicionamento no START, percurso dos quatro endereços, etiqueta errada da mesma prateleira, reconhecimento correto antecipado, chegada única, tracking perdido e recalibração.

A implementação preserva START → checkpoints em ordem → endereço correto. Não altera arquitetura nem adiciona localização indoor. Export Android não é APK. Não se afirmam precisão, resultados com participantes ou ganhos de produtividade. O SHA final e a publicação da branch devem ser conferidos no histórico Git; este relatório integra o próprio commit.
