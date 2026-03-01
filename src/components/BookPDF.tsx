import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register custom fonts for a children's book feel
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
  bgWarm: '#FCF8F2',
  white: '#FFFFFF',
  muted: '#8E9299',
};

const PAGE_SIZE = [842, 595]; // A4 landscape (width x height in points)
const HALF_WIDTH = 421;

const s = StyleSheet.create({
  // ─── Cover ───
  coverPage: {
    flexDirection: 'row',
    backgroundColor: BRAND.bg,
    width: '100%',
    height: '100%',
  },
  coverLeft: {
    width: HALF_WIDTH,
    height: '100%',
    backgroundColor: BRAND.ink,
    overflow: 'hidden',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  coverImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: BRAND.ink,
    opacity: 0.4,
  },
  coverRight: {
    width: HALF_WIDTH,
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: BRAND.bg,
    position: 'relative',
  },
  coverBorderDecor: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    bottom: 16,
    borderWidth: 1.5,
    borderColor: BRAND.olive,
    borderRadius: 6,
    opacity: 0.3,
  },
  coverSeries: {
    fontSize: 12,
    color: BRAND.accent,
    letterSpacing: 4,
    marginBottom: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  coverEmoji: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 10,
  },
  coverTitle: {
    fontSize: 26,
    fontFamily: 'Serif',
    fontWeight: 'bold',
    color: BRAND.ink,
    textAlign: 'center',
    lineHeight: 1.4,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  coverDivider: {
    width: 60,
    height: 2,
    backgroundColor: BRAND.olive,
    marginBottom: 20,
    opacity: 0.6,
  },
  coverSubtitle: {
    fontSize: 10,
    color: BRAND.muted,
    textAlign: 'center',
    marginTop: 'auto',
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
  },

  // ─── Content pages (landscape, image left, text right) ───
  contentPage: {
    flexDirection: 'row',
    backgroundColor: BRAND.white,
    width: '100%',
    height: '100%',
  },
  imageHalf: {
    width: HALF_WIDTH,
    height: '100%',
    backgroundColor: BRAND.bg,
    overflow: 'hidden',
    position: 'relative',
  },
  chapterImage: {
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BRAND.olive,
    opacity: 0.15,
  },
  textHalf: {
    width: HALF_WIDTH,
    height: '100%',
    padding: 36,
    paddingTop: 40,
    paddingBottom: 50,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  chapterTitleInText: {
    fontSize: 18,
    fontFamily: 'Serif',
    fontWeight: 'bold',
    color: BRAND.olive,
    marginBottom: 6,
    lineHeight: 1.3,
  },
  chapterSubLabel: {
    fontSize: 9,
    color: BRAND.accent,
    letterSpacing: 2,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  chapterDecoLine: {
    width: 40,
    height: 2,
    backgroundColor: BRAND.oliveLight,
    marginBottom: 14,
    opacity: 0.7,
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.75,
    color: BRAND.ink,
    marginBottom: 8,
    textAlign: 'justify',
  },
  dialogueText: {
    fontSize: 11,
    lineHeight: 1.75,
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
    fontSize: 32,
    fontFamily: 'Serif',
    fontWeight: 'bold',
    color: BRAND.olive,
    lineHeight: 1,
  },

  // ─── Footer ───
  pageFooter: {
    position: 'absolute',
    bottom: 16,
    right: 36,
    fontSize: 9,
    color: BRAND.muted,
  },
  pageFooterLine: {
    position: 'absolute',
    bottom: 30,
    left: 36,
    right: 36,
    height: 0.5,
    backgroundColor: BRAND.olive,
    opacity: 0.15,
  },

  // ─── Lexicon page (landscape full) ───
  lexiconPage: {
    flexDirection: 'row',
    backgroundColor: BRAND.white,
    width: '100%',
    height: '100%',
  },
  lexiconDecoLeft: {
    width: 60,
    backgroundColor: BRAND.olive,
    opacity: 0.08,
  },
  lexiconContent: {
    flex: 1,
    padding: 40,
    paddingTop: 50,
    position: 'relative',
  },
  lexiconHeader: {
    fontSize: 10,
    color: BRAND.olive,
    letterSpacing: 5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  lexiconTitle: {
    fontSize: 22,
    fontFamily: 'Serif',
    fontWeight: 'bold',
    color: BRAND.ink,
    marginBottom: 20,
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
    fontSize: 12,
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
    fontSize: 11,
    color: BRAND.ink,
    flex: 1,
  },
});

// Helper: detect if a paragraph is dialogue (starts with — or « or " or -)
function isDialogue(text: string): boolean {
  return /^[\u2014\u2013\u00ab""'\-]/.test(text.trim());
}

// Helper: parse markdown inline formatting to PDF Text elements
function renderMarkdownToPDF(text: string, isFirstChapter: boolean = false) {
  const paragraphs = text.split('\n').filter(p => p.trim());

  return paragraphs.map((paragraph, pIndex) => {
    const trimmed = paragraph.trim();
    if (!trimmed) return null;

    // Skip markdown headers
    if (trimmed.startsWith('#')) {
      const headerText = trimmed.replace(/^#+\s*/, '');
      return (
        <Text key={pIndex} style={[s.paragraph, s.boldText, { fontSize: 13, marginBottom: 12 }]}>
          {headerText}
        </Text>
      );
    }

    // Determine if this paragraph is dialogue
    const dialogue = isDialogue(trimmed);

    // Parse inline bold and italic
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

    // Use dialogue style for dialogue paragraphs
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

// Chapter decorative emojis (rotate through these for variety)
const CHAPTER_EMOJIS = ['🌿', '🦁', '🌍', '🌺', '✨', '🐘', '🌳', '🦜', '💧', '🌞', '🐢', '🌈', '🦋'];
function getChapterEmoji(index: number): string {
  return CHAPTER_EMOJIS[index % CHAPTER_EMOJIS.length];
}

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

export const BookPDF: React.FC<BookPDFProps> = ({ story, tomeNumber, groupImage, lexiconLanguage }) => (
  <Document>
    {/* ═══ COVER PAGE (landscape) ═══ */}
    <Page size={PAGE_SIZE} style={s.coverPage}>
      {/* Left half: cover image */}
      <View style={s.coverLeft}>
        {groupImage ? (
          <>
            <Image src={groupImage} style={s.coverImage} />
            <View style={s.coverImageOverlay} />
          </>
        ) : (
          <View style={s.imagePlaceholder}>
            <View style={s.imagePlaceholderDot} />
          </View>
        )}
      </View>

      {/* Right half: title */}
      <View style={s.coverRight}>
        <View style={s.coverBorderDecor} />
        <Text style={s.coverEmoji}>🌍 🌿 ✨</Text>
        <Text style={s.coverSeries}>Les Gardiens de la Terre</Text>
        <View style={s.coverDivider} />
        <Text style={s.coverTitle}>{story.title}</Text>
        <Text style={s.coverSubtitle}>Contes Éducatifs Africains 🌱</Text>
      </View>
    </Page>

    {/* ═══ CHAPTER PAGES (landscape: image left, text right) ═══ */}
    {story.chapters.map((chapter, index) => (
      <Page key={index} size={PAGE_SIZE} style={s.contentPage} wrap>
        {/* Left half: illustration */}
        <View style={s.imageHalf}>
          {chapter.imageUrl ? (
            <Image src={chapter.imageUrl} style={s.chapterImage} />
          ) : (
            <View style={s.imagePlaceholder}>
              <View style={s.imagePlaceholderDot} />
            </View>
          )}
        </View>

        {/* Right half: text */}
        <View style={s.textHalf} wrap>
          <Text style={s.chapterSubLabel}>{getChapterEmoji(index)}  {index + 1} / {story.chapters.length}</Text>
          <Text style={s.chapterTitleInText}>{chapter.title}</Text>
          <View style={s.chapterDecoLine} />
          {renderMarkdownToPDF(chapter.content, index === 0)}
          <View style={s.pageFooterLine} fixed />
          <Text style={s.pageFooter} fixed render={({ pageNumber }) => `${pageNumber}`} />
        </View>
      </Page>
    ))}

    {/* ═══ LEXICON PAGE (landscape) ═══ */}
    {story.lexicon && story.lexicon.length > 0 && (
      <Page size={PAGE_SIZE} style={s.lexiconPage}>
        <View style={s.lexiconDecoLeft} />
        <View style={s.lexiconContent}>
          <Text style={s.lexiconHeader}>📖  Vocabulaire</Text>
          <Text style={s.lexiconTitle}>Lexique{lexiconLanguage ? ` — ${lexiconLanguage}` : ''} 🌍</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flex: 1, height: 0.5, backgroundColor: BRAND.olive, opacity: 0.3 }} />
            <Text style={{ fontSize: 12, color: BRAND.olive, marginHorizontal: 10, opacity: 0.4 }}>✦</Text>
            <View style={{ flex: 1, height: 0.5, backgroundColor: BRAND.olive, opacity: 0.3 }} />
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

          <View style={[s.pageFooterLine, { left: 0, right: 0 }]} fixed />
          <Text style={[s.pageFooter, { right: 0 }]} fixed render={({ pageNumber }) => `${pageNumber}`} />
        </View>
      </Page>
    )}
  </Document>
);
