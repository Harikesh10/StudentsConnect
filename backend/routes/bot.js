const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Knowledge base about Sathyabama Connect
const knowledgeBase = {
    clubs: "Sathyabama Connect has various clubs including technical clubs, cultural clubs, and sports clubs. You can browse all clubs on the Clubs page and apply to join them.",
    hirings: "Club hirings are positions available in different clubs. You can view open positions on each club's page and submit applications.",
    chat: "You can chat with other students and faculty using the real-time messaging feature. Go to the Chat page to start conversations.",
    profile: "Your profile shows your information like name, register number, year, and department. You can update it from the Profile page.",
    search: "Use the Search page to find other students and faculty members by name or register number.",
    applications: "Track your club applications on the Applications page. You can see pending, accepted, and rejected applications.",
    dashboard: "The Dashboard shows an overview of your activity, recent messages, and club updates."
};

// Fallback response function for when API is unavailable
const getLocalResponse = (message, user, clubs, applications) => {
    const lowerMsg = message.toLowerCase();
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    if (lowerMsg.includes('club')) {
        if (clubs && clubs.length > 0) {
            const clubNames = clubs.map(c => c.name).join(', ');
            return pick([
                `Awesome! We currently have these clubs running: ${clubNames}. You can browse and join them directly from the Clubs page!`,
                `Looking for clubs? We have ${clubNames} active right now. Feel free to check them out on the Clubs page.`,
                `Sathyabama Connect has a variety of clubs including ${clubNames}. Head over to the Clubs section to see more details and apply.`
            ]);
        }
        return pick([
            "Sathyabama Connect has various clubs including technical clubs, cultural clubs, and sports clubs. You can browse all clubs on the Clubs page.",
            "You can find all active clubs on the Clubs page! There are technical, cultural, and sports clubs waiting for you.",
            "Want to join a club? Head over to the Clubs page to see what's available and submit your application."
        ]);
    } else if (lowerMsg.includes('hiring') || lowerMsg.includes('apply') || lowerMsg.includes('position')) {
        return pick([
            "Club hirings are positions available in different clubs. You can view open positions on each club's page.",
            "Looking to apply? Each club posts its open positions on their specific club page. You can submit applications right there!",
            "You can find open positions and hiring announcements directly on the respective Club's page."
        ]);
    } else if (lowerMsg.includes('chat') || lowerMsg.includes('message')) {
        return pick([
            "Use the Chat page to send real-time messages to other students and faculty.",
            "Want to talk to someone? The Chat feature lets you message anyone on the platform in real-time.",
            "You can easily connect and message other users by going to the Chat area."
        ]);
    } else if (lowerMsg.includes('profile')) {
        if (user) {
            return pick([
                `Your profile shows your name is ${user.name} and your register number is ${user.registerNumber}. You can update other details anytime!`,
                `You are logged in as ${user.name}. You can head to the Profile page to update your bio, skills, and more.`,
                `I see you are logged in as ${user.name} (${user.userType}). Your profile settings can be updated on the Profile page.`
            ]);
        }
        return pick([
            "Your profile shows your information like name and register number. You can update it from the Profile page.",
            "Go to the Profile page to update your bio, skills, and contact details.",
            "Make sure your profile is up to date! You can edit it directly on your Profile page."
        ]);
    } else if (lowerMsg.includes('search') || lowerMsg.includes('find')) {
        return pick([
            "Use the Search page to find other students and faculty members by name or register.",
            "You can easily find people on the platform using the global Search feature.",
            "Looking for someone? The Search page lets you find faculty and students across the university."
        ]);
    } else if (lowerMsg.includes('application')) {
        const c1 = applications && applications.length;
        if (c1) {
            return pick([
                `I see you have submitted ${applications.length} club applications. You can track their status on the Applications page.`,
                `You currently have ${applications.length} applications on file. Check the Applications page for status updates!`,
                `Great! You've made ${applications.length} applications to clubs so far. Track them on your Applications page.`
            ]);
        }
        return pick([
            "Track your club applications on the Applications page. You can see pending, accepted, and rejected statuses.",
            "Keep an eye on your submitted applications by visiting the Applications page.",
            "The Applications page is where you can monitor all the positions you've applied for."
        ]);
    } else if (lowerMsg.includes('dashboard') || lowerMsg.includes('home')) {
        return pick([
            "The Dashboard shows an overview of your activity, recent messages, and club updates.",
            "Your personalized homepage is the Dashboard, where you can see all recent updates.",
            "Head to the Dashboard for a quick summary of what's happening around you."
        ]);
    } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
        const name = user ? user.name : "there";
        return pick([
            `Hi ${name}! I'm Nexus AI, your assistant. I can help you with questions about clubs, chat, profiles, and more.`,
            `Hello ${name}! What can I help you discover on the platform today?`,
            `Hey ${name}! I'm here to answer any questions you have about the features.`
        ]);
    } else if (lowerMsg.includes('help')) {
        return pick([
            "I can help you with:\n• Clubs - Browse and join clubs\n• Hirings - View open positions\n• Chat - Message other users\n• Profile - Update your info\nWhat would you like to know more about?",
            "Need assistance? I know all about Clubs, Chat, Profiles, Search, and tracking Applications. Ask away!",
            "I'm here to help navigate the platform. You can ask me about chatting, applying to clubs, or updating your profile."
        ]);
    } else if (lowerMsg.includes('thank')) {
        return pick([
            "You're welcome! Feel free to ask if you have more questions.",
            "No problem at all! Let me know if you need anything else.",
            "Anytime! I'm always here to help."
        ]);
    }

    return pick([
        "I can help you with information about the platform's features like clubs, hirings, chat, profiles, search, and applications. What would you like to know?",
        "I didn't quite catch that. Try asking me about Clubs, Applications, or Chat!",
        "Could you rephrase? I'm specifically trained to help you navigate features like clubs, messaging, and applications."
    ]);
};

