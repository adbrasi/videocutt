import React, { useState } from 'react';
import { Plus, X, Tag as TagIcon } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { useAppStore } from '@/store';
import { Tag } from '@/types';
import { generateId } from '@/utils';

export const TagManager: React.FC = () => {
  const { tags, addTag, removeTag } = useAppStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      const tag: Tag = {
        id: generateId(),
        name: newTagName.trim(),
        color: newTagColor,
      };
      addTag(tag);
      setNewTagName('');
      setNewTagColor('#3b82f6');
      setIsCreating(false);
      setShowColorPicker(false);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setNewTagName('');
    setNewTagColor('#3b82f6');
    setShowColorPicker(false);
  };

  return (
    <div className="card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <TagIcon className="w-6 h-6 text-primary-400" />
          <h2 className="text-xl font-bold text-gray-100">Tags</h2>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Tag
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium"
            style={{ backgroundColor: tag.color + '20', color: tag.color }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: tag.color }}
            />
            {tag.name}
            <button
              onClick={() => removeTag(tag.id)}
              className="ml-1 hover:bg-red-500/20 rounded-full p-1 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {isCreating && (
          <div className="flex items-center gap-2 p-2 bg-gray-700 rounded-lg animate-scale-in">
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-6 h-6 rounded-full border-2 border-gray-600"
                style={{ backgroundColor: newTagColor }}
              />
              {showColorPicker && (
                <div className="absolute top-8 left-0 z-50 p-2 bg-gray-800 rounded-lg shadow-lg border border-gray-600">
                  <HexColorPicker color={newTagColor} onChange={setNewTagColor} />
                </div>
              )}
            </div>
            
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Tag name"
              className="input text-sm w-32"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateTag();
                if (e.key === 'Escape') handleCancel();
              }}
            />
            
            <button
              onClick={handleCreateTag}
              disabled={!newTagName.trim()}
              className="btn-primary text-sm px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
            
            <button
              onClick={handleCancel}
              className="btn-secondary text-sm px-2 py-1"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {tags.length === 0 && !isCreating && (
        <p className="text-gray-400 text-sm">
          No tags yet. Create tags to organize your videos into folders during export.
        </p>
      )}
    </div>
  );
};