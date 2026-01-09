const express = require('express');
const router = express.Router();

// POST /api/chat - Handle chat messages
router.post('/', async (req, res) => {
    try {
        const { message, context } = req.body;

        if (!message || typeof message !== 'string' || message.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        // Check if API key is configured
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(503).json({
                success: false,
                error: 'AI service is not configured. Please contact the administrator.'
            });
        }

        // Build the prompt with context
        let prompt = buildPrompt(message, context);

        // Call Google Gemini API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API error:', errorData);

            // Check for specific error types
            if (response.status === 429) {
                return res.status(429).json({
                    success: false,
                    error: 'Rate limit exceeded. Please try again in a moment.'
                });
            }

            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();

        // Extract the response text
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiResponse) {
            throw new Error('No response from AI');
        }

        res.json({
            success: true,
            response: aiResponse
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process chat message'
        });
    }
});

// Build prompt with context
function buildPrompt(userMessage, context) {
    let prompt = `You are DeedIQ AI, an expert real estate investment assistant. You help users analyze housing markets, understand investment metrics, and make informed property investment decisions.

Your expertise includes:
- Real estate market analysis and trends
- Investment metrics (IRR, Cash-on-Cash returns, CAP rates)
- Property valuation and comparison
- Rental property analysis
- Mortgage and financing options
- Market appreciation and depreciation analysis

`;

    // Add context if available
    if (context) {
        prompt += 'Current Context:\n';

        if (context.page) {
            prompt += `- User is on page: ${context.page}\n`;
        }

        if (context.currentMarket) {
            prompt += `- Currently viewing market: ${context.currentMarket.city}\n`;
        }

        if (context.comparingMarkets) {
            prompt += '- User is comparing multiple markets\n';
        }

        if (context.usingCalculator) {
            prompt += '- User is using the Property Investment Calculator\n';
        }

        prompt += '\n';
    }

    prompt += `User Question: ${userMessage}\n\n`;
    prompt += `Please provide a helpful, concise, and accurate response. Use specific numbers and examples when relevant. Keep responses under 200 words unless the question requires more detail.`;

    return prompt;
}

module.exports = router;
