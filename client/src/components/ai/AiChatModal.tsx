import React, { useState } from "react";
import { aiApi } from "../../services/api";
import { FaPaperPlane, FaSpinner, FaBrain } from "react-icons/fa";

interface AiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AiChatModal: React.FC<AiChatModalProps> = ({ isOpen, onClose }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setError("");
    setAnswer("");

    try {
      const aiAnswer = await aiApi.askQuestion(question);
      setAnswer(aiAnswer);
    } catch (err) {
      setError("Sorry, the AI assistant is unavailable right now.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset state when closing the modal
    setQuestion("");
    setAnswer("");
    setError("");
    onClose();
  };

  return (
    <div className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box">
        <button
          onClick={handleClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          ✕
        </button>
        <h3 className="font-bold text-lg text-primary flex items-center gap-2 mb-4">
          <FaBrain className="text-primary" />
          AI Assistant
        </h3>

        {/* Answer Display Area */}
        {answer && (
          <div className="p-4 bg-base-100 rounded-lg mb-4 text-base-content">
            {answer}
          </div>
        )}

        {error && <div className="alert alert-error text-sm">{error}</div>}

        {/* Input Form */}
        <form onSubmit={handleAskQuestion} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask about productivity..."
            className="input input-bordered w-full"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="btn btn-primary btn-square"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <FaPaperPlane />
            )}
          </button>
        </form>
        <p className="text-xs text-base-content/60 mt-2">
          Example: "How can I stop procrastinating?"
        </p>
      </div>
      {/* Clicking backdrop closes the modal */}
      <div className="modal-backdrop">
        <button onClick={handleClose}>close</button>
      </div>
    </div>
  );
};

export default AiChatModal;
