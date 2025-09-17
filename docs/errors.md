Run echo "🧪 Running Vitest tests..."
  echo "🧪 Running Vitest tests..."
  pnpm test --run --reporter=verbose --coverage=false
  echo "✅ All tests passed!"
  shell: /usr/bin/bash -e {0}
  env:
    REGISTRY: docker.io
    IMAGE_NAME: cac-frontend
    PNPM_HOME: /home/runner/setup-pnpm/node_modules/.bin
🧪 Running Vitest tests...

> cac-frontend@0.0.0 test /home/runner/work/cac-frontend/cac-frontend
> vitest --run --reporter=verbose --coverage=false


 RUN  v3.2.4 /home/runner/work/cac-frontend/cac-frontend

 × src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Renderização > deve renderizar todos os campos obrigatórios 35ms
   → [vitest] No "Building2" export is defined on the "lucide-react" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

 × src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Renderização > deve renderizar botão de próximo 4ms
   → [vitest] No "Building2" export is defined on the "lucide-react" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

 × src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Renderização > deve renderizar botão de preenchimento rápido 4ms
   → [vitest] No "Building2" export is defined on the "lucide-react" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

 × src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Renderização > deve renderizar botão de cancelar quando onCancel é fornecido 3ms
   → [vitest] No "Building2" export is defined on the "lucide-react" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

 × src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Renderização > deve preencher campos com dados iniciais 4ms
   → [vitest] No "Building2" export is defined on the "lucide-react" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

 × src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Preenchimento Rápido > deve preencher todos os campos ao clicar no botão de preenchimento rápido 4ms
   → [vitest] No "Building2" export is defined on the "lucide-react" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

 × src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Preenchimento Rápido > deve preencher contatos de teste 3ms
   → [vitest] No "Building2" export is defined on the "lucide-react" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

 × src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Validação > deve mostrar erro para campos obrigatórios vazios 3ms
   → [vitest] No "Building2" export is defined on the "lucide-react" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

 × src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Validação > deve validar campo CNPJ vazio 4ms
   → [vitest] No "Building2" export is defined on the "lucide-react" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

 × src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Gerenciamento de Contatos > deve adicionar novo contato 6ms
   → [vitest] No "Building2" export is defined on the "lucide-react" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

 × src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Gerenciamento de Contatos > deve remover contato existente 9ms
   → [vitest] No "Building2" export is defined on the "lucide-react" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

 × src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Submissão do Formulário > deve chamar onSubmit com dados corretos quando não há onAdvanceRequest 15ms
   → [vitest] No "Building2" export is defined on the "lucide-react" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

 ✓ src/modules/Contratos/components/ListaContratos/__tests__/pesquisa-e-filtros.test.tsx > SearchAndFilters > deve renderizar o campo de pesquisa 77ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/pesquisa-e-filtros.test.tsx > SearchAndFilters > deve renderizar o botão de filtros 20ms
 × src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Submissão do Formulário > deve chamar onAdvanceRequest quando fornecido 14ms
   → [vitest] No "Building2" export is defined on the "lucide-react" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

 × src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Submissão do Formulário > deve chamar onCancel ao clicar no botão cancelar 6ms
   → [vitest] No "Building2" export is defined on the "lucide-react" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

 × src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Acessibilidade > deve ter labels apropriados para todos os campos 2ms
   → [vitest] No "Building2" export is defined on the "lucide-react" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

 × src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Acessibilidade > deve ter botões com textos descritivos 5ms
   → [vitest] No "Building2" export is defined on the "lucide-react" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

 × src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Estados do Formulário > deve marcar checkbox de ativo como verdadeiro por padrão 2ms
   → [vitest] No "Building2" export is defined on the "lucide-react" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

 × src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Estados do Formulário > deve permitir alterar estado ativo 3ms
   → [vitest] No "Building2" export is defined on the "lucide-react" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

 ✓ src/modules/Contratos/components/ListaContratos/__tests__/pesquisa-e-filtros.test.tsx > SearchAndFilters > deve abrir o painel de filtros ao clicar no botão 20ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/pesquisa-e-filtros.test.tsx > SearchAndFilters > deve exibir todas as opções de status 13ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/pesquisa-e-filtros.test.tsx > SearchAndFilters > deve exibir todas as unidades disponíveis 8ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/pesquisa-e-filtros.test.tsx > SearchAndFilters > deve exibir campos de data para período de vigência 9ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/pesquisa-e-filtros.test.tsx > SearchAndFilters > deve exibir campos de valor mínimo e máximo 11ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/pesquisa-e-filtros.test.tsx > SearchAndFilters > deve permitir seleção de múltiplos status 17ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/pesquisa-e-filtros.test.tsx > SearchAndFilters > deve permitir seleção de múltiplas unidades 15ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/pesquisa-e-filtros.test.tsx > SearchAndFilters > deve permitir entrada de valores monetários 11ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/pesquisa-e-filtros.test.tsx > SearchAndFilters > deve permitir entrada de datas 14ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/pesquisa-e-filtros.test.tsx > SearchAndFilters > deve exibir contador de filtros ativos 15ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/pesquisa-e-filtros.test.tsx > SearchAndFilters > deve exibir botão de limpar filtros quando há filtros ativos 12ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/pesquisa-e-filtros.test.tsx > SearchAndFilters > deve chamar limparFiltros ao clicar no botão limpar 12ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/pesquisa-e-filtros.test.tsx > SearchAndFilters > deve permitir pesquisa por termo 12ms
 × src/modules/Contratos/components/ListaContratos/__tests__/pesquisa-e-filtros.test.tsx > SearchAndFilters > deve exibir filtros móveis em telas pequenas 83ms
   → Cannot read properties of undefined (reading 'map')
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/pesquisa-e-filtros.test.tsx > SearchAndFilters > deve aplicar classes CSS corretas para responsividade 20ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/pesquisa-e-filtros.test.tsx > SearchAndFilters > deve exibir ícones corretos 17ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/pesquisa-e-filtros.test.tsx > SearchAndFilters > deve permitir expansão e contração das seções de filtros 11ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/pesquisa-e-filtros.test.tsx > SearchAndFilters > deve renderizar corretamente quando não há filtros ativos 17ms
stderr | src/modules/contratos/components/__tests__/contrato-form.test.tsx > ContratoForm > deve renderizar todos os campos obrigatórios
Erro ao carregar processo instrutivo: TypeError: Failed to parse URL from /src/modules/Contratos/data/processo-instrutivo.json
    at node:internal/deps/undici/undici:13510:13
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
    at carregarProcessoInstrutivo (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:211:26) {
  [cause]: TypeError: Invalid URL: /src/modules/Contratos/data/processo-instrutivo.json
      at new URLImpl (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL-impl.js:20:13)
      at Object.exports.setup (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:54:12)
      at new URL (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:115:22)
      at new Request (node:internal/deps/undici/undici:9586:25)
      at fetch (node:internal/deps/undici/undici:10315:25)
      at fetch (node:internal/deps/undici/undici:13508:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:72:12)
      at carregarProcessoInstrutivo (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:211:32)
      at /home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:220:5
      at Object.react_stack_bottom_frame (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:23953:20)
}
Erro ao carregar unidades: TypeError: Failed to parse URL from /src/modules/Contratos/data/contratos-data.json
    at node:internal/deps/undici/undici:13510:13
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
    at carregarUnidades (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:227:26) {
  [cause]: TypeError: Invalid URL: /src/modules/Contratos/data/contratos-data.json
      at new URLImpl (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL-impl.js:20:13)
      at Object.exports.setup (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:54:12)
      at new URL (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:115:22)
      at new Request (node:internal/deps/undici/undici:9586:25)
      at fetch (node:internal/deps/undici/undici:10315:25)
      at fetch (node:internal/deps/undici/undici:13508:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:72:12)
      at carregarUnidades (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:227:32)
      at /home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:236:5
      at Object.react_stack_bottom_frame (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:23953:20)
}

