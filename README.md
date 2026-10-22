# Nexway

MVP de orientação de materiais em armazém, baseado no plano NEXUS: buscar material → reconhecer START-01 → reconhecer estante → indicar setor/prateleira → confirmar retirada e registrar tempo.

React Native + TypeScript + Expo + ViroReact. A tela inicial oferece um armazém virtual com seleção de materiais, planta interativa, caminho pelos corredores, posição animada e vista frontal do setor/prateleira. A aba Câmera AR mantém o fluxo de checkpoints e métricas da base inicial.

## Executar

Node 22 (`nvm use`, se usar nvm) e npm. Neste Mac, o Node foi instalado em `~/.local/share/nexway`; use `./scripts/npm` no lugar de `npm`, por exemplo `./scripts/npm run web`. O script usa o Node do sistema nos demais ambientes.

Com Node disponível no terminal:

```sh
npm ci
npm run verify
npm run web
```

A prévia web abre no **Armazém virtual**:

1. Escolha um material pelo nome/código ou toque em uma estante no mapa.
2. Veja o destino destacado na planta e na vista frontal da estante.
3. Toque em **Simular percurso** para acompanhar a posição da entrada até o destino.
4. Pause, continue ou volte à entrada. Trocar de material reinicia o percurso.

A planta e os materiais são fictícios; a posição animada é uma simulação, sem localização real. O caminho é calculado em uma grade, evitando os espaços ocupados pelas estantes. A aba **Câmera AR** permite acessar o protótipo anterior, incluindo seus botões de simulação de marcadores.

Para realidade aumentada em Android físico compatível com ARCore:

```sh
npm run doctor
npm run prebuild
npm run android
```

ViroReact exige build nativo; não funciona no Expo Go. Após instalar o aplicativo, `npm start` inicia o Metro para o development client.

Os marcadores imprimíveis estão em [assets/markers/print.html](assets/markers/print.html). Imprimir as imagens com 20 × 20 cm, sem ajuste automático de escala.

## Estrutura

- `src/data/catalog.ts`: materiais, estantes e busca.
- `src/navigation/session.ts`: estados, ordem dos checkpoints e métricas.
- `src/ar/`: câmera, targets e indicação textual ancorada.
- `App.tsx`: alternância entre armazém virtual e câmera AR.
- `src/screens/WarehouseSimulation.tsx`: seleção, reprodução do percurso e detalhe da prateleira.
- `src/components/WarehouseMap.tsx`: planta interativa e posição animada.
- `src/warehouse/layout.ts`: layout fictício e cálculo de caminho pelos corredores.
- `src/screens/ARExperience.tsx`: fluxo anterior de busca, checkpoints e métricas.
- `tests/`: regras do fluxo e busca.

Consulte [desenvolvimento e validação](docs/DEVELOPMENT.md) para divisão de responsabilidades e testes físicos pendentes. O código WL04 e o layout real do armazém não foram fornecidos. A cena AR não foi validada em dispositivo; setas espaciais e highlight 3D preciso permanecem como próximos passos.

Documentação técnica: [ViroReact + Expo](https://viro-community.readme.io/docs/integrating-with-expo) e [Expo](https://docs.expo.dev/).
