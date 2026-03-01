import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  BorderStyle,
  ImageRun,
  SectionType,
} from 'docx';
import { saveAs } from 'file-saver';

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

const BRAND_OLIVE = 'E07A5F';
const BRAND_ACCENT = '81B29A';
const BRAND_INK = '2B2D42';

const CHAPTER_EMOJIS = ['🌿', '🦁', '🌍', '🌺', '✨', '🐘', '🌳', '🦜', '💧', '🌞', '🐢', '🌈', '🦋'];

// Convert base64 data URL to Uint8Array for docx ImageRun
async function imageUrlToBuffer(url: string): Promise<Uint8Array | null> {
  try {
    if (url.startsWith('data:')) {
      const base64 = url.split(',')[1];
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    }
    return null;
  } catch {
    return null;
  }
}

// Parse markdown inline formatting into TextRun array
function parseContentToRuns(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const lines = text.split('\n').filter(l => l.trim());

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Add line break between paragraphs
    if (lineIndex > 0) {
      runs.push(new TextRun({ break: 1 }));
      runs.push(new TextRun({ break: 1 }));
    }

    // Check if it's a dialogue line
    const isDialogue = /^[—–«""'\-]/.test(trimmed);

    // Skip markdown headers
    const cleanLine = trimmed.startsWith('#') ? trimmed.replace(/^#+\s*/, '') : trimmed;

    // Parse bold and italic
    const parts = cleanLine.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

    parts.forEach(part => {
      if (part.startsWith('**') && part.endsWith('**')) {
        runs.push(new TextRun({
          text: part.slice(2, -2),
          bold: true,
          color: BRAND_OLIVE,
          font: 'Georgia',
          size: 22,
        }));
      } else if (part.startsWith('*') && part.endsWith('*')) {
        runs.push(new TextRun({
          text: part.slice(1, -1),
          italics: true,
          color: BRAND_ACCENT,
          font: 'Georgia',
          size: 22,
        }));
      } else if (part) {
        runs.push(new TextRun({
          text: part,
          color: isDialogue ? '5B6E4E' : BRAND_INK,
          italics: isDialogue,
          font: 'Georgia',
          size: 22,
        }));
      }
    });
  });

  return runs;
}