stderr | src/modules/contratos/components/__tests__/contrato-form.test.tsx > ContratoForm > deve exibir botões de navegação
Erro ao carregar processo instrutivo: TypeError: Failed to parse URL from /src/modules/Contratos/data/processo-instrutivo.json
    at node:internal/deps/undici/undici:13510:13
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
    at carregarProcessoInstrutivo (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:211:26) {
  [cause]: TypeError: Invalid URL: /src/modules/Contratos/data/processo-instrutivo.json
      at new URLImpl (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL-impl.js:20:13)
      at Object.exports.setup (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:54:12)
      at new URL (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:115:22)
      at new Request (node:internal/deps/undici/undici:9586:25)
      at fetch (node:internal/deps/undici/undici:10315:25)
      at fetch (node:internal/deps/undici/undici:13508:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:72:12)
      at carregarProcessoInstrutivo (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:211:32)
      at /home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:220:5
      at Object.react_stack_bottom_frame (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:23953:20)
}
Erro ao carregar unidades: TypeError: Failed to parse URL from /src/modules/Contratos/data/contratos-data.json
    at node:internal/deps/undici/undici:13510:13
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
    at carregarUnidades (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:227:26) {
  [cause]: TypeError: Invalid URL: /src/modules/Contratos/data/contratos-data.json
      at new URLImpl (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL-impl.js:20:13)
      at Object.exports.setup (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:54:12)
      at new URL (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:115:22)
      at new Request (node:internal/deps/undici/undici:9586:25)
      at fetch (node:internal/deps/undici/undici:10315:25)
      at fetch (node:internal/deps/undici/undici:13508:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:72:12)
      at carregarUnidades (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:227:32)
      at /home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:236:5
      at Object.react_stack_bottom_frame (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:23953:20)
}

 × src/modules/contratos/components/__tests__/contrato-form.test.tsx > ContratoForm > deve renderizar todos os campos obrigatórios 545ms
   → Found a label with the text of: /número do contrato/i, however the element associated with this label (<div />) is non-labellable [https://html.spec.whatwg.org/multipage/forms.html#category-label]. If you really need to label a <div />, you can use aria-label or aria-labelledby instead.

Ignored nodes: comments, script, style
<body>
  <div>
    <form
      class="space-y-8"
    >
      <div
        class="space-y-6"
      >
        <div
          class="flex items-center space-x-3 border-b border-slate-200 pb-3"
        >
          <div
            class="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-file-text h-4 w-4 text-slate-600"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
              />
              <path
                d="M14 2v4a2 2 0 0 0 2 2h4"
              />
              <path
                d="M10 9H8"
              />
              <path
                d="M16 13H8"
              />
              <path
                d="M16 17H8"
              />
            </svg>
          </div>
          <h3
            class="text-base font-semibold text-gray-900"
          >
            Informações Básicas
          </h3>
        </div>
        <div
          class="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <div
            class="space-y-2"
          >
            <div
              class="grid gap-2"
              data-slot="form-item"
            >
              <label
                class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive mb-2"
                data-error="false"
                data-slot="form-label"
                for="«r0»-form-item"
              >
                Número do Contrato *
              </label>
              <div
                aria-describedby="«r0»-form-item-description"
                aria-invalid="false"
                class="relative"
                data-slot="form-control"
                id="«r0»-form-item"
              >
                <input
                  class="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                  data-slot="input"
                  name="numeroContrato"
                  placeholder="CONT-2024-0001"
                  value=""
                />
              </div>
            </div>
          </div>
          <div
            class="space-y-2"
          >
            <div
              class="grid gap-2"
              data-slot="form-item"
            >
              <label
                class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive mb-2"
                data-error="false"
                data-slot="form-label"
                for="«r1»-form-item"
              >
                Processo SEI / Processo.rio *
              </label>
              <div
                aria-describedby="«r1»-form-item-description"
                aria-invalid="false"
                class="grid grid-cols-2 gap-2"
                data-slot="form-control"
                id="«r1»-form-item"
              >
                <div
                  aria-controls="radix-«r2»"
                  aria-expanded="false"
                  aria-haspopup="dialog"
                  aria-label="Selecionar processo SEI"
                  class="flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 transition-colors hover:bg-gray-50"
                  data-slot="popover-trigger"
                  data-state="closed"
                  role="combobox"
                  tabindex="0"
                  type="button"
                >
                  <span
                    class="text-sm text-gray-900"
                  >
                    Selecione o processo...
                  </span>
                  <svg
                    aria-hidden="true"
                    class="lucide lucide-chevrons-up-down h-4 w-4 shrink-0 opacity-50"
                    fill="none"
                    height="24"
          ...
stderr | src/modules/contratos/components/__tests__/contrato-form.test.tsx > ContratoForm > deve calcular vigência final automaticamente quando data inicial e prazo são preenchidos
Erro ao carregar processo instrutivo: TypeError: Failed to parse URL from /src/modules/Contratos/data/processo-instrutivo.json
    at node:internal/deps/undici/undici:13510:13
 ✓ src/modules/contratos/components/__tests__/contrato-form.test.tsx > ContratoForm > deve exibir botões de navegação 251ms
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
    at carregarProcessoInstrutivo (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:211:26) {
  [cause]: TypeError: Invalid URL: /src/modules/Contratos/data/processo-instrutivo.json
      at new URLImpl (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL-impl.js:20:13)
      at Object.exports.setup (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:54:12)
      at new URL (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:115:22)
      at new Request (node:internal/deps/undici/undici:9586:25)
      at fetch (node:internal/deps/undici/undici:10315:25)
      at fetch (node:internal/deps/undici/undici:13508:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:72:12)
      at carregarProcessoInstrutivo (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:211:32)
      at /home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:220:5
      at Object.react_stack_bottom_frame (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:23953:20)
}
Erro ao carregar unidades: TypeError: Failed to parse URL from /src/modules/Contratos/data/contratos-data.json
    at node:internal/deps/undici/undici:13510:13
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
    at carregarUnidades (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:227:26) {
  [cause]: TypeError: Invalid URL: /src/modules/Contratos/data/contratos-data.json
      at new URLImpl (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL-impl.js:20:13)
      at Object.exports.setup (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:54:12)
      at new URL (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:115:22)
      at new Request (node:internal/deps/undici/undici:9586:25)
      at fetch (node:internal/deps/undici/undici:10315:25)
      at fetch (node:internal/deps/undici/undici:13508:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:72:12)
      at carregarUnidades (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:227:32)
      at /home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:236:5
      at Object.react_stack_bottom_frame (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:23953:20)
}

stderr | src/modules/contratos/components/__tests__/contrato-form.test.tsx > ContratoForm > deve exibir erros de validação para campos obrigatórios
Erro ao carregar processo instrutivo: TypeError: Failed to parse URL from /src/modules/Contratos/data/processo-instrutivo.json
    at node:internal/deps/undici/undici:13510:13
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
    at carregarProcessoInstrutivo (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:211:26) {
  [cause]: TypeError: Invalid URL: /src/modules/Contratos/data/processo-instrutivo.json
      at new URLImpl (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL-impl.js:20:13)
      at Object.exports.setup (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:54:12)
      at new URL (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:115:22)
      at new Request (node:internal/deps/undici/undici:9586:25)
      at fetch (node:internal/deps/undici/undici:10315:25)
      at fetch (node:internal/deps/undici/undici:13508:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:72:12)
      at carregarProcessoInstrutivo (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:211:32)
      at /home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:220:5
      at Object.react_stack_bottom_frame (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:23953:20)
}
Erro ao carregar unidades: TypeError: Failed to parse URL from /src/modules/Contratos/data/contratos-data.json
    at node:internal/deps/undici/undici:13510:13
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
    at carregarUnidades (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:227:26) {
  [cause]: TypeError: Invalid URL: /src/modules/Contratos/data/contratos-data.json
      at new URLImpl (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL-impl.js:20:13)
      at Object.exports.setup (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:54:12)
      at new URL (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:115:22)
      at new Request (node:internal/deps/undici/undici:9586:25)
      at fetch (node:internal/deps/undici/undici:10315:25)
      at fetch (node:internal/deps/undici/undici:13508:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:72:12)
      at carregarUnidades (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:227:32)
      at /home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:236:5
      at Object.react_stack_bottom_frame (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:23953:20)
}

 × src/modules/contratos/components/__tests__/contrato-form.test.tsx > ContratoForm > deve calcular vigência final automaticamente quando data inicial e prazo são preenchidos 259ms
   → Found a label with the text of: /vigência inicial/i, however the element associated with this label (<div />) is non-labellable [https://html.spec.whatwg.org/multipage/forms.html#category-label]. If you really need to label a <div />, you can use aria-label or aria-labelledby instead.

Ignored nodes: comments, script, style
<body>
  <div>
    <form
      class="space-y-8"
    >
      <div
        class="space-y-6"
      >
        <div
          class="flex items-center space-x-3 border-b border-slate-200 pb-3"
        >
          <div
            class="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-file-text h-4 w-4 text-slate-600"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
              />
              <path
                d="M14 2v4a2 2 0 0 0 2 2h4"
              />
              <path
                d="M10 9H8"
              />
              <path
                d="M16 13H8"
              />
              <path
                d="M16 17H8"
              />
            </svg>
          </div>
          <h3
            class="text-base font-semibold text-gray-900"
          >
            Informações Básicas
          </h3>
        </div>
        <div
          class="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <div
            class="space-y-2"
          >
            <div
              class="grid gap-2"
              data-slot="form-item"
            >
              <label
                class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive mb-2"
                data-error="false"
                data-slot="form-label"
                for="«r30»-form-item"
              >
                Número do Contrato *
              </label>
              <div
                aria-describedby="«r30»-form-item-description"
                aria-invalid="false"
                class="relative"
                data-slot="form-control"
                id="«r30»-form-item"
              >
                <input
                  class="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                  data-slot="input"
                  name="numeroContrato"
                  placeholder="CONT-2024-0001"
                  value=""
                />
              </div>
            </div>
          </div>
          <div
            class="space-y-2"
          >
            <div
              class="grid gap-2"
              data-slot="form-item"
            >
              <label
                class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive mb-2"
                data-error="false"
                data-slot="form-label"
                for="«r31»-form-item"
              >
                Processo SEI / Processo.rio *
              </label>
              <div
                aria-describedby="«r31»-form-item-description"
                aria-invalid="false"
                class="grid grid-cols-2 gap-2"
                data-slot="form-control"
                id="«r31»-form-item"
              >
                <div
                  aria-controls="radix-«r32»"
                  aria-expanded="false"
                  aria-haspopup="dialog"
                  aria-label="Selecionar processo SEI"
                  class="flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 transition-colors hover:bg-gray-50"
                  data-slot="popover-trigger"
                  data-state="closed"
                  role="combobox"
                  tabindex="0"
                  type="button"
                >
                  <span
                    class="text-sm text-gray-900"
                  >
                    Selecione o processo...
                  </span>
                  <svg
                    aria-hidden="true"
                    class="lucide lucide-chevrons-up-down h-4 w-4 shrink-0 opacity-50"
                    fill="none"
                    height="24"
   ...
 × src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve renderizar o componente com título 38ms
   → Cannot read properties of undefined (reading 'map')
 × src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve exibir todas as opções de status 5ms
   → Cannot read properties of undefined (reading 'map')
 × src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve exibir todas as unidades disponíveis 5ms
   → Cannot read properties of undefined (reading 'map')
 × src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve exibir campos de data para período de vigência 5ms
   → Cannot read properties of undefined (reading 'map')
 × src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve exibir campos de valor mínimo e máximo 6ms
   → Cannot read properties of undefined (reading 'map')
 × src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve permitir seleção de múltiplos status 7ms
   → Cannot read properties of undefined (reading 'map')
 × src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve permitir desmarcar status selecionados 4ms
   → Cannot read properties of undefined (reading 'map')
 × src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve permitir seleção de múltiplas unidades 3ms
   → Cannot read properties of undefined (reading 'map')
 × src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve permitir entrada de valores monetários 3ms
   → Cannot read properties of undefined (reading 'map')
 × src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve permitir entrada de datas 4ms
   → Cannot read properties of undefined (reading 'map')
 × src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve exibir indicador de filtros ativos quando há filtros 5ms
   → Cannot read properties of undefined (reading 'map')
 × src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve permitir expansão e contração do painel de filtros 24ms
   → Cannot read properties of undefined (reading 'map')
 × src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve exibir ícone de filtro 5ms
   → Cannot read properties of undefined (reading 'map')
 × src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve exibir ícone de chevron para expansão 8ms
   → Cannot read properties of undefined (reading 'map')
 × src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve aplicar classes CSS corretas para responsividade 4ms
   → Cannot read properties of undefined (reading 'map')
 × src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve exibir checkboxes com labels corretos 4ms
   → Cannot read properties of undefined (reading 'map')
 × src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve permitir entrada de valores decimais nos campos monetários 4ms
   → Cannot read properties of undefined (reading 'map')
 × src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve permitir entrada de datas em formato ISO 4ms
   → Cannot read properties of undefined (reading 'map')
 × src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve renderizar corretamente quando não há filtros ativos 5ms
   → Cannot read properties of undefined (reading 'map')
 × src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve aplicar classes CSS corretas para o indicador de filtros ativos 4ms
   → Cannot read properties of undefined (reading 'map')
stderr | src/modules/contratos/components/__tests__/contrato-form.test.tsx > ContratoForm > deve chamar onAdvanceRequest quando formulário é válido e função está disponível
Erro ao carregar processo instrutivo: TypeError: Failed to parse URL from /src/modules/Contratos/data/processo-instrutivo.json
    at node:internal/deps/undici/undici:13510:13
    at carregarProcessoInstrutivo (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:211:26) {
  [cause]: TypeError: Invalid URL: /src/modules/Contratos/data/processo-instrutivo.json
      at new URLImpl (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL-impl.js:20:13)
      at Object.exports.setup (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:54:12)
      at new URL (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:115:22)
      at new Request (node:internal/deps/undici/undici:9586:25)
      at fetch (node:internal/deps/undici/undici:10315:25)
      at fetch (node:internal/deps/undici/undici:13508:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:72:12)
      at carregarProcessoInstrutivo (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:211:32)
      at /home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:220:5
      at Object.react_stack_bottom_frame (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:23953:20)
}
Erro ao carregar unidades: TypeError: Failed to parse URL from /src/modules/Contratos/data/contratos-data.json
    at node:internal/deps/undici/undici:13510:13
    at carregarUnidades (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:227:26) {
  [cause]: TypeError: Invalid URL: /src/modules/Contratos/data/contratos-data.json
      at new URLImpl (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL-impl.js:20:13)
      at Object.exports.setup (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:54:12)
      at new URL (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:115:22)
      at new Request (node:internal/deps/undici/undici:9586:25)
      at fetch (node:internal/deps/undici/undici:10315:25)
      at fetch (node:internal/deps/undici/undici:13508:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:72:12)
      at carregarUnidades (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:227:32)
      at /home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:236:5
      at Object.react_stack_bottom_frame (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:23953:20)
}

 ✓ src/modules/contratos/components/__tests__/contrato-form.test.tsx > ContratoForm > deve exibir erros de validação para campos obrigatórios 337ms
stderr | src/modules/contratos/components/__tests__/contrato-form.test.tsx > ContratoForm > deve permitir upload de arquivo PDF
Erro ao carregar processo instrutivo: TypeError: Failed to parse URL from /src/modules/Contratos/data/processo-instrutivo.json
    at node:internal/deps/undici/undici:13510:13
    at carregarProcessoInstrutivo (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:211:26) {
  [cause]: TypeError: Invalid URL: /src/modules/Contratos/data/processo-instrutivo.json
      at new URLImpl (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL-impl.js:20:13)
      at Object.exports.setup (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:54:12)
      at new URL (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:115:22)
      at new Request (node:internal/deps/undici/undici:9586:25)
      at fetch (node:internal/deps/undici/undici:10315:25)
      at fetch (node:internal/deps/undici/undici:13508:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:72:12)
      at carregarProcessoInstrutivo (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:211:32)
      at /home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:220:5
      at Object.react_stack_bottom_frame (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:23953:20)
}
Erro ao carregar unidades: TypeError: Failed to parse URL from /src/modules/Contratos/data/contratos-data.json
    at node:internal/deps/undici/undici:13510:13
    at carregarUnidades (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:227:26) {
  [cause]: TypeError: Invalid URL: /src/modules/Contratos/data/contratos-data.json
      at new URLImpl (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL-impl.js:20:13)
      at Object.exports.setup (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:54:12)
      at new URL (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:115:22)
      at new Request (node:internal/deps/undici/undici:9586:25)
      at fetch (node:internal/deps/undici/undici:10315:25)
      at fetch (node:internal/deps/undici/undici:13508:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:72:12)
      at carregarUnidades (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:227:32)
      at /home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:236:5
      at Object.react_stack_bottom_frame (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:23953:20)
}

 × src/modules/contratos/components/__tests__/contrato-form.test.tsx > ContratoForm > deve chamar onAdvanceRequest quando formulário é válido e função está disponível 255ms
   → Found a label with the text of: /número do contrato/i, however the element associated with this label (<div />) is non-labellable [https://html.spec.whatwg.org/multipage/forms.html#category-label]. If you really need to label a <div />, you can use aria-label or aria-labelledby instead.

Ignored nodes: comments, script, style
<body>
  <div>
    <form
      class="space-y-8"
    >
      <div
        class="space-y-6"
      >
        <div
          class="flex items-center space-x-3 border-b border-slate-200 pb-3"
        >
          <div
            class="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-file-text h-4 w-4 text-slate-600"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
              />
              <path
                d="M14 2v4a2 2 0 0 0 2 2h4"
              />
              <path
                d="M10 9H8"
              />
              <path
                d="M16 13H8"
              />
              <path
                d="M16 17H8"
              />
            </svg>
          </div>
          <h3
            class="text-base font-semibold text-gray-900"
          >
            Informações Básicas
          </h3>
        </div>
        <div
          class="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <div
            class="space-y-2"
          >
            <div
              class="grid gap-2"
              data-slot="form-item"
            >
              <label
                class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive mb-2"
                data-error="false"
                data-slot="form-label"
                for="«r60»-form-item"
              >
                Número do Contrato *
              </label>
              <div
                aria-describedby="«r60»-form-item-description"
                aria-invalid="false"
                class="relative"
                data-slot="form-control"
                id="«r60»-form-item"
              >
                <input
                  class="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                  data-slot="input"
                  name="numeroContrato"
                  placeholder="CONT-2024-0001"
                  value=""
                />
              </div>
            </div>
          </div>
          <div
            class="space-y-2"
          >
            <div
              class="grid gap-2"
              data-slot="form-item"
            >
              <label
                class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive mb-2"
                data-error="false"
                data-slot="form-label"
                for="«r61»-form-item"
              >
                Processo SEI / Processo.rio *
              </label>
              <div
                aria-describedby="«r61»-form-item-description"
                aria-invalid="false"
                class="grid grid-cols-2 gap-2"
                data-slot="form-control"
                id="«r61»-form-item"
              >
                <div
                  aria-controls="radix-«r62»"
                  aria-expanded="false"
                  aria-haspopup="dialog"
                  aria-label="Selecionar processo SEI"
                  class="flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 transition-colors hover:bg-gray-50"
                  data-slot="popover-trigger"
                  data-state="closed"
                  role="combobox"
                  tabindex="0"
                  type="button"
                >
                  <span
                    class="text-sm text-gray-900"
                  >
                    Selecione o processo...
                  </span>
                  <svg
                    aria-hidden="true"
                    class="lucide lucide-chevrons-up-down h-4 w-4 shrink-0 opacity-50"
                    fill="none"
                    height="24"
   ...
stderr | src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve renderizar o componente com todas as seções
React does not recognize the `whileHover` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `whilehover` instead. If you accidentally passed it from a parent component, remove it from the DOM element.

 × src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve renderizar o componente com todas as seções 154ms
   → Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `IndicadoresRelatorios`.
 × src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve exibir valor total formatado corretamente 62ms
   → Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `IndicadoresRelatorios`.
stderr | src/modules/contratos/components/__tests__/contrato-form.test.tsx > ContratoForm > deve chamar função de cancelar quando botão cancelar é clicado
Erro ao carregar processo instrutivo: TypeError: Failed to parse URL from /src/modules/Contratos/data/processo-instrutivo.json
 × src/modules/contratos/components/__tests__/contrato-form.test.tsx > ContratoForm > deve permitir upload de arquivo PDF 224ms
   → Found a label with the text of: /termo de referência/i, however the element associated with this label (<div />) is non-labellable [https://html.spec.whatwg.org/multipage/forms.html#category-label]. If you really need to label a <div />, you can use aria-label or aria-labelledby instead.

Ignored nodes: comments, script, style
<body>
  <div>
    <form
      class="space-y-8"
    >
      <div
        class="space-y-6"
      >
        <div
          class="flex items-center space-x-3 border-b border-slate-200 pb-3"
        >
          <div
            class="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-file-text h-4 w-4 text-slate-600"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
              />
              <path
                d="M14 2v4a2 2 0 0 0 2 2h4"
              />
              <path
                d="M10 9H8"
              />
              <path
                d="M16 13H8"
              />
              <path
                d="M16 17H8"
              />
            </svg>
          </div>
          <h3
            class="text-base font-semibold text-gray-900"
          >
            Informações Básicas
          </h3>
        </div>
        <div
          class="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <div
            class="space-y-2"
          >
            <div
              class="grid gap-2"
              data-slot="form-item"
            >
              <label
                class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive mb-2"
                data-error="false"
                data-slot="form-label"
                for="«r7g»-form-item"
              >
                Número do Contrato *
              </label>
              <div
                aria-describedby="«r7g»-form-item-description"
                aria-invalid="false"
                class="relative"
                data-slot="form-control"
                id="«r7g»-form-item"
              >
                <input
                  class="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                  data-slot="input"
                  name="numeroContrato"
                  placeholder="CONT-2024-0001"
                  value=""
                />
              </div>
            </div>
          </div>
          <div
            class="space-y-2"
          >
            <div
              class="grid gap-2"
              data-slot="form-item"
            >
              <label
                class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive mb-2"
                data-error="false"
                data-slot="form-label"
                for="«r7h»-form-item"
              >
                Processo SEI / Processo.rio *
              </label>
              <div
                aria-describedby="«r7h»-form-item-description"
                aria-invalid="false"
                class="grid grid-cols-2 gap-2"
                data-slot="form-control"
                id="«r7h»-form-item"
              >
                <div
                  aria-controls="radix-«r7i»"
                  aria-expanded="false"
                  aria-haspopup="dialog"
                  aria-label="Selecionar processo SEI"
                  class="flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 transition-colors hover:bg-gray-50"
                  data-slot="popover-trigger"
                  data-state="closed"
                  role="combobox"
                  tabindex="0"
                  type="button"
                >
                  <span
                    class="text-sm text-gray-900"
                  >
                    Selecione o processo...
                  </span>
                  <svg
                    aria-hidden="true"
                    class="lucide lucide-chevrons-up-down h-4 w-4 shrink-0 opacity-50"
                    fill="none"
                    height="24"
   ...
    at node:internal/deps/undici/undici:13510:13
    at carregarProcessoInstrutivo (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:211:26) {
  [cause]: TypeError: Invalid URL: /src/modules/Contratos/data/processo-instrutivo.json
      at new URLImpl (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL-impl.js:20:13)
      at Object.exports.setup (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:54:12)
      at new URL (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:115:22)
      at new Request (node:internal/deps/undici/undici:9586:25)
      at fetch (node:internal/deps/undici/undici:10315:25)
      at fetch (node:internal/deps/undici/undici:13508:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:72:12)
      at carregarProcessoInstrutivo (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:211:32)
      at /home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:220:5
      at Object.react_stack_bottom_frame (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:23953:20)
}
Erro ao carregar unidades: TypeError: Failed to parse URL from /src/modules/Contratos/data/contratos-data.json
    at node:internal/deps/undici/undici:13510:13
    at carregarUnidades (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:227:26) {
  [cause]: TypeError: Invalid URL: /src/modules/Contratos/data/contratos-data.json
      at new URLImpl (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL-impl.js:20:13)
      at Object.exports.setup (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:54:12)
      at new URL (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:115:22)
      at new Request (node:internal/deps/undici/undici:9586:25)
      at fetch (node:internal/deps/undici/undici:10315:25)
      at fetch (node:internal/deps/undici/undici:13508:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:72:12)
      at carregarUnidades (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:227:32)
      at /home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:236:5
      at Object.react_stack_bottom_frame (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:23953:20)
}

 × src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve exibir valor executado calculado corretamente 50ms
   → Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `IndicadoresRelatorios`.
 × src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve exibir saldo atual formatado corretamente 62ms
   → Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `IndicadoresRelatorios`.
stderr | src/modules/contratos/components/__tests__/contrato-form.test.tsx > ContratoForm > deve chamar função anterior quando botão anterior é clicado
Erro ao carregar processo instrutivo: TypeError: Failed to parse URL from /src/modules/Contratos/data/processo-instrutivo.json
 ✓ src/modules/contratos/components/__tests__/contrato-form.test.tsx > ContratoForm > deve chamar função de cancelar quando botão cancelar é clicado 191ms
    at node:internal/deps/undici/undici:13510:13
    at carregarProcessoInstrutivo (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:211:26) {
  [cause]: TypeError: Invalid URL: /src/modules/Contratos/data/processo-instrutivo.json
      at new URLImpl (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL-impl.js:20:13)
      at Object.exports.setup (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:54:12)
      at new URL (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:115:22)
      at new Request (node:internal/deps/undici/undici:9586:25)
      at fetch (node:internal/deps/undici/undici:10315:25)
      at fetch (node:internal/deps/undici/undici:13508:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:72:12)
      at carregarProcessoInstrutivo (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:211:32)
      at /home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:220:5
      at Object.react_stack_bottom_frame (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:23953:20)
}
Erro ao carregar unidades: TypeError: Failed to parse URL from /src/modules/Contratos/data/contratos-data.json
    at node:internal/deps/undici/undici:13510:13
    at carregarUnidades (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:227:26) {
  [cause]: TypeError: Invalid URL: /src/modules/Contratos/data/contratos-data.json
      at new URLImpl (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL-impl.js:20:13)
      at Object.exports.setup (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:54:12)
      at new URL (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:115:22)
      at new Request (node:internal/deps/undici/undici:9586:25)
      at fetch (node:internal/deps/undici/undici:10315:25)
      at fetch (node:internal/deps/undici/undici:13508:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:72:12)
      at carregarUnidades (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:227:32)
      at /home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:236:5
      at Object.react_stack_bottom_frame (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:23953:20)
}

 × src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve calcular e exibir percentual de execução correto 46ms
   → Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `IndicadoresRelatorios`.
 × src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve exibir barra de progresso com valor correto 45ms
   → Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `IndicadoresRelatorios`.
 × src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve exibir cronograma de vigência com todas as fases 59ms
   → Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `IndicadoresRelatorios`.
 × src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve exibir status correto para cada fase do cronograma 42ms
   → Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `IndicadoresRelatorios`.
 × src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve aplicar cores corretas para cada status do cronograma 53ms
   → Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `IndicadoresRelatorios`.
stderr | src/modules/contratos/components/__tests__/contrato-form.test.tsx > ContratoForm > deve preencher formulário com dados iniciais quando fornecidos
Erro ao carregar processo instrutivo: TypeError: Failed to parse URL from /src/modules/Contratos/data/processo-instrutivo.json
    at node:internal/deps/undici/undici:13510:13
    at carregarProcessoInstrutivo (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:211:26) {
  [cause]: TypeError: Invalid URL: /src/modules/Contratos/data/processo-instrutivo.json
      at new URLImpl (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL-impl.js:20:13)
      at Object.exports.setup (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:54:12)
      at new URL (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:115:22)
      at new Request (node:internal/deps/undici/undici:9586:25)
      at fetch (node:internal/deps/undici/undici:10315:25)
      at fetch (node:internal/deps/undici/undici:13508:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:72:12)
      at carregarProcessoInstrutivo (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:211:32)
      at /home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:220:5
      at Object.react_stack_bottom_frame (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:23953:20)
}
Erro ao carregar unidades: TypeError: Failed to parse URL from /src/modules/Contratos/data/contratos-data.json
    at node:internal/deps/undici/undici:13510:13
    at carregarUnidades (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:227:26) {
  [cause]: TypeError: Invalid URL: /src/modules/Contratos/data/contratos-data.json
      at new URLImpl (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL-impl.js:20:13)
      at Object.exports.setup (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:54:12)
      at new URL (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:115:22)
      at new Request (node:internal/deps/undici/undici:9586:25)
      at fetch (node:internal/deps/undici/undici:10315:25)
      at fetch (node:internal/deps/undici/undici:13508:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:72:12)
      at carregarUnidades (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:227:32)
      at /home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:236:5
      at Object.react_stack_bottom_frame (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:23953:20)
}

 ✓ src/modules/contratos/components/__tests__/contrato-form.test.tsx > ContratoForm > deve chamar função anterior quando botão anterior é clicado 175ms
 × src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve exibir todas as unidades vinculadas 36ms
   → Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `IndicadoresRelatorios`.
 × src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve exibir percentuais das unidades vinculadas 40ms
   → Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `IndicadoresRelatorios`.
 × src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve exibir valores mensais das unidades 42ms
   → Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `IndicadoresRelatorios`.
 × src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve exibir resumo financeiro das unidades 39ms
   → Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `IndicadoresRelatorios`.
 ✓ src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve renderizar corretamente quando não há unidades vinculadas 51ms
 × src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve aplicar classes CSS corretas para responsividade 49ms
   → Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `IndicadoresRelatorios`.
 × src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve exibir ícones corretos para cada seção 41ms
   → Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `IndicadoresRelatorios`.
stderr | src/modules/contratos/components/__tests__/contrato-form.test.tsx > ContratoForm > deve marcar checkbox de contrato ativo por padrão
Erro ao carregar processo instrutivo: TypeError: Failed to parse URL from /src/modules/Contratos/data/processo-instrutivo.json
    at node:internal/deps/undici/undici:13510:13
    at carregarProcessoInstrutivo (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:211:26) {
  [cause]: TypeError: Invalid URL: /src/modules/Contratos/data/processo-instrutivo.json
      at new URLImpl (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL-impl.js:20:13)
      at Object.exports.setup (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:54:12)
      at new URL (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:115:22)
      at new Request (node:internal/deps/undici/undici:9586:25)
      at fetch (node:internal/deps/undici/undici:10315:25)
      at fetch (node:internal/deps/undici/undici:13508:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:72:12)
      at carregarProcessoInstrutivo (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:211:32)
      at /home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:220:5
      at Object.react_stack_bottom_frame (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:23953:20)
}
Erro ao carregar unidades: TypeError: Failed to parse URL from /src/modules/Contratos/data/contratos-data.json
    at node:internal/deps/undici/undici:13510:13
    at carregarUnidades (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:227:26) {
  [cause]: TypeError: Invalid URL: /src/modules/Contratos/data/contratos-data.json
      at new URLImpl (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL-impl.js:20:13)
      at Object.exports.setup (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:54:12)
      at new URL (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:115:22)
      at new Request (node:internal/deps/undici/undici:9586:25)
      at fetch (node:internal/deps/undici/undici:10315:25)
      at fetch (node:internal/deps/undici/undici:13508:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:72:12)
      at carregarUnidades (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:227:32)
      at /home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:236:5
      at Object.react_stack_bottom_frame (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:23953:20)
}

 × src/modules/contratos/components/__tests__/contrato-form.test.tsx > ContratoForm > deve preencher formulário com dados iniciais quando fornecidos 207ms
   → Unable to find an element with the display value: 98765432109876543210.

Ignored nodes: comments, script, style
<body>
  <div>
    <form
      class="space-y-8"
    >
      <div
        class="space-y-6"
      >
        <div
          class="flex items-center space-x-3 border-b border-slate-200 pb-3"
        >
          <div
            class="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-file-text h-4 w-4 text-slate-600"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
              />
              <path
                d="M14 2v4a2 2 0 0 0 2 2h4"
              />
              <path
                d="M10 9H8"
              />
              <path
                d="M16 13H8"
              />
              <path
                d="M16 17H8"
              />
            </svg>
          </div>
          <h3
            class="text-base font-semibold text-gray-900"
          >
            Informações Básicas
          </h3>
        </div>
        <div
          class="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <div
            class="space-y-2"
          >
            <div
              class="grid gap-2"
              data-slot="form-item"
            >
              <label
                class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive mb-2"
                data-error="false"
                data-slot="form-label"
                for="«rc0»-form-item"
              >
                Número do Contrato *
              </label>
              <div
                aria-describedby="«rc0»-form-item-description"
                aria-invalid="false"
                class="relative"
                data-slot="form-control"
                id="«rc0»-form-item"
              >
                <input
                  class="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border-red-500 bg-red-50 pr-10"
                  data-slot="input"
                  name="numeroContrato"
                  placeholder="CONT-2024-0001"
                  value="CONT-2024-002"
                />
                <div
                  class="absolute top-1/2 right-3 -translate-y-1/2"
                >
                  <svg
                    aria-hidden="true"
                    class="lucide lucide-x h-4 w-4 text-red-500"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 6 6 18"
                    />
                    <path
                      d="m6 6 12 12"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div
            class="space-y-2"
          >
            <div
              class="grid gap-2"
              data-slot="form-item"
            >
              <label
                class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive mb-2"
                data-error="false"
                data-slot="form-label"
                for="«rc1»-form-item"
              >
                Processo SEI / Processo.rio *
              </label>
              <div
                aria-describedby="«rc1»-form-item-description"
                aria-invalid="false"
                class="grid grid-cols-2 gap-2"
                data-slot="form-control"
                id="«rc1»-form-item"
              >
                <div
                  aria-controls="radix-«rc2»"..
stderr | src/modules/contratos/components/__tests__/contrato-form.test.tsx > ContratoForm > deve validar prazo inicial entre 1 e 60 meses
Erro ao carregar processo instrutivo: TypeError: Failed to parse URL from /src/modules/Contratos/data/processo-instrutivo.json
 ✓ src/modules/contratos/components/__tests__/contrato-form.test.tsx > ContratoForm > deve marcar checkbox de contrato ativo por padrão 198ms
    at node:internal/deps/undici/undici:13510:13
    at carregarProcessoInstrutivo (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:211:26) {
  [cause]: TypeError: Invalid URL: /src/modules/Contratos/data/processo-instrutivo.json
      at new URLImpl (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL-impl.js:20:13)
      at Object.exports.setup (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:54:12)
      at new URL (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:115:22)
      at new Request (node:internal/deps/undici/undici:9586:25)
      at fetch (node:internal/deps/undici/undici:10315:25)
      at fetch (node:internal/deps/undici/undici:13508:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:72:12)
      at carregarProcessoInstrutivo (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:211:32)
      at /home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:220:5
      at Object.react_stack_bottom_frame (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:23953:20)
}
Erro ao carregar unidades: TypeError: Failed to parse URL from /src/modules/Contratos/data/contratos-data.json
    at node:internal/deps/undici/undici:13510:13
    at carregarUnidades (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:227:26) {
  [cause]: TypeError: Invalid URL: /src/modules/Contratos/data/contratos-data.json
      at new URLImpl (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL-impl.js:20:13)
      at Object.exports.setup (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:54:12)
      at new URL (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/whatwg-url@14.2.0/node_modules/whatwg-url/lib/URL.js:115:22)
      at new Request (node:internal/deps/undici/undici:9586:25)
      at fetch (node:internal/deps/undici/undici:10315:25)
      at fetch (node:internal/deps/undici/undici:13508:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:72:12)
      at carregarUnidades (/home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:227:32)
      at /home/runner/work/cac-frontend/cac-frontend/src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx:236:5
      at Object.react_stack_bottom_frame (/home/runner/work/cac-frontend/cac-frontend/node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:23953:20)
}

 × src/modules/contratos/components/__tests__/contrato-form.test.tsx > ContratoForm > deve validar prazo inicial entre 1 e 60 meses 314ms
   → expect(element).toHaveValue(12)

Expected the element to have value:
  12
Received:
  1212
 ✓ src/modules/Contratos/components/VisualizacaoContratos/__tests__/registro-alteracoes.test.tsx > RegistroAlteracoes > deve renderizar o componente com título da linha do tempo 110ms
 ✓ src/modules/Contratos/components/VisualizacaoContratos/__tests__/registro-alteracoes.test.tsx > RegistroAlteracoes > deve ordenar as alterações por data (mais recente primeiro) 43ms
 ✓ src/modules/Contratos/components/VisualizacaoContratos/__tests__/registro-alteracoes.test.tsx > RegistroAlteracoes > deve exibir ícones corretos para cada tipo de alteração 45ms
 ✓ src/modules/Contratos/components/VisualizacaoContratos/__tests__/registro-alteracoes.test.tsx > RegistroAlteracoes > deve exibir cores corretas para cada tipo de alteração 49ms
 ✓ src/modules/Contratos/components/VisualizacaoContratos/__tests__/registro-alteracoes.test.tsx > RegistroAlteracoes > deve exibir títulos corretos para cada tipo de alteração 56ms
 ✓ src/modules/Contratos/components/VisualizacaoContratos/__tests__/registro-alteracoes.test.tsx > RegistroAlteracoes > deve exibir descrições das alterações 58ms
 ✓ src/modules/Contratos/components/VisualizacaoContratos/__tests__/registro-alteracoes.test.tsx > RegistroAlteracoes > deve exibir responsáveis pelas alterações 50ms
 ✓ src/modules/Contratos/components/VisualizacaoContratos/__tests__/registro-alteracoes.test.tsx > RegistroAlteracoes > deve exibir badges de data/hora para cada alteração 55ms
 ✓ src/modules/Contratos/components/VisualizacaoContratos/__tests__/registro-alteracoes.test.tsx > RegistroAlteracoes > deve exibir a linha vertical do tempo 27ms
 ✓ src/modules/Contratos/components/VisualizacaoContratos/__tests__/registro-alteracoes.test.tsx > RegistroAlteracoes > deve aplicar animações com framer-motion 33ms
 ✓ src/modules/Contratos/components/VisualizacaoContratos/__tests__/registro-alteracoes.test.tsx > RegistroAlteracoes > deve exibir detalhes das alterações quando disponíveis 37ms
 ✓ src/modules/Contratos/components/VisualizacaoContratos/__tests__/registro-alteracoes.test.tsx > RegistroAlteracoes > deve renderizar corretamente quando não há alterações 11ms
 ✓ src/modules/Contratos/components/VisualizacaoContratos/__tests__/registro-alteracoes.test.tsx > RegistroAlteracoes > deve exibir as etapas do contrato com status correto 35ms
 ✓ src/modules/Contratos/components/VisualizacaoContratos/__tests__/registro-alteracoes.test.tsx > RegistroAlteracoes > deve aplicar classes CSS corretas para responsividade 30ms
 ✓ src/lib/__tests__/utils.test.ts > cn > deve combinar classes TailwindCSS corretamente 10ms
 ✓ src/lib/__tests__/utils.test.ts > cn > deve fazer merge de classes conflitantes 0ms
 × src/lib/__tests__/utils.test.ts > cn > deve lidar com condicionais 9ms
   → expected 'text-red-500 bg-red-500' to be 'bg-red-500' // Object.is equality
 ✓ src/lib/__tests__/utils.test.ts > cnpjUtils > limpar > deve remover todos os caracteres não numéricos 1ms
 ✓ src/lib/__tests__/utils.test.ts > cnpjUtils > limpar > deve retornar string vazia para entrada vazia 0ms
 ✓ src/lib/__tests__/utils.test.ts > cnpjUtils > formatar > deve formatar CNPJ válido corretamente 0ms
 ✓ src/lib/__tests__/utils.test.ts > cnpjUtils > formatar > deve retornar valor original se não tiver 14 dígitos 0ms
 ✓ src/lib/__tests__/utils.test.ts > cnpjUtils > formatar > deve retornar string vazia para entrada vazia 7ms
 ✓ src/lib/__tests__/utils.test.ts > cnpjUtils > validar > deve validar CNPJ válido 0ms
 ✓ src/lib/__tests__/utils.test.ts > cnpjUtils > validar > deve invalidar CNPJ com dígito verificador incorreto 0ms
 ✓ src/lib/__tests__/utils.test.ts > cnpjUtils > validar > deve invalidar CNPJ com todos os dígitos iguais 0ms
 ✓ src/lib/__tests__/utils.test.ts > cnpjUtils > validar > deve invalidar CNPJ com número incorreto de dígitos 0ms
 ✓ src/lib/__tests__/utils.test.ts > cnpjUtils > validar > deve invalidar string vazia 0ms
 ✓ src/lib/__tests__/utils.test.ts > cnpjUtils > validarComMensagem > deve retornar string vazia para CNPJ válido 1ms
 ✓ src/lib/__tests__/utils.test.ts > cnpjUtils > validarComMensagem > deve retornar mensagem de obrigatório para string vazia 0ms
 ✓ src/lib/__tests__/utils.test.ts > cnpjUtils > validarComMensagem > deve retornar mensagem de dígitos insuficientes 0ms
 ✓ src/lib/__tests__/utils.test.ts > cnpjUtils > validarComMensagem > deve retornar mensagem de CNPJ inválido 0ms
 ✓ src/lib/__tests__/utils.test.ts > cnpjUtils > aplicarMascara > deve aplicar máscara progressivamente 1ms
 ✓ src/lib/__tests__/utils.test.ts > cnpjUtils > aplicarMascara > deve limitar a 14 dígitos 0ms
 ✓ src/lib/__tests__/utils.test.ts > cnpjUtils > aplicarMascara > deve remover caracteres não numéricos antes de aplicar máscara 0ms
 ✓ src/lib/__tests__/utils.test.ts > cnpjUtils > aplicarMascara > deve retornar string vazia para entrada vazia 0ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/modal-confirmacao-exportacao.test.tsx > ModalConfirmacaoExportacao > deve renderizar o modal quando isOpen é true 187ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/modal-confirmacao-exportacao.test.tsx > ModalConfirmacaoExportacao > não deve renderizar o modal quando isOpen é false 5ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/modal-confirmacao-exportacao.test.tsx > ModalConfirmacaoExportacao > deve exibir o total de contratos formatado 30ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/modal-confirmacao-exportacao.test.tsx > ModalConfirmacaoExportacao > deve exibir o formato de exportação 26ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/modal-confirmacao-exportacao.test.tsx > ModalConfirmacaoExportacao > deve exibir mensagem sobre tempo de processamento 29ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/modal-confirmacao-exportacao.test.tsx > ModalConfirmacaoExportacao > deve chamar onClose quando cancelar for clicado 40ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/modal-confirmacao-exportacao.test.tsx > ModalConfirmacaoExportacao > deve chamar onConfirm quando exportar for clicado 27ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/modal-confirmacao-exportacao.test.tsx > ModalConfirmacaoExportacao > deve exibir ícone de alerta 27ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/modal-confirmacao-exportacao.test.tsx > ModalConfirmacaoExportacao > deve exibir ícone de download no botão exportar 21ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/modal-confirmacao-exportacao.test.tsx > ModalConfirmacaoExportacao > deve aplicar classes CSS corretas para o botão cancelar 25ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/modal-confirmacao-exportacao.test.tsx > ModalConfirmacaoExportacao > deve aplicar classes CSS corretas para o container de informações 37ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/modal-confirmacao-exportacao.test.tsx > ModalConfirmacaoExportacao > deve exibir informações organizadas em linhas 37ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/modal-confirmacao-exportacao.test.tsx > ModalConfirmacaoExportacao > deve aplicar classes CSS corretas para o conteúdo do modal 35ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/modal-confirmacao-exportacao.test.tsx > ModalConfirmacaoExportacao > deve formatar diferentes quantidades de contratos 25ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/modal-confirmacao-exportacao.test.tsx > ModalConfirmacaoExportacao > deve aplicar classes CSS corretas para o header do modal 20ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/modal-confirmacao-exportacao.test.tsx > ModalConfirmacaoExportacao > deve aplicar classes CSS corretas para o ícone de alerta 15ms
stderr | src/modules/Contratos/components/ListaContratos/__tests__/tabela-contratos.test.tsx > TabelaContratos > deve renderizar corretamente quando não há contratos
⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 ✓ src/modules/Contratos/components/ListaContratos/__tests__/tabela-contratos.test.tsx > TabelaContratos > deve renderizar o componente sem erros 2ms
 ✓ src/modules/Contratos/components/ListaContratos/__tests__/tabela-contratos.test.tsx > TabelaContratos > deve renderizar corretamente quando não há contratos 72ms
stderr | src/tests/page-breadcrumb.test.tsx > PageBreadcrumb > deve renderizar o breadcrumb na página inicial
⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 ✓ src/tests/page-breadcrumb.test.tsx > PageBreadcrumb > deve renderizar o breadcrumb na página inicial 121ms
 ✓ src/tests/page-breadcrumb.test.tsx > PageBreadcrumb > deve renderizar o breadcrumb na página de contratos 24ms
 × src/tests/page-breadcrumb.test.tsx > PageBreadcrumb > deve renderizar o breadcrumb na página de detalhes do contrato 27ms
   → Unable to find an element with the text: Contrato 123. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
<body>
  <div>
    <div
      class="group/sidebar-wrapper flex min-h-svh w-full"
      data-slot="sidebar-wrapper"
      style="--sidebar-width: 16rem; --sidebar-width-icon: 3rem;"
    >
      <div
        class="flex items-center gap-2"
      >
        <button
          aria-label="Alternar sidebar"
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:hover:bg-accent/50 size-7 cursor-pointer rounded-md border border-transparent p-2 transition-colors duration-200 hover:border-gray-200 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm"
          data-sidebar="trigger"
          data-slot="sidebar-trigger"
          title="Clique para expandir/colapsar a sidebar (Ctrl+B)"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-panel-left"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              height="18"
              rx="2"
              width="18"
              x="3"
              y="3"
            />
            <path
              d="M9 3v18"
            />
          </svg>
          <span
            class="sr-only"
          >
            Toggle Sidebar
          </span>
        </button>
        <nav
          aria-label="breadcrumb"
          data-slot="breadcrumb"
        >
          <ol
            class="flex flex-wrap items-center gap-2 text-sm font-medium break-words text-slate-600 sm:gap-3"
            data-slot="breadcrumb-list"
          >
            <li
              class="inline-flex items-center gap-1.5"
              data-slot="breadcrumb-item"
            >
              <a
                class="text-slate-700 decoration-[#43B9EB] underline-offset-4 transition-colors duration-200 hover:text-[#43B9EB] hover:underline"
                data-slot="breadcrumb-link"
                href="/"
              >
                Início
              </a>
            </li>
            <li
              aria-hidden="true"
              class="text-slate-400 [&>svg]:size-4"
              data-slot="breadcrumb-separator"
              role="presentation"
            >
              <svg
                aria-hidden="true"
                class="lucide lucide-chevron-right"
                fill="none"
                height="24"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="m9 18 6-6-6-6"
                />
              </svg>
            </li>
            <li
              class="inline-flex items-center gap-1.5"
              data-slot="breadcrumb-item"
            >
              <a
                class="text-slate-700 decoration-[#43B9EB] underline-offset-4 transition-colors duration-200 hover:text-[#43B9EB] hover:underline"
                data-slot="breadcrumb-link"
                href="/contratos"
              >
                Contratos
              </a>
            </li>
            <li
              aria-hidden="true"
              class="text-slate-400 [&>svg]:size-4"
              data-slot="breadcrumb-separator"
              role="presentation"
            >
              <svg
                aria-hidden="true"
                class="lucide lucide-chevron-right"
                fill="none"
                height="24"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="m9 18 6-6-6-6"
                />
              </svg>
            </li>
            <li
              class="inline-flex items-center gap-1.5"
              data-slot="breadcrumb-item"
            >
              <span
                aria-current="page"
                aria-disabled="true"
                class="font-semibold text-[#43B9EB]"
                data-slot="breadcrumb-page"
                role="link"
              >
                123
              </span>
            </li>
          </ol>
        </nav>
      </div>
    </div>
  </div>
</body>
 ✓ src/tests/page-breadcrumb.test.tsx > PageBreadcrumb > deve renderizar o breadcrumb na página de fornecedores 16ms
 × src/tests/page-breadcrumb.test.tsx > PageBreadcrumb > deve renderizar o breadcrumb na página de detalhes do fornecedor 18ms
   → Unable to find an element with the text: Fornecedor 456. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
<body>
  <div>
    <div
      class="group/sidebar-wrapper flex min-h-svh w-full"
      data-slot="sidebar-wrapper"
      style="--sidebar-width: 16rem; --sidebar-width-icon: 3rem;"
    >
      <div
        class="flex items-center gap-2"
      >
        <button
          aria-label="Alternar sidebar"
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:hover:bg-accent/50 size-7 cursor-pointer rounded-md border border-transparent p-2 transition-colors duration-200 hover:border-gray-200 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm"
          data-sidebar="trigger"
          data-slot="sidebar-trigger"
          title="Clique para expandir/colapsar a sidebar (Ctrl+B)"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-panel-left"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              height="18"
              rx="2"
              width="18"
              x="3"
              y="3"
            />
            <path
              d="M9 3v18"
            />
          </svg>
          <span
            class="sr-only"
          >
            Toggle Sidebar
          </span>
        </button>
        <nav
          aria-label="breadcrumb"
          data-slot="breadcrumb"
        >
          <ol
            class="flex flex-wrap items-center gap-2 text-sm font-medium break-words text-slate-600 sm:gap-3"
            data-slot="breadcrumb-list"
          >
            <li
              class="inline-flex items-center gap-1.5"
              data-slot="breadcrumb-item"
            >
              <a
                class="text-slate-700 decoration-[#43B9EB] underline-offset-4 transition-colors duration-200 hover:text-[#43B9EB] hover:underline"
                data-slot="breadcrumb-link"
                href="/"
              >
                Início
              </a>
            </li>
            <li
              aria-hidden="true"
              class="text-slate-400 [&>svg]:size-4"
              data-slot="breadcrumb-separator"
              role="presentation"
            >
              <svg
                aria-hidden="true"
                class="lucide lucide-chevron-right"
                fill="none"
                height="24"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="m9 18 6-6-6-6"
                />
              </svg>
            </li>
            <li
              class="inline-flex items-center gap-1.5"
              data-slot="breadcrumb-item"
            >
              <a
                class="text-slate-700 decoration-[#43B9EB] underline-offset-4 transition-colors duration-200 hover:text-[#43B9EB] hover:underline"
                data-slot="breadcrumb-link"
                href="/fornecedores"
              >
                Fornecedores
              </a>
            </li>
            <li
              aria-hidden="true"
              class="text-slate-400 [&>svg]:size-4"
              data-slot="breadcrumb-separator"
              role="presentation"
            >
              <svg
                aria-hidden="true"
                class="lucide lucide-chevron-right"
                fill="none"
                height="24"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="m9 18 6-6-6-6"
                />
              </svg>
            </li>
            <li
              class="inline-flex items-center gap-1.5"
              data-slot="breadcrumb-item"
            >
              <span
                aria-current="page"
                aria-disabled="true"
                class="font-semibold text-[#43B9EB]"
                data-slot="breadcrumb-page"
                role="link"
              >
                456
              </span>
            </li>
          </ol>
        </nav>
      </div>
    </div>
  </div>
</body>
 ✓ src/tests/page-breadcrumb.test.tsx > PageBreadcrumb > deve renderizar o SidebarTrigger junto com o breadcrumb 19ms
 ✓ src/tests/page-breadcrumb.test.tsx > PageBreadcrumb > deve ter atributos de acessibilidade corretos no SidebarTrigger 10ms
 ✓ src/tests/page-breadcrumb.test.tsx > PageBreadcrumb > deve ter classes de estilo para hover e interação 14ms
stderr | src/modules/Contratos/components/VisualizacaoContratos/__tests__/detalhes-contrato.test.tsx > DetalhesContrato > deve exibir informações básicas do contrato na aba Visão Geral
⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 ✓ src/modules/Contratos/components/VisualizacaoContratos/__tests__/detalhes-contrato.test.tsx > DetalhesContrato > deve exibir informações básicas do contrato na aba Visão Geral 223ms
 ✓ src/modules/Contratos/components/VisualizacaoContratos/__tests__/detalhes-contrato.test.tsx > DetalhesContrato > deve formatar valores monetários corretamente na aba Visão Geral 63ms
 ✓ src/modules/Contratos/components/VisualizacaoContratos/__tests__/detalhes-contrato.test.tsx > DetalhesContrato > deve exibir status e tipo de contratação com badges na aba Visão Geral 71ms
 ✓ src/modules/Contratos/components/VisualizacaoContratos/__tests__/detalhes-contrato.test.tsx > DetalhesContrato > deve exibir informações dos responsáveis na aba Visão Geral 59ms
 ✓ src/modules/Contratos/components/VisualizacaoContratos/__tests__/detalhes-contrato.test.tsx > DetalhesContrato > deve exibir informações de contato dos responsáveis na aba Visão Geral 72ms
 ✓ src/modules/Contratos/components/VisualizacaoContratos/__tests__/detalhes-contrato.test.tsx > DetalhesContrato > deve exibir as abas disponíveis 57ms
stderr | src/tests/nav-main.test.tsx > NavMain > deve renderizar todos os itens de navegação
⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.

 × src/tests/nav-main.test.tsx > NavMain > deve renderizar todos os itens de navegação 99ms
   → window.matchMedia is not a function
 × src/tests/nav-main.test.tsx > NavMain > deve destacar o item ativo baseado na URL atual 21ms
   → window.matchMedia is not a function
 × src/tests/nav-main.test.tsx > NavMain > deve destacar o item pai quando um subitem está ativo 23ms
   → window.matchMedia is not a function
 × src/tests/nav-main.test.tsx > NavMain > deve aplicar estado ativo nos subitens 18ms
   → window.matchMedia is not a function
 × src/tests/nav-main.test.tsx > NavMain > deve renderizar subitens quando disponíveis 21ms
   → window.matchMedia is not a function
 × src/tests/nav-main.test.tsx > NavMain > deve destacar subitem ativo 24ms
   → window.matchMedia is not a function
 ✓ src/tests/sidebar-footer.test.tsx > SidebarFooter > deve renderizar as informações do desenvolvedor quando expandida 37ms
 ✓ src/tests/sidebar-footer.test.tsx > SidebarFooter > deve renderizar apenas a versão quando colapsada 4ms
 ✓ src/tests/sidebar-footer.test.tsx > SidebarFooter > deve usar o ano atual na mensagem do desenvolvedor 4ms
 ✓ src/tests/sidebar-footer.test.tsx > SidebarFooter > deve ter estilos corretos para o texto da versão 4ms
 × src/tests/sidebar-footer.test.tsx > SidebarFooter > deve renderizar com cores da sidebar 10ms
   → expect(element).toHaveClass("bg-sidebar")

Expected the element to have class:
  bg-sidebar
Received:
  text-sidebar-foreground/60 font-mono text-xs
 × src/tests/App.test.tsx > App > deve renderizar a sidebar 55ms
   → useLocation() may be used only in the context of a <Router> component.

⎯⎯⎯⎯⎯⎯ Failed Tests 71 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/tests/App.test.tsx > App > deve renderizar a sidebar
Error: useLocation() may be used only in the context of a <Router> component.
 ❯ Object.invariant [as UNSAFE_invariant] node_modules/.pnpm/@remix-run+router@1.23.0/node_modules/@remix-run/router/history.ts:494:11
 ❯ useLocation node_modules/.pnpm/react-router@6.30.1_react@19.1.1/node_modules/react-router/lib/hooks.tsx:105:3
 ❯ NavMain src/components/nav-main.tsx:37:20
     35|   }[]
     36| }) {
     37|   const location = useLocation()
       |                    ^
     38|   const navigate = useNavigate()
     39|   const { state } = useSidebar()
 ❯ Object.react_stack_bottom_frame node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:23863:20
 ❯ renderWithHooks node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:5529:22
 ❯ updateFunctionComponent node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:8897:19
 ❯ beginWork node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:10522:18
 ❯ runWithFiberInDEV node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:1522:13
 ❯ performUnitOfWork node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:15140:22
 ❯ workLoopSync node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:14956:41

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/71]⎯

 FAIL  src/tests/nav-main.test.tsx > NavMain > deve renderizar todos os itens de navegação
 FAIL  src/tests/nav-main.test.tsx > NavMain > deve destacar o item ativo baseado na URL atual
 FAIL  src/tests/nav-main.test.tsx > NavMain > deve destacar o item pai quando um subitem está ativo
 FAIL  src/tests/nav-main.test.tsx > NavMain > deve aplicar estado ativo nos subitens
 FAIL  src/tests/nav-main.test.tsx > NavMain > deve renderizar subitens quando disponíveis
 FAIL  src/tests/nav-main.test.tsx > NavMain > deve destacar subitem ativo
TypeError: window.matchMedia is not a function
 ❯ src/hooks/use-mobile.ts:9:24
      7| 
      8|   React.useEffect(() => {
      9|     const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1…
       |                        ^
     10|     const onChange = () => {
     11|       setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
 ❯ Object.react_stack_bottom_frame node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:23953:20
 ❯ runWithFiberInDEV node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:1522:13
 ❯ commitHookEffectListMount node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:11905:29
 ❯ commitHookPassiveMountEffects node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:12028:11
 ❯ commitPassiveMountOnFiber node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:13841:13
 ❯ recursivelyTraversePassiveMountEffects node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:13815:11
 ❯ commitPassiveMountOnFiber node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:13957:11
 ❯ recursivelyTraversePassiveMountEffects node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:13815:11
 ❯ commitPassiveMountOnFiber node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:13957:11

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/71]⎯

 FAIL  src/tests/page-breadcrumb.test.tsx > PageBreadcrumb > deve renderizar o breadcrumb na página de detalhes do contrato
TestingLibraryElementError: Unable to find an element with the text: Contrato 123. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
<body>
  <div>
    <div
      class="group/sidebar-wrapper flex min-h-svh w-full"
      data-slot="sidebar-wrapper"
      style="--sidebar-width: 16rem; --sidebar-width-icon: 3rem;"
    >
      <div
        class="flex items-center gap-2"
      >
        <button
          aria-label="Alternar sidebar"
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:hover:bg-accent/50 size-7 cursor-pointer rounded-md border border-transparent p-2 transition-colors duration-200 hover:border-gray-200 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm"
          data-sidebar="trigger"
          data-slot="sidebar-trigger"
          title="Clique para expandir/colapsar a sidebar (Ctrl+B)"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-panel-left"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              height="18"
              rx="2"
              width="18"
              x="3"
              y="3"
            />
            <path
              d="M9 3v18"
            />
          </svg>
          <span
            class="sr-only"
          >
            Toggle Sidebar
          </span>
        </button>
        <nav
          aria-label="breadcrumb"
          data-slot="breadcrumb"
        >
          <ol
            class="flex flex-wrap items-center gap-2 text-sm font-medium break-words text-slate-600 sm:gap-3"
            data-slot="breadcrumb-list"
          >
            <li
              class="inline-flex items-center gap-1.5"
              data-slot="breadcrumb-item"
            >
              <a
                class="text-slate-700 decoration-[#43B9EB] underline-offset-4 transition-colors duration-200 hover:text-[#43B9EB] hover:underline"
                data-slot="breadcrumb-link"
                href="/"
              >
                Início
              </a>
            </li>
            <li
              aria-hidden="true"
              class="text-slate-400 [&>svg]:size-4"
              data-slot="breadcrumb-separator"
              role="presentation"
            >
              <svg
                aria-hidden="true"
                class="lucide lucide-chevron-right"
                fill="none"
                height="24"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="m9 18 6-6-6-6"
                />
              </svg>
            </li>
            <li
              class="inline-flex items-center gap-1.5"
              data-slot="breadcrumb-item"
            >
              <a
                class="text-slate-700 decoration-[#43B9EB] underline-offset-4 transition-colors duration-200 hover:text-[#43B9EB] hover:underline"
                data-slot="breadcrumb-link"
                href="/contratos"
              >
                Contratos
              </a>
            </li>
            <li
              aria-hidden="true"
              class="text-slate-400 [&>svg]:size-4"
              data-slot="breadcrumb-separator"
              role="presentation"
            >
              <svg
                aria-hidden="true"
                class="lucide lucide-chevron-right"
                fill="none"
                height="24"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="m9 18 6-6-6-6"
                />
              </svg>
            </li>
            <li
              class="inline-flex items-center gap-1.5"
              data-slot="breadcrumb-item"
            >
              <span
                aria-current="page"
                aria-disabled="true"
                class="font-semibold text-[#43B9EB]"
                data-slot="breadcrumb-page"
                role="link"
              >
                123
              </span>
            </li>
          </ol>
        </nav>
      </div>
    </div>
  </div>
</body>
 ❯ Object.getElementError node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/config.js:37:19
 ❯ node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:76:38
 ❯ node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:52:17
 ❯ getByText node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:95:19
 ❯ src/tests/page-breadcrumb.test.tsx:43:19
     41|     expect(screen.getByText('Início')).toBeInTheDocument()
     42|     expect(screen.getByText('Contratos')).toBeInTheDocument()
     43|     expect(screen.getByText('Contrato 123')).toBeInTheDocument()
       |                   ^
     44|     expect(screen.getByRole('button')).toBeInTheDocument() // SidebarT…
     45|   })

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/71]⎯

 FAIL  src/tests/page-breadcrumb.test.tsx > PageBreadcrumb > deve renderizar o breadcrumb na página de detalhes do fornecedor
