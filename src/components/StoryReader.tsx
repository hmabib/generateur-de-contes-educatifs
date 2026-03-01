import Markdown from 'react-markdown';
import { Pencil, Check, X, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

type Chapter = {
  chapterNumber: number;
  title: string;
  content: string;
  imagePrompt: string;
  imageUrl?: string;
  isGeneratingImage?: boolean;
};

type StoryData = {
  title: string;
  chapters: Chapter[];
  lexicon: { word: string; translation: string }[];
};

interface StoryReaderProps {
  story: StoryData;
  tomeNumber: string;
  editable?: boolean;
  onStoryChange?: (story: StoryData) => void;
}

export function StoryReader({ story, tomeNumber, editable = false, onStoryChange }: StoryReaderProps) {
  const [editingChapterIndex, setEditingChapterIndex] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingChapterTitle, setEditingChapterTitle] = useState<number | null>(null);
  const [newLexiconWord, setNewLexiconWord] = useState('');
  const [newLexiconTranslation, setNewLexiconTranslation] = useState('');

  const updateStory = (updated: StoryData) => {
    onStoryChange?.(updated);
  };

  const handleTitleChange = (newTitle: string) => {
    updateStory({ ...story, title: newTitle });
  };

  const handleChapterTitleChange = (index: number, newTitle: string) => {
    const updatedChapters = [...story.chapters];
    updatedChapters[index] = { ...updatedChapters[index], title: newTitle };
    updateStory({ ...story, chapters: updatedChapters });
  };

  const handleChapterContentChange = (index: number, newContent: string) => {
    const updatedChapters = [...story.chapters];
    updatedChapters[index] = { ...updatedChapters[index], content: newContent };
    updateStory({ ...story, chapters: updatedChapters });
  };

  const handleAddLexicon = () => {
    if (!newLexiconWord || !newLexiconTranslation) return;
    const updatedLexicon = [...(story.lexicon || []), { word: newLexiconWord, translation: newLexiconTranslation }];
    updateStory({ ...story, lexicon: updatedLexicon });
    setNewLexiconWord('');
    setNewLexiconTranslation('');
  };

  const handleRemoveLexicon = (index: number) => {
    const updatedLexicon = story.lexicon.filter((_, i) => i !== index);
    updateStory({ ...story, lexicon: updatedLexicon });
  };

  return (
    <div className="space-y-4">
      {/* Chapters */}
      <div className="space-y-12">
        {story.chapters.map((chapter, index) => (
          <div key={index}>
            {/* Decorative separator between chapters (not before first) */}
            {index > 0 && (
              <div className="flex items-center justify-center gap-4 mb-12">
                <div className="h-px bg-brand-olive/20 flex-1" />
                <div className="text-brand-olive/30 text-2xl">&#10045;</div>
                <div className="h-px bg-brand-olive/20 flex-1" />
              </div>
            )}

            {/* Chapter header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-brand-olive/10 rounded-full flex items-center justify-center text-brand-olive font-serif font-bold text-lg shrink-0">
                {chapter.chapterNumber}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-brand-olive-light font-bold mb-1">
                  Séquence {chapter.chapterNumber}
                </p>
                {editable && editingChapterTitle === index ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={chapter.title}
                      onChange={(e) => handleChapterTitleChange(index, e.target.value)}
                      className="text-2xl font-serif font-bold text-brand-ink bg-brand-bg border border-brand-olive/20 rounded-lg px-3 py-1 flex-1 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
                      autoFocus
                    />
                    <button onClick={() => setEditingChapterTitle(null)} className="p-1.5 hover:bg-brand-accent/10 rounded-lg text-brand-accent">
                      <Check size={18} />
                    </button>
                  </div>
                ) : (
                  <h3
                    className={`text-2xl font-serif font-bold text-brand-ink ${editable ? 'cursor-pointer hover:text-brand-olive transition-colors group' : ''}`}
                    onClick={() => editable && setEditingChapterTitle(index)}
                  >
                    {chapter.title}
                    {editable && <Pencil size={14} className="inline ml-2 opacity-0 group-hover:opacity-50 transition-opacity" />}
                  </h3>
                )}
              </div>
            </div>

            {/* Chapter image */}
            {chapter.imageUrl && (
              <img
                src={chapter.imageUrl}
                alt={`Illustration Séquence ${chapter.chapterNumber}`}
                className="w-full h-auto rounded-2xl shadow-md border border-brand-olive/20 mb-8"
              />
            )}

            {/* Chapter content */}
            {editable && editingChapterIndex === index ? (
              <div className="space-y-4">
                <textarea
                  value={chapter.content}
                  onChange={(e) => handleChapterContentChange(index, e.target.value)}
                  className="w-full min-h-[300px] bg-brand-bg border border-brand-olive/20 rounded-xl p-5 font-mono text-sm text-brand-ink leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-olive/50 resize-y"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingChapterIndex(null)}
                    className="flex items-center gap-2 bg-brand-accent text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-accent/80 transition-colors"
                  >
                    <Check size={16} />
                    Valider
                  </button>
                </div>
              </div>
            ) : (
              <div className={`relative ${editable ? 'group/chapter' : ''}`}>
                {editable && (
                  <button
                    onClick={() => setEditingChapterIndex(index)}
                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-brand-olive/10 opacity-0 group-hover/chapter:opacity-100 transition-opacity z-10 text-brand-ink/50 hover:text-brand-olive"
                  >
                    <Pencil size={14} />
                  </button>
                )}
                <div className="prose prose-stone prose-lg max-w-none font-serif text-brand-ink leading-relaxed
                  prose-p:mb-4 prose-p:leading-relaxed
                  first:prose-p:first-letter:text-4xl first:prose-p:first-letter:font-serif first:prose-p:first-letter:text-brand-olive first:prose-p:first-letter:float-left first:prose-p:first-letter:mr-2 first:prose-p:first-letter:mt-1 first:prose-p:first-letter:font-bold
                  prose-strong:text-brand-olive prose-em:text-brand-ink/80
                  prose-blockquote:border-brand-olive/30 prose-blockquote:text-brand-ink/70 prose-blockquote:italic">
                  <Markdown>{chapter.content}</Markdown>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lexicon */}
      {((story.lexicon && story.lexicon.length > 0) || editable) && (
        <div className="mt-16 pt-8 border-t border-brand-olive/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-brand-olive/20 flex-1" />
            <h3 className="text-2xl font-serif font-bold text-brand-olive px-4">Lexique</h3>
            <div className="h-px bg-brand-olive/20 flex-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {story.lexicon?.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-brand-bg to-white p-5 rounded-2xl border border-brand-olive/10 shadow-sm flex items-center gap-3 group">
                <div className="flex-1">
                  <span className="text-lg font-serif font-bold text-brand-olive">{item.word}</span>
                  <span className="text-brand-ink/40 mx-3 text-sm italic">signifie</span>
                  <span className="text-brand-ink font-medium">{item.translation}</span>
                </div>
                {editable && (
                  <button
                    onClick={() => handleRemoveLexicon(index)}
                    className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-brand-ink/30 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {editable && (
            <div className="mt-4 flex gap-3 items-center">
              <input
                value={newLexiconWord}
                onChange={(e) => setNewLexiconWord(e.target.value)}
                placeholder="Mot..."
                className="bg-white border border-brand-olive/20 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-olive/50 flex-1"
              />
              <input
                value={newLexiconTranslation}
                onChange={(e) => setNewLexiconTranslation(e.target.value)}
                placeholder="Traduction..."
                className="bg-white border border-brand-olive/20 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-olive/50 flex-1"
              />
              <button
                onClick={handleAddLexicon}
                disabled={!newLexiconWord || !newLexiconTranslation}
                className="p-2.5 bg-brand-olive text-white rounded-xl hover:bg-brand-olive-light transition-colors disabled:opacity-50"
              >
                <Plus size={18} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
