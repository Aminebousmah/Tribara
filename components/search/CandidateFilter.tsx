"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, SlidersHorizontal, X, Plus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { Filter, FilterCondition, FilterGroup, AdvancedFilter, SortOption } from "@/public/types"
import SortButton from "@/components/search/sort-button"
import { CardContent } from "@/components/ui/card"

/**
 * Helper: a condition is valid if it has a non-empty field & value
 */
const isValidCondition = (cond: FilterCondition) => {
    // For numeric fields, "0" is valid, so we only treat empty strings as invalid
    if (cond.field.trim() === "") return false
    // cond.value could be a number or string. Convert to string, check if empty.
    return cond.value.toString().trim() !== ""
}

interface CandidateFilterProps {
    filters: Filter
    sortBy: SortOption
    onFilterChange: (filters: Filter) => void
    onSortChange: (sortBy: SortOption) => void // Fixed type here
}

const CandidateFilter: React.FC<CandidateFilterProps> = ({ filters, sortBy, onFilterChange, onSortChange }) => {
    const [tempAdvancedFilter, setTempAdvancedFilter] = useState<AdvancedFilter>(filters.advancedFilter || { groups: [] })

    const handleFilterChange = (newFilters: Partial<Filter>) => {
        onFilterChange({ ...filters, ...newFilters })
    }

    const handleSortChange = (newSortBy: SortOption) => {
        onSortChange(newSortBy);
    };

    const addFilterCondition = () => {
        setTempAdvancedFilter((prev) => ({
            groups: [
                ...prev.groups,
                {
                    operator: "AND",
                    conditions: [{ field: "", operator: "equals", value: "" }],
                },
            ],
        }))
    }

    const removeTempFilterCondition = (groupIndex: number) => {
        setTempAdvancedFilter((prev) => ({
            groups: prev.groups.filter((_, i) => i !== groupIndex),
        }))
    }

    const updateTempFilterCondition = (groupIndex: number, updates: Partial<FilterCondition>) => {
        setTempAdvancedFilter((prev) => ({
            groups: prev.groups.map((group, i) =>
                i === groupIndex
                    ? {
                        ...group,
                        conditions: group.conditions.map((cond, cIndex) => (cIndex === 0 ? { ...cond, ...updates } : cond)),
                    }
                    : group,
            ),
        }))
    }

    const applyAdvancedFilter = () => {
        const cleanedGroups: FilterGroup[] = tempAdvancedFilter.groups
            .map((group) => {
                const validConditions = group.conditions.filter(isValidCondition)
                return { ...group, conditions: validConditions }
            })
            .filter((group) => group.conditions.length > 0)

        const validatedAdvancedFilter: AdvancedFilter = {
            ...tempAdvancedFilter,
            groups: cleanedGroups,
        }

        handleFilterChange({ advancedFilter: validatedAdvancedFilter })
    }

    const isNumericField = (field: string) => {
        return field === "relevant_experience" || field === "score"
    }

    const getOperatorLabel = (operator: string) => {
        switch (operator) {
            case "equals":
                return "égal à"
            case "contains":
                return "contient"
            case "notContains":
                return "ne contient pas"
            case "greaterThan":
                return "supérieur à"
            case "lessThan":
                return "inférieur à"
            default:
                return operator
        }
    }

    const getFieldLabel = (field: string) => {
        switch (field) {
            case "general.name":
                return "Nom"
            case "relevant_experience":
                return "Années d'expérience"
            case "general.location":
                return "Localisation"
            case "skills.all":
                return "Compétences"
            case "score":
                return "Score"
            case "education.degree":
                return "Diplôme"
            case "education.institution":
                return "Établissement"
            case "experiences.company":
                return "Entreprise"
            case "experiences.position":
                return "Poste"
            default:
                return field
        }
    }

    return (
            <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Rechercher par mot-clé..."
                            value={filters.keyword}
                            onChange={(e) => handleFilterChange({ keyword: e.target.value })}
                            className="pl-10 h-12 border-gray-300 shadow-sm rounded-lg"
                        />
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <motion.div
                                whileHover={{scale: 1.05}}
                                whileTap={{scale: 0.95}}
                            >
                                <Button
                                    variant="outline"
                                    className="h-12 flex items-center justify-center border-gray-300 hover:border-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-all duration-200"
                                >
                                    <SlidersHorizontal className="mr-2 h-4 w-4"/>
                                    Filtres avancés
                                </Button>
                            </motion.div>
                        </PopoverTrigger>
                        <PopoverContent className="w-90 p-4 border border-black rounded-lg shadow-md">
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {tempAdvancedFilter.groups.map((group, groupIndex) => (
                                        <motion.div
                                            key={groupIndex}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.2 }}
                                            className=" rounded-lg"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Select
                                                    value={group.conditions[0].field}
                                                    onValueChange={(value) =>
                                                        updateTempFilterCondition(groupIndex, { field: value })
                                                    }
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Champ" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="general.name">Nom</SelectItem>
                                                        <SelectItem value="relevant_experience">Années d'Expérience</SelectItem>
                                                        <SelectItem value="general.location">Localisation</SelectItem>
                                                        <SelectItem value="skills.all">Compétences</SelectItem>
                                                        <SelectItem value="score">Score</SelectItem>
                                                        <SelectItem value="education.degree">Diplôme</SelectItem>
                                                        <SelectItem value="education.institution">Établissement</SelectItem>
                                                        <SelectItem value="experiences.company">Entreprise</SelectItem>
                                                        <SelectItem value="experiences.position">Poste</SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <Select
                                                    value={group.conditions[0].operator}
                                                    onValueChange={(value) =>
                                                        updateTempFilterCondition(groupIndex, {
                                                            operator: value as FilterCondition["operator"],
                                                        })
                                                    }
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Opérateur" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="equals">Égal à</SelectItem>
                                                        {!isNumericField(group.conditions[0].field) && (
                                                            <>
                                                                <SelectItem value="contains">Contient</SelectItem>
                                                                <SelectItem value="notContains">Ne contient pas</SelectItem>
                                                            </>
                                                        )}
                                                        {isNumericField(group.conditions[0].field) && (
                                                            <>
                                                                <SelectItem value="greaterThan">Supérieur à</SelectItem>
                                                                <SelectItem value="lessThan">Inférieur à</SelectItem>
                                                            </>
                                                        )}
                                                    </SelectContent>
                                                </Select>

                                                <Input
                                                    value={group.conditions[0].value}
                                                    onChange={(e) =>
                                                        updateTempFilterCondition(groupIndex, {
                                                            value: e.target.value,
                                                        })
                                                    }
                                                    placeholder="Valeur"
                                                    type={isNumericField(group.conditions[0].field) ? "number" : "text"}
                                                    className="w-full"
                                                />

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeTempFilterCondition(groupIndex)}
                                                    className="h-10 w-10"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <div className="flex space-x-2 w-full">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex-grow"
                                    >
                                        <Button
                                            variant="outline"
                                            onClick={addFilterCondition}
                                            className="w-full h-12 transition-all duration-200 border-gray-300 hover:border-gray-500 hover:bg-gray-100 active:bg-gray-200"
                                        >
                                            <Plus className="h-4 w-4 mr-2" /> Ajouter un filtre
                                        </Button>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex-grow"
                                    >
                                        <Button
                                            onClick={applyAdvancedFilter}
                                            className="w-full h-12 bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 transition-all duration-200"
                                        >
                                            Appliquer les filtres
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <SortButton sortBy={sortBy} onSortChange={handleSortChange} />
                </div>
                <div className="flex flex-wrap gap-2">
                    {filters.keyword && (
                        <Badge variant="secondary" className="px-3 py-1 rounded-full">
                            Mot-clé : {filters.keyword}
                            <X className="ml-2 h-4 w-4 cursor-pointer"
                               onClick={() => handleFilterChange({keyword: ""})}/>
                        </Badge>
                    )}

                    {filters.advancedFilter.groups.map((group, index) => {
                        const condition = group.conditions[0]
                        return (
                            <Badge key={index} variant="secondary" className="px-3 py-1 rounded-full">
                                {getFieldLabel(condition.field)} {getOperatorLabel(condition.operator)} {condition.value}
                                <X
                                    className="ml-2 h-4 w-4 cursor-pointer"
                                    onClick={() => {
                                        const newGroups = [...filters.advancedFilter.groups]
                                        newGroups.splice(index, 1)
                                        handleFilterChange({
                                            advancedFilter: { groups: newGroups },
                                        })
                                    }}
                                />
                            </Badge>
                        )
                    })}
                </div>
            </CardContent>
    )
}

export default CandidateFilter