TestingLibraryElementError: Unable to find an element with the text: Fornecedor 456. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
<body>
  <div>
    <div
      class="group/sidebar-wrapper flex min-h-svh w-full"
      data-slot="sidebar-wrapper"
      style="--sidebar-width: 16rem; --sidebar-width-icon: 3rem;"
    >
      <div
        class="flex items-center gap-2"
      >
        <button
          aria-label="Alternar sidebar"
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:hover:bg-accent/50 size-7 cursor-pointer rounded-md border border-transparent p-2 transition-colors duration-200 hover:border-gray-200 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm"
          data-sidebar="trigger"
          data-slot="sidebar-trigger"
          title="Clique para expandir/colapsar a sidebar (Ctrl+B)"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-panel-left"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              height="18"
              rx="2"
              width="18"
              x="3"
              y="3"
            />
            <path
              d="M9 3v18"
            />
          </svg>
          <span
            class="sr-only"
          >
            Toggle Sidebar
          </span>
        </button>
        <nav
          aria-label="breadcrumb"
          data-slot="breadcrumb"
        >
          <ol
            class="flex flex-wrap items-center gap-2 text-sm font-medium break-words text-slate-600 sm:gap-3"
            data-slot="breadcrumb-list"
          >
            <li
              class="inline-flex items-center gap-1.5"
              data-slot="breadcrumb-item"
            >
              <a
                class="text-slate-700 decoration-[#43B9EB] underline-offset-4 transition-colors duration-200 hover:text-[#43B9EB] hover:underline"
                data-slot="breadcrumb-link"
                href="/"
              >
                Início
              </a>
            </li>
            <li
              aria-hidden="true"
              class="text-slate-400 [&>svg]:size-4"
              data-slot="breadcrumb-separator"
              role="presentation"
            >
              <svg
                aria-hidden="true"
                class="lucide lucide-chevron-right"
                fill="none"
                height="24"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="m9 18 6-6-6-6"
                />
              </svg>
            </li>
            <li
              class="inline-flex items-center gap-1.5"
              data-slot="breadcrumb-item"
            >
              <a
                class="text-slate-700 decoration-[#43B9EB] underline-offset-4 transition-colors duration-200 hover:text-[#43B9EB] hover:underline"
                data-slot="breadcrumb-link"
                href="/fornecedores"
              >
                Fornecedores
              </a>
            </li>
            <li
              aria-hidden="true"
              class="text-slate-400 [&>svg]:size-4"
              data-slot="breadcrumb-separator"
              role="presentation"
            >
              <svg
                aria-hidden="true"
                class="lucide lucide-chevron-right"
                fill="none"
                height="24"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="m9 18 6-6-6-6"
                />
              </svg>
            </li>
            <li
              class="inline-flex items-center gap-1.5"
              data-slot="breadcrumb-item"
            >
              <span
                aria-current="page"
                aria-disabled="true"
                class="font-semibold text-[#43B9EB]"
                data-slot="breadcrumb-page"
                role="link"
              >
                456
              </span>
            </li>
          </ol>
        </nav>
      </div>
    </div>
  </div>
