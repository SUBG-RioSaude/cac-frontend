# 🎨 PLANO DE REDESIGN DO DASHBOARD - MODERNO E INTERATIVO

## 📋 VISÃO GERAL

Redesign completo do dashboard com:
- Carousel de seções completas (métricas → gráficos → riscos → atividades)
- 4 Abas principais: Dashboard, Analytics, Riscos, Atividades
- Nova paleta de cores temáticas: #2a688f, #42b9eb, oklch neutros
- Componentes shadcn/ui (Carousel, Tabs, Charts)
- Destaque: KPIs executivos, tendências, alertas, distribuições

---

## 🎯 ESTRUTURA PROPOSTA

### ABA 1: DASHBOARD (Visão Executiva)

```
┌─ CAROUSEL PRINCIPAL (com indicadores + setas) ──────┐
│ SLIDE 1: Métricas Executivas (4 cards grandes)      │
│ SLIDE 2: Gráfico de Tendência (últimos 6 meses)     │
│ SLIDE 3: Alertas Críticos (riscos + vencimentos)    │
│ SLIDE 4: Top 5 Contratos (maiores valores)          │
└──────────────────────────────────────────────────────┘
```

### ABA 2: ANALYTICS (Análises Detalhadas)

```
┌─ SUB-TABS ───────────────────────────────────────────┐
│ [Status] [Tipo] [Valor] [Fornecedor] [Temporal]     │
├──────────────────────────────────────────────────────┤
│  Gráficos interativos com drill-down                 │
│  - Pizza/Donut para distribuições                    │
│  - Barras para comparações                           │
│  - Linhas para tendências                            │
│  - Export para CSV/PDF                               │
└──────────────────────────────────────────────────────┘
```

### ABA 3: RISCOS (Gestão de Riscos)

```
┌─ CARDS DE RISCO ─────────────────────────────────────┐
│ [Alto Risco: 12] [Médio Risco: 34] [Baixo: 846]     │
├──────────────────────────────────────────────────────┤
│  Timeline de Vencimentos (próximos 90 dias)         │
│  Lista de Ações Prioritárias                         │
│  Documentação Pendente                               │
└──────────────────────────────────────────────────────┘
```

### ABA 4: ATIVIDADES (Histórico)

```
┌─ LINHA DO TEMPO ─────────────────────────────────────┐
│  Últimos eventos ordenados por data                  │
│  - Novos contratos cadastrados                       │
│  - Contratos aprovados/atualizados                   │
│  - Contratos cancelados                              │
│  - Infinite scroll / paginação                       │
└──────────────────────────────────────────────────────┘
```

---

## 🎨 SISTEMA DE CORES TEMÁTICAS

### Paleta Principal

```css
/* Cores Primárias do Cliente */
--theme-primary: #2a688f;        /* Azul escuro profissional */
--theme-secondary: #42b9eb;      /* Azul claro vibrante */
--theme-neutral-dark: oklch(0.404 0.017 264.376);
--theme-neutral-light: oklch(0.709 0.142 213.68);

/* Aplicação em Gráficos */
--chart-1: #2a688f;              /* Azul escuro */
--chart-2: #42b9eb;              /* Azul claro */
--chart-3: #5ac8fa;              /* Azul médio */
--chart-4: #1c4f6a;              /* Azul navy */
--chart-5: #7dd3fc;              /* Azul sky */

/* Aplicação em UI */
--accent-primary: #42b9eb;       /* Botões, badges */
--accent-hover: #2a688f;         /* Hover states */
--gradient-start: #2a688f;       /* Gradientes */
--gradient-end: #42b9eb;
```

---

## 🔧 COMPONENTES A CRIAR/REFATORAR

### 1. DashboardCarousel (NOVO)

**Arquivo:** `src/modules/Dashboard/components/dashboard-carousel.tsx`

```tsx
// Carousel de seções completas com auto-play
<Carousel opts={{ align: "start", loop: true }}>
  <CarouselContent>
    <CarouselItem><MetricsSection /></CarouselItem>
    <CarouselItem><TrendSection /></CarouselItem>
    <CarouselItem><AlertsSection /></CarouselItem>
    <CarouselItem><TopContractsSection /></CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
  <CarouselIndicators /> {/* Bolinhas embaixo */}
</Carousel>
```