router.post('/chat', async (req, res) => {
    try {
        const { message, user, clubs, applications, history } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ message: 'Message is required' });
        }

        // Only try API if key exists
        if (process.env.GEMINI_API_KEY) {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

                let contextStr = `Platform details:
- A social network for Sathyabama University students and faculty
- Features: Club management, Hiring/Recruitment for clubs, Real-time chat, User profiles
- Audience: Students, Faculty, Club Admins\n\n`;

                if (user) {
                    contextStr += `Current Logged-in User Information:
Name: ${user.name || 'Unknown'}
Register Number: ${user.registerNumber || 'Unknown'}
User Type: ${user.userType || 'Unknown'}
Bio: ${user.bio || 'None'}
Skills: ${user.skills ? user.skills.join(', ') : 'None'}
Email: ${user.email || 'None'}
Phone: ${user.phone || 'None'}
`;
                }

                if (clubs && clubs.length > 0) {
                    contextStr += `\nAvailable Clubs in Sathyabama Connect:\n`;
                    clubs.forEach(c => {
                       contextStr += `- ${c.name} (Type: ${c.category || 'general'}): ${c.description || 'No description'}\n`;
                    });
                }

                if (applications && applications.length > 0) {
                    contextStr += `\nUser's Club Applications:\n`;
                    applications.forEach(app => {
                       // We can try to look up club name if populated, otherwise use what we have
                       const clubName = app.club?.name || app.clubId || 'Unknown Club';
                       contextStr += `- Applied to ${clubName} for position: ${app.hiring?.position || app.position || 'Member'}, Status: ${app.status}\n`;
                    });
                }

                let historyStr = "";
                if (history && history.length > 0) {
                    historyStr += `\nRecent Conversation History:\n`;
                    history.forEach(msg => {
                        historyStr += `${msg.isBot ? 'Bot' : 'User'}: ${msg.text}\n`;
                    });
                }

                const prompt = `You are Nexus AI, a helpful AI assistant for the 'Sathyabama Connect' student platform.
                
${contextStr}
${historyStr}
                
User message: ${message}
                
Respond in a friendly, helpful manner specifically about the platform features and the user's personal details. You have access to the user's profile, clubs, and applications. Keep responses concise (under 50 words unless detail is needed).`;

                const result = await model.generateContent(prompt);
                const response = result.response.text();

                return res.json({ response });
            } catch (apiError) {
                console.error('Gemini API Error:', apiError);
                // Fallback to local response
            }
        }

        // Fallback response
        const fallbackResponse = getLocalResponse(message, user, clubs, applications);
        res.json({ response: fallbackResponse });

    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({
            message: 'Error processing request',
            error: error.message
        });
    }
});

module.exports = router;
