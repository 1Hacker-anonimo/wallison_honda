# PROJETO: HONDA EXPERIENCE - REENGENHARIA VISUAL
## 1. Arquitetura e Conceito Visual
**Conceito:** "Dark Premium Automotive". Uma estética imersiva, dominada por tons escuros profundos (Carbon/Onyx), com acentos vibrantes (Honda Red/Neon) e efeitos de vidro (Glassmorphism) para profundidade. O foco é na máquina (moto) e na autoridade do vendedor.

**Fluxo de Navegação:**
- **Hero Section Imersiva:** Não mais um banner estático. Uma área de entrada visual impactante com a identidade da loja/vendedor integrada dinamicamente sobrepondo a imagem de fundo.
- **Catálogo Fluído:** Substituição do grid rígido por um layout de cards flutuantes interativos.
- **Detalhes em Drawer:** Abandonamos os modais centrais padrão web. Detalhes de produtos e formulários abrirão em painéis laterais (Drawers) ou Overlays de tela cheia com animações de entrada suaves (Slide-up/Slide-in), típicos de apps nativos.

## 2. Paleta de Cores & Tipografia
### Cores
- **Background Base:** `#0F0F0F` (Dark Onyx)
- **Surface (Cards/Glass):** `rgba(30, 30, 30, 0.6)` com `backdrop-filter: blur(20px)`
- **Accent Primary:** `#FF0033` (Honda Racing Red - Modernizado) - Usado em CTAs e detalhes.
- **Accent Secondary:** `#D4AF37` (Metallic Gold) - Para selos premium ou detalhes financeiros.
- **Text Primary:** `#F3F3F3` (Off-white para leitura confortável)
- **Text Secondary:** `#A0A0A0` (Silver Grey)

### Tipografia
- **Display (Títulos):** `Audiowide` ou `Chakra Petch` (Futuristic/Automotive).
- **Body (Texto):** `Outfit` (Manter, mas com pesos mais leves e tracking maior) ou `Inter`.
- *Decisão:* Vamos usar **'Chakra Petch'** para títulos (bold, uppercase) e **'Inter'** para dados técnicos.

## 3. Novos Componentes (UI Kit)
### 3.1. Moto Card (Novo)
- **Formato:** Vertical alongado.
- **Comportamento:** A imagem da moto "sai" do card no hover (Scale effect).
- **Dados:** Nome da moto em destaque no topo, preço/categoria discretos no rodapé do card.
- **Ações:** Botão "Ver Detalhes" aparece apenas no hover ou é um ícone flutuante sutil.

### 3.2. Navegação (Floating Dock)
- Menu de categorias ou filtros será uma barra flutuante na parte inferior (Mobile) ou lateral fixa (Desktop), estilo "Dock" do macOS/iOS.

### 3.3. Botões (CTA)
- **Estilo:** Sólidos, sem borda radius completa (Sharp edges ou levemente arredondado - 4px).
- **Efeito:** Glow (brilho difuso) da cor do acento ao passar o mouse.

## 4. Estrutura do Grid & Responsividade
- **Desktop:** Masonry ou Grid Assimétrico (destaque para a moto principal/lançamento).
- **Mobile (Smartphones):** 
    - Layout de coluna única para foco total no produto.
    - **Adaptação de Toque:** Como disparadores de hover não existem em mobile, o painel de ações (`card-actions-hover`) torna-se estático e visível no rodapé do card para acesso imediato.
    - **Drawer Full-Screen:** O painel lateral ocupa 100% da largura em telas pequenas para facilitar a leitura técnica e o preenchimento de formulários.

## 5. Diretrizes de UI & UX Mobile
- **Touch Targets:** Botões com altura mínima de 48px para facilitar o clique.
- **Hierarquia:** Hero centralizado em smartphones para uma leitura rápida do perfil profissional do vendedor.
- **Performance:** Uso de `backdrop-filter` otimizado para não prejudicar a rolagem em dispositivos mais antigos.
