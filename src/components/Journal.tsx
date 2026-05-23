import React, { useState, useEffect, useRef } from 'react';
import { JournalEntry } from '../lib/types';
import {
  getJournalEntries,
  createJournalEntry,
  deleteJournalEntry,
  exportToFile,
  shareViaApp,
  importFromJSON,
} from '../lib/localStorage';
import {
  BookOpen,
  Plus,
  Trash2,
  Filter,
  X,
  Download,
  Upload,
  Share2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

type FilterType = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';

export function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newStressLevel, setNewStressLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [mood, setMood] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadEntries();
  }, [filterType, customStartDate, customEndDate]);

  const loadEntries = () => {
    setLoading(true);
    try {
      let allEntries = getJournalEntries();

      let startDate: Date | undefined;
      let endDate: Date | undefined;
      const now = new Date();

      switch (filterType) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        case 'custom':
          if (customStartDate) startDate = new Date(customStartDate);
          if (customEndDate) endDate = new Date(customEndDate);
          break;
      }

      if (startDate) {
        allEntries = allEntries.filter((e) => new Date(e.created_at) >= startDate!);
      }
      if (endDate) {
        allEntries = allEntries.filter((e) => new Date(e.created_at) <= endDate!);
      }

      setEntries(allEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
    setLoading(false);
  };

  const handleCreateEntry = async () => {
    if (!newContent.trim()) return;

    try {
      const entry = createJournalEntry(newContent, newStressLevel, mood);
      setEntries([entry, ...entries]);
      setNewContent('');
      setNewStressLevel(3);
      setMood('');
      setShowNewEntry(false);
      showMessage('success', 'Gunluk kaydedildi');
    } catch (error) {
      console.error('Error creating entry:', error);
      showMessage('error', 'Kayit hatasi');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      deleteJournalEntry(id);
      setEntries(entries.filter((e) => e.id !== id));
      showMessage('success', 'Kayit silindi');
    } catch (error) {
      console.error('Error deleting entry:', error);
      showMessage('error', 'Silme hatasi');
    }
  };

  const handleExport = () => {
    try {
      exportToFile();
      showMessage('success', 'Dosya indirildi');
    } catch (error) {
      showMessage('error', 'Dondurma hatasi');
    }
  };

  const handleShare = async () => {
    const shared = await shareViaApp();
    if (!shared) {
      showMessage('error', 'Paylasim desteklenmiyor. Dosya olarak indirebilirsiniz.');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importFromJSON(content);

      if (result.success) {
        setEntries(result.entries);
        showMessage('success', result.message);
      } else {
        showMessage('error', result.message);
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Bugun';
    if (days === 1) return 'Dun';
    if (days < 7) return `${days} gun once`;
    return date.toLocaleDateString('tr-TR');
  };

  const getStressColor = (level: number) => {
    const colors: Record<number, string> = {
      1: 'bg-amber-100 text-amber-700',
      2: 'bg-sky-100 text-sky-700',
      3: 'bg-teal-100 text-teal-700',
      4: 'bg-blue-100 text-blue-700',
      5: 'bg-slate-100 text-slate-700',
    };
    return colors[level] || colors[3];
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-teal-500" />
            <h2 className="text-xl font-bold text-gray-800">Gunluk</h2>
          </div>
          <button
            onClick={() => setShowNewEntry(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Yeni</span>
          </button>
        </div>

        {/* Export/Import Controls */}
        <div className="flex flex-wrap gap-2 mb-6 p-4 bg-gray-50 rounded-xl">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Indir</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Paylas</span>
          </button>
          <button
            onClick={handleImportClick}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Ice Aktar</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Message Toast */}
        {message && (
          <div
            className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors mb-3"
          >
            <Filter className="w-4 h-4" />
            <span>Filtrele</span>
          </button>

          {showFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {(['all', 'today', 'week', 'month', 'year'] as FilterType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filterType === type
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type === 'all'
                    ? 'Tumu'
                    : type === 'today'
                    ? 'Bugun'
                    : type === 'week'
                    ? 'Hafta'
                    : type === 'month'
                    ? 'Ay'
                    : 'Yil'}
                </button>
              ))}
              <button
                onClick={() => setFilterType('custom')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'custom'
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tarih Sec
              </button>
            </div>
          )}

          {filterType === 'custom' && (
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Başlangıç</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Bitiş</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* New Entry Modal */}
        {showNewEntry && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Yeni Günlük</h3>
                <button
                  onClick={() => setShowNewEntry(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Şu an ne düşünüyorsun?
                  </label>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    placeholder="Bugün hissetiklerin..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stres Seviyesi
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        onClick={() => setNewStressLevel(level as 1 | 2 | 3 | 4 | 5)}
                        className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                          newStressLevel === level
                            ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ruh Hali (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Mutlu, heyecanlı..."
                  />
                </div>

                <button
                  onClick={handleCreateEntry}
                  disabled={!newContent.trim()}
                  className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Entries List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Henüz günlük yok</p>
            <p className="text-sm text-gray-400">İlk günlüğünü yaz!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-400">{formatDate(entry.created_at)}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStressColor(
                        entry.stress_level
                      )}`}
                    >
                      Seviye {entry.stress_level}
                    </span>
                    {entry.mood && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-pink-100 text-pink-700">
                        {entry.mood}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{entry.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