</body>
 ❯ Object.getElementError node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/config.js:37:19
 ❯ node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:76:38
 ❯ node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:52:17
 ❯ getByText node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:95:19
 ❯ src/tests/page-breadcrumb.test.tsx:60:19
     58|     expect(screen.getByText('Início')).toBeInTheDocument()
     59|     expect(screen.getByText('Fornecedores')).toBeInTheDocument()
     60|     expect(screen.getByText('Fornecedor 456')).toBeInTheDocument()
       |                   ^
     61|     expect(screen.getByRole('button')).toBeInTheDocument() // SidebarT…
     62|   })

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/71]⎯

 FAIL  src/tests/sidebar-footer.test.tsx > SidebarFooter > deve renderizar com cores da sidebar
Error: expect(element).toHaveClass("bg-sidebar")

Expected the element to have class:
  bg-sidebar
Received:
  text-sidebar-foreground/60 font-mono text-xs
 ❯ src/tests/sidebar-footer.test.tsx:63:23
     61| 
     62|     const container = screen.getByText(`v${VERSAO_APP}`).closest('div')
     63|     expect(container).toHaveClass('bg-sidebar')
       |                       ^
     64|     expect(container).toHaveClass('text-sidebar-foreground')
     65|   })

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/71]⎯

 FAIL  src/lib/__tests__/utils.test.ts > cn > deve lidar com condicionais
