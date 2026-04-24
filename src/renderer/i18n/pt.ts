/** Textos da UI em português (MVP i18n). */
export const pt = {
  brandSubtitle: "Cliente IPTV para desktop",
  nav: {
    home: "Início",
    live: "TV ao vivo",
    movies: "Filmes",
    series: "Séries",
    library: "Fontes",
    settings: "Definições",
    categories: "Categorias",
    favorites: "Favoritos",
    recent: "Recentes"
  },
  navGroup: {
    navigation: "Navegação",
    explore: "Explorar",
    settings: "Configurações",
    soon: "Em breve"
  },
  welcome: {
    title: "Organize as suas playlists num só lugar",
    tagline: "Cliente IPTV para desktop",
    hasSourcesLead: "As suas fontes estão prontas. Pode adicionar outra lista ou entrar na app.",
    savedSourcesTitle: "Playlists guardadas",
    addSource: "Adicionar fonte",
    continueToApp: "Continuar para a app",
    sidebarSection: "Biblioteca",
    sidebarBrowse: "Sistema",
    sidebarPlaylists: "Playlists",
    sidebarTitle: "Estado da biblioteca",
    sidebarEmpty: "Sem fontes importadas",
    sidebarSources: "fontes",
    sidebarReady: "Tudo pronto para navegar"
  },
  theme: {
    light: "Modo claro",
    dark: "Modo escuro"
  },
  dashboard: {
    eyebrow: "Resumo da biblioteca",
    title: "As suas listas e reprodução num só sítio.",
    subtitle: "Importe fontes M3U ou Xtream Codes, navegue por categorias e reproduza com o player integrado.",
    statsSources: "Fontes",
    statsItems: "Itens",
    statsLive: "Canais ao vivo",
    statsVod: "Filmes + séries"
  },
  import: {
    title: "Importar fonte",
    subtitle: "O processamento pesado corre fora da interface.",
    sourceType: "Tipo de fonte",
    displayName: "Nome a exibir",
    playlistUrl: "URL da lista",
    selectFile: "Escolher ficheiro local",
    import: "Importar",
    importing: "A importar...",
    epgUrl: "URL do EPG (XMLTV, opcional)",
    epgHint: "Guia de programação; associado a esta fonte após importar."
  },
  live: {
    channelSearch: "Pesquisar canais...",
    promoTitle: "Mais de 1000+ canais",
    promoSubtitle: "Explore categorias e reproduza em qualidade.",
    channelInfo: "Informações do canal",
    epgSectionNow: "Agora na TV",
    epgSectionNext: "A seguir",
    remainingHint: "restantes",
    shortcuts: "Atalhos",
    shortcutFullscreen: "F - ecrã inteiro",
    shortcutMute: "M - silenciar",
    shortcutNav: "Setas - navegar na lista",
    quality: "Qualidade",
    source: "Fonte",
    statusOnline: "Online",
    statusLabel: "Estado"
  },
  catalog: {
    search: "Pesquisar...",
    items: "itens",
    categories: "Categorias",
    allCategories: "Todas",
    selectChannel: "Escolha um canal",
    selectEpisode: "Escolha um episódio na lista à esquerda.",
    episodesLoading: "A carregar episódios...",
    episodesError: "Não foi possível carregar episódios.",
    noEpisodes: "Sem episódios.",
    epgNow: "Agora",
    epgNext: "A seguir"
  },
  player: {
    selectToPlay: "Selecione algo para reproduzir",
    fullscreen: "Ecrã inteiro",
    exitFullscreen: "Sair do ecrã inteiro",
    volume: "Volume",
    mute: "Silenciar",
    unmute: "Ativar som",
    statusIdle: "Inativo",
    statusReady: "Pronto",
    statusPlaying: "A reproduzir",
    statusPaused: "Em pausa",
    statusBuffering: "A carregar buffer...",
    statusError: "Erro de reprodução",
    statusReconnecting: "A restabelecer...",
    favorite: "Favorito"
  },
  library: {
    title: "Fontes importadas",
    subtitle: "Remova ou reimporte listas. Os dados ficam no disco local.",
    items: "itens",
    groups: "grupos",
    updated: "Atualizado",
    empty: "Ainda sem fontes",
    emptyHint: "Importe uma fonte na página Início.",
    remove: "Remover",
    refresh: "Atualizar lista",
    confirmRemove: "Remover esta fonte e toda a biblioteca associada?"
  },
  settings: {
    title: "Definições",
    subtitle: "Tema e idioma da interface."
  },
  common: {
    back: "Voltar"
  },
  vod: {
    resume: "Continuar"
  },
  errorBound: {
    summary:
      "Ocorreu um erro inesperado. Copie o texto (inclui registo de diagnóstico recente) para o suporte, se for preciso.",
    copyDetails: "Copiar detalhes + registo de diagnóstico",
    reload: "Recarregar a app"
  }
} as const;

export type PtStrings = typeof pt;
