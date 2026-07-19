import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
    id: string;
    children: React.ReactNode;
}

export const SortableItem: React.FC<SortableItemProps> = ({ id, children }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
    };

    // Extraire la catégorie depuis l'id
    const [category] = id.split('::');

    // Fonction pour choisir la couleur de fond en fonction de la catégorie
    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'mustHave':
                return 'bg-red-100';
            case 'niceToHave':
                return 'bg-blue-100';
            case 'additional':
                return 'bg-green-100';
            default:
                return 'bg-gray-100';
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`p-3 rounded-lg shadow-sm cursor-move border 
        ${isDragging ? 'opacity-50' : 'border-transparent'}
        ${getCategoryColor(category)}
        hover:border-blue-200 transition-colors duration-200`}
        >
            {children}
        </div>
    );
};