AssertionError: expected 'text-red-500 bg-red-500' to be 'bg-red-500' // Object.is equality

Expected: "bg-red-500"
Received: "text-red-500 bg-red-500"

 ❯ src/lib/__tests__/utils.test.ts:16:76
     14| 
     15|   it('deve lidar com condicionais', () => {
     16|     expect(cn('text-red-500', condicional ? 'bg-blue-500' : 'bg-red-50…
       |                                                                            ^
     17|       'bg-red-500',
     18|     )

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/71]⎯

 FAIL  src/modules/contratos/components/__tests__/contrato-form.test.tsx > ContratoForm > deve renderizar todos os campos obrigatórios
TestingLibraryElementError: Found a label with the text of: /número do contrato/i, however the element associated with this label (<div />) is non-labellable [https://html.spec.whatwg.org/multipage/forms.html#category-label]. If you really need to label a <div />, you can use aria-label or aria-labelledby instead.

Ignored nodes: comments, script, style
<body>
  <div>
    <form
      class="space-y-8"
    >
      <div
        class="space-y-6"
      >
        <div
          class="flex items-center space-x-3 border-b border-slate-200 pb-3"
        >
          <div
            class="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-file-text h-4 w-4 text-slate-600"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
              />
              <path
                d="M14 2v4a2 2 0 0 0 2 2h4"
              />
              <path
                d="M10 9H8"
              />
              <path
                d="M16 13H8"
              />
              <path
                d="M16 17H8"
              />
            </svg>
          </div>
          <h3
            class="text-base font-semibold text-gray-900"
          >
            Informações Básicas
          </h3>
        </div>
        <div
          class="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <div
            class="space-y-2"
          >
            <div
              class="grid gap-2"
              data-slot="form-item"
            >
              <label
                class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive mb-2"
                data-error="false"
                data-slot="form-label"
                for="«r0»-form-item"
              >
                Número do Contrato *
              </label>
              <div
                aria-describedby="«r0»-form-item-description"
                aria-invalid="false"
                class="relative"
                data-slot="form-control"
                id="«r0»-form-item"
              >
                <input
                  class="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                  data-slot="input"
                  name="numeroContrato"
                  placeholder="CONT-2024-0001"
                  value=""
                />
              </div>
            </div>
          </div>
          <div
            class="space-y-2"
          >
            <div
              class="grid gap-2"
              data-slot="form-item"
            >
              <label
                class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive mb-2"
                data-error="false"
                data-slot="form-label"
                for="«r1»-form-item"
              >
                Processo SEI / Processo.rio *
              </label>
              <div
                aria-describedby="«r1»-form-item-description"
                aria-invalid="false"
                class="grid grid-cols-2 gap-2"
                data-slot="form-control"
                id="«r1»-form-item"
              >
                <div
                  aria-controls="radix-«r2»"
                  aria-expanded="false"
                  aria-haspopup="dialog"
                  aria-label="Selecionar processo SEI"
                  class="flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 transition-colors hover:bg-gray-50"
                  data-slot="popover-trigger"
                  data-state="closed"
                  role="combobox"
                  tabindex="0"
                  type="button"
                >
                  <span
                    class="text-sm text-gray-900"
                  >
                    Selecione o processo...
                  </span>
                  <svg
                    aria-hidden="true"
                    class="lucide lucide-chevrons-up-down h-4 w-4 shrink-0 opacity-50"
                    fill="none"
                    height="24"
          ...
 ❯ Object.getElementError node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/config.js:37:19
 ❯ getAllByLabelText node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/queries/label-text.js:106:40
 ❯ node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:52:17
 ❯ getByLabelText node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:95:19
 ❯ src/modules/contratos/components/__tests__/contrato-form.test.tsx:28:19
     26|     render(<ContratoForm {...defaultProps} />)
     27| 
     28|     expect(screen.getByLabelText(/número do contrato/i)).toBeInTheDocu…
       |                   ^
     29|     expect(screen.getByLabelText(/processo sei/i)).toBeInTheDocument()
     30|     expect(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/71]⎯

 FAIL  src/modules/contratos/components/__tests__/contrato-form.test.tsx > ContratoForm > deve calcular vigência final automaticamente quando data inicial e prazo são preenchidos
TestingLibraryElementError: Found a label with the text of: /vigência inicial/i, however the element associated with this label (<div />) is non-labellable [https://html.spec.whatwg.org/multipage/forms.html#category-label]. If you really need to label a <div />, you can use aria-label or aria-labelledby instead.

Ignored nodes: comments, script, style
<body>
  <div>
    <form
      class="space-y-8"
    >
      <div
        class="space-y-6"
      >
        <div
          class="flex items-center space-x-3 border-b border-slate-200 pb-3"
        >
          <div
            class="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-file-text h-4 w-4 text-slate-600"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
              />
              <path
                d="M14 2v4a2 2 0 0 0 2 2h4"
              />
              <path
                d="M10 9H8"
              />
              <path
                d="M16 13H8"
              />
              <path
                d="M16 17H8"
              />
            </svg>
          </div>
          <h3
            class="text-base font-semibold text-gray-900"
          >
            Informações Básicas
          </h3>
        </div>
        <div
          class="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <div
            class="space-y-2"
          >
            <div
              class="grid gap-2"
              data-slot="form-item"
            >
              <label
                class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive mb-2"
                data-error="false"
                data-slot="form-label"
                for="«r30»-form-item"
              >
                Número do Contrato *
              </label>
              <div
                aria-describedby="«r30»-form-item-description"
                aria-invalid="false"
                class="relative"
                data-slot="form-control"
                id="«r30»-form-item"
              >
                <input
                  class="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                  data-slot="input"
                  name="numeroContrato"
                  placeholder="CONT-2024-0001"
                  value=""
                />
              </div>
            </div>
          </div>
          <div
            class="space-y-2"
          >
            <div
              class="grid gap-2"
              data-slot="form-item"
            >
              <label
                class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive mb-2"
                data-error="false"
                data-slot="form-label"
                for="«r31»-form-item"
              >
                Processo SEI / Processo.rio *
              </label>
              <div
                aria-describedby="«r31»-form-item-description"
                aria-invalid="false"
                class="grid grid-cols-2 gap-2"
                data-slot="form-control"
                id="«r31»-form-item"
              >
                <div
                  aria-controls="radix-«r32»"
                  aria-expanded="false"
                  aria-haspopup="dialog"
                  aria-label="Selecionar processo SEI"
                  class="flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 transition-colors hover:bg-gray-50"
                  data-slot="popover-trigger"
                  data-state="closed"
                  role="combobox"
                  tabindex="0"
                  type="button"
                >
                  <span
                    class="text-sm text-gray-900"
                  >
                    Selecione o processo...
                  </span>
                  <svg
                    aria-hidden="true"
                    class="lucide lucide-chevrons-up-down h-4 w-4 shrink-0 opacity-50"
                    fill="none"
                    height="24"
   ...
 ❯ Object.getElementError node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/config.js:37:19
 ❯ getAllByLabelText node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/queries/label-text.js:106:40
 ❯ node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:52:17
 ❯ getByLabelText node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:95:19
 ❯ src/modules/contratos/components/__tests__/contrato-form.test.tsx:63:41
     61|     render(<ContratoForm {...defaultProps} />)
     62| 
     63|     const vigenciaInicialInput = screen.getByLabelText(/vigência inici…
       |                                         ^
     64|     const prazoInput = screen.getByLabelText(/prazo inicial/i)
     65|     const vigenciaFinalInput = screen.getByLabelText(/vigência final/i)

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/71]⎯

 FAIL  src/modules/contratos/components/__tests__/contrato-form.test.tsx > ContratoForm > deve chamar onAdvanceRequest quando formulário é válido e função está disponível
TestingLibraryElementError: Found a label with the text of: /número do contrato/i, however the element associated with this label (<div />) is non-labellable [https://html.spec.whatwg.org/multipage/forms.html#category-label]. If you really need to label a <div />, you can use aria-label or aria-labelledby instead.

Ignored nodes: comments, script, style
<body>
  <div>
    <form
      class="space-y-8"
    >
      <div
        class="space-y-6"
      >
        <div
          class="flex items-center space-x-3 border-b border-slate-200 pb-3"
        >
          <div
            class="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-file-text h-4 w-4 text-slate-600"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
              />
              <path
                d="M14 2v4a2 2 0 0 0 2 2h4"
              />
              <path
                d="M10 9H8"
              />
              <path
                d="M16 13H8"
              />
              <path
                d="M16 17H8"
              />
            </svg>
          </div>
          <h3
            class="text-base font-semibold text-gray-900"
          >
            Informações Básicas
          </h3>
        </div>
        <div
          class="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <div
            class="space-y-2"
          >
            <div
              class="grid gap-2"
              data-slot="form-item"
            >
              <label
                class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive mb-2"
                data-error="false"
                data-slot="form-label"
                for="«r60»-form-item"
              >
                Número do Contrato *
              </label>
              <div
                aria-describedby="«r60»-form-item-description"
                aria-invalid="false"
                class="relative"
                data-slot="form-control"
                id="«r60»-form-item"
              >
                <input
                  class="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                  data-slot="input"
                  name="numeroContrato"
                  placeholder="CONT-2024-0001"
                  value=""
                />
              </div>
            </div>
          </div>
          <div
            class="space-y-2"
          >
            <div
              class="grid gap-2"
              data-slot="form-item"
            >
              <label
                class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive mb-2"
                data-error="false"
                data-slot="form-label"
                for="«r61»-form-item"
              >
                Processo SEI / Processo.rio *
              </label>
              <div
                aria-describedby="«r61»-form-item-description"
                aria-invalid="false"
                class="grid grid-cols-2 gap-2"
                data-slot="form-control"
                id="«r61»-form-item"
              >
                <div
                  aria-controls="radix-«r62»"
                  aria-expanded="false"
                  aria-haspopup="dialog"
                  aria-label="Selecionar processo SEI"
                  class="flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 transition-colors hover:bg-gray-50"
                  data-slot="popover-trigger"
                  data-state="closed"
                  role="combobox"
                  tabindex="0"
                  type="button"
                >
                  <span
                    class="text-sm text-gray-900"
                  >
                    Selecione o processo...
                  </span>
                  <svg
                    aria-hidden="true"
                    class="lucide lucide-chevrons-up-down h-4 w-4 shrink-0 opacity-50"
                    fill="none"
                    height="24"
   ...
 ❯ Object.getElementError node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/config.js:37:19
 ❯ getAllByLabelText node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/queries/label-text.js:106:40
 ❯ node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:52:17
 ❯ getByLabelText node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:95:19
 ❯ src/modules/contratos/components/__tests__/contrato-form.test.tsx:128:14
    126|     // Preenche todos os campos obrigatórios
    127|     await user.type(
    128|       screen.getByLabelText(/número do contrato/i),
       |              ^
    129|       'CONT-2024-001',
    130|     )

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/71]⎯

 FAIL  src/modules/contratos/components/__tests__/contrato-form.test.tsx > ContratoForm > deve permitir upload de arquivo PDF
TestingLibraryElementError: Found a label with the text of: /termo de referência/i, however the element associated with this label (<div />) is non-labellable [https://html.spec.whatwg.org/multipage/forms.html#category-label]. If you really need to label a <div />, you can use aria-label or aria-labelledby instead.

Ignored nodes: comments, script, style
<body>
  <div>
    <form
      class="space-y-8"
    >
      <div
        class="space-y-6"
      >
        <div
          class="flex items-center space-x-3 border-b border-slate-200 pb-3"
        >
          <div
            class="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-file-text h-4 w-4 text-slate-600"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
              />
              <path
                d="M14 2v4a2 2 0 0 0 2 2h4"
              />
              <path
                d="M10 9H8"
              />
              <path
                d="M16 13H8"
              />
              <path
                d="M16 17H8"
              />
            </svg>
          </div>
          <h3
            class="text-base font-semibold text-gray-900"
          >
            Informações Básicas
          </h3>
        </div>
        <div
          class="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <div
            class="space-y-2"
          >
            <div
              class="grid gap-2"
              data-slot="form-item"
            >
              <label
                class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive mb-2"
                data-error="false"
                data-slot="form-label"
                for="«r7g»-form-item"
              >
                Número do Contrato *
              </label>
              <div
                aria-describedby="«r7g»-form-item-description"
                aria-invalid="false"
                class="relative"
                data-slot="form-control"
                id="«r7g»-form-item"
              >
                <input
                  class="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                  data-slot="input"
                  name="numeroContrato"
                  placeholder="CONT-2024-0001"
                  value=""
                />
              </div>
            </div>
          </div>
          <div
            class="space-y-2"
          >
            <div
              class="grid gap-2"
              data-slot="form-item"
            >
              <label
                class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive mb-2"
                data-error="false"
                data-slot="form-label"
                for="«r7h»-form-item"
              >
                Processo SEI / Processo.rio *
              </label>
              <div
                aria-describedby="«r7h»-form-item-description"
                aria-invalid="false"
                class="grid grid-cols-2 gap-2"
                data-slot="form-control"
                id="«r7h»-form-item"
              >
                <div
                  aria-controls="radix-«r7i»"
                  aria-expanded="false"
                  aria-haspopup="dialog"
                  aria-label="Selecionar processo SEI"
                  class="flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 transition-colors hover:bg-gray-50"
                  data-slot="popover-trigger"
                  data-state="closed"
                  role="combobox"
                  tabindex="0"
                  type="button"
                >
                  <span
                    class="text-sm text-gray-900"
                  >
                    Selecione o processo...
                  </span>
                  <svg
                    aria-hidden="true"
                    class="lucide lucide-chevrons-up-down h-4 w-4 shrink-0 opacity-50"
                    fill="none"
                    height="24"
   ...
 ❯ Object.getElementError node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/config.js:37:19
 ❯ getAllByLabelText node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/queries/label-text.js:106:40
 ❯ node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:52:17
 ❯ getByLabelText node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:95:19
 ❯ src/modules/contratos/components/__tests__/contrato-form.test.tsx:190:30
    188|     render(<ContratoForm {...defaultProps} />)
    189| 
    190|     const fileInput = screen.getByLabelText(/termo de referência/i)
       |                              ^
    191|     const file = new File(['teste'], 'termo-referencia.pdf', {
    192|       type: 'application/pdf',

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/71]⎯

 FAIL  src/modules/contratos/components/__tests__/contrato-form.test.tsx > ContratoForm > deve preencher formulário com dados iniciais quando fornecidos
TestingLibraryElementError: Unable to find an element with the display value: 98765432109876543210.

Ignored nodes: comments, script, style
<body>
  <div>
    <form
      class="space-y-8"
    >
      <div
        class="space-y-6"
      >
        <div
          class="flex items-center space-x-3 border-b border-slate-200 pb-3"
        >
          <div
            class="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-file-text h-4 w-4 text-slate-600"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
              />
              <path
                d="M14 2v4a2 2 0 0 0 2 2h4"
              />
              <path
                d="M10 9H8"
              />
              <path
                d="M16 13H8"
              />
              <path
                d="M16 17H8"
              />
            </svg>
          </div>
          <h3
            class="text-base font-semibold text-gray-900"
          >
            Informações Básicas
          </h3>
        </div>
        <div
          class="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <div
            class="space-y-2"
          >
            <div
              class="grid gap-2"
              data-slot="form-item"
            >
              <label
                class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive mb-2"
                data-error="false"
                data-slot="form-label"
                for="«rc0»-form-item"
              >
                Número do Contrato *
              </label>
              <div
                aria-describedby="«rc0»-form-item-description"
                aria-invalid="false"
                class="relative"
                data-slot="form-control"
                id="«rc0»-form-item"
              >
                <input
                  class="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border-red-500 bg-red-50 pr-10"
                  data-slot="input"
                  name="numeroContrato"
                  placeholder="CONT-2024-0001"
                  value="CONT-2024-002"
                />
                <div
                  class="absolute top-1/2 right-3 -translate-y-1/2"
                >
                  <svg
                    aria-hidden="true"
                    class="lucide lucide-x h-4 w-4 text-red-500"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 6 6 18"
                    />
                    <path
                      d="m6 6 12 12"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div
            class="space-y-2"
          >
            <div
              class="grid gap-2"
              data-slot="form-item"
            >
              <label
                class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive mb-2"
                data-error="false"
                data-slot="form-label"
                for="«rc1»-form-item"
              >
                Processo SEI / Processo.rio *
              </label>
              <div
                aria-describedby="«rc1»-form-item-description"
                aria-invalid="false"
                class="grid grid-cols-2 gap-2"
                data-slot="form-control"
                id="«rc1»-form-item"
              >
                <div
                  aria-controls="radix-«rc2»"..
 ❯ Object.getElementError node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/config.js:37:19
 ❯ node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:76:38
 ❯ node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:52:17
 ❯ getByDisplayValue node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:95:19
 ❯ src/modules/contratos/components/__tests__/contrato-form.test.tsx:234:19
    232| 
    233|     expect(screen.getByDisplayValue('CONT-2024-002')).toBeInTheDocumen…
    234|     expect(screen.getByDisplayValue('98765432109876543210')).toBeInThe…
       |                   ^
    235|     expect(
    236|       screen.getByDisplayValue('Prestação de serviços'),

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/71]⎯

 FAIL  src/modules/contratos/components/__tests__/contrato-form.test.tsx > ContratoForm > deve validar prazo inicial entre 1 e 60 meses
Error: expect(element).toHaveValue(12)

Expected the element to have value:
  12
Received:
  1212
 ❯ src/modules/contratos/components/__tests__/contrato-form.test.tsx:256:24
    254|     await user.clear(prazoInput)
    255|     await user.type(prazoInput, '12')
    256|     expect(prazoInput).toHaveValue(12)
       |                        ^
    257| 
    258|     // Verifica se aceita valores no limite

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[12/71]⎯

 FAIL  src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Renderização > deve renderizar todos os campos obrigatórios
 FAIL  src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Renderização > deve renderizar botão de próximo
 FAIL  src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Renderização > deve renderizar botão de preenchimento rápido
 FAIL  src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Renderização > deve renderizar botão de cancelar quando onCancel é fornecido
 FAIL  src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Renderização > deve preencher campos com dados iniciais
 FAIL  src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Preenchimento Rápido > deve preencher todos os campos ao clicar no botão de preenchimento rápido
 FAIL  src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Preenchimento Rápido > deve preencher contatos de teste
 FAIL  src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Validação > deve mostrar erro para campos obrigatórios vazios
 FAIL  src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Validação > deve validar campo CNPJ vazio
 FAIL  src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Gerenciamento de Contatos > deve adicionar novo contato
 FAIL  src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Gerenciamento de Contatos > deve remover contato existente
 FAIL  src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Submissão do Formulário > deve chamar onSubmit com dados corretos quando não há onAdvanceRequest
 FAIL  src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Submissão do Formulário > deve chamar onAdvanceRequest quando fornecido
 FAIL  src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Submissão do Formulário > deve chamar onCancel ao clicar no botão cancelar
 FAIL  src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Acessibilidade > deve ter labels apropriados para todos os campos
 FAIL  src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Acessibilidade > deve ter botões com textos descritivos
 FAIL  src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Estados do Formulário > deve marcar checkbox de ativo como verdadeiro por padrão
 FAIL  src/modules/contratos/components/__tests__/fornecedor-form.test.tsx > FornecedorForm > Estados do Formulário > deve permitir alterar estado ativo
Error: [vitest] No "Building2" export is defined on the "lucide-react" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

vi.mock(import("lucide-react"), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    // your mocked methods
  }
})

 ❯ FornecedorForm src/modules/Contratos/components/CadastroDeContratos/fornecedor-form.tsx:499:16
    497|           <div className="flex items-center space-x-3 border-b border-…
    498|             <div className="flex h-7 w-7 items-center justify-center r…
    499|               <Building2
       |                ^
    500|                 className="h-4 w-4 text-slate-600"
    501|                 aria-hidden="true"
 ❯ Object.react_stack_bottom_frame node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:23863:20
 ❯ renderWithHooks node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:5529:22
 ❯ updateFunctionComponent node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:8897:19
 ❯ beginWork node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:10522:18
 ❯ runWithFiberInDEV node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:1522:13
 ❯ performUnitOfWork node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:15140:22
 ❯ workLoopSync node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:14956:41

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[13/71]⎯

 FAIL  src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve renderizar o componente com título
 FAIL  src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve exibir todas as opções de status
 FAIL  src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve exibir todas as unidades disponíveis
 FAIL  src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve exibir campos de data para período de vigência
 FAIL  src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve exibir campos de valor mínimo e máximo
 FAIL  src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve permitir seleção de múltiplos status
 FAIL  src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve permitir desmarcar status selecionados
 FAIL  src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve permitir seleção de múltiplas unidades
 FAIL  src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve permitir entrada de valores monetários
 FAIL  src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve permitir entrada de datas
 FAIL  src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve exibir indicador de filtros ativos quando há filtros
 FAIL  src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve permitir expansão e contração do painel de filtros
 FAIL  src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve exibir ícone de filtro
 FAIL  src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve exibir ícone de chevron para expansão
 FAIL  src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve aplicar classes CSS corretas para responsividade
 FAIL  src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve exibir checkboxes com labels corretos
 FAIL  src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve permitir entrada de valores decimais nos campos monetários
 FAIL  src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve permitir entrada de datas em formato ISO
 FAIL  src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve renderizar corretamente quando não há filtros ativos
 FAIL  src/modules/Contratos/components/ListaContratos/__tests__/filtros-contratos.test.tsx > FiltrosContratos > deve aplicar classes CSS corretas para o indicador de filtros ativos
TypeError: Cannot read properties of undefined (reading 'map')
 ❯ FiltrosContratos src/modules/Contratos/components/ListaContratos/filtros-contratos.tsx:250:43
    248|               <Label className="text-sm font-medium">Unidades</Label>
    249|               <div className="grid max-h-40 grid-cols-1 gap-3 overflow…
    250|                 {unidadesMock.demandantes.map((unidade) => (
       |                                           ^
    251|                   <div key={unidade} className="flex items-center spac…
    252|                     <Checkbox
 ❯ Object.react_stack_bottom_frame node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:23863:20
 ❯ renderWithHooks node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:5529:22
 ❯ updateFunctionComponent node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:8897:19
 ❯ beginWork node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:10522:18
 ❯ runWithFiberInDEV node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:1522:13
 ❯ performUnitOfWork node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:15140:22
 ❯ workLoopSync node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:14956:41
 ❯ renderRootSync node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:14936:11
 ❯ performWorkOnRoot node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:14462:44

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[14/71]⎯

 FAIL  src/modules/Contratos/components/ListaContratos/__tests__/pesquisa-e-filtros.test.tsx > SearchAndFilters > deve exibir filtros móveis em telas pequenas
TypeError: Cannot read properties of undefined (reading 'map')
 ❯ FilterContent src/modules/Contratos/components/ListaContratos/pesquisa-e-filtros.tsx:385:39
    383|         <CollapsibleContent className="mt-2 ml-6 space-y-2">
    384|           <div className="max-h-32 space-y-2 overflow-y-auto">
    385|             {unidadesMock.demandantes.map((unidade) => (
       |                                       ^
    386|               <div key={unidade} className="flex items-center space-x-…
    387|                 <Checkbox
 ❯ Object.react_stack_bottom_frame node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:23863:20
 ❯ renderWithHooks node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:5529:22
 ❯ updateFunctionComponent node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:8897:19
 ❯ beginWork node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:10522:18
 ❯ runWithFiberInDEV node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:1522:13
 ❯ performUnitOfWork node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:15140:22
 ❯ workLoopSync node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:14956:41
 ❯ renderRootSync node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:14936:11
 ❯ performWorkOnRoot node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:14462:44

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[15/71]⎯

 FAIL  src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve renderizar o componente com todas as seções
 FAIL  src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve exibir valor total formatado corretamente
 FAIL  src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve exibir valor executado calculado corretamente
 FAIL  src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve exibir saldo atual formatado corretamente
 FAIL  src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve calcular e exibir percentual de execução correto
 FAIL  src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve exibir barra de progresso com valor correto
 FAIL  src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve exibir cronograma de vigência com todas as fases
 FAIL  src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve exibir status correto para cada fase do cronograma
 FAIL  src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve aplicar cores corretas para cada status do cronograma
 FAIL  src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve exibir todas as unidades vinculadas
 FAIL  src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve exibir percentuais das unidades vinculadas
 FAIL  src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve exibir valores mensais das unidades
 FAIL  src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve exibir resumo financeiro das unidades
 FAIL  src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve aplicar classes CSS corretas para responsividade
 FAIL  src/modules/Contratos/components/VisualizacaoContratos/__tests__/indicadores-relatorios.test.tsx > IndicadoresRelatorios > deve exibir ícones corretos para cada seção
Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `IndicadoresRelatorios`.
 ❯ createFiberFromTypeAndProps node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:4259:28
 ❯ createFiberFromElement node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:4273:14
 ❯ createChild node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:7297:26
 ❯ reconcileChildrenArray node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:7629:25
 ❯ reconcileChildFibersImpl node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:7952:30
 ❯ node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:8057:33
 ❯ reconcileChildren node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:8621:13
 ❯ beginWork node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:10793:13
 ❯ runWithFiberInDEV node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:1522:13
 ❯ performUnitOfWork node_modules/.pnpm/react-dom@19.1.1_react@19.1.1/node_modules/react-dom/cjs/react-dom-client.development.js:15140:22

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[16/71]⎯


 Test Files  10 failed | 4 passed (14)
      Tests  71 failed | 93 passed (164)
   Start at  17:17:48
   Duration  9.96s (transform 1.23s, setup 1.33s, collect 7.10s, tests 6.98s, environment 8.19s, prepare 1.47s)

 ELIFECYCLE  Test failed. See above for more details.
Error: Process completed with exit code 1.