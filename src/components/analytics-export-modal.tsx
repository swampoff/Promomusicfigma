/**
 * ANALYTICS EXPORT MODAL
 * Модальное окно для выбора формата экспорта аналитики
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Download, FileText, Table, FileSpreadsheet, FileJson,
  Check, Info, Calendar, TrendingUp
} from 'lucide-react';

interface AnalyticsExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'pdf' | 'excel' | 'csv' | 'json') => void;
  title?: string;
  type?: 'radio' | 'venue';
}

export function AnalyticsExportModal({ 
  isOpen, 
  onClose, 
  onExport,
  title = 'Экспорт аналитики',
  type = 'radio'
}: AnalyticsExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | 'csv' | 'json'>('pdf');
  const [isExporting, setIsExporting] = useState(false);

  const formats = [
    {
      id: 'pdf' as const,
      name: 'PDF отчет',
      icon: FileText,
      description: 'Детальный отчет с графиками и таблицами',
      features: ['Графики', 'Таблицы', 'Статистика', 'Готов к печати'],
      color: 'from-red-500 to-red-600',
      recommended: true
    },
    {
      id: 'excel' as const,
      name: 'Excel таблица',
      icon: FileSpreadsheet,
      description: 'Таблица для анализа и обработки данных',
      features: ['Все данные', 'Формулы', 'Фильтры', 'Сводные таблицы'],
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'csv' as const,
      name: 'CSV файл',
      icon: Table,
      description: 'Простой формат для импорта в другие системы',
      features: ['Легкий', 'Универсальный', 'Импорт везде'],
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'json' as const,
      name: 'JSON данные',
      icon: FileJson,
      description: 'Структурированные данные для программистов',
      features: ['API интеграция', 'Автоматизация', 'Разработка'],
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(selectedFormat);
      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Export error:', error);
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0a0a14] rounded-2xl shadow-2xl border border-white/10"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 p-6 bg-[#0a0a14]/95 backdrop-blur-xl border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{title}</h2>
                  <p className="text-sm text-slate-400">Выберите формат для экспорта</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Info Banner */}
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-300 font-medium mb-1">
                    Экспорт аналитики
                  </p>
                  <p className="text-xs text-blue-200/60">
                    Отчет будет содержать данные за выбранный период со всеми метриками и графиками
                  </p>
                </div>
              </div>
            </div>

            {/* Format Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formats.map((format) => (
                <motion.button
                  key={format.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                    selectedFormat === format.id
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {/* Recommended Badge */}
                  {format.recommended && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
                      Рекомендуем
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${format.color} flex items-center justify-center mb-3`}>
                    <format.icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Name */}
                  <h3 className="text-white font-bold mb-1 flex items-center gap-2">
                    {format.name}
                    {selectedFormat === format.id && (
                      <Check className="w-4 h-4 text-indigo-400" />
                    )}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-400 mb-3">
                    {format.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1">
                    {format.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-full bg-white/5 text-slate-300 text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Preview Info */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Что будет в отчете
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                  <span className="text-slate-300">Общая статистика</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                  <span className="text-slate-300">Финансовые данные</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                  <span className="text-slate-300">
                    {type === 'radio' ? 'Заявки артистов' : 'Рекламные кампании'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                  <span className="text-slate-300">Графики и тренды</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 p-6 bg-[#0a0a14]/95 backdrop-blur-xl border-t border-white/10">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
              >
                Отмена
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Экспорт...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Скачать {formats.find(f => f.id === selectedFormat)?.name}
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}