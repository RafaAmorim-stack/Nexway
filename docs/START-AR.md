# Marco 2 — material e destino após START

Versões preservadas: Expo ~57.0.31, React Native 0.86.3 e @reactvision/react-viro 3.0.3.

## Teste manual no Xiaomi

1. Instale o APK de desenvolvimento de android/app/build/outputs/apk/debug/app-debug.apk. Se o build já instalado é o do Marco 1 com as mesmas dependências nativas, basta carregar o JavaScript atualizado.
2. No computador, em C:\NexWay\nexway, execute `npm start`. Mantenha o terminal aberto e o celular na mesma rede. No launcher Expo, use Fetch development servers e abra o servidor. Se necessário use `npm run start:tunnel` e escaneie o QR do Metro. Esse QR apenas conecta o aplicativo.
3. Em Armazém virtual, busque `protecao` ou `MAT-002` e toque em Luva de proteção. Confira a indicação Selecionado e RACK-B. MAT-001 é a seleção inicial.
4. Abra Câmera AR e permita a câmera. Antes do reconhecimento, confira Aguardando marcador START, Material: MAT-002 · Luva de proteção e Destino: RACK-B.
5. Imprima assets/markers/START-01.png com a imagem medindo 20 × 20 cm. Aponte para a imagem completa em boa iluminação. Deve aparecer START reconhecido, mantendo material e destino.
6. Retire a imagem do campo de visão e alterne entre as abas. Material, destino e confirmação devem permanecer. Coloque o app em segundo plano e retome: a confirmação também permanece.
7. Volte ao Armazém virtual, selecione MAT-003 e abra Câmera AR: deve mostrar MAT-003, Destino: RACK-C e aguardar um novo START. Reconheça novamente. Repita com MAT-001 → RACK-A.
8. Pesquise um código inexistente: deve aparecer Nenhum material encontrado e a seleção anterior permanece. Limpe a busca para exibir os três materiais. Selecionar novamente o mesmo material preserva a confirmação.
9. Teste câmera negada e retorno dos ajustes. Apenas o reconhecimento da imagem START confirma o início.

O estado fica em App e permanece em memória durante a alternância das telas. Fechar/reiniciar o aplicativo volta ao material inicial e aguarda START. O catálogo é demonstrativo; não há material 100001 nos dados atuais.

A cena AR continua cadastrando exclusivamente START. Não há seta AR, reconhecimento de rack, setor/prateleira na câmera nem navegação contínua. O armazém virtual mantém sua simulação preexistente, separada da experiência AR.

## Verificação

Execute `npm run typecheck`, `npm test` e, dentro de android, `.\gradlew.bat assembleDebug`. O APK debug usa Metro; build e testes não substituem a validação óptica no Xiaomi.
