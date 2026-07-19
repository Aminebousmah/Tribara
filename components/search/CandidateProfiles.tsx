"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Candidate } from "@/public/types"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin } from "lucide-react"

type CandidateProfilesProps = {
    candidates: Candidate[]
    onCandidateSelect: (candidate: Candidate) => void
    remainingToProcess?: number
}

const CandidateProfiles: React.FC<CandidateProfilesProps> = ({
                                                                 candidates,
                                                                 onCandidateSelect,
                                                                 remainingToProcess = 0,
                                                             }) => {
    const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
    const [animatedScores, setAnimatedScores] = useState<{ [key: string]: number }>({})

    useEffect(() => {
        const newAnimatedScores: Record<string, number> = {}

        candidates.forEach((candidate) => {
            const name = candidate.data?.general?.name
            const score = candidate.data?.score
            if (name && score !== undefined && animatedScores[name] !== score) {
                newAnimatedScores[name] = score
            }
        })

        if (Object.keys(newAnimatedScores).length > 0) {
            setAnimatedScores((prev) => ({ ...prev, ...newAnimatedScores }))
        }
    }, [candidates, animatedScores])

    const handleCardClick = (candidate: Candidate) => {
        const name = candidate.data?.general?.name
        if (name) {
            setSelectedCandidate(name)
            onCandidateSelect(candidate)
        }
    }

    const getScoreColor = (score: number) => {
        const hue = Math.min(score * 1.2, 120) // 0 to 120 (red to green)
        return `hsl(${hue}, 80%, 45%)` // Adjust saturation and lightness as needed
    }

    return (
        <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-4">
                <AnimatePresence>
                    {candidates.map((candidate, index) => {
                        const general = candidate.data?.general
                        if (!general) return null

                        const name = general.name
                        const score = candidate.data?.score
                        const animatedScore = animatedScores[name] || 0
                        const isCandidateLoading = score === undefined

                        return (
                            <motion.div
                                key={name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <Card
                                    onClick={() => handleCardClick(candidate)}
                                    className={`cursor-pointer border-2 transition-all duration-300 hover:shadow-sm ${
                                        selectedCandidate === name
                                            ? "ring-2 ring-blue-400 border-blue-400"
                                            : "border-gray-300 hover:border-blue-400"
                                    } h-[220px] flex flex-col overflow-hidden group`}
                                >
                                    <CardContent className="p-4 flex flex-col justify-between h-full relative">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                                                    {general.name}
                                                </h3>
                                                <p className="text-sm text-gray-600">{general.title}</p>
                                            </div>
                                            {!isCandidateLoading && (
                                                <div className="relative w-16 h-16 flex-shrink-0">
                                                    <svg className="w-16 h-16" viewBox="0 0 64 64">
                                                        <circle
                                                            className="text-gray-200"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                            fill="none"
                                                            cx="32"
                                                            cy="32"
                                                            r="28"
                                                        />
                                                        <circle
                                                            className="transition-all duration-1000 ease-out"
                                                            stroke={getScoreColor(animatedScore)}
                                                            strokeWidth="4"
                                                            strokeLinecap="round"
                                                            fill="none"
                                                            strokeDasharray={`${(animatedScore / 100) * 175.92} 175.92`}
                                                            transform="rotate(-90 32 32)"
                                                            cx="32"
                                                            cy="32"
                                                            r="28"
                                                        />
                                                    </svg>
                                                    <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-800">
                                                        {Math.round(animatedScore)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2 mb-2">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                                {general.location || "Non spécifié"}
                                            </div>
                                        </div>
                                        <p className="text-sm line-clamp-3 text-gray-700">{general.summary}</p>
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-green-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out" />
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
                {remainingToProcess > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <Card className="border-gray-300 h-[220px]">
                            <CardContent className="p-4 flex flex-col justify-between h-full animate-pulse">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="space-y-2 flex-grow">
                                        <div className="w-2/3 h-5 bg-gray-300 rounded" />
                                        <div className="w-1/2 h-4 bg-gray-200 rounded" />
                                    </div>
                                    <div className="w-16 h-16 bg-gray-300 rounded-full" />
                                </div>
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center">
                                        <div className="w-4 h-4 bg-gray-300 rounded-full mr-2" />
                                        <div className="w-1/2 h-3 bg-gray-200 rounded" />
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-4 h-4 bg-gray-300 rounded-full mr-2" />
                                        <div className="w-2/3 h-3 bg-gray-200 rounded" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="w-full h-3 bg-gray-200 rounded" />
                                    <div className="w-full h-3 bg-gray-200 rounded" />
                                    <div className="w-2/3 h-3 bg-gray-200 rounded" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </ScrollArea>
    )
}

export default CandidateProfiles
