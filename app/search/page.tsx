"use client"

import React, {useEffect, useMemo, useRef, useState} from "react"
import {AnimatePresence, motion} from "framer-motion"
import {CheckCircle, Search, Users} from "lucide-react"
import ProgressIndicator from "@/components/search/ProgressIndicator"
import StepContent from "@/components/search/StepContent"
import StepValidation from "@/components/search/StepValidation"
import StepResults from "@/components/search/StepResults"
import CandidateDetails from "@/components/search/CandidateDetails"
import Loader from "@/components/search/Loader"
import {generateKeywords, scoreResume} from "@/lib/api"
import type {Candidate, Filter, FilterCondition, ParsedJob} from "@/public/types"

const steps = ["Création", "Validation", "Résultat"]
const INITIAL_COUNT = 3

const Page: React.FC = () => {
    // -- États pour l'affichage
    const [displayedCandidates, setDisplayedCandidates] = useState<Candidate[]>([])
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

    // -- États de chargement
    const [loading, setLoading] = useState(false) // Pour la génération des mots-clés
    const [initialLoading, setInitialLoading] = useState(false) // Pour la première phase (3 candidats)
    const [stepTransitionLoading, setStepTransitionLoading] = useState(false) // Transition de step

    // -- Progression
    const [processedCount, setProcessedCount] = useState(0)
    const [isProcessingComplete, setIsProcessingComplete] = useState(false)

    // -- Étapes & Inputs
    const [currentStep, setCurrentStep] = useState(0)
    const [inputValue, setInputValue] = useState("")
    const [values, setValues] = useState<any>({})
    const [extractedText, setExtractedText] = useState<string | null>(null)
    const [parsedJob, setparsedJob] = useState<ParsedJob | null>(null)

    // -- Pour stocker tous les candidats fetchés (mais pas forcément affichés)
    const allCandidatesRef = useRef<Candidate[]>([])

    // -- Pour annuler requête si besoin
    const abortControllerRef = useRef<AbortController | null>(null)

    // -- Filtres
    const [filters, setFilters] = useState<Filter>({
        keyword: "",
        advancedFilter: {
            groups: [],
        },
        sortBy: {
            field: "score",
            direction: "desc",
        }
    })

    // Helper function to get nested value from candidate
    const getNestedValue = (candidate: Candidate, path: string): any => {
        const paths = path.split(".");
        let value = candidate.data as any;

        for (const p of paths) {
            if (Array.isArray(value)) {
                value = value.map((item) => item[p]).filter(Boolean);
            } else if (value && typeof value === "object") {
                value = value[p];
            } else {
                return undefined;
            }
        }

        if (Array.isArray(value)) {
            return value.flat();
        }

        return value;
    };


    const applyFilters = (candidates: Candidate[]): Candidate[] => {
        const { keyword, advancedFilter } = filters;
        return candidates.filter((candidate) => {
            // Keyword filter
            if (keyword) {
                const searchTerm = keyword.toLowerCase();

                // Check if `skills.all` is selected
                const searchableFields = [
                    candidate.data.general.name,
                    candidate.data.general.title,
                    candidate.data.general.summary,
                    candidate.data.general.location,
                    ...candidate.data.skills.technical,
                    ...candidate.data.skills.analytical,
                    ...candidate.data.skills.soft_skills,
                ]
                    .flat()
                    .map((field) => (field || "").toLowerCase());

                if (!searchableFields.some((field) => field.includes(searchTerm))) {
                    return false;
                }
            }

            return advancedFilter.groups.every((group) => {
                return group.conditions.every((condition) => {
                    const value = getNestedValue(candidate, condition.field);

                    if (condition.field === "skills.all") {
                        const combinedSkills = [
                            ...candidate.data.skills.technical,
                            ...candidate.data.skills.analytical,
                            ...candidate.data.skills.soft_skills,
                        ];
                        return matchCondition(combinedSkills, condition);
                    }

                    return matchCondition(value, condition);
                });
            });
        });
    };

    const matchCondition = (value: any, condition: FilterCondition): boolean => {
        if (value === undefined || value === null) return false; // Handle missing values

        const filterValue = parseFloat(condition.value.toString()) || 0;
        const candidateValue = parseFloat(value.toString()) || 0;

        switch (condition.operator) {
            case "equals":
                if (Array.isArray(value)) {
                    return value.some(
                        (v) =>
                            v.toString().toLowerCase() === condition.value.toString().toLowerCase()
                    );
                }
                return (
                    value.toString().toLowerCase() ===
                    condition.value.toString().toLowerCase()
                );

            case "contains":
                // Split the condition value into terms
                const filterTerms = condition.value
                    .toString()
                    .toLowerCase()
                    .split(",")
                    .map((term) => term.trim());

                const candidateTerms = value
                    .toString()
                    .toLowerCase()
                    .split(/[\s,]+/);

                return filterTerms.some((term) => candidateTerms.includes(term));

            case "notContains":
                return !value.toString().toLowerCase().includes(condition.value.toString().toLowerCase());

            case "greaterThan":
                return candidateValue > filterValue;

            case "lessThan":
                console.log("Comparing values:", { candidateValue, filterValue }); // Debug
                return candidateValue < filterValue;

            default:
                return false;
        }
    };

    const filteredCandidates = useMemo(() => {
        const filtered = applyFilters(displayedCandidates);
        const { field, direction } = filters.sortBy;
        console.log("Sorting by:", field, direction);
        return filtered.sort((a, b) => {
            switch (field) {
                case 'experience':
                    const aExp = (a.data.relevant_experience || 0 );
                    const bExp = (b.data.relevant_experience || 0);
                    return direction === 'desc' ? aExp - bExp : bExp - aExp;

                case 'score':
                    const aScore = a.data.score || 0;
                    const bScore = b.data.score || 0;
                    return direction === 'desc' ? aScore - bScore : bScore - aScore;

                default:
                    return 0;
            }
        });
    }, [displayedCandidates, filters]);

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const response = await fetch("/candidates.json")
                const data = await response.json()

                allCandidatesRef.current = data.candidates.map((candidate: Candidate) => ({
                    ...candidate,
                    data: {
                        ...candidate.data,
                        score: undefined,
                        explanation: "",
                        relevant_experience: undefined
                    },
                }))
                // Pour l'exemple, on n'affiche rien tant qu'on n'a pas cliqué sur "Générer des mots-clés"
            } catch (error) {
                console.error("Erreur lors du chargement des candidats :", error)
            }
        }

        fetchCandidates()

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [])

    const sortedCandidates = useMemo(() => {
        return [...filteredCandidates].sort((a, b) => {
            const { field, direction } = filters.sortBy;

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

                default:
                    break;
            }
            return direction === "desc" ? comparison : -comparison;
        });
    }, [filteredCandidates, filters.sortBy]);

    /**
     * Traite et affiche immédiatement les 3 premiers candidats
     */
    const processInitialCandidates = async (jobDescription: ParsedJob) => {
        setInitialLoading(true)
        setProcessedCount(0)
        setIsProcessingComplete(false)

        const candidatesList = allCandidatesRef.current
        const firstCandidates = candidatesList.slice(0, INITIAL_COUNT)

        for (let i = 0; i < firstCandidates.length; i++) {
            try {
                const result = await scoreResume(firstCandidates[i], jobDescription)

                firstCandidates[i] = {
                    ...firstCandidates[i],
                    data: {
                        ...firstCandidates[i].data,
                        score: result.rating || 0,
                        explanation: result.explanation || "Pas d'explication disponible.",
                        relevant_experience: result.relevant_experience || 0,
                    },
                }
                setProcessedCount(i + 1)

                // Force un léger délai, purely visuel
                await new Promise((resolve) => setTimeout(resolve, 500))
            } catch (error) {
                console.error(`Erreur pour le candidat ${i}:`, error)
            }
        }

        setCurrentStep(2)
        setDisplayedCandidates(firstCandidates)
        setStepTransitionLoading(false)
        setInitialLoading(false)

        // On lance le chargement un par un des candidats restants
        loadCandidatesOneByOne(jobDescription, INITIAL_COUNT)
    }

    /**
     * Charge le reste des candidats UN par UN (à partir de startIndex).
     */
    const loadCandidatesOneByOne = async (jobDescription: ParsedJob, startIndex: number) => {
        abortControllerRef.current = new AbortController()

        const candidatesList = allCandidatesRef.current
        let currentIndex = startIndex

        while (currentIndex < candidatesList.length && !abortControllerRef.current.signal.aborted) {
            try {
                const candidate = candidatesList[currentIndex]
                const result = await scoreResume(
                    candidate,
                    jobDescription,
                    abortControllerRef.current.signal,
                )
                const updatedCandidate = {
                    ...candidate,
                    data: {
                        ...candidate.data,
                        score: result.rating || 0,
                        explanation: result.explanation || "Pas d'explication disponible.",
                        relevant_experience: result.relevant_experience || 0,
                    },
                }

                // Mise à jour de la liste globale
                candidatesList[currentIndex] = updatedCandidate

                // Mise à jour de la liste affichée
                setDisplayedCandidates((prev) => [...prev, updatedCandidate])
                setProcessedCount((prev) => prev + 1)
                // Petit délai si vous voulez ralentir le rythme d'arrivée
                await new Promise((resolve) => setTimeout(resolve, 500))
            } catch (error) {
                console.error("Erreur lors du traitement du candidat index:", currentIndex, error)
            }

            currentIndex++
        }

        setIsProcessingComplete(true)
    }

    /**
     * Appelle l'API pour générer des mots-clés
     */
    const handleGenerateKeywords = async (text: string) => {
        setLoading(true)
        try {
            const data = await generateKeywords(text)
            setparsedJob(data)
            if (currentStep === 0) {
                setCurrentStep(1)
            }
            console.log("Mots-clés générés:", data)
        } catch (error) {
            console.error("Error generating keywords:", error)
        } finally {
            setLoading(false)
        }
    }

    const nextStep = async () => {
        // Step Création => Validation
        if (currentStep === 0) {
            // Génération des mots-clés
            const combinedInput = [inputValue, values.job, values.industry, values.location, extractedText]
                .filter(Boolean)
                .join(", ")

            await handleGenerateKeywords(combinedInput)
            // Le setCurrentStep(1) est déjà fait dans handleGenerateKeywords si succès
        }
        // Step Validation => Résultat
        else if (currentStep === 1) {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
            setStepTransitionLoading(true)
            // Petit délai pour l'animation de transition
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // On lance la première phase (3 candidats)
            if (parsedJob) processInitialCandidates(parsedJob)
        }
        // Autres steps (si vous en aviez plus)
        else if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            if (currentStep === 2) {
                setSelectedCandidate(null)

                setFilters({
                    keyword: "",
                    advancedFilter: { groups: [] },
                    sortBy: { field: "score", direction: "desc" },
                });
            }
            setCurrentStep((prev) => prev - 1)
        }
    }

    const handleCandidateSelect = (candidate: Candidate) => {
        setSelectedCandidate(candidate)
    }

    // Récupération des mots-clés validés
    const handleCollectKeywords = (keywords: {
        mustHave: string[]
        niceToHave: string[]
        additional: string[]
    }) => {
        if (!parsedJob) return
        // Replace keywords in parsedJob with the new values from the validation step
        const updatedParsedJob = {
            ...parsedJob,
            keywords: {
                ...parsedJob.keywords,
                competencies: {
                    must_have: keywords.mustHave,
                    nice_to_have: keywords.niceToHave,
                    complementary: keywords.additional,
                },
            },
        };

        setparsedJob(updatedParsedJob);
    };

    // Calcul du nombre de candidats restants à traiter
    const totalCandidatesCount = allCandidatesRef.current.length
    const displayedCount = displayedCandidates.length
    const remainingToProcess = totalCandidatesCount - displayedCount

    const renderRightSideContent = () => {
        switch (currentStep) {
            case 0:
            case 1:
                return (
                    <div className="p-6 text-center h-full flex flex-col justify-center">
                        {currentStep === 0 ? (
                            <>
                                <Search className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Définissez votre recherche</h3>
                                <p className="text-gray-600">
                                    Commencez par décrire le profil idéal que vous recherchez. Plus vous serez précis, meilleurs seront
                                    les résultats.
                                </p>
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Validez les mots-clés</h3>
                                <p className="text-gray-600">
                                    Vérifiez et ajustez les mots-clés générés pour affiner votre recherche et obtenir les meilleurs
                                    candidats.
                                </p>
                            </>
                        )}
                    </div>
                )
            case 2:
                if (selectedCandidate) {
                    return <CandidateDetails candidate={selectedCandidate} />
                } else {
                    return (
                        <div className="p-6 text-center h-full flex flex-col justify-center">
                            <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Résultats de la recherche</h3>
                            <p className="text-gray-600">Sélectionnez un candidat dans la liste pour afficher ses détails ici.</p>
                        </div>
                    )
                }
            default:
                return null
        }
    }

    const handleFilterChange = (newFilters: Partial<Filter>) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            ...newFilters,
        }));
    };

    return (
        <div
            className="h-screen bg-gradient-to-br from-[#85CCF0] via-[#3864ea] to-[#5A56E9] flex items-center justify-between px-6">
            {/* Left-Side Container */}
            <div className="bg-white rounded-2xl shadow-lg w-3/4 p-12 h-[95%] flex flex-col">
                <ProgressIndicator steps={steps} currentStep={currentStep}/>

                <div className="ml-4 flex items-start">
                    <div
                        className="flex items-center justify-center bg-gray-800 text-white text-3xl font-semibold h-14 w-14 rounded-md mr-6">
                        {currentStep + 1}
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-800">{steps[currentStep]}</h1>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                            {currentStep === 2 ? (
                                !isProcessingComplete ? (
                                    // Analyse en cours + spinner
                                    <>
                                        Analyse:
                                        <span
                                            className="inline-block w-3 h-3 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"/>
                                        {processedCount}/{allCandidatesRef.current.length} profils
                                    </>
                                ) : (
                                    "Analyse terminée"
                                )
                            ) : currentStep === 0 ? (
                                "Décrivez le profil recherché pour obtenir les candidats les plus pertinents."
                            ) : (
                                "Vérifiez et modifiez les mots-clés générés."
                            )}
                        </p>
                    </div>
                </div>

                {/* Affichage du contenu de la step ou loader */}
                <div className="flex-grow flex justify-center items-center overflow-y-auto">
                    {stepTransitionLoading || loading ? (
                        // Loader pendant la génération des mots clés OU la transition
                        <Loader/>
                    ) : initialLoading ? (
                        // Loader tant que les 3 premiers candidats ne sont pas chargés
                        <Loader/>
                    ) : currentStep === 1 && parsedJob ? (
                        // Étape 2 : Validation des mots clés
                        <StepValidation result={parsedJob} onCollectKeywords={handleCollectKeywords}/>
                    ) : currentStep === 2 ? (
                        // Étape 3 : Résultats
                        <StepResults
                            filteredCandidates={sortedCandidates}
                            onFilterChange={handleFilterChange}
                            remainingToProcess={remainingToProcess}
                            handleCandidateSelect={handleCandidateSelect}
                        />
                    ) : (
                        // Étape 1 : Formulaire de création
                        <StepContent
                            currentStep={currentStep}
                            inputValue={inputValue}
                            values={values}
                            onSubmit={handleGenerateKeywords}
                            setValues={setValues}
                            setInputValue={setInputValue}
                            setExtractedText={setExtractedText}
                        />
                    )}
                </div>

                {/* Boutons de navigation */}
                <div className="flex justify-between mt-4">
                    <button
                        type="button"
                        onClick={prevStep}
                        className={`px-5 py-4 rounded-xl text-s font-semibold ${
                            currentStep === 0 ? "opacity-0 cursor-not-allowed" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        }`}
                        disabled={currentStep === 0}
                    >
                        Précédent
                    </button>

                    <button
                        type="button"
                        onClick={nextStep}
                        className={`px-5 py-4 rounded-xl text-s font-semibold ${
                            loading || currentStep === steps.length - 1 || stepTransitionLoading
                                ? "opacity-50 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                        disabled={loading || currentStep === steps.length - 1 || stepTransitionLoading}
                    >
                        {currentStep === 0 ? "Générer des mots-clés" : currentStep === 1 ? "Valider les mots-clés" : ""}
                    </button>
                </div>
            </div>

            {/* Right-Side Container */}
            <motion.div
                className="w-full max-w-[350px] relative"
                initial={{opacity: 0, x: 20}}
                animate={{
                    opacity: 1,
                    x: 0,
                    height: currentStep === 2 ? "95%" : "auto",
                    marginTop: currentStep === 2 ? "0" : "auto",
                    marginBottom: currentStep === 2 ? "0" : "auto",
                }}
                transition={{duration: 0.5}}
            >
                <motion.div
                    className="w-full h-full flex flex-col items-center justify-start bg-white rounded-2xl shadow-lg overflow-hidden px-6"
                    animate={{
                        height: currentStep === 2 ? "100%" : "auto",
                        minHeight: currentStep === 2 ? "100%" : "300px",
                    }}
                    transition={{duration: 0.5}}
                >
                    {/* Modified blue header section */}
                    <div className="w-[calc(100%+3rem)] -mx-6 px-6 py-4 bg-blue-500 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white">{steps[currentStep]}</h2>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -20}}
                            transition={{duration: 0.3}}
                            className="w-full h-full overflow-y-auto"
                        >
                            {renderRightSideContent()}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </div>
    )
}

export default Page

