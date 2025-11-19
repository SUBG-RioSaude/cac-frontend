# Guia de Tipografia - Plus Jakarta Sans

Baseado no manual de marca da Prefeitura do Rio.

## 📐 Hierarquia Tipográfica

### PLUS JAKARTA SANS BLACK (Extra Bold 800)
**Equivalente à CERA PRO BLACK no manual**

**Uso:** Títulos e subtítulos principais
- ✅ Sobre fundo branco
- ✅ Para destaques ou subtítulos
- ✅ Sobre fundo azul ou imagem escura

**Classes disponíveis:**
```tsx
// Título principal sobre fundo branco (azul escuro)
<h1 className="font-display text-brand-primary">
  DASHBOARD DE CONTRATOS
</h1>

// Destaque/subtítulo (azul claro)
<h2 className="font-display text-brand-secondary">
  MÉTRICAS EXECUTIVAS
</h2>

// Sobre fundo azul ou escuro (branco)
<h1 className="font-display text-brand-white">
  VISÃO GERAL
</h1>
```

---

### PLUS JAKARTA SANS MEDIUM (Bold 700)
**Equivalente à CERA PRO MEDIUM no manual**

**Uso:** Subtítulos e títulos curtos
- ✅ Sobre fundo branco
- ✅ Para destaques ou subtítulos
- ✅ Sobre fundo azul ou imagem escura

**Preferencialmente em CAIXA ALTA**

**Classes disponíveis:**
```tsx
// Subtítulo sobre fundo branco (azul escuro)
<h3 className="font-heading text-brand-primary uppercase">
  TOTAL DE CONTRATOS
</h3>

// Destaque/card title (azul claro)
<h4 className="font-heading text-brand-secondary uppercase">
  CONTRATOS ATIVOS
</h4>

// Sobre fundo azul ou escuro (branco)
<h3 className="font-heading text-brand-white uppercase">
  ALERTAS CRÍTICOS
</h3>
```

---

### Plus Jakarta Sans Regular (Regular 400)
**Equivalente à CERA PRO REGULAR no manual**

**Uso:** Textos longos e parágrafos
- ✅ Em caixa alta e baixa (sentença normal)
- ✅ Sobre fundo branco (escuro)
- ✅ Sobre fundo azul ou imagem escura (cinza claro ou branco)

**Classes disponíveis:**
```tsx
// Texto sobre fundo branco
<p className="font-body text-foreground">
  Visão executiva e operacional do portfólio de contratos
</p>

// Texto sobre fundo azul/escuro
<p className="font-body text-brand-white">
  Últimos 6 meses de evolução dos contratos
</p>

// Texto secundário (muted)
<p className="font-body text-muted-foreground">
  Dados atualizados em tempo real
</p>
```

---

## 🎨 Paleta de Cores Tipográficas

### ✅ Variáveis Tailwind Disponíveis:

| Cor | Variável Tailwind | Hex | RGB | Uso |
|-----|-------------------|-----|-----|-----|
| Azul Escuro | `brand-primary` | `#2a688f` | R 42 / G 104 / B 143 | Títulos sobre fundo branco |
| Azul Claro | `brand-secondary` | `#42b9eb` | R 66 / G 185 / B 235 | Destaques e subtítulos |
| Cinza Claro | `brand-gray-light` | `#eceded` | R 236 / G 237 / B 237 | Fundos secundários |
| Branco | `brand-white` | `#ffffff` | R 255 / G 255 / B 255 | Texto sobre fundos escuros |

### Sobre fundo branco:
- **Primário (títulos):** `text-brand-primary` ou `bg-brand-primary`
- **Secundário (destaques):** `text-brand-secondary` ou `bg-brand-secondary`
- **Texto corpo:** `text-foreground` (preto/cinza escuro)
- **Texto secundário:** `text-muted-foreground` (cinza médio)

### Sobre fundo azul ou imagem escura:
- **Títulos/texto principal:** `text-brand-white` ou `text-white`
- **Texto secundário:** `text-white/80` ou `text-gray-200`
- **Fundo azul escuro:** `bg-brand-primary`
- **Fundo azul claro:** `bg-brand-secondary`

---

## 📝 Regras de Aplicação

