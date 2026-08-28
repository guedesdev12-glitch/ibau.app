export type DailyVerse = { text: string; reference: string };

/**
 * Versículos em domínio público (Almeida 1911 / ARC).
 * A escolha é determinística pelo dia do ano — todo mundo vê o mesmo
 * versículo no mesmo dia, sem precisar de banco nem de rede.
 */
const VERSES: DailyVerse[] = [
  { text: "O Senhor é o meu pastor; nada me faltará.", reference: "Salmos 23:1" },
  {
    text: "Tudo posso naquele que me fortalece.",
    reference: "Filipenses 4:13",
  },
  {
    text: "Entrega o teu caminho ao Senhor; confia nele, e ele o fará.",
    reference: "Salmos 37:5",
  },
  {
    text: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus.",
    reference: "Isaías 41:10",
  },
  {
    text: "Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho.",
    reference: "Salmos 119:105",
  },
  {
    text: "Alegrai-vos na esperança, sede pacientes na tribulação, perseverai na oração.",
    reference: "Romanos 12:12",
  },
  {
    text: "O choro pode durar uma noite, mas a alegria vem pela manhã.",
    reference: "Salmos 30:5",
  },
  {
    text: "Buscai primeiro o reino de Deus, e a sua justiça, e todas estas coisas vos serão acrescentadas.",
    reference: "Mateus 6:33",
  },
  {
    text: "Porque para Deus nada é impossível.",
    reference: "Lucas 1:37",
  },
  {
    text: "Deem graças em todas as circunstâncias, pois esta é a vontade de Deus para vocês.",
    reference: "1 Tessalonicenses 5:18",
  },
  {
    text: "O Senhor é a minha luz e a minha salvação; a quem temerei?",
    reference: "Salmos 27:1",
  },
  {
    text: "Sede fortes e corajosos; não temais, porque o Senhor vosso Deus é quem vai convosco.",
    reference: "Deuteronômio 31:6",
  },
  {
    text: "Os que esperam no Senhor renovarão as suas forças.",
    reference: "Isaías 40:31",
  },
  {
    text: "Amarás o teu próximo como a ti mesmo.",
    reference: "Marcos 12:31",
  },
  {
    text: "Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.",
    reference: "Provérbios 3:5",
  },
];

export function verseOfTheDay(date: Date = new Date()): DailyVerse {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return VERSES[dayOfYear % VERSES.length];
}
