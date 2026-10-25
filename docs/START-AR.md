# Marco 4 — rota lógica após START e validação da estante

Versões preservadas: Expo ~57.0.31, React Native 0.86.3 e @reactvision/react-viro 3.0.3.

## Teste manual no Xiaomi

1. Instale android/app/build/outputs/apk/debug/app-debug.apk. Execute npm start em C:\NexWay\nexway e conecte o development client ao Metro na mesma rede; se necessário use npm run start:tunnel. O QR do Metro só conecta o aplicativo.
2. Abra assets/markers/print.html e imprima START-01, RACK-A, RACK-B e RACK-C em tamanho real, sem ajuste à página. Cada imagem deve medir 20 × 20 cm. Use boa iluminação e mantenha a imagem inteira visível.
3. Em Armazém virtual, selecione MAT-002 (Luva de proteção). Abra Câmera AR e permita a câmera. Confira material, Destino: RACK-B e Aguardando marcador START.
4. Antes de START, mostre RACK-B e RACK-A: nenhum deles deve registrar chegada nem avançar o fluxo.
5. Reconheça START-01: confira START reconhecido · Aguardando marcador da estante destino.
6. Mostre RACK-A: confira Estante incorreta, Esperado: RACK-B e Reconhecido: RACK-A, sem chegada. Repita com RACK-C. Retire o marker: perder rastreamento não deve avançar o fluxo; a última mensagem fica visível.
7. Mostre RACK-B: confira Estante correta reconhecida e Chegada registrada com data e hora. Mostre novamente RACK-B, START e outros racks: o registro deve permanecer com o mesmo horário.
8. Alterne abas e coloque o aplicativo em segundo plano; ao retornar, seleção e chegada devem permanecer. Selecionar o mesmo material também preserva o estado.
9. Selecione MAT-001: deve limpar reconhecimento e chegada, exigindo START novamente. Teste erro com RACK-B/RACK-C e sucesso com RACK-A. Repita para MAT-003, com destino RACK-C.
10. Mostre START e o rack destino juntos: deve reconhecer START e depois o rack já visível. Com vários racks visíveis, o destino tem prioridade. Cubra e descubra os markers; apenas anchors reconhecidos e rastreados devem ser considerados.
11. Teste câmera negada, retorno dos ajustes e pausa/retomada. Confira busca inexistente e preservação da seleção anterior.

A chegada fica em memória na sessão do App, com rack e horário; fechar/reiniciar o aplicativo reinicia a sessão. Não há persistência em disco ou envio para servidor. Não há setor/prateleira na câmera, seta AR contínua ou navegação até o rack. A simulação do armazém permanece independente.

## Verificação

Execute npm run typecheck, npm test e, dentro de android, .\gradlew.bat assembleDebug. O APK debug depende do Metro. Build e testes automatizados não substituem validação óptica no Xiaomi.

## Rota local do Marco 4

O mapa usa uma grade de 15 × 13 células, sem escala física. A origem fica no canto superior esquerdo: x cresce para a direita, y para baixo. START = (7,11). Os pontos de acesso são RACK-A = (4,4), RACK-B = (8,4), RACK-C = (12,4), ao lado das estantes, fora da área bloqueada. As paredes ocupam o contorno. As estantes bloqueiam os retângulos A: x=2..3/y=2..7, B: x=6..7/y=2..7 e C: x=10..11/y=2..7. As demais células internas são transitáveis.

O cálculo por busca em largura usa movimentos entre células vizinhas, sem diagonais, e encontra o menor caminho disponível. Os checkpoints resumem as mudanças de direção. Exemplo: START (7,11) → Corredor principal (7,8) → Corredor B (8,8) → RACK-B (8,4). Nenhum checkpoint intermediário exige marker.

### Teste complementar no Xiaomi

1. Selecione MAT-002 e abra Câmera AR: antes de START não deve aparecer Rota calculada.
2. Reconheça START. Confira material, RACK-B, rota textual, coordenadas dos checkpoints, traçado no mapa e Próxima instrução para o corredor principal.
3. Confira que o caminho contorna as áreas das estantes. O mapa não mostra posição ao vivo. Caminhar ou esperar não avança a instrução e não registra chegada.
4. Reconheça RACK-A: a mensagem de erro permanece com esperado/reconhecido; a rota continua para RACK-B, sem chegada. Reconheça RACK-B para validar a chegada.
5. Troque para MAT-001 e depois MAT-003, reconhecendo START novamente a cada troca. Confira caminhos distintos e destinos RACK-A e RACK-C.
6. Alterne abas e retome o app do segundo plano: o plano da seleção atual deve permanecer. Selecionar o mesmo material não reinicia a sessão.

Não há tracking contínuo ARCore, seta AR dinâmica ou avanço automático entre checkpoints. A próxima instrução indica a saída do START até o primeiro checkpoint; após chegada exibe a validação final. As coordenadas são demonstrativas e precisam ser adaptadas ao armazém real antes de uso operacional.
