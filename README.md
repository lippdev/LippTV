# LippTV

LippTV é um player de IPTV e streaming moderno para desktop, construído com Electron, React e TypeScript. O objetivo é fornecer uma experiência rápida, estável e refinada para usuários que desejam organizar e reproduzir suas próprias fontes autorizadas de IPTV no Windows.

> O LippTV não fornece playlists, canais, filmes, séries, credenciais ou conteúdo de streaming. O aplicativo é apenas um reprodutor/cliente para fontes fornecidas pelo usuário, que deve ter o direito legal de acessá-las.

## Destaques

- Aplicativo Desktop para Windows desenvolvido com Electron.
- Interface premium (modo dark/light) com barra de título customizada.
- Reprodutor web interno focado em reprodução de HLS/M3U8.
- Importação de playlist a partir de arquivo M3U ou URL.
- Estrutura inicial de conexão para API Xtream e portais compatíveis com Stalker/MAG.
- Organização em TV Ao Vivo, Filmes e Séries.
- Favoritos, histórico de reprodução e preferências.
- Busca rápida e navegação por categorias.
- Listas virtualizadas para catálogos extensos.
- Persistência local segura.
- Padrões de segurança do Electron com renderizador isolado (preload bridge).

## Telas

As capturas de tela serão adicionadas em breve. Se você estiver contribuindo com melhorias na interface do usuário, sinta-se à vontade para abrir um PR adicionando imagens atualizadas da versão mais recente.

## Tecnologias Utilizadas

- Electron
- React
- TypeScript
- Vite
- Zustand
- hls.js
- mpegts.js
- @tanstack/react-virtual
- electron-store
- electron-builder

## Objetivos do Projeto

O LippTV é projetado em torno de três prioridades:

- **Performance**: grandes catálogos de IPTV não devem travar a interface.
- **Estabilidade**: erros de reprodução devem ser tratados de forma suave sempre que possível.
- **Qualidade de UX**: o aplicativo deve parecer um produto de streaming real (premium), não um visualizador genérico de listas.

## Como Funciona

O processo principal do Electron é dono da janela nativa do desktop, dos handlers de IPC, da persistência local e do trabalho pesado de importação. O renderizador é um aplicativo React responsável pela navegação, interface do catálogo, controles de reprodução e experiência do usuário.

Listas de reprodução grandes são processadas fora do caminho crítico da interface do usuário, e a renderização do catálogo usa listas virtualizadas para que milhares de entradas possam ser navegadas sem renderizar tudo de uma vez.

## Fontes Suportadas

- Playlists M3U a partir de arquivo.
- Playlists M3U a partir de URL.
- Transmissões diretas HLS/M3U8.
- Contas compatíveis com API Xtream (quando autorizadas pelo usuário).
- Portais compatíveis com Stalker/MAG (quando autorizados pelo usuário).

## Começando

### Requisitos

- Node.js 20 ou superior.
- npm 10 ou superior.
- Windows é o alvo principal no momento.

### Instalação

```bash
npm install
```

### Rodar em Desenvolvimento

```bash
npm run dev
```

Isso inicia o modo watch do TypeScript para o Electron, o Vite para o renderizador e, em seguida, abre o aplicativo de desktop.

### Checagem de Tipos

```bash
npm run typecheck
```

### Build de Produção

```bash
npm run build
```

### Empacotar o App

```bash
npm run pack
```

### Criar Instalador

```bash
npm run dist
```

Os artefatos de build serão gerados na pasta `release/`.

## Scripts Disponíveis

- `npm run dev`: inicia o aplicativo em modo de desenvolvimento.
- `npm run build`: faz o build do renderizador e do processo principal do Electron.
- `npm run build:renderer`: faz o build do renderizador Vite.
- `npm run build:main`: compila os arquivos TypeScript do Electron.
- `npm run typecheck`: executa as verificações do TypeScript.
- `npm run preview`: visualiza o build do renderizador Vite.
- `npm run pack`: cria uma compilação de desktop descompactada.
- `npm run dist`: cria um instalador distribuível com electron-builder.

## Uso Legal e Responsável

Este repositório é destinado ao acesso legítimo de mídia pessoal, assinaturas de IPTV autorizadas, testes internos e aprendizado de código aberto.

**Não use** o LippTV para acessar conteúdo sem permissão. Não abra issues solicitando playlists, conteúdo pirata, credenciais de provedor ou ajuda para contornar controles de acesso.

## Licença

MIT. Veja o arquivo [LICENSE](LICENSE).
