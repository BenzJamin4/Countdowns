import React, { useState, useEffect, useMemo } from 'react';
import { CountdownItem as CountdownItemType, PaperStyle } from './types';
import { PAPER_THEMES } from './data/paperThemes';
import { DEFAULT_COUNTDOWNS } from './data/defaultCountdowns';
import { PaperBackground } from './components/PaperBackground';
import { NotebookHeader } from './components/NotebookHeader';
import { CountdownItem } from './components/CountdownItem';
import { StickyNoteModal } from './components/StickyNoteModal';
import { Plus, NotebookPen } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<CountdownItemType[]>(() => {
    try {
      const saved = localStorage.getItem('countdowns');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading local storage countdowns:', e);
    }
    return DEFAULT_COUNTDOWNS;
  });

  const [themeStyle, setThemeStyle] = useState<PaperStyle>(() => {
    const saved = localStorage.getItem('notebook_theme');
    return (saved as PaperStyle) || 'classic';
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CountdownItemType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [useEmojiButtons, setUseEmojiButtons] = useState(true);

  // Save to LocalStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem('countdowns', JSON.stringify(data));
    } catch (e) {
      console.error('Error saving countdowns to localStorage:', e);
    }
  }, [data]);

  // Save theme selection
  useEffect(() => {
    localStorage.setItem('notebook_theme', themeStyle);
  }, [themeStyle]);

  const currentTheme = PAPER_THEMES[themeStyle] || PAPER_THEMES.classic;

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id: number) => {
    const item = data.find((i) => i.id === id);
    if (item) {
      setEditingItem(item);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    setData((prev) => prev.filter((i) => i.id !== id));
  };

  const handleTogglePin = (id: number) => {
    setData((prev) =>
      prev.map((i) => (i.id === id ? { ...i, pinned: !i.pinned } : i))
    );
  };

  const handleDuplicate = (item: CountdownItemType) => {
    const newItem: CountdownItemType = {
      ...item,
      id: Date.now(),
      title: `${item.title} (Copy)`,
    };
    setData((prev) => [newItem, ...prev]);
  };

  const handleSaveItem = (
    itemData: Omit<CountdownItemType, 'id'> & { id?: number }
  ) => {
    if (itemData.id) {
      // Update existing
      setData((prev) =>
        prev.map((i) =>
          i.id === itemData.id ? ({ ...itemData, id: itemData.id } as CountdownItemType) : i
        )
      );
    } else {
      // Create new
      const newItem: CountdownItemType = {
        ...itemData,
        id: Date.now(),
        createdAt: Date.now(),
      } as CountdownItemType;
      setData((prev) => [newItem, ...prev]);
    }
  };

  const handleDownloadData = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `countdowns-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUploadData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          // Basic validation
          const validItems: CountdownItemType[] = parsed.filter(
            (i) => i && typeof i.id === 'number' && i.title && i.startDate
          );
          if (validItems.length > 0) {
            setData(validItems);
            alert(`Successfully imported ${validItems.length} countdowns!`);
          } else {
            alert('Invalid JSON file format. Could not find valid countdown entries.');
          }
        }
      } catch (err) {
        alert('Failed to parse uploaded JSON file.');
      }
    };

    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  const handleResetDefaultData = () => {
    if (window.confirm('Reset all countdowns to default sample notes?')) {
      setData(DEFAULT_COUNTDOWNS);
    }
  };

  // Extract all unique categories present in the current countdown data (supporting multiple comma-separated categories per item)
  const categories = useMemo(() => {
    const cats = new Set<string>();
    data.forEach((item) => {
      if (item.category && item.category.trim()) {
        item.category.split(',').forEach((c) => {
          const trimmed = c.trim();
          if (trimmed) cats.add(trimmed);
        });
      }
    });
    return Array.from(cats);
  }, [data]);

  // Filter & sort countdowns: Pinned items first, then by target date or creation
  const filteredData = useMemo(() => {
    let result = [...data];

    if (selectedCategory === 'pinned') {
      result = result.filter((i) => i.pinned);
    } else if (selectedCategory !== 'all') {
      result = result.filter(
        (i) =>
          i.category &&
          i.category
            .split(',')
            .some((c) => c.trim().toLowerCase() === selectedCategory.trim().toLowerCase())
      );
    }

    // Sort: Pinned first, then sorted by start date
    return result.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
  }, [data, selectedCategory]);

  return (
    <PaperBackground theme={currentTheme}>
      {isModalOpen && (
        <StickyNoteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveItem}
          initialItem={editingItem}
          existingCategories={categories}
        />
      )}
      <div className="flex-1 flex flex-col">
        <NotebookHeader
          onOpenModal={handleOpenAddModal}
          onDownloadData={handleDownloadData}
          onUploadData={handleUploadData}
          onResetDefaultData={handleResetDefaultData}
          currentTheme={currentTheme}
          onSelectTheme={setThemeStyle}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          useEmojiButtons={useEmojiButtons}
          onToggleEmojiButtons={() => setUseEmojiButtons((prev) => !prev)}
          count={filteredData.length}
        />

          {/* Countdown List on Notebook Lines */}
          <main id="list" className="mt-0 flex-1 flex flex-col relative">
            {filteredData.length > 0 ? (
              <>
                {filteredData.map((item) => (
                  <React.Fragment key={item.id}>
                    <CountdownItem
                      item={item}
                      theme={currentTheme}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onTogglePin={handleTogglePin}
                      onDuplicate={handleDuplicate}
                      useEmojiButtons={useEmojiButtons}
                    />
                    {/* Lined empty row divider after each countdown */}
                    <div className="h-[40px] shrink-0 pointer-events-none" />
                  </React.Fragment>
                ))}

                {/* Seamless notebook filler lines reaching bottom of page */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {Array.from({ length: 25 }).map((_, idx) => (
                    <div
                      key={`filler-${idx}`}
                      className="h-[40px] border-b shrink-0 pointer-events-none"
                      style={{ borderColor: currentTheme.lineColor }}
                    />
                  ))}
                </div>
              </>
            ) : (
              /* Empty state sticky note invitation stuck onto continuous notebook lines */
              <div className="relative flex-1 flex flex-col min-h-[500px]">
                {/* Background notebook lines filling the page uninterrupted */}
                <div className="absolute inset-0 flex flex-col overflow-hidden pointer-events-none">
                  {Array.from({ length: 30 }).map((_, idx) => (
                    <div
                      key={`filler-${idx}`}
                      className="h-[40px] border-b shrink-0"
                      style={{ borderColor: currentTheme.lineColor }}
                    />
                  ))}
                </div>

                {/* Empty state sticky note stuck onto the notebook lines at main sticky height */}
                <div className="relative z-20 pt-8 pb-12 px-4 flex flex-col items-center justify-start text-center">
                  <div
                    className="p-8 rounded-xs shadow-xl max-w-sm transform rotate-1 border-t-8 border-yellow-300 relative z-20 mt-2"
                    style={{
                      backgroundColor: '#fff9c4',
                      color: '#451a03',
                      fontFamily: currentTheme.fontFamily,
                    }}
                  >
                    {/* Tape decoration stuck on top */}
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-36 h-7 bg-white/75 shadow-xs border border-amber-200/70 backdrop-blur-xs transform -rotate-1 pointer-events-none z-20 flex items-center justify-center">
                      <div className="w-full h-full bg-amber-100/30 opacity-60 border-x-2 border-dashed border-amber-300/50" />
                    </div>

                    <NotebookPen className="w-10 h-10 mx-auto mb-3 opacity-80" />
                    <h3 className="text-lg font-bold mb-1 uppercase tracking-wider">Notebook is Empty</h3>
                    <p className="text-xs mb-4 opacity-80">
                      {selectedCategory !== 'all'
                        ? 'No countdowns match your category filter.'
                        : 'Click the ➕ button to stick your first countdown note onto the paper!'}
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenAddModal}
                      className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xs hover:bg-slate-800 transition-colors cursor-pointer inline-flex items-center gap-1.5 uppercase"
                    >
                      <Plus className="w-4 h-4" /> Stick New Note
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
    </PaperBackground>
  );
}
