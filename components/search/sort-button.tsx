import React from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, Check } from "lucide-react";
import { motion } from "framer-motion";
import type { SortOption } from "@/public/types";

// Helper to display field and direction labels
const fieldLabels: { [key: string]: string } = {
    score: "Score",
    relevant_experience: "Expérience pertinente",
};

const directionLabels = {
    asc: "croissant",
    desc: "décroissant",
};

const getSortLabel = (field: string, direction: "asc" | "desc") =>
    `${fieldLabels[field]} (${directionLabels[direction]})`;

interface SortButtonProps {
    sortBy: SortOption;
    onSortChange: (sortBy: SortOption) => void;
}

const SortButton: React.FC<SortButtonProps> = ({ sortBy, onSortChange }) => {
    return (
        <div className="relative">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            variant="outline"
                            className="h-12 flex items-center justify-center border-gray-300 hover:border-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-all duration-200"
                        >
                            <ArrowUpDown className="mr-2 h-4 w-4" />
                            Trier par
                        </Button>
                    </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className=" bg-white border rounded-lg shadow-md w-110">
                    {Object.keys(fieldLabels).map((field) =>
                        ["desc", "asc"].map((direction) => (
                            <DropdownMenuItem
                                key={`${field}-${direction}`}
                                onClick={() =>
                                    onSortChange({
                                        field,
                                        direction: direction as "asc" | "desc",
                                    })
                                }
                                className={`flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 transition-all duration-200 ${
                                    sortBy.field === field &&
                                    sortBy.direction === direction
                                        ? "bg-gray-100"
                                        : ""
                                }`}
                            >
                                {getSortLabel(field, direction as "asc" | "desc")}
                                {sortBy.field === field &&
                                    sortBy.direction === direction && (
                                        <Check className="h-4 w-4 text-blue-500" />
                                    )}
                            </DropdownMenuItem>
                        ))
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default SortButton;
