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
