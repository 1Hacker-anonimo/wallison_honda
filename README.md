# Projeto Honda Refatorado

Este projeto é uma recriação completa de um site de vendas de motos Honda, desenvolvido com foco em performance, organização e facilidade de manutenção.

## Estrutura do Projeto
- `/public`: Contém os arquivos do site visível ao público.
    - `index.html`: Estrutura principal utilizando HTML5 semântico.
    - `css/style.css`: Estilização moderna com CSS Grid, Flexbox e variáveis.
    - `js/app.js`: Lógica de renderização dinâmica do catálogo e interações (modais, scroll).
    - `js/data.js`: Camada de persistência simulada usando `localStorage`.
- `/admin`: Painel administrativo para gestão do site.
    - `index.html`: Tela de login segura para testes.
    - `dashboard.html`: Interface de gerenciamento.
    - `js/admin.js`: Lógica do CRUD de motos e edição de perfil.

## Lógica de Funcionamento

### 1. Centralização de Dados
Diferente do projeto original, que possuía milhares de linhas de HTML estático, este projeto utiliza um **Catálogo Dinâmico**. Todos os dados (vendedor, banner, motos, preços, especificações) estão em um objeto JSON central.
- O arquivo `data.js` inicializa esses dados no seu navegador (`localStorage`).
- Qualquer alteração feita no Painel Admin atualiza esse JSON e reflete instantaneamente no site público.

### 2. Frontend Reativo (Vanilla JS)
- **Componentização via Scripts**: Os cards de motos são gerados via JavaScript. Isso permite adicionar centenas de motos sem aumentar o tamanho do arquivo HTML.
- **Modal Dinâmico Único**: Ao invés de ter um modal oculto para cada moto (o que pesava o site original), existe apenas um único modal estrutural que é preenchido com as informações da moto clicada em tempo de execução.
- **Sticky Header Inteligente**: O cabeçalho monitora o scroll da página, tornando-se fixo e alterando sua aparência (fundo branco, logo reduzido) automaticamente para manter a navegação acessível.

### 3. Painel Administrativo
- **Simplicidade e Poder**: Permite editar o nome do vendedor, links sociais e todas as informações das motos (incluindo imagens e categorias).
- **Sem Perda de Dados**: Por usar `localStorage`, suas alterações persistem mesmo após fechar o navegador ou atualizar a página.

### 4. Design Premium
- Tipografia moderna (`Outfit` do Google Fonts).
- Paleta de cores harmoniosa baseada na identidade visual da Honda.
- Micro-interações em botões e cards.

## Como usar
1. Abra `/public/index.html` para ver o site.
2. Para editar, acesse `/admin/index.html`.
   - **Usuário**: `admin`
   - **Senha**: `admin123`
