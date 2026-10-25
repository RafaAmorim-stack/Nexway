# Marco 5 — orientação relativa com Viro/ARCore

Versões preservadas: Expo ~57.0.31, React Native 0.86.3 e @reactvision/react-viro 3.0.3.

## Fluxo

Selecione um material no Armazém virtual. Na Câmera AR, reconheça START-01 em tracking normal. O app captura a posição e o vetor frontal da câmera nesse instante, calcula a rota local e passa a acompanhar deslocamento e direção com onCameraTransformUpdate do Viro. Não há markers intermediários. O rack correto continua sendo a única validação da chegada; o rack errado mostra esperado/reconhecido sem concluir.

O ponto onde o usuário fica ao reconhecer START é a origem relativa (0,0). A direção horizontal da câmera nessa captura representa a frente do mapa. Portanto, reconheça o START a partir de um ponto de parada demarcado, olhando para o corredor principal. A rotação do desenho do marker não alinha o mapa automaticamente. Não calibre olhando de lado ou para trás.

A câmera fornece coordenadas em metros no referencial da sessão AR. A lógica subtrai a posição inicial e projeta o deslocamento nos eixos horizontais frontal e direito capturados no START. X positivo aponta para a direita; Z positivo aponta para a frente. A altura não participa da navegação. A direção relativa considera também para onde a câmera está olhando agora, com ângulo positivo à direita e negativo à esquerda.

## Mapa e parâmetros locais

A grade é de 15 × 13 células. x cresce para a direita; y para baixo. START = (7,11). Os acessos são RACK-A = (4,4), RACK-B = (8,4), RACK-C = (12,4), fora das áreas das estantes. Paredes bloqueiam o contorno; os retângulos bloqueados são A: x=2..3/y=2..7, B: x=6..7/y=2..7, C: x=10..11/y=2..7. A busca em largura mantém a rota nas células livres, sem diagonais.

Parâmetros em src/navigation/relativeNavigation.ts:

- METERS_PER_CELL = 1: escala inicial de demonstração, 1 metro por célula.
- CHECKPOINT_TOLERANCE = 0.45: avança ao ficar a até 45 cm do próximo checkpoint.
- A pose é processada aproximadamente a cada 150 ms; mais de 1,5 s sem pose causa suspensão, verificada a cada 500 ms.
- Poses inválidas, direção quase vertical ou salto superior a 2 m entre amostras descartam a calibração.

As mudanças de direção formam os checkpoints ordenados. Para RACK-B: START (0,0 m) → Corredor principal (0,3 m) → Corredor B (1,3 m) → RACK-B (1,7 m). RACK-A inclui um acesso lateral antes do rack. Só o próximo checkpoint pode avançar; o app não pula para outro por proximidade. A distância é horizontal e aproximada. Ao percorrer todos os checkpoints, o app pede o marker do rack e não conclui sozinho.

A sobreposição da câmera mostra seta 2D, direção, próximo checkpoint e distância. A área de depuração mostra X, Z, distância e ângulo. A planta continua mostrando o plano; não desenha uma posição ao vivo. Os parâmetros e o mapa precisam ser ajustados às dimensões reais antes de uso operacional. Não há colisão física nem prevenção de obstáculos novos; o cálculo evita apenas os bloqueios conhecidos do mapa.

## Perda de tracking e ciclo de vida

Tracking limitado, ausência de poses, pose inválida ou mudança brusca de referencial suspendem a orientação. As coordenadas deixam de ser usadas e nenhum checkpoint avança enquanto não houver nova calibração. Volte ao ponto físico de START, olhe para o corredor principal e reconheça START novamente. A sequência de checkpoints reinicia; a chegada não é registrada pela recuperação do tracking.

Ir para segundo plano ou sair da aba AR descarta a calibração, pois a cena nativa pode ser recriada com outro referencial. Material, rota e uma chegada já validada ficam na sessão do App; a orientação pede novo START ao voltar. Trocar material limpa START/chegada e reinicia origem e checkpoints. Selecionar novamente o mesmo material, sem sair da câmera, preserva a sessão. Fechar o app reinicia tudo.

