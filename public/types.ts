export type Candidate = {
    data: {
        score?: number;
        explanation?: string;
        relevant_experience?: number;
        general: {
            profilePicture: any;
            name: string;
            title: string;
            email: string;
            phone: string;
            linkedin: string;
            location: string;
            summary: string;
        };
        education: {
            degree: string;
            institution: string;
            start_date: string;
            end_date: string;
        }[];
        experiences: {
            company: string;
            position: string;
            start_date: string;
            end_date: string;
            location: string;
            skills: string[];
            summary: string;
        }[];
        skills: {
            technical: string[];
            analytical: string[];
            soft_skills: string[];
        };
        languages: {
            name: string;
            level: string;
        }[];
        hobbies: string[];
    };
};

/** Poste analysé par /api/generate-keywords, puis validé par le recruteur. */
export type ParsedJob = {
    job_title: string;
    seniority: string;
    location: string;
    summary: string;
    keywords: {
        competencies: {
            must_have: string[];
            nice_to_have: string[];
            complementary: string[];
        };
    };
};

/** Résultat de /api/score-resume pour un candidat. */
export type ResumeScore = {
    rating: number;
    relevant_experience: number;
    explanation: string;
};

export type FilterCondition = {
    field: string
    operator: "equals" | "contains" | "notContains" | "greaterThan" | "lessThan"
    value: string | number
}

export type FilterGroup = {
    conditions: FilterCondition[]
    operator: "AND" | "OR"
}

export type AdvancedFilter = {
    groups: FilterGroup[]
}

export type SortOption = {
    field: string
    direction: "asc" | "desc"
}

export type Filter = {
    keyword: string;
    advancedFilter: AdvancedFilter;
    sortBy: SortOption;
};