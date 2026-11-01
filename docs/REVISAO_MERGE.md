# NexWay — revisão da organização documental

## Escopo e organização

Branch docs/organizacao-disciplina. Código e testes permanecem iguais ao commit funcional 7acefc534bc52615189aa3b9bb4f6e8ae9160ad8. Merge para main continua dependendo de aprovação explícita.

O pacote README foi incorporado com quatro diagramas (MMD, SVG e PNG), oito capturas de 25/10/2026 e artigo acadêmico V5 em docs/documents. README e DEVELOPMENT descrevem o estado atual. BUILD_EVIDENCE e START-AR foram preservados integralmente.

A estrutura mantém src, assets, tests, scripts, arquivos de entrada e configuração na disposição React Native/Expo. As três pastas documentais exigidas contêm arquivos reais. O .gitignore preserva exclusões de node_modules, .expo, android, ios, dist, dist-*, coverage, .env e variantes, logs, APK e AAB.

## Estado funcional

A correção 7acefc534bc52615189aa3b9bb4f6e8ae9160ad8 exige START calibrado e todos os checkpoints em ordem antes de aceitar o rack correto. Rack antecipado e rack incorreto não concluem; a chegada é registrada uma única vez. Perda de tracking, pose inválida, salto ou troca de material revogam a liberação.

Verificações desta revisão: typecheck aprovado e 29/29 testes aprovados. Exportações da revisão anterior não equivalem a novo APK ou teste físico da correção. A validação física específica com rastreabilidade completa permanece pendente.

## Artigo e evidências

O artigo NexWay_Artigo_Final_V5.docx foi incorporado sem edição e substitui a versão anterior do pacote. Ainda descreve f2e1c8f e 24 testes: é o recorte histórico do artigo, não o estado atual. O índice documental explicita essa diferença para a equipe acadêmica.

O APK é um Development Build. Seu SHA-256 verifica a integridade do shell nativo; não identifica sozinho o JS/TS servido pelo Metro. A rastreabilidade funcional precisa associar commit Git, working tree limpa, testes, build e APK instalado, execução Metro a partir dessa mesma versão e validação física. Não reatribuir automaticamente o hash histórico à execução JS da correção atual.

## Revisão de conteúdo

README contém NEXUS, integrantes e RA, responsabilidades, curso, disciplina, professor indicado no pacote fornecido, semestre, objetivos, tabela funcional, tecnologias, arquitetura, árvore, instalação, execução, testes, Development Build, marcadores, limites e links documentais.

Não há campos genéricos não preenchidos no README final. Descrição é cabeçalho de tabela preenchida, não placeholder. Dados não registrados, como modelo e Android do Xiaomi, não foram inventados.

Arquivos de texto e XML do DOCX foram inspecionados em busca de credenciais. Não foram identificados segredos no conjunto a versionar. Nomes e RA são dados acadêmicos solicitados; identificadores de pacote e hashes de integridade não são segredos. A inspeção não é garantia absoluta sobre o histórico remoto ou conteúdo oculto em imagens.

## Integração futura

Não executar merge para main nesta etapa. Não usar squash, rebase ou force push. Preservar commits e evidências. A documentação não reintroduz métricas, confirmação de retirada ou rótulos 3D na interface: o README declara o escopo atual.
