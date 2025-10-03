# Plano de Remocao do Debug de Cadastro de Contratos

## Contexto
- Ao acessar a pagina de cadastro de contrato com o tradutor do Google ativo, ocorria o erro `Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node`.
- A causa estava em utilitarios de debug (painel flutuante e funcoes de exportar payload) que criavam ancors temporarias no DOM. Extensoes de traducao reparentavam esses nos antes de `removeChild`, provocando a excecao.
- Esses utilitarios nao sao mais usados pela equipe, logo a remocao direta elimina o bug sem impactar funcionalidades visiveis ao usuario final.

## Escopo de Remocao
- Excluir os arquivos de debug obsoletos:
  - `src/modules/Contratos/components/CadastroDeContratos/debug-panel.tsx`
  - `src/modules/Contratos/components/CadastroDeContratos/debug-payload.tsx`
  - `src/modules/Contratos/hooks/use-debug-cadastro.ts`
- Garantir que nenhum import ou referencia residual permaneceu nos formularios de cadastro (`fornecedor-form.tsx`, `contrato-form.tsx`, `unidades-form.tsx`, `atribuicao-fiscais-form.tsx`) ou na pagina `cadastrar-contrato.tsx`.

## Passos Executados
1. Localizar referencias aos componentes e hooks de debug com `rg` para confirmar que nao eram usados em outras rotas.
2. Remover fisicamente os arquivos listados acima.
3. Verificar que nao restaram imports/residuos usando novas buscas (`rg "debug-panel"`, `rg "useDebugCadastro"`).
4. Atualizar esta documentacao para refletir a estrategia vigente.

## Validacao
- A pagina de cadastro continua carregando somente com os formularios oficiais, sem scripts auxiliares de debug.
- Com o tradutor do Google habilitado, nao ocorre mais a chamada a `removeChild` associada ao painel de debug, prevenindo o erro reportado pelo usuario.
- Build/local lint devem permanecer verdes; caso necessario, rodar o fluxo de cadastro manualmente para garantir ausencia de regressao.

## Proximos Passos
- Se aparecer necessidade futura de diagnostico semelhante, considerar implementar ferramentas de debug fora do bundle da aplicacao (ex.: extensao do browser ou script opt-in) para evitar efeitos colaterais no DOM.
