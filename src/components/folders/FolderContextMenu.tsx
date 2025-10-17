import { FolderPlus, Pencil, Pin, Info, Upload } from 'lucide-react';
import { ContextMenu } from '../ui/ContextMenu';
import { type Category } from '../../types';

interface ContextMenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  separator?: boolean;
  shortcut?: string;
}

interface FolderContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  category: Category | null;
  onClose: () => void;
  onNewFolder: (parentId: string) => void;
  onUploadFiles: (categoryId: string) => void;
  onRename: (categoryId: string) => void;
  onTogglePin: (categoryId: string, isPinned: boolean) => void;
  onProperties: (categoryId: string) => void;
}

export function FolderContextMenu({
  isOpen,
  position,
  category,
  onClose,
  onNewFolder,
  onUploadFiles,
  onRename,
  onTogglePin,
  onProperties,
}: FolderContextMenuProps) {
  if (!category) return null;

  const isPinned = category.isPinned || false;

  const menuItems: ContextMenuItem[] = [
    {
      id: 'new-folder',
      label: 'New Folder',
      icon: FolderPlus,
      onClick: () => onNewFolder(category.id),
    },
    {
      id: 'upload-files',
      label: 'Upload Files',
      icon: Upload,
      onClick: () => onUploadFiles(category.id),
      separator: true,
    },
    {
      id: 'rename',
      label: 'Rename',
      icon: Pencil,
      onClick: () => onRename(category.id),
      shortcut: 'F2',
    },
    {
      id: 'pin',
      label: isPinned ? 'Unpin' : 'Pin',
      icon: Pin,
      onClick: () => onTogglePin(category.id, !isPinned),
      shortcut: 'Ctrl+P',
      separator: true,
    },
    {
      id: 'properties',
      label: 'Properties',
      icon: Info,
      onClick: () => onProperties(category.id),
    },
  ];

  return (
    <ContextMenu
      isOpen={isOpen}
      position={position}
      onClose={onClose}
    >
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            item.onClick();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <item.icon className="w-4 h-4" />
          <span className="flex-1 text-left">{item.label}</span>
          {item.shortcut && (
            <span className="text-xs text-gray-400">{item.shortcut}</span>
          )}
        </button>
      ))}
    </ContextMenu>
  );
}
