# a-casa-abandonada

Escape room pedagógico de matemática.

## Estrutura sugerida para 3 níveis

Este repositório agora está preparado com uma tela inicial para escolher o nível:

- Fácil
- Médio
- Difícil

### Arquivos principais

- `/index.html` → tela de seleção de nível
- `/styles.css` → estilos da tela inicial e das páginas de nível
- `/niveis/facil/index.html` → entrada do nível fácil
- `/niveis/medio/index.html` → entrada do nível médio
- `/niveis/dificil/index.html` → entrada do nível difícil

## Como publicar seus 3 jogos no mesmo repositório

1. Coloque os arquivos de cada jogo dentro da pasta correspondente:
   - `niveis/facil/`
   - `niveis/medio/`
   - `niveis/dificil/`
2. Se cada jogo tiver seu próprio `index.html`, mantenha esse arquivo dentro da pasta do nível.
3. Ajuste os links internos dos jogos para usar caminhos relativos da própria pasta.
4. Publique no GitHub Pages (ou outro host estático) para abrir a tela inicial e escolher o nível.
