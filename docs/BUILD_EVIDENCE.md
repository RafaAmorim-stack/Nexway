# Evidência de Build — NexWay Marco 5

## Identificação da versão

- Data da geração e validação: 31/10/2026
- Branch: `feat/rack-recognition`
- Commit de origem: `f2e1c8f64edbc95b048caf2964bd6e298f33444a`
- Commit: `feat: adicionar tracking relativo e orientação dinâmica no Marco 5`
- Plataforma: Android
- Dispositivo utilizado: Xiaomi
- Artefato: `android/app/build/outputs/apk/debug/app-debug.apk`
- SHA-256 do APK: `8B50DC762B462496ADA1790206C1CC1CB6EE92EC326B930005494F15C50871D4`

## Verificações executadas

- `npm run typecheck` — aprovado
- `npm test` — 24 testes aprovados
- `.\gradlew.bat assembleDebug` — build concluído com sucesso
- `adb install -r -d` — instalação concluída com sucesso no Xiaomi
- validação física do fluxo — aprovada

## Funcionalidades cobertas pelo Marco 5

- seleção de material;
- associação do material ao rack destino;
- reconhecimento do marcador START;
- cálculo da rota lógica;
- acompanhamento relativo da pose da câmera em X/Z;
- cálculo de direção e distância;
- avanço entre checkpoints;
- orientação visual sobre a câmera;
- validação final pelo reconhecimento do rack destino.

## Rastreabilidade

O APK identificado acima foi gerado diretamente a partir do commit:

`f2e1c8f64edbc95b048caf2964bd6e298f33444a`

O SHA-256 registrado permite verificar a integridade do artefato Android utilizado na validação.

## Observação sobre a demonstração anterior

A demonstração registrada em 25/10/2026 não teve o SHA exato do build anotado no momento da execução.

Em 31/10/2026 foi realizada uma nova geração e validação rastreável do APK a partir do commit do Marco 5, permitindo associar o código-fonte ao artefato Android validado fisicamente.
