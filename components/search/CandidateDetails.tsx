"use client"

import type React from "react"
import type { Candidate } from "@/public/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Briefcase, GraduationCap, Globe, Star, Mail, Linkedin, Phone, Heart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type CandidateDetailsProps = {
    candidate: Candidate | null
}

const CandidateDetails: React.FC<CandidateDetailsProps> = ({ candidate }) => {
    if (!candidate) {
        return null
    }

    const { general, education, experiences, skills, languages, score, explanation } = candidate.data

    const getScoreColor = (score: number) => {
        const hue = Math.min(score * 1.2, 120)
        return `hsl(${hue}, 80%, 45%)`
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full h-full overflow-y-auto py-6 flex flex-col"
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
            >
                <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20 border-2 border-blue-500">
                        <AvatarImage src={general.profilePicture} alt={`Photo de profil de ${general.name}`} />
                        <AvatarFallback>{general.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{general.name}</h2>
                        <p className="text-lg text-gray-600">{general.title}</p>
                        <p className="text-sm text-gray-500">{general.location}</p>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
            >
                <div className="flex items-center gap-2">
                    {general.linkedin && (
                        <a
                            href={general.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-blue-100 text-blue-600 px-3 py-1.5 rounded-full text-sm hover:bg-blue-200 transition-colors duration-200"
                        >
                            <Linkedin className="w-4 h-4" />
                            LinkedIn
                        </a>
                    )}
                    <a
                        href={`mailto:${general.email}`}
                        className="flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1.5 rounded-full text-sm hover:bg-red-200 transition-colors duration-200"
                    >
                        <Mail className="w-4 h-4" />
                        Email
                    </a>
                    {general.phone && (
                        <a
                            href={`tel:${general.phone}`}
                            className="flex items-center gap-2 bg-green-100 text-green-600 px-3 py-1.5 rounded-full text-sm hover:bg-green-200 transition-colors duration-200"
                        >
                            <Phone className="w-4 h-4" />
                            Numéro
                        </a>
                    )}
                </div>
            </motion.div>

            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="score">
                    <AccordionTrigger className="flex items-center justify-between accordion-trigger">
                        <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-500" />
                            Score du candidat
                        </div>
                        {score !== undefined && (
                            <Badge
                                className="text-sm font-bold px-2 py-1 rounded-full"
                                style={{ backgroundColor: getScoreColor(score), color: "white" }} // Apply dynamic color
                            >
                                {score}/100
                            </Badge>
                        )}
                    </AccordionTrigger>
                    <AccordionContent>
                        <AnimatePresence>
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {explanation && <p className="text-sm text-gray-700">{explanation}</p>}
                            </motion.div>
                        </AnimatePresence>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="resume">
                    <AccordionTrigger>Résumé</AccordionTrigger>
                    <AccordionContent>
                        <AnimatePresence>
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <p className="text-sm text-gray-700">{general.summary}</p>
                            </motion.div>
                        </AnimatePresence>
                    </AccordionContent>
                </AccordionItem>

                {education.length > 0 && (
                    <AccordionItem value="education">
                        <AccordionTrigger>Formation</AccordionTrigger>
                        <AccordionContent>
                            <AnimatePresence>
                                <motion.ul
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-4"
                                >
                                    {education.map((edu, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-start space-x-3 bg-blue-50 p-3 rounded-lg"
                                        >
                                            <GraduationCap className="flex-shrink-0 w-6 h-6 mt-0.5 text-blue-600" />
                                            <div>
                                                <p className="font-medium text-blue-800">{edu.degree}</p>
                                                <p className="text-sm text-blue-600">{edu.institution}</p>
                                                <p className="text-sm text-blue-500">
                                                    {edu.start_date} - {edu.end_date}
                                                </p>
                                            </div>
                                        </motion.li>
                                    ))}
                                </motion.ul>
                            </AnimatePresence>
                        </AccordionContent>
                    </AccordionItem>
                )}

                {experiences.length > 0 && (
                    <AccordionItem value="experiences">
                        <AccordionTrigger>Expériences professionnelles</AccordionTrigger>
                        <AccordionContent>
                            <AnimatePresence>
                                <motion.ul
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-4"
                                >
                                    {experiences.map((exp, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-start space-x-3 bg-green-50 p-3 rounded-lg"
                                        >
                                            <Briefcase className="flex-shrink-0 w-6 h-6 mt-0.5 text-green-600" />
                                            <div>
                                                <p className="font-medium text-green-800">{exp.position}</p>
                                                <p className="text-sm text-green-600">{exp.company}</p>
                                                <p className="text-sm text-green-500">
                                                    {exp.start_date} - {exp.end_date}
                                                </p>
                                                <p className="text-sm text-green-700 mt-1">{exp.summary}</p>
                                            </div>
                                        </motion.li>
                                    ))}
                                </motion.ul>
                            </AnimatePresence>
                        </AccordionContent>
                    </AccordionItem>
                )}

                {Object.keys(skills).length > 0 && (
                    <AccordionItem value="skills">
                        <AccordionTrigger>Compétences</AccordionTrigger>
                        <AccordionContent>
                            <AnimatePresence>
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-wrap gap-2"
                                >
                                    {Object.entries(skills).map(([skillType, skillList]) =>
                                        skillList.map((skill, index) => (
                                            <motion.div
                                                key={`${skillType}-${index}`}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <Badge variant="secondary" className="text-sm py-1 px-3">
                                                    {skill}
                                                </Badge>
                                            </motion.div>
                                        )),
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </AccordionContent>
                    </AccordionItem>
                )}

                {languages.length > 0 && (
                    <AccordionItem value="languages">
                        <AccordionTrigger>Langues</AccordionTrigger>
                        <AccordionContent>
                            <AnimatePresence>
                                <motion.ul
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-2"
                                >
                                    {languages.map((lang, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center space-x-2 bg-purple-50 p-2 rounded-lg"
                                        >
                                            <Globe className="flex-shrink-0 w-5 h-5 text-purple-600" />
                                            <span className="text-purple-800">
                        {lang.name} - <span className="text-purple-600">{lang.level}</span>
                      </span>
                                        </motion.li>
                                    ))}
                                </motion.ul>
                            </AnimatePresence>
                        </AccordionContent>
                    </AccordionItem>
                )}
                {candidate.data.hobbies && candidate.data.hobbies.length > 0 && (
                    <AccordionItem value="hobbies">
                        <AccordionTrigger>Hobbies</AccordionTrigger>
                        <AccordionContent>
                            <AnimatePresence>
                                <motion.ul
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-2"
                                >
                                    {candidate.data.hobbies.map((hobby, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center space-x-2 bg-pink-50 p-2 rounded-lg"
                                        >
                                            <Heart className="flex-shrink-0 w-5 h-5 text-pink-600" />
                                            <span className="text-pink-800">{hobby}</span>
                                        </motion.li>
                                    ))}
                                </motion.ul>
                            </AnimatePresence>
                        </AccordionContent>
                    </AccordionItem>
                )}
            </Accordion>
        </motion.div>
    )
}

export default CandidateDetails

