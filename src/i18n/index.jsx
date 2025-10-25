import { useTranslation } from "react-i18next";

function LanguageManager() {
    const { t, i18n } = useTranslation();
    
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };
    
    return (
        <div>
            <button onClick={() => changeLanguage("es")}>ES</button>
            <button onClick={() => changeLanguage("en")}>EN</button>
        </div>
    );
}
