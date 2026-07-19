import React, { useRef, useEffect } from 'react';

interface InputBarProps {
    inputValue: string;
    setInputValue: (value: string) => void;
    onSubmit: (text: string) => void;
    placeholder?: string; // Optional placeholder prop
}

const InputBar: React.FC<InputBarProps> = ({ inputValue, setInputValue, onSubmit, placeholder = "Décrivez votre recherche ou collez un texte" }) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const handleSubmit = (event: React.FormEvent | React.KeyboardEvent) => {
        event.preventDefault();
        if (textareaRef.current && inputValue.trim()) {
            onSubmit(inputValue);
            setInputValue("");
        }
    };

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "50px"; // Reset height to recalculate
            const newHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${newHeight}px`;
        }
    };

    useEffect(() => {
        adjustTextareaHeight(); // Adjust height when inputValue changes
    }, [inputValue]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSubmit(e);
        }
    };

    return (
        <div className="flex w-full flex-col gap-1.5 rounded-[12px] border-gray-300 border-[1px] p-0.5 bg-card shadow-sm">
            <div className="flex items-end gap-1.5 md:gap-2">
                {/* Zone de texte */}
                <div className="flex font-light min-w-0 flex-1 flex-col">
                    <textarea
                        ref={textareaRef}
                        id="prompt-textarea"
                        placeholder={placeholder} // Use the placeholder prop
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)} // Controlled input
                        onKeyDown={handleKeyDown}
                        className="resize-none border-0 bg-transparent px-0 py-3 text-primary placeholder-secondary focus:outline-none"
                        style={{
                            maxHeight: "150px",
                            overflow: "auto",
                            height: "50px",
                            marginLeft: "10px",
                            whiteSpace: "pre-wrap",
                            color: "var(--primary)",
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default InputBar;