export async function exportToWord(
  story: StoryData,
  tomeNumber: string,
  groupImage: string | null,
  lexiconLanguage?: string
) {
  const sections: any[] = [];

  // ═══ COVER PAGE ═══
  const coverChildren: Paragraph[] = [];

  coverChildren.push(new Paragraph({ spacing: { after: 600 }, children: [] }));

  // Decorative emojis
  coverChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: '🌍  🌿  ✨', size: 44, font: 'Segoe UI Emoji' })],
  }));

  // Series title
  coverChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({
      text: 'LES GARDIENS DE LA TERRE',
      color: BRAND_ACCENT,
      size: 22,
      font: 'Georgia',
      characterSpacing: 200,
    })],
  }));

  // Divider
  coverChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 300 },
    children: [new TextRun({ text: '───────────', color: BRAND_OLIVE, size: 24, font: 'Georgia' })],
  }));

  // Cover image
  if (groupImage) {
    const imgBuffer = await imageUrlToBuffer(groupImage);
    if (imgBuffer) {
      coverChildren.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [new ImageRun({
          data: imgBuffer,
          transformation: { width: 400, height: 300 },
          type: 'png',
        })],
      }));
    }
  }

  // Story title
  coverChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({
      text: story.title,
      bold: true,
      color: BRAND_INK,
      size: 52,
      font: 'Georgia',
    })],
  }));

  // Subtitle
  coverChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 600 },
    children: [new TextRun({
      text: 'Contes Éducatifs Africains 🌱',
      color: '8E9299',
      size: 20,
      font: 'Georgia',
    })],
  }));

  sections.push({
    properties: {
      type: SectionType.NEXT_PAGE,
      page: {
        size: { width: 11906, height: 16838, orientation: 'portrait' },
        margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
      },
    },
    children: coverChildren,
  });

  // ═══ CHAPTER PAGES ═══
  for (let i = 0; i < story.chapters.length; i++) {
    const chapter = story.chapters[i];
    const emoji = CHAPTER_EMOJIS[i % CHAPTER_EMOJIS.length];
    const chapterChildren: Paragraph[] = [];

    // Chapter emoji + number
    chapterChildren.push(new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 100 },
      children: [new TextRun({
        text: `${emoji}  ${i + 1} / ${story.chapters.length}`,
        color: BRAND_ACCENT,
        size: 18,
        font: 'Georgia',
        characterSpacing: 100,
      })],
    }));

    // Chapter title
    chapterChildren.push(new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 100 },
      children: [new TextRun({
        text: chapter.title,
        bold: true,
        color: BRAND_OLIVE,
        size: 36,
        font: 'Georgia',
      })],
    }));

    // Decorative line
    chapterChildren.push(new Paragraph({
      spacing: { after: 300 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 2, color: BRAND_OLIVE, space: 1 },
      },
      children: [new TextRun({ text: '', size: 4 })],
    }));

    // Chapter image
    if (chapter.imageUrl) {
      const imgBuffer = await imageUrlToBuffer(chapter.imageUrl);
      if (imgBuffer) {
        chapterChildren.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          children: [new ImageRun({
            data: imgBuffer,
            transformation: { width: 450, height: 320 },
            type: 'png',
          })],
        }));
      }
    }

    // Chapter content as paragraph with runs
    const contentRuns = parseContentToRuns(chapter.content);
    chapterChildren.push(new Paragraph({
      spacing: { after: 200, line: 360 },
      alignment: AlignmentType.JUSTIFIED,
      children: contentRuns,
    }));

    sections.push({
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          size: { width: 11906, height: 16838, orientation: 'portrait' },
          margin: { top: 1200, bottom: 1200, left: 1440, right: 1440 },
        },
      },
      children: chapterChildren,
    });
  }

  // ═══ LEXICON PAGE ═══
  if (story.lexicon && story.lexicon.length > 0) {
    const lexiconChildren: Paragraph[] = [];

    // Header
    lexiconChildren.push(new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 100 },
      children: [new TextRun({
        text: '📖  VOCABULAIRE',
        color: BRAND_OLIVE,
        size: 20,
        font: 'Georgia',
        characterSpacing: 200,
      })],
    }));

    // Title
    lexiconChildren.push(new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 200 },
      children: [new TextRun({
        text: `Lexique${lexiconLanguage ? ` — ${lexiconLanguage}` : ''} 🌍`,
        bold: true,
        color: BRAND_INK,
        size: 40,
        font: 'Georgia',
      })],
    }));

    // Divider
    lexiconChildren.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: '─────────── ✦ ───────────', color: BRAND_OLIVE, size: 20, font: 'Georgia' })],
    }));

    // Lexicon entries
    story.lexicon.forEach(item => {
      const lang = item.language || lexiconLanguage || '';
      const langText = lang ? ` (${lang})` : '';

      lexiconChildren.push(new Paragraph({
        spacing: { after: 150 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E8E8E8', space: 4 },
        },
        children: [
          new TextRun({
            text: item.word,
            bold: true,
            color: BRAND_OLIVE,
            size: 24,
            font: 'Georgia',
          }),
          new TextRun({
            text: langText,
            italics: true,
            color: BRAND_ACCENT,
            size: 18,
            font: 'Georgia',
          }),
          new TextRun({
            text: '  →  ',
            color: '8E9299',
            size: 22,
            font: 'Georgia',
          }),
          new TextRun({
            text: item.translation,
            color: BRAND_INK,
            size: 22,
            font: 'Georgia',
          }),
        ],
      }));
    });

    sections.push({
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          size: { width: 11906, height: 16838, orientation: 'portrait' },
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
        },
      },
      children: lexiconChildren,
    });
  }

  // Generate document
  const doc = new Document({ sections });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Les_Gardiens_${tomeNumber ? `Tome_${tomeNumber}` : story.title.replace(/\s+/g, '_')}.docx`);
}
