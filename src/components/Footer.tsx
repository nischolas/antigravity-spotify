import React from 'react';
import { useTranslation } from 'react-i18next';

export const Footer: React.FC = () => {
    const { i18n, t } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <footer className="app-footer">
            <hr />
            <div className="footer-content">
                <div className="language-selector">
                    <span className="language-label">{t('footer.language')}:</span>
                    <button
                        className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
                        onClick={() => changeLanguage('en')}
                        aria-label="Switch to English"
                    >
                        🇬🇧 English
                    </button>
                    <button
                        className={`lang-btn ${i18n.language === 'de' ? 'active' : ''}`}
                        onClick={() => changeLanguage('de')}
                        aria-label="Zu Deutsch wechseln"
                    >
                        🇩🇪 Deutsch
                    </button>
                </div>


                <div>
                    <span>{t('footer.by')}</span> <a href="https://nicholas-mathi.eu" target="_blank" rel="noopener noreferrer">
                        Nicholas Mathieu
                    </a>
                    &nbsp;–&nbsp;
                    <a href="https://nicholas-mathi.eu/impressum" target="_blank" rel="noopener noreferrer">
                        {t('footer.legal')}
                    </a>
                </div>
                <p>{t('footer.privacy')}</p>
            </div>
        </footer>
    );
};
