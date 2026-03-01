import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 60,
    paddingTop: 70,
    paddingBottom: 70,
    fontFamily: 'Helvetica',
  },
  coverPage: {
    flexDirection: 'column',
    backgroundColor: '#F8F6F1',
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Helvetica',
  },
  coverBorder: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderWidth: 2,
    borderColor: '#E07A5F',
    borderRadius: 8,
  },
  coverInnerBorder: {
    position: 'absolute',
    top: 25,
    left: 25,
    right: 25,
    bottom: 25,
    borderWidth: 0.5,
    borderColor: '#81B29A',
    borderRadius: 6,
  },
  seriesTitle: {
    fontSize: 16,
    color: '#81B29A',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: 3,
  },
  tomeLabel: {
    fontSize: 14,
    color: '#E07A5F',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 2,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: '#2B2D42',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 1.3,
  },
  coverImage: {
    width: '85%',
    maxHeight: 350,
    objectFit: 'contain',
    borderRadius: 8,
    marginBottom: 20,
  },
  coverFooter: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: '#8E9299',
  },
  // Chapter title page
  chapterTitlePage: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Helvetica',
  },
  chapterNumberCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E07A5F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  chapterNumberText: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  chapterSequenceLabel: {
    fontSize: 10,
    color: '#E07A5F',
    letterSpacing: 4,
    marginBottom: 8,
    textAlign: 'center',
  },
  chapterTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#2B2D42',
    textAlign: 'center',
    marginBottom: 30,
  },
  chapterImage: {
    width: '100%',
    maxHeight: 280,
    objectFit: 'contain',
    borderRadius: 8,
    marginBottom: 24,
  },
  textContainer: {
    backgroundColor: '#FCF8F2',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(224, 122, 95, 0.2)',
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 1.7,
    color: '#2B2D42',
    marginBottom: 12,
    textAlign: 'justify',
  },
  boldText: {
    fontFamily: 'Helvetica-Bold',
  },
  italicText: {
    fontFamily: 'Helvetica-Oblique',
  },
  // Decorative separator
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  separatorLine: {
    height: 0.5,
    backgroundColor: '#E07A5F',
    flex: 1,
    opacity: 0.3,
  },
  separatorDot: {
    fontSize: 16,
    color: '#E07A5F',
    marginHorizontal: 10,
    opacity: 0.4,
  },
  // Footer
  footerLine: {
    position: 'absolute',
    bottom: 50,
    left: 60,
    right: 60,
    height: 0.5,
    backgroundColor: '#E07A5F',
    opacity: 0.2,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 10,
    bottom: 35,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#8E9299',
  },
  // Lexicon
  lexiconHeader: {
    fontSize: 10,
    color: '#E07A5F',
    letterSpacing: 4,
    marginBottom: 8,
    textAlign: 'center',
  },
  lexiconTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#2B2D42',
    marginBottom: 24,
    textAlign: 'center',
  },
  lexiconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  lexiconItem: {
    width: '48%',
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E8E8E8',
  },
  lexiconWord: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: '#E07A5F',
    width: '45%',
  },
  lexiconArrow: {
    fontSize: 10,
    color: '#8E9299',
    marginHorizontal: 4,
  },
  lexiconTranslation: {
    fontSize: 12,
    color: '#2B2D42',
    width: '45%',
  },
});

// Helper: parse markdown inline formatting to PDF Text elements
function renderMarkdownToPDF(text: string) {
  return text.split('\n').map((paragraph, pIndex) => {
    const trimmed = paragraph.trim();
    if (!trimmed) return null;
    // Skip markdown headers (##, ###)
    if (trimmed.startsWith('#')) {
      const headerText = trimmed.replace(/^#+\s*/, '');
      return (
        <Text key={pIndex} style={[styles.paragraph, styles.boldText, { fontSize: 15, marginBottom: 16 }]}>
          {headerText}
        </Text>
      );
    }

    // Parse inline bold and italic
    const parts = trimmed.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return (
      <Text key={pIndex} style={styles.paragraph}>
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <Text key={i} style={styles.boldText}>{part.slice(2, -2)}</Text>;
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return <Text key={i} style={styles.italicText}>{part.slice(1, -1)}</Text>;
          }
          return part;
        })}
      </Text>
    );
  }).filter(Boolean);
}

type Chapter = {
  chapterNumber: number;
  title: string;
  content: string;
  imageUrl?: string;
};

type StoryData = {
  title: string;
  chapters: Chapter[];
  lexicon: { word: string; translation: string }[];
};

interface BookPDFProps {
  story: StoryData;
  tomeNumber: string;
  groupImage: string | null;
}

export const BookPDF: React.FC<BookPDFProps> = ({ story, tomeNumber, groupImage }) => (
  <Document>
    {/* Cover Page */}
    <Page size="A4" style={styles.coverPage}>
      <View style={styles.coverBorder} />
      <View style={styles.coverInnerBorder} />
      <Text style={styles.seriesTitle}>LES GARDIENS DE LA TERRE</Text>
      <Text style={styles.tomeLabel}>TOME {tomeNumber}</Text>
      <Text style={styles.title}>{story.title}</Text>
      {groupImage && <Image src={groupImage} style={styles.coverImage} />}
      <Text style={styles.coverFooter}>Contes Éducatifs Africains</Text>
    </Page>

    {/* Chapters */}
    {story.chapters.map((chapter, index) => (
      <React.Fragment key={index}>
        {/* Chapter content page */}
        <Page size="A4" style={styles.page}>
          {/* Chapter header */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View style={styles.chapterNumberCircle}>
              <Text style={styles.chapterNumberText}>{chapter.chapterNumber}</Text>
            </View>
            <Text style={styles.chapterSequenceLabel}>SÉQUENCE {chapter.chapterNumber}</Text>
            <Text style={styles.chapterTitle}>{chapter.title}</Text>
          </View>

          {chapter.imageUrl && <Image src={chapter.imageUrl} style={styles.chapterImage} />}

          <View style={styles.textContainer}>
            {renderMarkdownToPDF(chapter.content)}
          </View>

          {/* Footer line */}
          <View style={styles.footerLine} fixed />
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
            `${pageNumber} / ${totalPages}`
          )} fixed />
        </Page>
      </React.Fragment>
    ))}

    {/* Lexicon Page */}
    {story.lexicon && story.lexicon.length > 0 && (
      <Page size="A4" style={styles.page}>
        <Text style={styles.lexiconHeader}>VOCABULAIRE</Text>
        <Text style={styles.lexiconTitle}>Lexique</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <View style={{ flex: 1, height: 0.5, backgroundColor: '#E07A5F', opacity: 0.3 }} />
          <Text style={{ fontSize: 12, color: '#E07A5F', marginHorizontal: 10, opacity: 0.5 }}>✦</Text>
          <View style={{ flex: 1, height: 0.5, backgroundColor: '#E07A5F', opacity: 0.3 }} />
        </View>

        <View style={styles.lexiconGrid}>
          {story.lexicon.map((item, index) => (
            <View key={index} style={styles.lexiconItem}>
              <Text style={styles.lexiconWord}>{item.word}</Text>
              <Text style={styles.lexiconArrow}>→</Text>
              <Text style={styles.lexiconTranslation}>{item.translation}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footerLine} fixed />
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>
    )}
  </Document>
);
