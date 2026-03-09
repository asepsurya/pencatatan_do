/**
 * Utility for AI Document Analysis
 */

const API_URL = 'https://myollama.scrollwebid.com/api/generate';

export const analyzeDOImage = async (base64Image) => {
  const enhancedPrompt = `
    Analyze this Delivery Order (DO) image. 
    Extract the following information in strict JSON format:
    {
      "doNumber": "string",
      "date": "YYYY-MM-DD",
      "sender": "string",
      "receiver": "string",
      "items": [
        { "name": "string", "quantity": number, "unit": "string (e.g., Kg, Gr, Dus, Krat, Pcs, Box)" }
      ],
      "notes": "string"
    }
    ONLY return the JSON object. Capture units accurately from the text (e.g., '100 kg' -> quantity: 100, unit: 'Kg').
  `;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemini-3-flash-preview',
        prompt: `Return ONLY a valid JSON object. No preamble, no markdown formatting. ${enhancedPrompt}`,
        stream: true,
        images: [base64Image.split(',')[1] || base64Image],
        web_search: { enabled: true, search_depth: 'high' },
        options: { temperature: 0.1, top_p: 0.95 } // Lower temp for more deterministic JSON
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`AI Server Error: ${res.status} - ${errorText}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      // Keep the last part in buffer if it doesn't end with a newline
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const jsonChunk = JSON.parse(line);
          fullContent += jsonChunk.response || jsonChunk.content || "";
          if (jsonChunk.done) break;
        } catch (e) {
          // If not valid JSON, might be raw text
          fullContent += line;
        }
      }
    }

    // Process remaining buffer
    if (buffer.trim()) {
      try {
        const jsonChunk = JSON.parse(buffer);
        fullContent += jsonChunk.response || jsonChunk.content || "";
      } catch (e) {
        fullContent += buffer;
      }
    }

    // Try to find the first valid JSON object in the accumulated content
    // We search for the first '{' and try to find its matching '}'
    let firstOpen = fullContent.indexOf('{');
    let lastClose = fullContent.lastIndexOf('}');

    if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
      let jsonCandidate = fullContent.substring(firstOpen, lastClose + 1);

      // Clean markdown if present
      jsonCandidate = jsonCandidate.replace(/```json|```/g, '').trim();

      try {
        return JSON.parse(jsonCandidate);
      } catch (e) {
        // If parsing the whole block fails (maybe multiple objects), 
        // try to find the shortest prefix that is a valid JSON
        for (let i = lastClose; i > firstOpen; i--) {
          if (fullContent[i] === '}') {
            try {
              const subCandidate = fullContent.substring(firstOpen, i + 1);
              return JSON.parse(subCandidate);
            } catch (innerE) {
              continue;
            }
          }
        }
      }
    }

    throw new Error('Gagal mengekstrak format JSON dari respon AI');
  } catch (error) {
    console.error("AI Analysis Detailed Error:", error);
    throw error;
  }
};

export const chatWithAI = async (message, context) => {
  const fullPrompt = `
    Konteks Aplikasi:
    - Nama Aplikasi: Sistem Pencatatan DO Koperasi Karya Surya Asri
    - User Aktif: ${context.activeUser}
    - Total DO di database: ${context.totalDOs}
    - Data DO Terbaru: ${JSON.stringify(context.recentDOs, null, 2)}

    INSTRUKSI KRITIKAL:
    1. Kamu adalah asisten internal aplikasi ini. JANGAN pernah bilang kamu tidak punya akses ke data.
    2. Gunakan "Data DO Terbaru" di atas untuk menjawab pertanyaan.
    3. Jika ditanya total, hitung dari data yang diberikan.
    4. Jawablah dengan ramah, rapi, dan profesional dalam Bahasa Indonesia.
    5. Gunakan poin-poin atau bold jika diperlukan agar mudah dibaca.

    Pertanyaan User: "${message}"
  `;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemini-3-flash-preview',
        prompt: fullPrompt,
        stream: false
      })
    });

    if (!res.ok) throw new Error('AI Response Error');
    const data = await res.json();
    let content = data.response || data.content || "Maaf, saya tidak bisa merespon saat ini.";

    // Clean up unnecessary disclaimers if they still appear
    content = content.replace(/sebagai AI.*laporan perusahaan Anda secara langsung/gi, '');

    return content.trim();
  } catch (error) {
    console.error("Chat Error:", error);
    return "Terjadi kesalahan saat menghubungi asisten AI.";
  }
};