### 2. MetricsSection (REFACTOR)

**Arquivo:** `src/modules/Dashboard/components/Cards/metrics-section.tsx`

```tsx
// Grid 2x2 com cards grandes e animados
<div className="grid grid-cols-2 gap-6">
  <MetricCard
    icon={FileText}
    value="1,284"
    label="Total de Contratos"
    trend={+12.4}
    color="theme-primary"
    sparkline={miniData}
  />
  {/* + 3 cards */}
</div>
```

### 3. TrendSection (NOVO)

**Arquivo:** `src/modules/Dashboard/components/Charts/trend-section.tsx`

```tsx
// Gráfico de área/linha grande com últimos 6 meses
<Card>
  <CardHeader>
    <CardTitle>Evolução dos Contratos</CardTitle>
    <CardDescription>Últimos 6 meses</CardDescription>
  </CardHeader>
  <CardContent>
    <ChartContainer config={chartConfig}>
      <AreaChart data={statusTrend}>
        {/* Área com gradiente #2a688f → #42b9eb */}
      </AreaChart>
    </ChartContainer>
  </CardContent>
</Card>
```

### 4. AlertsSection (NOVO)

**Arquivo:** `src/modules/Dashboard/components/Lists/alerts-section.tsx`

```tsx
// Cards de alerta com ícones e cores temáticas
<div className="grid gap-4">
  <AlertCard severity="high" count={12} />
  <AlertCard severity="medium" count={34} />
  <AlertCard severity="low" count={846} />
</div>
```

### 5. TopContractsSection (NOVO)

**Arquivo:** `src/modules/Dashboard/components/Lists/top-contracts-section.tsx`

```tsx
// Lista dos 5 maiores contratos com mini-gráfico
<Card>
  <CardHeader>
    <CardTitle>Maiores Contratos</CardTitle>
  </CardHeader>
  <CardContent>
    {topContracts.map(contract => (
      <ContractRow
        contract={contract}
        showSparkline
        showValue
      />
    ))}
  </CardContent>
</Card>
```

### 6. AnalyticsTab (REFACTOR)

**Arquivo:** `src/modules/Dashboard/components/analytics-tab.tsx`

```tsx
// Sub-tabs com gráficos interativos
<Tabs defaultValue="status">
  <TabsList>
    <TabsTrigger value="status">Status</TabsTrigger>
    <TabsTrigger value="tipo">Tipo</TabsTrigger>
    <TabsTrigger value="valor">Valor</TabsTrigger>
    <TabsTrigger value="fornecedor">Fornecedor</TabsTrigger>
    <TabsTrigger value="temporal">Temporal</TabsTrigger>
  </TabsList>
  <TabsContent value="status">
    <StatusDistributionChart />
  </TabsContent>
  {/* Outros tabs... */}
</Tabs>
```

### 7. RiskTimelineCard (NOVO)

**Arquivo:** `src/modules/Dashboard/components/risk-timeline-card.tsx`

```tsx
// Timeline visual de vencimentos
<Card>
  <CardHeader>
    <CardTitle>Timeline de Vencimentos</CardTitle>
    <CardDescription>Próximos 90 dias</CardDescription>
  </CardHeader>
  <CardContent>
    <ScrollArea className="h-[400px]">
      {vencimentos.map(item => (
        <TimelineItem
          date={item.date}
          contract={item.contract}
          daysRemaining={item.days}
          severity={item.severity}
        />
      ))}
    </ScrollArea>
  </CardContent>
</Card>
```

### 8. SparklineChart (NOVO)

**Arquivo:** `src/modules/Dashboard/components/Charts/sparkline-chart.tsx`

```tsx
// Mini-gráfico para cards de métrica
<ChartContainer config={sparklineConfig} className="h-[60px]">
  <LineChart data={data}>
    <Line
      type="monotone"
      dataKey="value"
      stroke="var(--theme-secondary)"
      strokeWidth={2}
      dot={false}
    />
  </LineChart>
</ChartContainer>
```

### 9. ExportButton (NOVO)

**Arquivo:** `src/modules/Dashboard/components/export-button.tsx`

