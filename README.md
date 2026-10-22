# Nexway

MVP de orientação de materiais em armazém, baseado no plano NEXUS: buscar material → reconhecer START-01 → reconhecer estante → indicar setor/prateleira → confirmar retirada e registrar tempo.

React Native + TypeScript + Expo + ViroReact, com catálogo demonstrativo, regras de checkpoint, registro de erros, exportação JSON e modo demonstração. A câmera usa marcadores de imagem e o fallback textual ancorado previsto no PDF.

## Executar

Node 22 (`nvm use`, se usar nvm) e npm. Neste Mac, o Node foi instalado em `~/.local/share/nexway`; use `./scripts/npm` no lugar de `npm`, por exemplo `./scripts/npm run web`. O script usa o Node do sistema nos demais ambientes.

Com Node disponível no terminal:

```sh
npm ci
npm run verify
npm run web
```

A prévia web abre em modo demonstração: selecione um material e toque nos marcadores para testar o fluxo, inclusive estantes incorretas.

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
- `App.tsx`: busca, navegação, demonstração e conclusão.
- `tests/`: regras do fluxo e busca.

Consulte [desenvolvimento e validação](docs/DEVELOPMENT.md) para divisão de responsabilidades e testes físicos pendentes. O código WL04 e o layout real do armazém não foram fornecidos. A cena AR não foi validada em dispositivo; setas espaciais e highlight 3D preciso permanecem como próximos passos.

Documentação técnica: [ViroReact + Expo](https://viro-community.readme.io/docs/integrating-with-expo) e [Expo](https://docs.expo.dev/).
