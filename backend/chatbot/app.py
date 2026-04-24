"""
Nexus AI - Python Flask Chatbot Server
A friendly assistant bot for the Sathyabama Connect platform.
Uses Google Gemini API for intelligent responses.
"""

import os
import random
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables from parent directory's .env
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

app = Flask(__name__)
CORS(app)

# ─── Configure Gemini ────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash")
else:
    model = None
    print("[WARN] GEMINI_API_KEY not found. Bot will use local fallback responses only.")


# ─── Knowledge Base ──────────────────────────────────────────────────────────
KNOWLEDGE_BASE = {
    "clubs": "Sathyabama Connect has various clubs including technical clubs, cultural clubs, and sports clubs. You can browse all clubs on the Clubs page and apply to join them.",
    "hirings": "Club hirings are positions available in different clubs. You can view open positions on each club's page and submit applications.",
    "chat": "You can chat with other students and faculty using the real-time messaging feature. Go to the Chat page to start conversations.",
    "profile": "Your profile shows your information like name, register number, year, and department. You can update it from the Profile page.",
    "search": "Use the Search page to find other students and faculty members by name or register number.",
    "applications": "Track your club applications on the Applications page. You can see pending, accepted, and rejected applications.",
    "dashboard": "The Dashboard shows an overview of your activity, recent messages, and club updates.",
}


# ─── Local Fallback Responses ────────────────────────────────────────────────
def get_local_response(message: str, user: dict | None, clubs: list | None, applications: list | None) -> str:
    """Generate a fallback response when the Gemini API is unavailable."""
    lower_msg = message.lower()
    pick = lambda arr: random.choice(arr)

    if "club" in lower_msg:
        if clubs:
            club_names = ", ".join(c.get("name", "Unknown") for c in clubs)
            return pick([
                f"Awesome! We currently have these clubs running: {club_names}. You can browse and join them directly from the Clubs page!",
                f"Looking for clubs? We have {club_names} active right now. Feel free to check them out on the Clubs page.",
                f"Sathyabama Connect has a variety of clubs including {club_names}. Head over to the Clubs section to see more details and apply.",
            ])
        return pick([
            "Sathyabama Connect has various clubs including technical clubs, cultural clubs, and sports clubs. You can browse all clubs on the Clubs page.",
            "You can find all active clubs on the Clubs page! There are technical, cultural, and sports clubs waiting for you.",
            "Want to join a club? Head over to the Clubs page to see what's available and submit your application.",
        ])

    if any(kw in lower_msg for kw in ("hiring", "apply", "position")):
        return pick([
            "Club hirings are positions available in different clubs. You can view open positions on each club's page.",
            "Looking to apply? Each club posts its open positions on their specific club page. You can submit applications right there!",
            "You can find open positions and hiring announcements directly on the respective Club's page.",
        ])

    if any(kw in lower_msg for kw in ("chat", "message")):
        return pick([
            "Use the Chat page to send real-time messages to other students and faculty.",
            "Want to talk to someone? The Chat feature lets you message anyone on the platform in real-time.",
            "You can easily connect and message other users by going to the Chat area.",
        ])

    if "profile" in lower_msg:
        if user:
            name = user.get("name", "there")
            reg = user.get("registerNumber", "N/A")
            user_type = user.get("userType", "user")
            return pick([
                f"Your profile shows your name is {name} and your register number is {reg}. You can update other details anytime!",
                f"You are logged in as {name}. You can head to the Profile page to update your bio, skills, and more.",
                f"I see you are logged in as {name} ({user_type}). Your profile settings can be updated on the Profile page.",
            ])
        return pick([
            "Your profile shows your information like name and register number. You can update it from the Profile page.",
            "Go to the Profile page to update your bio, skills, and contact details.",
            "Make sure your profile is up to date! You can edit it directly on your Profile page.",
        ])

    if any(kw in lower_msg for kw in ("search", "find")):
        return pick([
            "Use the Search page to find other students and faculty members by name or register.",
            "You can easily find people on the platform using the global Search feature.",
            "Looking for someone? The Search page lets you find faculty and students across the university.",
        ])

    if "application" in lower_msg:
        if applications:
            count = len(applications)
            return pick([
                f"I see you have submitted {count} club applications. You can track their status on the Applications page.",
                f"You currently have {count} applications on file. Check the Applications page for status updates!",
                f"Great! You've made {count} applications to clubs so far. Track them on your Applications page.",
            ])
        return pick([
            "Track your club applications on the Applications page. You can see pending, accepted, and rejected statuses.",
            "Keep an eye on your submitted applications by visiting the Applications page.",
            "The Applications page is where you can monitor all the positions you've applied for.",
        ])

    if any(kw in lower_msg for kw in ("dashboard", "home")):
        return pick([
            "The Dashboard shows an overview of your activity, recent messages, and club updates.",
            "Your personalized homepage is the Dashboard, where you can see all recent updates.",
            "Head to the Dashboard for a quick summary of what's happening around you.",
        ])

    if any(kw in lower_msg for kw in ("hello", "hi", "hey")):
        name = user.get("name", "there") if user else "there"
        return pick([
            f"Hi {name}! I'm Nexus AI, your assistant. I can help you with questions about clubs, chat, profiles, and more.",
            f"Hello {name}! What can I help you discover on the platform today?",
            f"Hey {name}! I'm here to answer any questions you have about the features.",
        ])

    if "help" in lower_msg:
        return pick([
            "I can help you with:\n• Clubs - Browse and join clubs\n• Hirings - View open positions\n• Chat - Message other users\n• Profile - Update your info\nWhat would you like to know more about?",
            "Need assistance? I know all about Clubs, Chat, Profiles, Search, and tracking Applications. Ask away!",
            "I'm here to help navigate the platform. You can ask me about chatting, applying to clubs, or updating your profile.",
        ])

    if "thank" in lower_msg:
        return pick([
            "You're welcome! Feel free to ask if you have more questions.",
            "No problem at all! Let me know if you need anything else.",
            "Anytime! I'm always here to help.",
        ])

    return pick([
        "I can help you with information about the platform's features like clubs, hirings, chat, profiles, search, and applications. What would you like to know?",
        "I didn't quite catch that. Try asking me about Clubs, Applications, or Chat!",
        "Could you rephrase? I'm specifically trained to help you navigate features like clubs, messaging, and applications.",
    ])


