import { useState } from "react";
import { useTranslation } from "react-i18next";

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const questions = t("faq.questions", { returnObjects: true }) as FAQItem[];
  const title = t("faq.title");

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!Array.isArray(questions) || questions.length === 0) {
    return null;
  }

  return (
    <div className="faq-container">
      <h2>{title}</h2>
      <div className="accordion">
        {questions.map((item, index) => (
          <div key={index} className="item">
            <button className={`question ${openIndex === index ? "active" : ""}`} onClick={() => toggleIndex(index)} aria-expanded={openIndex === index}>
              <span className="icon">{openIndex === index ? "−" : "+"}</span>
              <span className="question-text">{item.question}</span>
            </button>
            <div className={`answer ${openIndex === index ? "open" : ""}`}>
              <div className="answer-content">{item.answer}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
