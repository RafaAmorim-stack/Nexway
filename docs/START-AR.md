# Marco 3 — reconhecimento da estante destino

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