# ─── Build Context for Gemini Prompt ─────────────────────────────────────────
def build_context(user: dict | None, clubs: list | None, applications: list | None) -> str:
    """Build a rich context string from user data, clubs, and applications."""
    context = (
        "Platform details:\n"
        "- A social network for Sathyabama University students and faculty\n"
        "- Features: Club management, Hiring/Recruitment for clubs, Real-time chat, User profiles\n"
        "- Audience: Students, Faculty, Club Admins\n\n"
    )

    if user:
        context += (
            "Current Logged-in User Information:\n"
            f"Name: {user.get('name', 'Unknown')}\n"
            f"Register Number: {user.get('registerNumber', 'Unknown')}\n"
            f"User Type: {user.get('userType', 'Unknown')}\n"
            f"Bio: {user.get('bio', 'None')}\n"
            f"Skills: {', '.join(user.get('skills', [])) or 'None'}\n"
            f"Email: {user.get('email', 'None')}\n"
            f"Phone: {user.get('phone', 'None')}\n\n"
        )

    if clubs:
        context += "Available Clubs in Sathyabama Connect:\n"
        for c in clubs:
            name = c.get("name", "Unknown")
            category = c.get("category", "general")
            desc = c.get("description", "No description")
            context += f"- {name} (Type: {category}): {desc}\n"
        context += "\n"

    if applications:
        context += "User's Club Applications:\n"
        for app in applications:
            club_name = app.get("club", {}).get("name") if isinstance(app.get("club"), dict) else app.get("clubId", "Unknown Club")
            position = app.get("hiring", {}).get("position") if isinstance(app.get("hiring"), dict) else app.get("position", "Member")
            status = app.get("status", "unknown")
            context += f"- Applied to {club_name} for position: {position}, Status: {status}\n"
        context += "\n"

    return context


def build_history_str(history: list | None) -> str:
    """Format conversation history for the prompt."""
    if not history:
        return ""
    lines = ["Recent Conversation History:"]
    for msg in history:
        role = "Bot" if msg.get("isBot") else "User"
        lines.append(f"{role}: {msg.get('text', '')}")
    return "\n".join(lines) + "\n"


# ─── Chat Endpoint ───────────────────────────────────────────────────────────
@app.route("/api/bot/chat", methods=["POST"])
def chat():
    """Handle incoming chat messages. Uses Gemini API with local fallback."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "Request body is required"}), 400

        message = (data.get("message") or "").strip()
        if not message:
            return jsonify({"message": "Message is required"}), 400

        user = data.get("user")
        clubs = data.get("clubs")
        applications = data.get("applications")
        history = data.get("history")

        # Try Gemini API first
        if model:
            try:
                context_str = build_context(user, clubs, applications)
                history_str = build_history_str(history)

                prompt = (
                    "You are Nexus AI, a helpful and friendly AI assistant for the 'Sathyabama Connect' student platform.\n\n"
                    f"{context_str}"
                    f"{history_str}\n"
                    f"User message: {message}\n\n"
                    "Respond in a friendly, helpful manner specifically about the platform features and the user's personal details. "
                    "You have access to the user's profile, clubs, and applications. "
                    "Keep responses concise (under 50 words unless detail is needed)."
                )

                result = model.generate_content(prompt)
                response_text = result.text
                return jsonify({"response": response_text})

            except Exception as api_error:
                print(f"[WARN] Gemini API Error: {api_error}")
                # Fall through to local fallback

        # Fallback to local response
        fallback = get_local_response(message, user, clubs, applications)
        return jsonify({"response": fallback})

    except Exception as e:
        print(f"[ERROR] Chat Error: {e}")
        return jsonify({"message": "Error processing request", "error": str(e)}), 500


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.route("/api/bot/health", methods=["GET"])
def health():
    """Simple health-check endpoint."""
    return jsonify({
        "status": "ok",
        "gemini_configured": model is not None,
    })


# ─── Entry Point ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.getenv("BOT_PORT", 5001))
    print(f"[BOT] Nexus AI Python server running on port {port}")
    print(f"   Gemini API: {'[OK] Configured' if model else '[X] Not configured'}")
    app.run(host="0.0.0.0", port=port, debug=False)
