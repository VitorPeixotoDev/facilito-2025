import { PROFESSIONAL_COURSES_CONFIG, type ProfessionalCourseConfig } from '@/lib/constants/professional_courses';

function normalize(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

export function getAllProfessionalCourses(): ProfessionalCourseConfig[] {
    return PROFESSIONAL_COURSES_CONFIG;
}

export function getProfessionalCoursesByTag(tag: string): ProfessionalCourseConfig[] {
    if (!tag || tag === 'Todas') return PROFESSIONAL_COURSES_CONFIG;
    return PROFESSIONAL_COURSES_CONFIG.filter((course) => course.mainTags.includes(tag));
}

export function searchProfessionalCourses(baseList: ProfessionalCourseConfig[], query: string): ProfessionalCourseConfig[] {
    const term = normalize(query);
    if (!term) return baseList;

    return baseList.filter((course) => {
        const haystack = [
            course.courseName,
            course.shortDescription,
            course.partner.name,
            ...course.mainTags,
        ].map(normalize);

        return haystack.some((text) => text.includes(term));
    });
}

