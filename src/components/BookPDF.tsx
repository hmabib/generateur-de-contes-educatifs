import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register custom fonts
Font.register({
  family: 'Serif',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/playfair-display@latest/latin-400-normal.ttf', fontWeight: 'normal' },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/playfair-display@latest/latin-700-normal.ttf', fontWeight: 'bold' },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/playfair-display@latest/latin-400-italic.ttf', fontStyle: 'italic' },
  ],
});

const BRAND = {
  olive: '#E07A5F',
  oliveLight: '#F4A261',
  ink: '#2B2D42',
  accent: '#81B29A',
  bg: '#F8F6F1',
  white: '#FFFFFF',
  muted: '#8E9299',
};

// A4 portrait: 595 x 842 points
const PAGE_W = 595;
const PAGE_H = 842;

const MARGIN = { top: 50, bottom: 50, left: 50, right: 50 };
const CONTENT_W = PAGE_W - MARGIN.left - MARGIN.right; // 495pt

const s = StyleSheet.create({
  // ─── Full-bleed image page ───
  imagePage: {
    width: '100%',
    height: '100%',
    backgroundColor: BRAND.ink,
  },
  fullImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: BRAND.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderDot: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: BRAND.olive,
    opacity: 0.15,
  },

  // ─── Cover title page ───
  coverTitlePage: {
    width: '100%',
    height: '100%',
    backgroundColor: BRAND.bg,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
    position: 'relative',
  },
  coverBorder: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderWidth: 1.5,
    borderColor: BRAND.olive,
    borderRadius: 8,
    opacity: 0.25,
  },
  coverDecoLine: {
    width: 100,
    height: 2,
    backgroundColor: BRAND.accent,
    marginBottom: 20,
    opacity: 0.5,
  },
  coverSeries: {
    fontSize: 13,
    color: BRAND.accent,
    letterSpacing: 5,
    marginBottom: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  coverDivider: {
    width: 70,
    height: 2.5,
    backgroundColor: BRAND.olive,
    marginBottom: 24,
    opacity: 0.6,
  },
  coverTitle: {
    fontSize: 32,
    fontFamily: 'Serif',
    fontWeight: 'bold',
    color: BRAND.ink,
    textAlign: 'center',
    lineHeight: 1.35,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  coverSubtitle: {
    fontSize: 11,
    color: BRAND.muted,
    textAlign: 'center',
    position: 'absolute',
    bottom: 40,
    left: 60,
    right: 60,
  },

  // ─── Chapter text page ───
  textPage: {
    width: '100%',
    height: '100%',
    backgroundColor: BRAND.white,
    paddingTop: MARGIN.top,
    paddingBottom: MARGIN.bottom + 10,
    paddingLeft: MARGIN.left,
    paddingRight: MARGIN.right,
    position: 'relative',
  },
  chapterSubLabel: {
    fontSize: 10,
    color: BRAND.accent,
    letterSpacing: 3,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  chapterTitle: {
    fontSize: 22,
    fontFamily: 'Serif',
    fontWeight: 'bold',
    color: BRAND.olive,
    marginBottom: 6,
    lineHeight: 1.3,
  },
  chapterDecoLine: {
    width: 50,
    height: 2,
    backgroundColor: BRAND.oliveLight,
    marginBottom: 14,
    opacity: 0.7,
  },

  // ─── Text styles ───
  paragraph: {
    fontSize: 12,
    fontFamily: 'Serif',
    lineHeight: 1.7,
    color: BRAND.ink,
    marginBottom: 8,
    textAlign: 'justify',
  },
  dialogueText: {
    fontSize: 12,
    fontFamily: 'Serif',
    lineHeight: 1.7,
    color: '#5B6E4E',
    marginBottom: 8,
    textAlign: 'justify',
    fontStyle: 'italic',
  },
  boldText: {
    fontFamily: 'Serif',
    fontWeight: 'bold',
    color: BRAND.olive,
  },
  italicText: {
    fontFamily: 'Serif',
    fontStyle: 'italic',
    color: BRAND.accent,
  },
  dropCap: {
    fontSize: 36,
    fontFamily: 'Serif',
    fontWeight: 'bold',
    color: BRAND.olive,
    lineHeight: 1,
  },
  markdownHeader: {
    fontSize: 15,
    fontFamily: 'Serif',
    fontWeight: 'bold',
    color: BRAND.olive,
    marginBottom: 8,
    marginTop: 4,
  },

  // ─── Footer ───
  pageFooter: {
    position: 'absolute',
    bottom: 20,
    right: MARGIN.right,
    fontSize: 9,
    color: BRAND.muted,
  },
  pageFooterLine: {
    position: 'absolute',
    bottom: 34,
    left: MARGIN.left,
    right: MARGIN.right,
    height: 0.5,
    backgroundColor: BRAND.olive,
    opacity: 0.12,
  },

  // ─── Lexicon page ───
  lexiconPage: {
    width: '100%',
    height: '100%',
    backgroundColor: BRAND.white,
    paddingTop: MARGIN.top,
    paddingBottom: MARGIN.bottom,
    paddingLeft: MARGIN.left,
    paddingRight: MARGIN.right,
    position: 'relative',
  },
  lexiconHeader: {
    fontSize: 10,
    color: BRAND.olive,
    letterSpacing: 5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  lexiconTitle: {
    fontSize: 22,
    fontFamily: 'Serif',
    fontWeight: 'bold',
    color: BRAND.ink,
    marginBottom: 20,
  },
  lexiconDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  lexiconDividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: BRAND.olive,
    opacity: 0.3,
  },
  lexiconDividerDash: {
    fontSize: 12,
    color: BRAND.olive,
    marginHorizontal: 10,
    opacity: 0.4,
  },
  lexiconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  lexiconItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E8E8E8',
    marginRight: '2%',
  },
  lexiconWord: {
    fontFamily: 'Serif',
    fontWeight: 'bold',
    fontSize: 11,
    color: BRAND.olive,
  },
  lexiconLang: {
    fontSize: 8,
    color: BRAND.accent,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  lexiconArrow: {
    fontSize: 10,
    color: BRAND.muted,
    marginHorizontal: 6,
  },
  lexiconTranslation: {
    fontSize: 10,
    color: BRAND.ink,
    flex: 1,
  },
});

// ─── Helpers ───

function isDialogue(text: string): boolean {
  return /^[\u2014\u2013\u00ab\u201c\u201d'\-]/.test(text.trim());
}

function renderMarkdownToPDF(text: string, isFirstChapter: boolean = false) {
  const paragraphs = text.split('\n').filter(p => p.trim());

  return paragraphs.map((paragraph, pIndex) => {
    const trimmed = paragraph.trim();
    if (!trimmed) return null;

    // Markdown headers
    if (trimmed.startsWith('#')) {
      const headerText = trimmed.replace(/^#+\s*/, '');
      return (
        <Text key={pIndex} style={s.markdownHeader}>
          {headerText}
        </Text>
      );
    }

    const dialogue = isDialogue(trimmed);
    const parts = trimmed.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

    // Drop cap for first paragraph of first chapter
    if (isFirstChapter && pIndex === 0 && parts.length > 0) {
      const firstPart = typeof parts[0] === 'string' ? parts[0] : '';
      if (firstPart.length > 1) {
        const firstLetter = firstPart[0];
        const rest = firstPart.slice(1);
        return (
          <Text key={pIndex} style={s.paragraph}>
            <Text style={s.dropCap}>{firstLetter}</Text>
            {rest}
            {parts.slice(1).map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <Text key={i} style={s.boldText}>{part.slice(2, -2)}</Text>;
              }
              if (part.startsWith('*') && part.endsWith('*')) {
                return <Text key={i} style={s.italicText}>{part.slice(1, -1)}</Text>;
              }
              return part;
            })}
          </Text>
        );
      }
    }

    const paragraphStyle = dialogue ? s.dialogueText : s.paragraph;

    return (
      <Text key={pIndex} style={paragraphStyle}>
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <Text key={i} style={s.boldText}>{part.slice(2, -2)}</Text>;
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return <Text key={i} style={s.italicText}>{part.slice(1, -1)}</Text>;
          }
          return part;
        })}
      </Text>
    );
  }).filter(Boolean);
}

