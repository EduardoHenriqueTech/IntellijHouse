/** Páginas do painel do morador: caminho, textos do cabeçalho e rótulo do menu. */
export interface PaginaInfo {
  /** Primeiro segmento da URL ("" = visão geral). */
  chave: string;
  caminho: string;
  rotulo: string;
  titulo: string;
  subtitulo: string;
}

export const PAGINAS: PaginaInfo[] = [
  { chave: "", caminho: "/", rotulo: "Visão geral", titulo: "Visão geral", subtitulo: "O que está ligado agora e o que a casa sugere." },
  { chave: "dispositivos", caminho: "/dispositivos", rotulo: "Dispositivos", titulo: "Dispositivos", subtitulo: "Ligue e desligue os equipamentos da casa." },
  { chave: "assistente", caminho: "/assistente", rotulo: "Assistente virtual", titulo: "Assistente virtual", subtitulo: "Peça em linguagem natural, como falaria com uma pessoa." },
  { chave: "ambientes", caminho: "/ambientes", rotulo: "Ambientes", titulo: "Ambientes", subtitulo: "Dispositivos organizados por cômodo." },
  { chave: "atividade", caminho: "/atividade", rotulo: "Atividade recente", titulo: "Atividade recente", subtitulo: "Comandos e alterações desde que a página foi aberta." },
  { chave: "rotinas", caminho: "/rotinas", rotulo: "Rotinas aprendidas", titulo: "Rotinas aprendidas", subtitulo: "Horários que a casa percebeu no seu histórico de uso." },
];
