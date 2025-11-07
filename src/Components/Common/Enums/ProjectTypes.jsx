import {t} from "i18next";

export const ProjectTypes = Object.freeze({
    CASE            : 'CASE'            , // قضية
    CONSULTATION    : 'CONSULTATION'    , // استشارة
    CLAIM           : 'CLAIM'           , // مطالبة
    AGENCY          : 'AGENCY'          , // وكالة
    OFFICE_NEEDS    : 'OFFICE_NEEDS'    , // احتياجات مكتب
});

export const getProjectType = (projectType) => {
    switch (projectType) {
        case ProjectTypes.CASE: {
            return t("projects.type.case");
        }
        case ProjectTypes.CONSULTATION: {
            return t("projects.type.consultation");
        }
        case ProjectTypes.CLAIM: {
            return t("projects.type.claim");
        }
        case ProjectTypes.AGENCY: {
            return t("projects.type.agency");
        }
        case ProjectTypes.OFFICE_NEEDS: {
            return t("projects.type.officeNeeds");
        }
        default: {
            console.log("Unhandled; ", projectType);
        }
    }
}
