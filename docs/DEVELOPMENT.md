# Desenvolvimento Nexway

O projeto usa **React Native, TypeScript e ViroReact 3.0.3**, com aplicativo nativo próprio. Expo SDK 57, React Native 0.86.3 e React 19.2.3 respeitam a compatibilidade declarada pelo ViroReact. O Expo fornece as ferramentas de desenvolvimento e o EAS permite compilar na nuvem, sem Xcode local.

O planejamento de referência está no PDF `NexWay_Divisao_Desenvolvimento_Leonardo_Rafael.pdf`, com entrega prevista em 01/12/2026.

## Responsabilidades e integração

Leonardo: catálogo, destinos, regras de navegação, integração de estado e métricas.
Rafael: ambiente mobile, reconhecimento de imagens, cena AR e validação física.

Use `develop` para integração e `feat/*` ou `fix/*` para alterações. Abra PR com referência à issue/card e solicite revisão do outro desenvolvedor. `main` deve conter versões demonstráveis.

## Execução nativa

O README contém os comandos para autenticar no EAS, vincular o projeto, registrar o iPhone e gerar o build. O perfil `development` em `eas.json` produz o aplicativo para dispositivo físico. A instalação no iPhone depende de credenciais Apple Developer e do Modo de Desenvolvedor.

Depois de instalar o Nexway, `npm start` inicia o Metro para o development client. O QR code/deep link abre o aplicativo Nexway instalado. Use `npm run start:tunnel` quando a rede bloquear a conexão direta. Alterações de módulos nativos ou plugins exigem um novo build.

`.easignore` exclui `android/` e `ios/` gerados localmente para o EAS criar projetos nativos a partir da configuração atual. O build na nuvem ainda depende de login e vinculação à conta Expo; não há IPA gerado nem teste físico concluído.

## Estrutura de realidade aumentada

- `src/camera/CameraPreview.tsx`: entrada direta da experiência ViroReact e tratamento de erro de renderização.
- `src/ar/ViroExperience.tsx`: permissão da câmera, ciclo de vida e ViroARSceneNavigator.
- `src/ar/ARContext.ts`: estado compartilhado entre a navegação e a cena.
- `src/ar/NavigationScene.tsx`: cadastro de targets, eventos de anchors e texto ancorado.
- `src/ar/markerSelection.ts`: prioridade do checkpoint esperado entre imagens visíveis.
- `src/navigation/session.ts`: sequência START → RACK, erros, conclusão e métricas.

`expo-camera` é usado somente para consultar e solicitar a permissão. O ViroReact renderiza a câmera e os objetos virtuais. A câmera é desmontada ao sair da aba e ao entrar em segundo plano; a sessão de navegação permanece em memória.

START e chegada são confirmados por reconhecimento de imagem. A retirada é confirmada pelo usuário. O modo demonstração é separado e oferece botões de checkpoint para testar as regras sem câmera.

## Validação física

1. Imprimir `assets/markers/print.html` em tamanho real. A imagem de cada target deve medir 20 × 20 cm, sem ajuste automático de escala.
2. Instalar o build em iPhone compatível com ARKit ou Android compatível com ARCore.
3. Selecionar MAT-001 e reconhecer RACK-A antes de START: deve indicar erro sem avançar.
4. Reconhecer START-01, depois RACK-B: deve manter o destino RACK-A.
5. Reconhecer RACK-A e conferir o setor/prateleira ancorado. Confirmar retirada e compartilhar métricas.
6. Repetir com os demais materiais. Testar reconhecimento simultâneo de START/estante, perda/retomada do tracking e baixa iluminação.
7. Testar permissão negada, alteração da permissão nos ajustes, retomada do aplicativo e alternância de abas.
8. Conferir legibilidade e orientação do texto com o marcador na posição real de uso. Registrar vídeo, aparelho, sistema e versão do build.

Os PNGs são candidatos de teste: sua qualidade no reconhecimento ainda não foi medida. Exportações JavaScript e geração dos projetos nativos não comprovam estabilidade do tracking nem substituem um build e teste no aparelho.

## Armazém virtual e limites atuais

A planta fictícia tem três estantes e entrada START. Selecionar um material destaca estante, setor e prateleira. O caminho é calculado em uma grade, evitando obstáculos, com indicador animado, pausa, retomada e reinício. Trocar o material reinicia o percurso.

O mapa virtual não calibra a cena AR nem define coordenadas do armazém real. Setas espaciais, relocalização global e delimitação 3D precisa da prateleira dependem de layout e calibração física. O destaque atual é textual e ancorado ao marcador, conforme o fallback previsto no PDF.

O baseline WL04 não foi fornecido e sua validação permanece pendente. O catálogo é fictício. Métricas e sessão ficam em memória até serem compartilhadas; fechar o aplicativo perde os registros não exportados. O tempo total vai da seleção até a confirmação da retirada; a chegada tem timestamp separado.

## Verificações

`npm run verify` executa TypeScript e os testes de busca, sessão, prioridade de marcadores e caminhos da planta. A automação também exporta bundles web, iOS e Android. `npm run doctor` verifica a configuração e a compatibilidade do SDK.

A árvore Expo/ViroReact apresenta alertas de dependências herdadas relacionados a `braces` e `node-forge`. Reavaliar atualizações compatíveis antes da distribuição; não forçar versões fora das faixas suportadas para contornar esses alertas.
