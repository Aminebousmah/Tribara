import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import InputBar from '@/components/search/InputBar';
import { Autocomplete, TextField } from '@mui/material';
import { Plus } from 'lucide-react';

type Category = 'mustHave' | 'niceToHave' | 'additional';

interface AddItemFormProps {
    onAddItem: (category: Category, item: string) => void;
}

const categories = [
    { label: 'Critères essentiels', value: 'mustHave' },
    { label: 'Compétences appréciées', value: 'niceToHave' },
    { label: 'Atouts supplémentaires', value: 'additional' },
];

export const AddItemForm: React.FC<AddItemFormProps> = ({ onAddItem }) => {
    const [newItem, setNewItem] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(categories[0]);

    const handleSubmit = (text: string) => {
        if (text.trim()) {
            onAddItem(selectedCategory.value as Category, text.trim());
            setNewItem('');
        }
    };

    return (
        <div className="flex gap-3 items-center">
            <div className="flex-grow">
                <InputBar
                    inputValue={newItem}
                    setInputValue={setNewItem}
                    onSubmit={handleSubmit}
                    placeholder="Nouveau critère"
                />
            </div>

            <Autocomplete
                value={selectedCategory}
                onChange={(event, newValue) => {
                    if (newValue) setSelectedCategory(newValue);
                }}
                options={categories}
                disableClearable
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Catégorie"
                        placeholder="Choisissez une catégorie"
                        variant="outlined"
                        sx={{
                            backgroundColor: 'white',
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                '& fieldset': {
                                    borderColor: '#d1d5db',
                                    borderWidth: '1px',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#bdbdbd',
                                    borderWidth: '1.5px',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#3b82f6',
                                    borderWidth: '2px',
                                },
                            },
                            width: { xs: '250px' },
                        }}
                    />
                )}
            />

            <Button
                onClick={() => handleSubmit(newItem)}
                type="button"
                className="flex items-center justify-center rounded-[12px] bg-blue-500 hover:bg-blue-600 px-4"
                style={{
                    height: '56px',
                    minWidth: '56px',
                }}
            >
                <Plus className="h-6 w-6 text-white" />
            </Button>
        </div>
    );
};