import { useState } from "react";
import axios from "axios";
import { SERVER_URL } from "../../constants/server_url.js";
import "./aiAdvice.css";

function AIAdvice({ onClose }) {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await axios.post(`${SERVER_URL}/api/ai/advice`, { message });
      setResponse(res.data.advice);
    } catch (err) {
      setResponse("Eroare la obținerea răspunsului.");
    }

    setLoading(false);
  };

  return (
    <div>
      <button className="close-button" onClick={onClose}>×</button>
      <h3>Întreabă-ne despre îngrijirea animalului tău</h3>
      <textarea
        rows="4"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ex: Am un cățel Golden Retriever de 3 ani..."
      />
      <br />
      <button
        className="btn btn-primary"
        onClick={handleSend}
        disabled={loading}
      >
        {loading ? "Se generează..." : "Trimite"}
      </button>
      {response && (
        <div className="response-box">
          <strong>Răspuns:</strong>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

export default AIAdvice;