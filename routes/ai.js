const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

const SYSTEM_PROMPTS = {
  general: 'Sən GDRTI (Gəncə-Daşkəsən Regional Təhsil İdarəsi) üçün köməkçi AI-sən. Qısa, aydın, Azərbaycan dilində cavab ver. Rəsmi üslub istifadə et.',
  letter:  `Sən rəsmi məktub yazma mütəxəssisisən. Azərbaycan dilində tam, peşəkar rəsmi məktublar yaz.
Məktub formatı:
- Başlıq: [Tarix, Sənəd nömrəsi]
- Kimin adına: [Müraciət]
- Mövzu: [Mövzu sətri]
- Əsas mətn (rəsmi dil, aydın struktur)
- Nəticə cümləsi
- Hörmətlə, [Ad Soyad, Vəzifə]
İstifadəçinin verdiyi məlumatları əsas götür.`,
  summary: 'Sən sənəd xülasəçisisən. Verilən mətni qısa (3-5 cümlə), aydın şəkildə xülasə et. Əsas məqamları siyahı ilə göstər.',
  analyze: 'Sən sənəd analizçisisən. Faylın məzmununu analiz et, əsas məqamları, problemləri və tövsiyələri qeyd et. Azərbaycan dilində cavab ver.',
};

router.post('/chat', verifyToken, async (req, res) => {
  const { message, history, mode, fileContent, fileName } = req.body;
  if (!message?.trim() && !fileContent) return res.status(400).json({ error: 'Mesaj boşdur' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'AI xidməti konfiqurasiya edilməyib. Render-də GROQ_API_KEY əlavə edin.' });

  try {
    const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.general;

    // Fayl mətni varsa, user mesajına əlavə et
    let userContent = message?.trim() || '';
    if (fileContent) {
      userContent = `📎 Fayl: ${fileName || 'fayl'}\n\nFayln məzmunu:\n---\n${fileContent.slice(0, 8000)}\n---\n\n${userContent || 'Bu faylı analiz et.'}`;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []),
      { role: 'user', content: userContent }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 2048,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'AI xətası');
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '';
    const newHistory = [
      ...(history || []),
      { role: 'user', content: userContent },
      { role: 'assistant', content: reply }
    ];
    res.json({ reply, messages: newHistory });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

