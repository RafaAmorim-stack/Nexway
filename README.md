# Nexway

Localização de materiais com armazém virtual e realidade aumentada por **ViroReact**. React Native + TypeScript + Expo SDK 57, compatível com ViroReact 3.0.3. A interface mantém o padrão visual claro das duas abas.

## Marco 4 no Android

Busque e selecione um material em **Armazém virtual**, abra **Câmera AR** e reconheça START para calcular a rota no mapa local; reconheça o rack destino para registrar chegada. A seleção e a confirmação permanecem entre abas; trocar material exige reconhecer START novamente. Consulte o [roteiro de teste no Xiaomi](docs/START-AR.md).

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

Selecione o material em Armazém virtual. Na Câmera AR, reconheça START-01 para exibir a rota, checkpoints e a próxima instrução. O plano usa o mapa local, sem markers intermediários nem posição ao vivo. Depois reconheça o rack destino. Estantes erradas exibem o esperado e o reconhecido sem registrar chegada. A estante correta registra chegada uma única vez. Trocar material exige novo START.

Imprima [os marcadores](assets/markers/print.html) em tamanho real (20 × 20 cm). Não são QR codes. Não há setor/prateleira na câmera, seta contínua ou navegação até o rack. A simulação do armazém permanece independente.

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