```tsx
// Botão de export com dropdown
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">
      <Download className="mr-2" />
      Exportar
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={exportCSV}>CSV</DropdownMenuItem>
    <DropdownMenuItem onClick={exportPDF}>PDF</DropdownMenuItem>
    <DropdownMenuItem onClick={exportExcel}>Excel</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### 10. CarouselIndicators (NOVO)

**Arquivo:** `src/modules/Dashboard/components/carousel-indicators.tsx`

```tsx
// Bolinhas indicadoras embaixo do carousel
<div className="flex justify-center gap-2 mt-4">
  {slides.map((_, index) => (
    <button
      className={cn(
        "h-2 w-2 rounded-full transition-all",
        current === index
          ? "bg-theme-secondary w-8"
          : "bg-muted"
      )}
      onClick={() => goToSlide(index)}
    />
  ))}
</div>
```

---

## 📂 ESTRUTURA DE ARQUIVOS (NOVA ORGANIZAÇÃO)

```
Dashboard/
├── pages/
│   └── dashboard-page.tsx              # Página principal com 4 abas
│
├── components/
│   ├── dashboard-carousel.tsx          # ⭐ NOVO - Carousel principal
│   ├── carousel-indicators.tsx         # ⭐ NOVO - Indicadores
│   │
│   ├── Cards/
│   │   ├── metrics-section.tsx         # 🔄 REFACTOR - Grid 2x2 animado
│   │   ├── metric-card.tsx             # 🔄 REFACTOR - Com sparkline
│   │   ├── alert-card.tsx              # ⭐ NOVO - Card de alerta
│   │   └── contract-row.tsx            # ⭐ NOVO - Linha de contrato
│   │
│   ├── Charts/
│   │   ├── trend-section.tsx           # ⭐ NOVO - Gráfico grande
│   │   ├── sparkline-chart.tsx         # ⭐ NOVO - Mini-gráfico
│   │   ├── status-distribution-chart.tsx # 🔄 REFACTOR - Cores temáticas
│   │   ├── type-distribution-chart.tsx   # 🔄 REFACTOR - Cores temáticas
│   │   └── value-chart.tsx             # ⭐ NOVO - Análise de valor
│   │
│   ├── Tabs/
│   │   ├── dashboard-tab.tsx           # ⭐ NOVO - Aba principal
│   │   ├── analytics-tab.tsx           # 🔄 REFACTOR - Sub-tabs
│   │   ├── risks-tab.tsx               # 🔄 REFACTOR - Timeline
│   │   └── activities-tab.tsx          # ⭐ NOVO - Histórico
│   │
│   ├── Lists/
│   │   ├── alerts-section.tsx          # ⭐ NOVO - Grid de alertas
│   │   ├── top-contracts-section.tsx   # ⭐ NOVO - Top 5
│   │   ├── risk-timeline-card.tsx      # ⭐ NOVO - Timeline vencimentos
│   │   └── activities-timeline.tsx     # 🔄 REFACTOR - Infinite scroll
│   │
│   └── UI/
│       ├── export-button.tsx           # ⭐ NOVO - Export dropdown
│       ├── empty-state.tsx             # ⭐ NOVO - Estado vazio
│       └── error-boundary.tsx          # ⭐ NOVO - Error visual
│
├── hooks/
│   ├── useDashboardData.ts            # 🔄 REFACTOR - Otimizar
│   ├── useTopContracts.ts             # ⭐ NOVO - Top contratos
│   └── useRiskTimeline.ts             # ⭐ NOVO - Timeline riscos
│
├── services/
│   └── dashboard-service.ts           # ✅ MANTER - Já completo
│
├── types/
│   └── dashboard.ts                   # 🔄 ADICIONAR - Novos tipos
│
└── utils/
    ├── dashboard-utils.ts             # ✅ MANTER
    ├── export-utils.ts                # ⭐ NOVO - Export CSV/PDF
    └── chart-colors.ts                # ⭐ NOVO - Config de cores
