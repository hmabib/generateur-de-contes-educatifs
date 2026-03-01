import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 50,
    fontFamily: 'Helvetica',
  },
  coverPage: {
    flexDirection: 'column',
    backgroundColor: '#F5F5F0',
    padding: 50,
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Helvetica',
  },
  seriesTitle: {
    fontSize: 24,
    color: '#5A5A40',
    marginBottom: 10,
    textAlign: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#141414',
    marginBottom: 40,
    textAlign: 'center',
  },
  coverImage: {
    width: '100%',
    maxHeight: 400,
    objectFit: 'contain',
    borderRadius: 10,
    marginBottom: 20,
  },
  chapterTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5A5A40',
    marginBottom: 20,
  },
  chapterImage: {
    width: '100%',
    maxHeight: 300,
    objectFit: 'contain',
    borderRadius: 10,
    marginBottom: 20,
  },
  textContainer: {
    backgroundColor: '#FCF8F2',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(90, 90, 64, 0.3)',
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 1.6,
    color: '#141414',
    marginBottom: 15,
    textAlign: 'justify',
  },
  lexiconTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5A5A40',
    marginBottom: 20,
  },
  lexiconItem: {
    flexDirection: 'row',
    marginBottom: 10,
    fontSize: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 5,
  },
  lexiconWord: {
    fontWeight: 'bold',
    color: '#141414',
    width: '40%',
  },
  lexiconTranslation: {
    color: '#5A5A40',
    width: '60%',
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#8E9299',
  },
});

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
    <Page size="A4" style={styles.coverPage}>
      <Text style={styles.seriesTitle}>Générateur de Contes</Text>
      <Text style={styles.seriesTitle}>Tome {tomeNumber}</Text>
      <Text style={styles.title}>{story.title}</Text>
      {groupImage && <Image src={groupImage} style={styles.coverImage} />}
    </Page>
    
    {story.chapters.map((chapter, index) => (
      <Page key={index} size="A4" style={styles.page}>
        {chapter.imageUrl && <Image src={chapter.imageUrl} style={styles.chapterImage} />}
        
        <View style={styles.textContainer}>
          {chapter.content.split('\n').map((paragraph, pIndex) => {
            const text = paragraph.trim().replace(/\*\*/g, '');
            if (!text) return null;
            return (
              <Text key={pIndex} style={styles.paragraph}>
                {text}
              </Text>
            );
          })}
        </View>
        
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>
    ))}

    {story.lexicon && story.lexicon.length > 0 && (
      <Page size="A4" style={styles.page}>
        <Text style={styles.lexiconTitle}>Lexique</Text>
        {story.lexicon.map((item, index) => (
          <View key={index} style={styles.lexiconItem}>
            <Text style={styles.lexiconWord}>{item.word}</Text>
            <Text style={styles.lexiconTranslation}>{item.translation}</Text>
          </View>
        ))}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>
    )}
  </Document>
);
