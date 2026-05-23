import { JournalEntry } from './types';

const STORAGE_KEY = 'nefes_al_journal_entries';

export function getJournalEntries(): JournalEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading journal entries:', error);
    return [];
  }
}

export function saveJournalEntries(entries: JournalEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving journal entries:', error);
  }
}

export function createJournalEntry(
  content: string,
  stressLevel: number,
  mood?: string
): JournalEntry {
  const entry: JournalEntry = {
    id: generateId(),
    user_id: 'local_user',
    content,
    stress_level: stressLevel,
    mood: mood || '',
    created_at: new Date().toISOString(),
  };

  const entries = getJournalEntries();
  entries.unshift(entry);
  saveJournalEntries(entries);

  return entry;
}

export function deleteJournalEntry(id: string): void {
  const entries = getJournalEntries();
  const filtered = entries.filter((e) => e.id !== id);
  saveJournalEntries(filtered);
}

export function exportToJSON(): string {
  const entries = getJournalEntries();
  const exportData = {
    app: 'Nefes Al',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    entries,
  };
  return JSON.stringify(exportData, null, 2);
}

export function exportToFile(): void {
  const jsonData = exportToJSON();
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `nefes_al_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function shareViaApp(): Promise<boolean> {
  const jsonData = exportToJSON();
  const blob = new Blob([jsonData], { type: 'application/json' });
  const file = new File([blob], `nefes_al_backup_${new Date().toISOString().split('T')[0]}.json`, {
    type: 'application/json',
  });

  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: 'Nefes Al - Gunluk Yedek',
        text: 'Gunluk kayitlarim',
        files: [file],
      });
      return true;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
      return false;
    }
  }
  return false;
}

export function importFromJSON(jsonString: string): { success: boolean; message: string; entries: JournalEntry[] } {
  try {
    const data = JSON.parse(jsonString);

    if (!data.entries || !Array.isArray(data.entries)) {
      return { success: false, message: 'Gecersiz dosya formati', entries: [] };
    }

    const validEntries: JournalEntry[] = data.entries.filter((entry: Partial<JournalEntry>) => {
      return entry.id && entry.content && entry.created_at;
    }).map((entry: Partial<JournalEntry>) => ({
      id: entry.id || generateId(),
      user_id: 'local_user',
      content: entry.content || '',
      stress_level: entry.stress_level || 3,
      mood: entry.mood || '',
      created_at: entry.created_at || new Date().toISOString(),
    }));

    if (validEntries.length === 0) {
      return { success: false, message: 'Dosyada gecerli kayit bulunamadi', entries: [] };
    }

    const existingEntries = getJournalEntries();
    const existingIds = new Set(existingEntries.map((e) => e.id));

    // Add only new entries
    const newEntries = validEntries.filter((e) => !existingIds.has(e.id));
    const allEntries = [...newEntries, ...existingEntries];

    // Sort by date descending
    allEntries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    saveJournalEntries(allEntries);

    return {
      success: true,
      message: `${newEntries.length} yeni kayit ice aktarildi`,
      entries: allEntries
    };
  } catch (error) {
    console.error('Error importing:', error);
    return { success: false, message: 'Dosya okunamiyor. Gecerli bir JSON dosyasi secin.', entries: [] };
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
