import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PromptExamplesProps {
    onPromptClick: (text: string) => void;
}

export default function PromptExamples({ onPromptClick }: PromptExamplesProps) {
    const promptExamples = [
        {
            icon: "💻",
            text: "Je recherche un data engineer spécialisé dans l'IA",
        },
        {
            icon: "📚",
            text: "Expert comptable avec un bon niveau en anglais",
        },
        {
            icon: "🌍",
            text: "J'ai besoin d'un community manager instagram",
        },
    ];

    return (
        <div className="container mx-auto flex flex-col items-center justify-center mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-center">
                {promptExamples.map((example, index) => (
                    <Card
                        key={index}
                        className="w-full max-w-[15rem] transition-transform transform hover:scale-105 hover:bg-accent hover:text-accent-foreground" // Hover effects on the whole card
                    >
                        <CardContent className="p-3">
                            <Button
                                variant="ghost"
                                className="w-full h-auto flex flex-col items-center justify-center space-y-2 text-center hover:bg-transparent hover:text-inherit focus:bg-transparent focus:text-inherit active:bg-transparent" // Override button hover
                                onClick={() => onPromptClick(example.text)}
                            >
                                <span className="text-2xl">{example.icon}</span>
                                <span className="text-sm font-normal text-secondary-foreground">
                                    {example.text}
                                </span>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
