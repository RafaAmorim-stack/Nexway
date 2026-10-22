# Nexway

Aplicativo de localização de materiais com armazém virtual e câmera com indicação do destino. Executa no **Expo Go para iPhone e Android**, sem Xcode, Android Studio ou conta Apple Developer.

## Abrir no celular

Instale a versão atual do Expo Go no celular. No projeto, com Node 22 e npm:

```sh
npm ci
npm start
```

Mantenha o computador e o celular na mesma rede Wi-Fi. No iPhone, leia o QR code do terminal com a Câmera e abra no Expo Go. Autorize acesso à rede local e à câmera quando solicitado.

Neste Mac, o Node está em `~/.local/share/nexway`. Se `npm` não estiver no PATH, use `./scripts/npm start`.

Se a rede bloquear a conexão entre os aparelhos, use `npm run start:tunnel`. O Expo pode solicitar a instalação do adaptador de túnel. O terminal deve permanecer aberto durante o uso.

## Armazém virtual

1. Escolha um material pelo nome/código ou toque em uma estante na planta.
2. Confira a estante destacada e a vista frontal do setor/prateleira.
3. Toque em **Simular percurso** para acompanhar a posição da entrada até o destino.
4. Pause, continue ou volte à entrada. Trocar o material reinicia o percurso.

A planta e o catálogo são fictícios. O caminho é calculado em uma grade, evitando as estantes. A posição é simulada, sem localização real.

## Câmera

No celular, a aba **Câmera** inicia no modo câmera. Selecione um material, toque em **Permitir câmera** e confira as informações do destino sobre a imagem ao vivo.

Use **Confirmar ponto inicial (simulação)** e **Confirmar chegada (simulação)** para avançar no percurso. Depois confirme a retirada para registrar o tempo e compartilhar as métricas.

**Usar demonstração** alterna para os botões de marcadores, inclusive para testar estantes incorretas. No navegador, a aba usa esses botões e orienta abrir o Expo Go para acessar a câmera.

Este modo não reconhece marcadores automaticamente nem ancora objetos 3D no ambiente. O ViroReact não está no aplicativo atual, pois não é suportado pelo Expo Go. A implementação anterior está preservada no histórico Git até o commit `dbf37fa`.

## Desenvolvimento

```sh
npm run verify
npm run doctor
npm run web
npm run export:web
npm run export:ios
```

React Native + TypeScript + Expo SDK 58 + expo-camera. A geração do bundle iOS valida o JavaScript e não equivale a um teste no iPhone físico.

- `src/data/catalog.ts`: catálogo e busca.
- `src/warehouse/layout.ts`: planta fictícia e cálculo do caminho.
- `src/components/WarehouseMap.tsx`: mapa e posição animada.
- `src/screens/WarehouseSimulation.tsx`: seleção e simulação do armazém.
- `src/screens/CameraExperience.tsx`: fluxo de câmera/demonstração e métricas.
- `src/camera/CameraPreview.tsx`: permissão, câmera ao vivo e indicação do destino.
- `src/navigation/session.ts`: ordem dos checkpoints, conclusão e métricas.

Consulte [o guia de desenvolvimento](docs/DEVELOPMENT.md) e o PDF original para o planejamento do projeto.