```

---

## 🎯 ORDEM DE IMPLEMENTAÇÃO

### FASE 1: Fundação (2-3 horas)

1. ✅ Criar chart-colors.ts com nova paleta temática
2. ✅ Criar dashboard-carousel.tsx base
3. ✅ Criar carousel-indicators.tsx
4. ✅ Refatorar dashboard-page.tsx com 4 abas principais

### FASE 2: Aba Dashboard (3-4 horas)

5. ✅ Refatorar metrics-section.tsx (grid 2x2 animado)
6. ✅ Criar sparkline-chart.tsx
7. ✅ Refatorar metric-card.tsx (adicionar sparkline)
8. ✅ Criar trend-section.tsx (gráfico grande)
9. ✅ Criar alerts-section.tsx (grid de alertas)
10. ✅ Criar top-contracts-section.tsx
11. ✅ Integrar tudo no carousel

### FASE 3: Aba Analytics (2-3 horas)

12. ✅ Criar analytics-tab.tsx com sub-tabs
13. ✅ Refatorar gráficos existentes com cores temáticas
14. ✅ Criar value-chart.tsx (novo gráfico)
15. ✅ Adicionar interatividade (click to filter)
16. ✅ Criar export-button.tsx

### FASE 4: Aba Riscos (2 horas)

17. ✅ Criar risk-timeline-card.tsx
18. ✅ Refatorar risks-tab.tsx
19. ✅ Adicionar ordenação por severidade
20. ✅ Criar links para ações

### FASE 5: Aba Atividades (1-2 horas)

21. ✅ Criar activities-tab.tsx
22. ✅ Criar activities-timeline.tsx
23. ✅ Adicionar infinite scroll ou paginação

### FASE 6: Polimento (2 horas)

24. ✅ Criar empty-state.tsx e error-boundary.tsx
25. ✅ Adicionar animações (Framer Motion)
26. ✅ Criar export-utils.ts (CSV/PDF)
27. ✅ Testes de responsividade
28. ✅ Acessibilidade (ARIA, keyboard nav)

**TOTAL ESTIMADO: 12-16 horas (~2 dias)**

---

## 🚀 MELHORIAS TÉCNICAS

### Performance

- ✅ Lazy loading de gráficos por aba
- ✅ Skeleton loading por seção
- ✅ Memoização de componentes pesados
- ✅ Virtualization em listas longas (react-window)

### UX/UI

- ✅ Animações suaves (Framer Motion)
- ✅ Hover effects nos cards
- ✅ Tooltips informativos
- ✅ Estados vazios com ilustrações
- ✅ Error boundaries visuais

### Acessibilidade

- ✅ Keyboard navigation completa
- ✅ ARIA labels em todos os componentes
- ✅ Focus states visíveis
- ✅ Screen reader friendly

### Responsividade

- ✅ Mobile-first design
- ✅ Carousel touch-friendly
- ✅ Tabs colapsáveis em mobile
- ✅ Gráficos adaptáveis

---

## 📝 NOTAS IMPORTANTES

1. **Filtros Globais:** Manter o componente AdvancedFilters existente no topo
2. **Dados Reais:** Todos os gráficos usarão endpoints existentes (já funcionais)
3. **Cores Consistentes:** Aplicar paleta temática em TODOS os gráficos
4. **Carousel Auto-play:** Opcional, com pausa no hover
5. **Export:** Implementar apenas se houver tempo
6. **Atividades:** Se não houver endpoint real, usar dados mockados
7. **Dark Mode:** Adaptar cores temáticas para modo escuro
8. **Testes:** Adicionar testes apenas para componentes críticos

---

## ✨ RESULTADO ESPERADO

Um dashboard moderno, profissional e altamente visual que:

- ✅ Reduz scroll com carousel e abas
- ✅ Destaca métricas executivas com números grandes
- ✅ Mostra tendências de forma clara
- ✅ Alerta sobre riscos de forma visual
- ✅ Usa cores temáticas coerentes (#2a688f, #42b9eb)
- ✅ É responsivo e acessível
- ✅ Carrega dados reais da API
- ✅ Exporta relatórios (se tempo permitir)

**Pronto para implementar!** 🚀

---

## 📚 REFERÊNCIAS

- [shadcn/ui Carousel](https://ui.shadcn.com/docs/components/carousel)
- [shadcn/ui Tabs](https://ui.shadcn.com/docs/components/tabs)
- [shadcn/ui Charts](https://ui.shadcn.com/docs/components/chart)
- [Recharts Documentation](https://recharts.org/en-US/)
- [Framer Motion](https://www.framer.com/motion/)
- [TanStack Query](https://tanstack.com/query/latest)
