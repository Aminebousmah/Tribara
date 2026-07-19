import React, { useRef, useState, useEffect } from "react";
import { FiUpload } from "react-icons/fi";
import InputBar from "@/components/search/InputBar";
import CustomAutocomplete from "@/components/search/CustomAutocomplete";
import { processFile } from "@/utils/fileProcessor";
import labelMap from "@/public/labelMap";

interface StepContentProps {
    currentStep: number;
    inputValue: string;
    onSubmit: (text: string) => void; // API call uses only extracted text
    values: any;
    setValues: React.Dispatch<React.SetStateAction<any>>;
    setInputValue: React.Dispatch<React.SetStateAction<string>>;
    setExtractedText: React.Dispatch<React.SetStateAction<string | null>>;
}

const StepContent: React.FC<StepContentProps> = ({
                                                     currentStep,
                                                     inputValue,
                                                     values,
                                                     onSubmit,
                                                     setValues,
                                                     setInputValue,
                                                     setExtractedText,
                                                 }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [optionsMap, setOptionsMap] = useState<any>({ job: [], industry: [], location: [] }); // Dynamic options

    // Load data dynamically from JSON files
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [jobsResponse, industriesResponse, citiesResponse] = await Promise.all([
                    fetch("/jobs.json"),
                    fetch("/industries.json"),
                    fetch("/cities.json"),
                ]);

                const jobs = await jobsResponse.json();
                const industries = await industriesResponse.json();
                const cities = await citiesResponse.json();

                setOptionsMap({
                    job: jobs,
                    industry: industries,
                    location: cities,
                });
            } catch (error) {
                console.error("Error loading options:", error);
            }
        };

        fetchOptions();
    }, []);

    const handleFileUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                setUploadedFileName(file.name);
                const text = await processFile(file);
                setExtractedText(text); // Update the state in parent
                console.log("Extracted text:", text);
            } catch (error) {
                console.error("Error processing file:", error);
            }
        }
    };

    switch (currentStep) {
        case 0: // Creation Step
            return (
                <div className="space-y-12 w-full ml-4 mr-4">
                    {/* Input Description */}
                    <div>
                        <p className="text-xs text-gray-500 mb-2">
                            Donnez une description du poste
                        </p>
                        <InputBar
                            inputValue={inputValue}
                            setInputValue={setInputValue}
                            onSubmit={onSubmit}
                            placeholder="Décrivez votre recherche ou collez un texte"
                        />
                    </div>

                    {/* Separator */}
                    <div className="relative flex items-center">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="mx-4 text-sm text-gray-500 whitespace-nowrap">
                            Autres méthodes
                        </span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    {/* Split Section: Left for Job Fields, Right for File Upload */}
                    <div className="grid grid-cols-2 gap-16">
                        {/* Left Section */}
                        <div className="space-y-4">
                            <p className="text-xs text-gray-500 mb-2">
                                Recherche rapide
                            </p>
                            <CustomAutocomplete
                                options={optionsMap.job}
                                label={labelMap.job}
                                placeholder="Intitulé du poste"
                                value={values.job || ""}
                                onChange={(newValue) => {
                                    setValues((prevValues: any) => ({
                                        ...prevValues,
                                        job: newValue,
                                    }));
                                }}
                            />
                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <CustomAutocomplete
                                        options={optionsMap.industry}
                                        label={labelMap.industry}
                                        placeholder="Secteur d'activité"
                                        value={values.industry || ""}
                                        onChange={(newValue) => {
                                            setValues((prevValues: any) => ({
                                                ...prevValues,
                                                industry: newValue,
                                            }));
                                        }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <CustomAutocomplete
                                        options={optionsMap.location}
                                        label={labelMap.location}
                                        placeholder="Localisation"
                                        value={values.location || ""}
                                        onChange={(newValue) => {
                                            setValues((prevValues: any) => ({
                                                ...prevValues,
                                                location: newValue,
                                            }));
                                        }}
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">
                                ⓘ Laisser vide pour cibler tous les champs.
                            </p>
                        </div>

                        {/* Right Section */}
                        <div className="w-full space-y-4 ml-4 mr-4">
                            <p className="text-xs text-gray-500 mb-2">
                                A partir d'un fichier
                            </p>
                            <div
                                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <p className="text-sm text-gray-600 mb-4">
                                    Téléchargez une description de poste (PDF ou DOCX).
                                </p>
                                <div
                                    className="cursor-pointer flex flex-col items-center"
                                    onClick={handleFileUploadClick}
                                >
                                    <FiUpload size={40} className="text-blue-600"/>
                                    <p className="mt-2 text-xs text-gray-400">Ajouter un fichier</p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileUpload}
                                    style={{display: "none"}}
                                />
                                {uploadedFileName && (
                                    <p className="mt-4 text-sm text-gray-500">
                                        Uploaded: <span className="font-medium">{uploadedFileName}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 1: // Validation Step
            return (
                <div>
                    <h2 className="text-lg font-semibold">Validation des mots-clés</h2>
                    <p>Vérifiez et ajustez vos mots-clés ici.</p>
                </div>
            );

        case 2: // Result Step
            return (
                <div>
                    <h2 className="text-lg font-semibold">Résultats Améliorés</h2>
                    <p>Affichez les résultats basés sur vos critères affinés.</p>
                </div>
            );

        default:
            return null;
    }
};

export default StepContent;
