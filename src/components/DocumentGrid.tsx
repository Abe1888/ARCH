import { FileText } from 'lucide-react';
import { type Document } from '../types';
import { useDocumentStore } from '../store/useDocumentStore';
import { FolderCard } from './FolderCard';
import { FolderStyleDocumentCard } from './FolderStyleDocumentCard';

interface DocumentGridProps {
  documents: Document[];
  use3DView?: boolean;
}

export const DocumentGrid: React.FC<DocumentGridProps> = ({ documents, use3DView = false }) => {
  const { setPreviewDocument, setViewMode, toggleFavorite, previewDocument } = useDocumentStore();

  const isDocumentSelected = (docId: string) => previewDocument?.id === docId;


  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <FileText className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium">No documents found</p>
        <p className="text-sm">Try adjusting your filters or search query</p>
      </div>
    );
  }

  if (use3DView) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 py-8">
        {documents.map((doc) => (
          <FolderCard
            key={doc.id}
            document={doc}
            onSelect={() => {
              setViewMode('list');
              setPreviewDocument(doc);
            }}
            onToggleFavorite={() => toggleFavorite(doc.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-8 gap-y-20 justify-items-center auto-rows-max">
        {documents.map((doc, index) => (
          <FolderStyleDocumentCard
            key={doc.id}
            document={doc}
            index={index}
            isSelected={isDocumentSelected(doc.id)}
            onSelect={() => {
              setViewMode('list');
              setPreviewDocument(doc);
            }}
            onToggleFavorite={() => toggleFavorite(doc.id)}
          />
        ))}
      </div>
    </div>
  );
};
