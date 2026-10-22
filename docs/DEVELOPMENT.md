# Desenvolvimento

Baseada no PDF NexWay_Divisao_Desenvolvimento_Leonardo_Rafael.pdf. Entrega prevista: 01/12/2026.

Leonardo: catálogo, destinos, regras de navegação, integração de estado e métricas.
Rafael: ambiente Android, reconhecimento, cena AR e validação física.

Use develop para integração e feat/* ou fix/* para alterações. Abra PR para develop com referência à issue/card e solicite revisão do outro desenvolvedor. main deve conter versões demonstráveis.

## Validação física pendente

1. Configurar Android Studio, Android SDK, adb e JDK compatível com a versão do Gradle gerada pelo Expo (recomendação inicial: JDK 17).
2. Conectar Android compatível com ARCore, com depuração USB, e conferir adb devices.
3. Executar npm run doctor, npm run prebuild e npm run android.
4. Imprimir assets/markers/print.html em tamanho real; cada imagem deve medir 20 cm de largura. Não confundir o texto externo com parte do target.
5. Selecionar MAT-001 e reconhecer RACK-A antes de START: deve indicar erro sem avançar.
6. Reconhecer START-01, depois RACK-B: deve manter destino RACK-A.
7. Reconhecer RACK-A, conferir setor/prateleira, confirmar retirada e compartilhar JSON.
8. Repetir com outros materiais; testar baixa iluminação, perda/retomada de tracking e permissão de câmera negada. Gravar vídeo e registrar aparelho, versão Android e APK.

Os marcadores gerados são candidatos para teste, sem avaliação de qualidade no ARCore. O destaque usa fallback textual ancorado ao marcador. Não há coordenadas de layout do armazém: não há seta espacial ou localização indoor contínua. O texto orienta pela identificação física da estante. Para setas reais, cadastrar e calibrar poses relativas ao START.

O baseline WL04 não foi fornecido e sua validação permanece pendente. O catálogo é fictício. As métricas ficam em memória até serem compartilhadas; fechar o aplicativo perde a sessão. O tempo total começa ao selecionar o material e termina ao confirmar a retirada; a chegada tem timestamp separado.

## Próximos passos

- Validar baseline WL04 e reconhecimento individual dos marcadores.
- Substituir catálogo e calibrar layout/poses reais.
- Medir tracking, orientação e performance no dispositivo.
- Implementar destaque 3D somente se estável até 10/11; manter fallback textual conforme plano.
- Produzir APK e evidências por milestone, até entrega em 01/12.

## Verificações desta base

TypeScript, três testes automatizados de busca/estado, exportação web, geração nativa Android e 21 verificações do Expo Doctor passaram. A exportação JavaScript não equivale a gerar um APK nem comprova tracking em aparelho.

`npm audit` identificou 16 entradas de severidade alta na árvore de dependências, derivadas de `braces` e `node-forge`, sem correção disponível no registro consultado. `npm audit fix` não as resolveu. Reavaliar atualizações compatíveis de Expo/ViroReact antes da distribuição.

## Armazém virtual

A tela inicial agora simula uma planta com três estantes e entrada START. A seleção de material destaca a estante, o setor e a prateleira correspondente. Uma busca em largura calcula um caminho percorrível na grade, respeitando os obstáculos. O indicador de posição avança automaticamente, com pausa, retomada e reinício. Trocar material reinicia a simulação.

Esta demonstração usa coordenadas fictícias e independe de câmera, marcadores e ARCore. As rotas virtuais não calibram a cena AR. O fluxo anterior está preservado em `src/screens/ARExperience.tsx`.

Foram acrescentados testes para verificar que todos os materiais têm rotas contíguas, com início e fim corretos, sem atravessar estantes ou paredes.

## Modo atual: Expo Go no iPhone e Android

Por escolha do usuário, a execução principal passou a ser Expo Go com câmera e simulação. Esta seção substitui as instruções anteriores de build obrigatório com ViroReact. O projeto foi atualizado para o SDK 58, disponível no cliente Expo atual; ViroReact e expo-dev-client foram retirados das dependências. A implementação nativa anterior está preservada no Git até `dbf37fa`.

`npm start` inicia `expo start --go`. A câmera usa expo-camera, com destino sobreposto e confirmação manual dos pontos do percurso. Não há reconhecimento de imagens nem posicionamento 3D. Os marcadores PNG existentes pertencem ao protótipo anterior e não são necessários neste modo.

A área útil respeita o recorte e a barra do iPhone. A câmera é desmontada ao sair da aba e pausada ao entrar em segundo plano. Permissão negada permite usar a demonstração; quando o sistema não permite nova solicitação, o botão abre os ajustes do aplicativo.

### Validação no iPhone

1. Atualizar o Expo Go, conectar celular e computador à mesma rede, executar `npm start` e ler o QR code.
2. Autorizar acesso à rede local. Abrir Armazém virtual e testar seleção, percurso e prateleira.
3. Abrir Câmera, selecionar o material, permitir a câmera e verificar a indicação do destino sobre a imagem.
4. Confirmar ponto inicial e chegada pelos botões identificados como simulação, concluir e compartilhar métricas.
5. Negar a câmera e testar o modo demonstração. Conferir retomada após mudar permissões nos ajustes.
6. Enviar o app para segundo plano e voltar, alternar abas e conferir que não existe mais de uma câmera ativa.

A sessão continua em memória; fechar o aplicativo perde os resultados não compartilhados. Os testes físicos de câmera e permissões dependem do aparelho do usuário.

## Modo atual: ViroReact com development client

O usuário solicitou ViroReact novamente. Esta seção e o README atual substituem as instruções anteriores de execução da câmera dentro do Expo Go. O armazém virtual e o estilo visual permanecem disponíveis.

ViroReact 3.0.3 declara suporte a Expo >=57 <58 e React Native >=0.86 <0.87. Por isso, o projeto retorna ao SDK 57 e RN 0.86.3, sem forçar versões fora da faixa suportada. expo-camera é usado somente para consultar/solicitar a permissão; a prévia e a cena 3D são renderizadas pelo ViroReact.

- `src/camera/CameraPreview.tsx`: proteção contra Expo Go, carregamento da integração nativa e tratamento de erro de renderização.
- `src/ar/ViroExperience.tsx`: permissão, ciclo de vida da câmera e ViroARSceneNavigator.
- `src/ar/ARContext.ts`: estado da navegação compartilhado com a cena.
- `src/ar/NavigationScene.tsx`: targets, eventos de anchors e texto ancorado.
- `src/ar/markerSelection.ts`: prioridade do checkpoint esperado entre imagens visíveis.

O fluxo real não oferece confirmação manual de START ou chegada. Os eventos de reconhecimento atualizam o estado. A confirmação de retirada permanece manual. O modo demonstração, explicitamente separado, mantém os botões de checkpoint.

O EAS está configurado para build nativo em nuvem, com perfil development para dispositivo físico. Sem login Expo, o projeto não pode ser vinculado nem enviar o build. No iPhone são necessários registro do dispositivo, credenciais Apple Developer e Modo de Desenvolvedor. Não há IPA gerado nem validação física concluída nesta etapa.

### Critérios de validação física

Imprimir targets com 20 cm de largura; testar individualmente START e as três estantes. Testar reconhecimento simultâneo de START/estante, ordem incorreta, perda/retomada de tracking, baixa iluminação, retomada do app e permissões negadas. Conferir legibilidade e orientação do texto com o marcador na posição de uso. Os PNGs são candidatos de teste; sua qualidade de reconhecimento ainda não foi medida. Guardar vídeo e dados do aparelho.

A planta virtual não define coordenadas de navegação no mundo real. Relocalização global, setas espaciais e geometria precisa de setor/prateleira precisam de layout e calibração física. O texto ancorado ao marker é a implementação atual de destaque.