const CHAPTER_MARKERS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII'];
function getChapterMarker(index: number): string {
  return CHAPTER_MARKERS[index % CHAPTER_MARKERS.length];
}

// ─── Types ───

type Chapter = {
  chapterNumber: number;
  title: string;
  content: string;
  imageUrl?: string;
};

type LexiconEntry = {
  word: string;
  translation: string;
  language?: string;
};

type StoryData = {
  title: string;
  chapters: Chapter[];
  lexicon: LexiconEntry[];
};

interface BookPDFProps {
  story: StoryData;
  tomeNumber: string;
  groupImage: string | null;
  lexiconLanguage?: string;
}

export const BookPDF: React.FC<BookPDFProps> = ({ story, groupImage, lexiconLanguage }) => (
  <Document>
    {/* ═══ COVER — PAGE 1: Full image ═══ */}
    <Page size="A4" style={s.imagePage}>
      {groupImage ? (
        <Image src={groupImage} style={s.fullImage} />
      ) : (
        <View style={s.imagePlaceholder}>
          <View style={s.imagePlaceholderDot} />
        </View>
      )}
    </Page>

    {/* ═══ COVER — PAGE 2: Title page ═══ */}
    <Page size="A4" style={s.coverTitlePage}>
      <View style={s.coverBorder} />
      <View style={s.coverDecoLine} />
      <Text style={s.coverSeries}>Les Gardiens de la Terre</Text>
      <View style={s.coverDivider} />
      <Text style={s.coverTitle}>{story.title}</Text>
      <Text style={s.coverSubtitle}>Contes Educatifs Africains</Text>
    </Page>

    {/* ═══ CHAPTERS: image page + text page(s) ═══ */}
    {story.chapters.map((chapter, index) => (
      <React.Fragment key={index}>
        {/* Image page (full bleed) */}
        <Page size="A4" style={s.imagePage}>
          {chapter.imageUrl ? (
            <Image src={chapter.imageUrl} style={s.fullImage} />
          ) : (
            <View style={s.imagePlaceholder}>
              <View style={s.imagePlaceholderDot} />
            </View>
          )}
        </Page>

        {/* Text page (wraps to additional pages if needed) */}
        <Page size="A4" style={s.textPage} wrap>
          <Text style={s.chapterSubLabel}>
            Chapitre {getChapterMarker(index)}  —  {index + 1} / {story.chapters.length}
          </Text>
          <Text style={s.chapterTitle}>{chapter.title}</Text>
          <View style={s.chapterDecoLine} />
          {renderMarkdownToPDF(chapter.content, index === 0)}
          <View style={s.pageFooterLine} fixed />
          <Text style={s.pageFooter} fixed render={({ pageNumber }) => `${pageNumber}`} />
        </Page>
      </React.Fragment>
    ))}

    {/* ═══ LEXICON PAGE ═══ */}
    {story.lexicon && story.lexicon.length > 0 && (
      <Page size="A4" style={s.lexiconPage} wrap>
        <Text style={s.lexiconHeader}>Vocabulaire</Text>
        <Text style={s.lexiconTitle}>
          Lexique{lexiconLanguage ? ` — ${lexiconLanguage}` : ''}
        </Text>

        <View style={s.lexiconDivider}>
          <View style={s.lexiconDividerLine} />
          <Text style={s.lexiconDividerDash}>—</Text>
          <View style={s.lexiconDividerLine} />
        </View>

        <View style={s.lexiconGrid}>
          {story.lexicon.map((item, index) => (
            <View key={index} style={s.lexiconItem}>
              <Text style={s.lexiconWord}>{item.word}</Text>
              {(item.language || lexiconLanguage) && (
                <Text style={s.lexiconLang}>({item.language || lexiconLanguage})</Text>
              )}
              <Text style={s.lexiconArrow}>→</Text>
              <Text style={s.lexiconTranslation}>{item.translation}</Text>
            </View>
          ))}
        </View>

        <View style={[s.pageFooterLine, { left: MARGIN.left, right: MARGIN.right }]} fixed />
        <Text style={s.pageFooter} fixed render={({ pageNumber }) => `${pageNumber}`} />
      </Page>
    )}
  </Document>
);
