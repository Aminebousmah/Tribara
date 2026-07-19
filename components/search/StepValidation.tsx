import React, {useState, useEffect, useRef} from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay,
    useDroppable,
    DragOverEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { AddItemForm } from './AddItemForm';
import {Trash2} from "lucide-react";

// Separate trash bin component
const TrashBin = ({ isOver }: { isOver: boolean }) => {
    const { setNodeRef } = useDroppable({
        id: 'trash-bin'
    });

    return (
        <div
            ref={setNodeRef}
            className={`flex items-center justify-center rounded-[12px] transition-colors duration-200 ${
                isOver ? 'bg-red-700' : 'bg-red-500 hover:bg-red-600'
            }`}
            style={{
                height: '56px',
                minWidth: '56px',
            }}
        >
            <Trash2 className="h-6 w-6 text-white" />
        </div>
    );
};

const DroppableContainer = ({ id, children }: { id: string; items: string[]; children: React.ReactNode }) => {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className="h-full max-h-[400px] overflow-y-auto">
            {children}
        </div>
    );
};

interface KeywordsCreateProps {
    result?: {
        keywords?: {
            competencies?: {
                must_have?: string[];
                nice_to_have?: string[];
                complementary?: string[];
            };
        };
    };
    onCollectKeywords: (keywords: {
        mustHave: string[];
        niceToHave: string[];
        additional: string[];
    }) => void;
}

const StepValidation: React.FC<KeywordsCreateProps> = ({ result = {}, onCollectKeywords }) => {
    const [items, setItems] = useState({
        mustHave: result?.keywords?.competencies?.must_have || [],
        niceToHave: result?.keywords?.competencies?.nice_to_have || [],
        additional: result?.keywords?.competencies?.complementary || [],
    });
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isOverTrash, setIsOverTrash] = useState(false);

    const prevItemsRef = useRef(items);

    useEffect(() => {
        if (
            prevItemsRef.current.mustHave !== items.mustHave ||
            prevItemsRef.current.niceToHave !== items.niceToHave ||
            prevItemsRef.current.additional !== items.additional
        ) {
            onCollectKeywords(items);
            prevItemsRef.current = items;
        }
    }, [items, onCollectKeywords]);

    const handleAddItem = (category: 'mustHave' | 'niceToHave' | 'additional', item: string) => {
        setItems((prev) => ({
            ...prev,
            [category]: [...prev[category], item],
        }));
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const previousItems = useRef(items);

    useEffect(() => {
        if (JSON.stringify(items) !== JSON.stringify(previousItems.current)) {
            onCollectKeywords(items);
            previousItems.current = items;
        }
    }, [items, onCollectKeywords]);

    const handleDragStart = (event: DragEndEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        setIsOverTrash(event.over?.id === 'trash-bin');
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setIsOverTrash(false);

        if (!over) return;

        // Handle dropping on trash bin
        if (over.id === 'trash-bin') {
            const [activeCategory, activeItemContent] = (active.id as string).split('::');
            setItems((prev) => ({
                ...prev,
                [activeCategory]: prev[activeCategory as keyof typeof items].filter(
                    (item) => item !== activeItemContent
                ),
            }));
            return;
        }

        // Handle normal sorting/moving between columns
        const activeId = active.id as string;
        const [activeCategory, activeItemContent] = activeId.split('::');

        let overCategory;
        if (over.id === 'mustHave' || over.id === 'niceToHave' || over.id === 'additional') {
            overCategory = over.id;
        } else {
            const [overCat] = (over.id as string).split('::');
            overCategory = overCat;
        }

        if (activeCategory === overCategory) {
            const oldIndex = items[activeCategory as keyof typeof items].indexOf(activeItemContent);
            const newIndex =
                over.id === overCategory
                    ? items[overCategory as keyof typeof items].length
                    : items[overCategory as keyof typeof items].indexOf((over.id as string).split('::')[1]);

            setItems((prev) => ({
                ...prev,
                [activeCategory]: arrayMove(prev[activeCategory as keyof typeof items], oldIndex, newIndex),
            }));
        } else {
            setItems((prev) => {
                const sourceItems = [...prev[activeCategory as keyof typeof items]];
                const destItems = [...prev[overCategory as keyof typeof items]];

                const itemToMove = sourceItems.find((item) => item === activeItemContent);
                if (!itemToMove) return prev;

                return {
                    ...prev,
                    [activeCategory]: sourceItems.filter((item) => item !== activeItemContent),
                    [overCategory]: [...destItems, itemToMove],
                };
            });
        }
    };

    const renderColumn = (title: string, category: 'mustHave' | 'niceToHave' | 'additional', bgColor: string) => (
        <Card className={`h-[400px] flex flex-col overflow-hidden border border-dashed border-gray-500 rounded-none ${bgColor}`}>
            <CardHeader className="py-3 px-4 border-dashed border-gray-500">
                <h3 className="text-lg font-semibold text-center truncate text-gray-800">{title}</h3>
            </CardHeader>
            <CardContent className="flex-1 p-3 overflow-auto">
                <DroppableContainer id={category} items={items[category]}>
                    <SortableContext
                        items={items[category].map((item) => `${category}::${item}`)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-2">
                            {items[category].map((item) => (
                                <SortableItem key={`${category}::${item}`} id={`${category}::${item}`}>
                                    {item}
                                </SortableItem>
                            ))}
                        </div>
                    </SortableContext>
                </DroppableContainer>
            </CardContent>
        </Card>
    );

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="w-full max-w-6xl mx-auto p-4">
                <div className="flex gap-3 items-center">
                    <div className="flex-grow">
                        <AddItemForm onAddItem={handleAddItem} />
                    </div>
                    <TrashBin isOver={isOverTrash} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mt-3 border border-dashed border-gray-500">
                    {renderColumn('Critères essentiels', 'mustHave', 'bg-white')}
                    {renderColumn('Compétences appréciées', 'niceToHave', 'bg-white')}
                    {renderColumn('Atouts supplémentaires', 'additional', 'bg-white')}
                </div>

                <DragOverlay>
                    {activeId ? (
                        <div className="p-2 bg-gray-300 shadow-md border border-dashed border-gray-700">
                            {activeId.split('::')[1]}
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
};

export default StepValidation;