# Histórico de alterações do NexWay

## Organização documental

- README revisado conforme as exigências da disciplina, com dados reais da equipe NEXUS, instalação, execução, testes, Android Development Build, marcadores e limitações.
- Diagramas em docs/diagrams, capturas históricas em docs/images e artigo NexWay_Artigo_Final_V5.docx em docs/documents.
- Desenvolvimento e revisão documental atualizados para a correção 7acefc534bc52615189aa3b9bb4f6e8ae9160ad8.
- BUILD_EVIDENCE.md e START-AR.md preservados integralmente.
- Rastreabilidade esclarecida: SHA-256 do APK nativo não identifica sozinho o JS/TS servido pelo Metro.

## Correção funcional — 7acefc534bc52615189aa3b9bb4f6e8ae9160ad8

- Exige START calibrado e conclusão ordenada dos checkpoints antes da validação do rack destino.
- Impede chegada antecipada e mantém rejeição de rack incorreto e registro único.
- Typecheck aprovado e 29/29 testes aprovados.
- A correção não constitui nova evidência física por si só.

## Registro histórico — 31/10/2026

- BUILD_EVIDENCE.md registra o commit f2e1c8f64edbc95b048caf2964bd6e298f33444a, 24 testes e validação Android informada pela equipe.
- O hash registrado identifica a integridade do APK Development Build, sem identificar sozinho a versão JS executada.

## Marcos 2 a 5 — 25/10/2026

- START e destino, reconhecimento do rack, rota lógica e navegação relativa com orientação dinâmica.
- Remoção de artefatos gerados e atualização do .gitignore.

## Marco 1 — 22/10/2026

- Base do aplicativo, integração ViroReact e configuração de builds de desenvolvimento.
- Remoção dos caminhos do Expo Go.
