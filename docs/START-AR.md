# Huawei — validação técnica no Xiaomi

Fluxo obrigatório: selecionar endereço → reconhecer START → percorrer checkpoints em ordem → reconhecer endereço correto → registrar chegada uma vez.

## Preparação da versão

1. No checkout do NexWay, execute git fetch origin e git switch feat/huawei-warehouse-layout. Confira git log -1 e git status --porcelain (vazio antes do teste).
2. Use Node 22.13+ e npm ci. Execute npm run verify, git diff --check e npm run export:android. Export Android produz bundle e assets, não instala nem gera APK.
3. Instale/abra o Development Build compatível com as dependências atuais. Expo Go não funciona. Se precisar compilar: npm run build:android (EAS já vinculado) ou npx expo prebuild --platform android e android\gradlew.bat assembleDebug. A instalação via ADB está detalhada no README.
4. Execute npm start **neste checkout/branch**, abra esse servidor no app Xiaomi, na mesma rede; npm run start:tunnel é alternativa. O QR do Metro é apenas conexão com o servidor, não o START.
5. Registre modelo Xiaomi, Android, commit, APK e servidor Metro usados. Evidência antiga não valida este layout automaticamente.

## Preparação física

- Use as cinco etiquetas reais fotografadas, sem imprimir o antigo print.html A/B/C. START circular no piso; SF01001A e SF01014A em A; SF01009B e SF01012B em B.
- Meça a largura externa de cada região usada no recorte e ajuste targetPhysicalWidths em src/ar/huaweiTargets.ts. Os 20 cm atuais são nominais, não aferidos. Não altere a escala confirmada de 1 m/célula para compensar um target mal configurado.
- Reproduza o esboço: START (6,0); A 12×1 m em Z=3..4; corredor Z=4..6; B 12×1 m em Z=6..7. Módulos 1/2/3/4 ocupam faixas X=0..3/3..6/6..9/9..12.
- Confira que as extremidades da A utilizadas pelo plano estão livres. O aplicativo conhece as prateleiras, mas não obstáculos móveis.
- MarkerPosition é o centro visual do módulo. AccessPoint é a célula livre de aproximação, não a posição da etiqueta na estrutura.

| Destino | Marker X/Z | Acesso X/Z | Referência |
|---|---|---|---|
| SF01001A | 1,5 / 3 | 1 / 2 | A, módulo 1 |
| SF01014A | 7,5 / 3 | 7 / 2 | A, módulo 3 |
| SF01009B | 1,5 / 6 | 1 / 5 | B, módulo 1 |
| SF01012B | 7,5 / 6 | 7 / 5 | B, módulo 3 |

## Calibração do START no chão

A origem relativa (0,0) é a **pose horizontal da câmera no reconhecimento**. A direção horizontal da câmera define a frente do mapa; a rotação da foto não alinha o mapa automaticamente. Fique no ponto demarcado START, voltado para A, e incline a câmera para enquadrar o marcador sem girar lateralmente. Evite apontar exatamente na vertical: não há direção horizontal válida nesse caso. Mantenha a projeção horizontal do telefone tão próxima do START quanto possível; afastar-se do ponto durante a captura introduz deslocamento na rota.

O mapa usa X positivo à direita e Z positivo em direção às prateleiras. O código usa y para Z no mapa 2D, sem inverter o sinal na conversão para tracking. Altura não participa da navegação. orientation: Up do target é a orientação da imagem, não a orientação do piso.

## Casos a executar

1. Busque SF01001A e selecione. Confira A/M1 na lista e destaque apenas desse módulo. Repita busca/seleção dos quatro endereços.
2. Abra a Câmera AR. Antes de START, mostre qualquer etiqueta de destino: não deve liberar navegação nem chegada.
3. Reconheça START com tracking normal. Confira X≈0 e Z≈0, destino correto e rota. Para os quatro planos atuais o primeiro checkpoint fica em (6,2), isto é, (0,2) relativo ao START.
4. Mostre o endereço correto imediatamente após START. **Não pode registrar chegada.**
5. Caminhe lentamente em direção ao primeiro checkpoint. Z deve aumentar, distância diminuir. Gire sem andar: a direção muda, X/Z ficam aproximadamente estáveis. A tolerância de avanço é 0,45 m.
6. Siga os próximos checkpoints na ordem apresentada. Não há etiquetas intermediárias: checkpoints são as curvas e o acesso final do BFS. Não pule a curva mesmo que veja a etiqueta de destino.
7. Para SF01009B, confira contorno pela esquerda da A. Para SF01012B, confira contorno pela direita. Nenhum segmento pode entrar em A ou B. Os pontos exatos aparecem na tela; não caminhe através de estoque para alcançar um checkpoint.
8. Ao concluir os checkpoints, confira pedido para validar a posição. Não deve registrar chegada apenas por proximidade.
9. Com SF01012B selecionado, mostre SF01009B: deve indicar endereço incorreto, esperado SF01012B, reconhecido SF01009B. Mostre também SF01014A: não deve validar. Agora mostre SF01012B: chegada registrada uma única vez; repetir não altera horário.
10. Repita o teste de etiqueta errada/correta e reconhecimento antecipado para todos os endereços, especialmente SF01001A versus SF01014A.
11. Durante uma rota não concluída, provoque tracking limitado. A orientação deve suspender, limpar origem e pedir START. Mostrar somente o destino não recupera a sessão. Retorne ao START e refaça os checkpoints.
12. Teste segundo plano e saída/retorno da aba AR. Antes da chegada, exigem START novamente. Troca de endereço reinicia tudo; uma chegada já validada fica registrada para a sessão até trocar de destino/reiniciar o app.
13. Teste câmera negada e reativação nos ajustes. Observe iluminação/reflexos, reconhecimento dos quatro recortes semelhantes, desgaste da etiqueta SF01001A e resolução do START.

## Parâmetros e registro

Escala: 1 m/célula. Tolerância: 0,45 m. Pose processada aproximadamente a cada 150 ms. Ausência de poses por mais de 1,5 s (verificação a cada 500 ms), direção horizontal inválida, tracking limitado ou salto >2 m descartam a calibração. A câmera é mantida durante a navegação ativa; sistema em segundo plano ou saída da aba desmonta a cena.

Registre por destino: reconhecimento START, sequência seguida, etiqueta errada rejeitada, correta antecipada rejeitada, correta final aceita uma vez, perda/recalibração e diferença observada entre posições medidas e X/Z mostrado. Anexe evidências e versão. Não há resultados físicos desta implementação registrados neste documento.

A planta da câmera mostra o plano, não posição ao vivo. A orientação é sobreposição 2D e pode sofrer deriva. As margens laterais da grade são limites lógicos, não paredes aferidas. Os testes automatizados não comprovam precisão AR, discriminação das etiquetas no aparelho ou produtividade. Esta é **validação técnica em ambiente real de armazenagem**, não experimento com participantes.
