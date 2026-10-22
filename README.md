# Nexway

Localização de materiais com armazém virtual e realidade aumentada por **ViroReact**. React Native + TypeScript + Expo SDK 57, compatível com ViroReact 3.0.3. A interface mantém o padrão visual claro das duas abas.

## iPhone sem Xcode local: Expo EAS

O Nexway é executado como aplicativo nativo com ViroReact. O EAS compila o aplicativo na nuvem, dispensando Xcode neste Mac. Para instalar no iPhone físico, é necessário ter conta Expo, assinatura Apple Developer ativa e registrar o aparelho.

Com Node 22 e npm, na pasta do projeto:

```sh
npm ci
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest device:create
npm run build:ios
```

No `init`, selecione a conta/projeto Expo correto. O comando grava o identificador do projeto na configuração. No registro do dispositivo, abra o link fornecido no iPhone. Durante o build, siga a configuração de assinatura da Apple pelo EAS; não compartilhe senhas ou códigos de verificação no chat.

Instale o aplicativo pelo link fornecido ao final do build. Habilite o Modo de Desenvolvedor no iPhone quando necessário. Depois execute:

```sh
npm start
```

Mantenha Mac e iPhone na mesma rede e abra o projeto no **Nexway instalado**, pelo QR code/deep link do development client. Se a rede bloquear acesso entre os aparelhos, use `npm run start:tunnel`.

Neste Mac, se `npm` não estiver no PATH, use `./scripts/npm` no lugar de `npm`.

Para Android, `npm run build:android` gera um APK de desenvolvimento pelo EAS. Alterações em bibliotecas nativas ou plugins exigem novo build; alterações de interface e regras TypeScript usam o Metro normalmente.

## Como usar a câmera AR

1. Abra **Câmera AR**, selecione um material e permita o acesso à câmera.
2. Reconheça a imagem do marcador **START-01**.
3. Siga a identificação física até a estante e reconheça o marcador esperado, como **RACK-A**.
4. Confira o setor/prateleira indicado no texto ancorado ao marcador e confirme a retirada.
5. Compartilhe as métricas, se necessário.

Imprima [os marcadores](assets/markers/print.html) em tamanho real, com a imagem medindo **20 × 20 cm**. Eles são alvos de reconhecimento de imagem, não QR codes.

A cena trata detecção, atualização e remoção de anchors. Se START e uma estante já estiverem visíveis, o estado prioriza o checkpoint esperado. A indicação virtual é ocultada quando o marcador deixa de ser rastreado (incluindo a pose antiga reportada pelo ARCore).

Os marcadores e a estabilidade do texto ancorado ainda precisam de validação no aparelho. O catálogo é fictício. Não há calibração do layout real nem seta espacial até a estante; o caminho da planta continua sendo uma simulação independente. O destaque atual é textual, e não uma delimitação 3D precisa da prateleira.

## Demonstração e armazém virtual

```sh
npm run web
```

Escolha o material e use **Simular percurso** para acompanhar o caminho na planta. Na aba Câmera AR, o navegador oferece **Usar demonstração**, com botões START/RACK para validar a ordem e erros de estante. Essa demonstração permanece disponível também no aplicativo nativo.

## Verificação

```sh
npm run verify
npm run doctor
npm run export:web
npm run export:ios
npm run export:android
```

Exportar o bundle não equivale a compilar um IPA/APK nem a validar o rastreamento em dispositivo físico. O perfil `development` está em `eas.json`; os diretórios nativos gerados localmente são excluídos do upload por `.easignore`, para o EAS gerar projetos com a configuração atual.

A geração na nuvem ainda depende do login e da vinculação do projeto à conta Expo. Consulte [desenvolvimento](docs/DEVELOPMENT.md), [ViroReact + Expo](https://viro-community.readme.io/docs/integrating-with-expo) e [EAS para iPhone](https://docs.expo.dev/tutorial/eas/ios-development-build-for-devices/).
