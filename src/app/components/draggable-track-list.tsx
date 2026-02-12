/**
 * DRAGGABLE TRACK LIST - Drag & drop сортировка треков/видео
 * Используется в плейлистах для изменения порядка
 */

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import {
  GripVertical, Play, Pause, Music2, Heart, TrendingUp,
  Check, ArrowUpDown, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const ITEM_TYPE = 'TRACK';

interface TrackItem {
  id: string | number;
  title: string;
  artist?: string;
  cover?: string;
  duration?: string;
  plays?: number;
  likes?: number;
}

interface DragItem {
  index: number;
  id: string | number;
}

interface DraggableTrackProps {
  track: TrackItem;
  index: number;
  moveTrack: (dragIndex: number, hoverIndex: number) => void;
  isPlaying?: boolean;
  onPlay?: (id: string | number) => void;
}

function DraggableTrack({ track, index, moveTrack, isPlaying, onPlay }: DraggableTrackProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: () => ({ index, id: track.id }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    hover(item: DragItem, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveTrack(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
        isDragging
          ? 'opacity-40 bg-purple-500/10 border-purple-500/30 scale-[0.98]'
          : isOver
          ? 'bg-white/[0.06] border-purple-500/20'
          : 'bg-white/[0.03] border-white/10 hover:border-white/20'
      }`}
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      {/* Drag Handle */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <GripVertical className="w-4 h-4 text-slate-600" />
        <span className="text-xs text-slate-600 font-mono w-5 text-center">{index + 1}</span>
      </div>

      {/* Cover */}
      {track.cover ? (
        <img
          src={track.cover}
          alt={track.title}
          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
          <Music2 className="w-5 h-5 text-slate-500" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{track.title}</p>
        {track.artist && (
          <p className="text-[10px] text-slate-500 truncate">{track.artist}</p>
        )}
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-3 text-[10px] text-slate-500">
        {track.plays !== undefined && (
          <span className="flex items-center gap-1">
            <Play className="w-2.5 h-2.5" />{(track.plays / 1000).toFixed(1)}K
          </span>
        )}
        {track.likes !== undefined && (
          <span className="flex items-center gap-1">
            <Heart className="w-2.5 h-2.5" />{track.likes}
          </span>
        )}
      </div>

      {/* Duration */}
      {track.duration && (
        <span className="text-xs text-slate-500 flex-shrink-0">{track.duration}</span>
      )}

      {/* Play Button */}
      {onPlay && (
        <button
          onClick={(e) => { e.stopPropagation(); onPlay(track.id); }}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors flex-shrink-0"
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 text-purple-400" />
          ) : (
            <Play className="w-3.5 h-3.5 text-slate-300 ml-0.5" />
          )}
        </button>
      )}
    </div>
  );
}

interface DraggableTrackListProps {
  tracks: TrackItem[];
  onReorder: (newOrder: TrackItem[]) => void;
  playingId?: string | number | null;
  onPlay?: (id: string | number) => void;
  title?: string;
  subtitle?: string;
}

// Detect touch device
function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function DraggableTrackList({
  tracks,
  onReorder,
  playingId,
  onPlay,
  title = 'Порядок треков',
  subtitle,
}: DraggableTrackListProps) {
  const [items, setItems] = useState(tracks);
  const [hasChanged, setHasChanged] = useState(false);
  const [saving, setSaving] = useState(false);

  const moveTrack = useCallback((dragIndex: number, hoverIndex: number) => {
    setItems((prev) => {
      const newItems = [...prev];
      const [removed] = newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, removed);
      return newItems;
    });
    setHasChanged(true);
  }, []);

  const handleSave = useCallback(() => {
    setSaving(true);
    setTimeout(() => {
      onReorder(items);
      setHasChanged(false);
      setSaving(false);
      toast.success('Порядок треков сохранён');
    }, 500);
  }, [items, onReorder]);

  const handleReset = useCallback(() => {
    setItems(tracks);
    setHasChanged(false);
  }, [tracks]);

  const Backend = isTouchDevice() ? TouchBackend : HTML5Backend;
  const backendOptions = isTouchDevice() ? { enableMouseEvents: true } : undefined;

  return (
    <DndProvider backend={Backend} options={backendOptions}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-purple-400" />
              {title}
            </h3>
            {subtitle && <p className="text-[10px] text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <AnimatePresence>
            {hasChanged && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-2"
              >
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Отменить
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Hint */}
        <p className="text-[10px] text-slate-600 flex items-center gap-1.5">
          <GripVertical className="w-3 h-3" />
          Перетащите треки для изменения порядка
        </p>

        {/* Track List */}
        <div className="space-y-1.5">
          {items.map((track, index) => (
            <DraggableTrack
              key={track.id}
              track={track}
              index={index}
              moveTrack={moveTrack}
              isPlaying={playingId === track.id}
              onPlay={onPlay}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}