## Roteiro no Xiaomi

1. Instale android/app/build/outputs/apk/debug/app-debug.apk. Execute npm start em C:\NexWay\nexway e abra o servidor no development client. Use a mesma rede ou npm run start:tunnel. O APK debug usa Metro; o QR de conexão não é um marker de navegação.
2. Imprima assets/markers/print.html em tamanho real: cada imagem completa deve medir 20 × 20 cm, sem ajustar à página. Posicione START para ser reconhecido olhando na direção do corredor principal. Prepare um espaço livre e marque no chão o ponto de parada inicial e as posições métricas dos checkpoints da rota de demonstração.
3. Selecione MAT-002 (RACK-B), abra Câmera AR e permita a câmera. Antes de START, confira que não há coordenadas ou orientação ativa. Mostrar um rack não deve iniciar navegação nem chegada.
4. No ponto demarcado, olhe para o corredor principal e reconheça START. Confira material, RACK-B, rota e depuração X≈0/Z≈0. A seta deve apontar para frente, distância inicial≈3 m, próximo checkpoint Corredor principal.
5. Retire START do campo de visão e caminhe lentamente 1 m em frente: Z deve aumentar aproximadamente 1 m e a distância diminuir. Não há necessidade de outro marker. Desloque o celular para a direita sem girar: X deve aumentar. Variações pequenas e deriva são possíveis.
6. Gire no mesmo lugar para a direita: X/Z devem permanecer aproximadamente estáveis, mas a orientação para o checkpoint deve passar a pedir esquerda. Gire para a esquerda e para trás para conferir os demais sentidos. Mantenha o celular próximo da vertical e a câmera apontada adiante, não diretamente para o chão.
7. Aproxime-se de (0,3 m). Dentro de 45 cm, o próximo checkpoint passa para Corredor B. A orientação deve indicar direita até (1,3 m), depois orientar para RACK-B em (1,7 m). Permanecer perto de um checkpoint já atingido não deve avançar os demais.
8. Ao alcançar a posição final, confira Checkpoints percorridos e pedido para reconhecer RACK-B. Não deve aparecer Chegada registrada apenas por distância.
9. Mostre RACK-A: confira Estante incorreta, Esperado: RACK-B e Reconhecido: RACK-A, sem chegada. Mostre RACK-B: deve registrar chegada uma única vez. Repetir o marker não muda o horário.
10. Repita com MAT-001 e MAT-003. Trocar material exige START novamente e deve zerar X/Z e sequência após nova captura. As rotas terminam nos acessos dos respectivos racks, contornando os bloqueios lógicos.
11. Durante o percurso, cubra a câmera ou reduza a iluminação para provocar tracking limitado. A orientação deve ser suspensa, sem avanço/chegada. Retorne ao ponto inicial e reconheça START olhando para frente: coordenadas e checkpoints reiniciam.
12. Coloque o app em segundo plano e retorne; alterne as abas. A calibração deve ser descartada e pedir START novamente. Uma chegada já confirmada deve permanecer registrada. Teste câmera negada e retorno dos ajustes.
13. Observe o comportamento em caminhada lenta, paradas e curvas. Registre diferenças entre as distâncias físicas medidas e as mostradas, oscilações de X/Z, perdas de tracking e eventuais viradas incorretas. Esses resultados são necessários para calibrar escala/tolerância no aparelho.

## Verificação automatizada

Execute npm run typecheck, npm test, npm run export:android e, dentro de android, .\gradlew.bat assembleDebug. Os testes verificam matemática, avanço ordenado, reinício, perda de tracking e validação final pelo rack. Eles não substituem a validação física do ARCore no Xiaomi.

Não há Cloud Anchors, VPS, GPS indoor, backend, mapa 3D completo ou seta 3D. A orientação visual é uma sobreposição 2D alimentada pela pose local da câmera.