### 1. Entrelinhas em Títulos Grandes
```tsx
// Reduzir entrelinha em títulos grandes (mínimo 30 milésimos = -0.03em)
<h1 className="font-display text-[#2a688f] tracking-tight">
  {/* tracking-tight = -0.025em */}
</h1>
```

### 2. Preferencialmente CAIXA ALTA
```tsx
// Títulos e subtítulos em uppercase
<h2 className="font-heading text-[#42b9eb] uppercase">
  CONTRATOS VENCENDO
</h2>
```

### 3. Textos Longos em Sentença
```tsx
// Parágrafos e descrições SEM uppercase
<p className="font-body text-muted-foreground">
  Esta seção apresenta os contratos que estão próximos do vencimento.
</p>
```

---

## 🔧 Classes Utilitárias Customizadas

Todas as classes já estão configuradas em `src/index.css`:

```css
/* Títulos principais - Extra Bold 800 */
.font-display {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: -0.02em;
}

/* Subtítulos - Bold 700 */
.font-heading {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
}

/* Textos corridos - Regular 400 */
.font-body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 400;
}
```

---

## ✅ Exemplos Práticos

### Card de Métrica
```tsx
<Card>
  <CardHeader>
    {/* Título do card - HEADING em uppercase */}
    <CardTitle className="font-heading text-[#2a688f] uppercase">
      CONTRATOS ATIVOS
    </CardTitle>

    {/* Descrição - BODY em sentença */}
    <CardDescription className="font-body text-muted-foreground">
      Total de contratos vigentes no momento
    </CardDescription>
  </CardHeader>

  <CardContent>
    {/* Número grande - DISPLAY */}
    <div className="font-display text-4xl text-[#42b9eb]">
      1.234
    </div>
  </CardContent>
</Card>
```

### Header do Dashboard
```tsx
<header className="bg-card">
  {/* Título principal - DISPLAY sobre fundo branco */}
  <h1 className="font-display text-[#2a688f]">
    DASHBOARD DE CONTRATOS
  </h1>

  {/* Subtítulo - BODY em sentença */}
  <p className="font-body text-muted-foreground">
    Visão executiva e operacional do portfólio de contratos
  </p>
</header>
```

### Banner com Fundo Azul
```tsx
<div className="bg-[#2a688f] p-8">
  {/* Título sobre fundo escuro - DISPLAY branco */}
  <h2 className="font-display text-white">
    ALERTAS CRÍTICOS
  </h2>

  {/* Texto sobre fundo escuro - BODY branco/translúcido */}
  <p className="font-body text-white/80">
    Contratos que requerem atenção imediata
  </p>
</div>
```

---

## 📚 Weights Disponíveis

- **400** - Regular (textos corridos)
- **500** - Medium (opcional, uso intermediário)
- **600** - Semi Bold (opcional, ênfase moderada)
- **700** - Bold (subtítulos e headings)
- **800** - Extra Bold (títulos principais)

Para usar weights específicos:
```tsx
<h3 className="font-sans font-semibold">{/* 600 */}</h3>
<h3 className="font-sans font-bold">{/* 700 */}</h3>
<h3 className="font-sans font-extrabold">{/* 800 */}</h3>
```

---

## 🚫 O que EVITAR

❌ Não use uppercase em textos longos (parágrafos)
❌ Não use font-display em textos de mais de 2 linhas
❌ Não misture muitos pesos diferentes na mesma seção
❌ Evite texto azul claro (#42b9eb) sobre fundo azul escuro (#2a688f)
❌ Não use entrelinhas muito apertadas em textos longos

---

## 🎯 Resumo Rápido

| Elemento | Classe | Cor (fundo branco) | Cor (fundo escuro) |
|----------|--------|-------------------|-------------------|
| Título principal | `font-display` | `text-[#2a688f]` | `text-white` |
| Destaque/Badge | `font-display` | `text-[#42b9eb]` | `text-white` |
| Subtítulo | `font-heading uppercase` | `text-[#2a688f]` | `text-white` |
| Card title | `font-heading uppercase` | `text-[#42b9eb]` | `text-white` |
| Parágrafo | `font-body` | `text-foreground` | `text-white` |
| Texto secundário | `font-body` | `text-muted-foreground` | `text-white/80` |
