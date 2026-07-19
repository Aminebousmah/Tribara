import React, {useMemo, useState} from "react";
import CandidateFilter from "@/components/search/CandidateFilter";
import CandidateProfiles from "@/components/search/CandidateProfiles";
import { Candidate, Filter, SortOption } from "@/public/types";
import { motion } from "framer-motion";

type StepResultsProps = {
    filteredCandidates: Candidate[];
    onFilterChange: (filters: Filter) => void;
    handleCandidateSelect: (candidate: Candidate) => void;
    remainingToProcess: number;
};

const StepResults: React.FC<StepResultsProps> = ({
                                                     filteredCandidates,
                                                     onFilterChange,
                                                     remainingToProcess,
                                                     handleCandidateSelect,
                                                 }) => {
    const [filters, setFilters] = useState<Filter>({
        keyword: "",
        advancedFilter: { groups: [] },
        sortBy: { field: "score", direction: "desc" }, // Default sorting
    });

    /**
     * Handle filter changes from the CandidateFilter component.
     */
    const handleFilterChange = (newFilters: Filter) => {
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    /**
     * Handle sort changes from the CandidateFilter component.
     */
    const handleSortChange = (newSortBy: SortOption) => {
        const updatedFilters = { ...filters, sortBy: newSortBy };
        setFilters(updatedFilters);
        onFilterChange(updatedFilters);
    };

    const sortedCandidates = useMemo(() => {
        const { field, direction } = filters.sortBy;

        return [...filteredCandidates].sort((a, b) => {
            let comparison = 0;

            switch (field) {
                case "score":
                    comparison = (b.data.score || 0) - (a.data.score || 0);
                    break;

                case "relevant_experience":
                    comparison =
                        (b.data.relevant_experience || 0) -
                        (a.data.relevant_experience || 0);
                    break;

                case "education":
                    const educationOrder = ["bachelor", "master", "phd"];
                    const aEdu = Math.max(
                        ...a.data.education.map((edu) =>
                            educationOrder.indexOf(edu.degree.toLowerCase())
                        )
                    );
                    const bEdu = Math.max(
                        ...b.data.education.map((edu) =>
                            educationOrder.indexOf(edu.degree.toLowerCase())
                        )
                    );
                    comparison = bEdu - aEdu;
                    break;

                default:
                    break;
            }

            return direction === "desc" ? comparison : -comparison;
        });
    }, [filteredCandidates, filters.sortBy]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col h-full w-full bg-gray-50"
        >
            {/* Sticky top bar with CandidateFilter */}
            <div className="bg-white shadow-sm z-10 sticky top-0">
                <CandidateFilter
                    filters={filters}
                    sortBy={filters.sortBy}
                    onFilterChange={handleFilterChange}
                    onSortChange={handleSortChange}
                />
            </div>

            {/* Main content area */}
            <div className="flex-grow overflow-y-auto bg-white">
                {filteredCandidates.length > 0 ? (
                    <CandidateProfiles
                        candidates={sortedCandidates}
                        onCandidateSelect={handleCandidateSelect}
                        remainingToProcess={remainingToProcess}
                    />
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center h-full text-gray-600"
                    >
                        <p className="text-lg font-medium">
                            Aucun candidat ne correspond aux filtres appliqués.
                        </p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default StepResults;
