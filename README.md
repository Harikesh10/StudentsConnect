# Sathyabama Connect

A college networking platform for Sathyabama Institute of Science and Technology - similar to Fiverr/LinkedIn where students can showcase portfolios, connect with peers, and join clubs.

## Features

### For Students
- 🎓 **Portfolio Management**: Create and update your professional portfolio with skills and projects
- 🔍 **Search**: Find other students by name, register number, or skills
- 👥 **Clubs**: Browse and apply to student clubs and chapters
- 💬 **Real-time Chat**: Connect with students, faculty, and club admins
- 📋 **Applications**: Track your club applications

### For Clubs
- 📢 **Post Opportunities**: Create hiring posts for club positions
- 👨‍💼 **Manage Applications**: Review and accept/reject student applications
- 💬 **Chat**: Communicate with interested students

### For Faculty
- 👀 **View Portfolios**: Browse student portfolios
- 💬 **Mentorship**: Chat with students for guidance

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, React Router
- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas
- **Real-time**: Socket.IO
- **Authentication**: JWT

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (already configured)

## Installation & Setup

### 1. Clone or Extract the Project

```bash
cd sathyabama-connect
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Seed the Database with Test Data

```bash
npm run seed
```

This will create test accounts for:
- 5 Students (with different skills)
- 3 Clubs (with open positions)
- 1 Faculty member

### 4. Start the Backend Server

```bash
npm start
```

Backend will run on `http://localhost:5000`

### 5. Install Frontend Dependencies (New Terminal)

```bash
cd ../frontend
npm install
```

### 6. Start the Frontend

```bash
npm start
```

Frontend will run on `http://localhost:3000`

## Demo Accounts

### Students
| Name | Register Number | Password | Skills |
|------|----------------|----------|--------|
| Rahul Kumar | 41520104001 | demo123 | React, Python, Machine Learning, TensorFlow |
| Priya Sharma | 41520104002 | demo123 | UI/UX Design, Figma, Web Design, Adobe XD |
| Arjun Patel | 41520104003 | demo123 | JavaScript, Node.js, MongoDB, Express |
| Ananya Reddy | 41520104004 | demo123 | Java, Spring Boot, MySQL, REST API |
| Vikram Singh | 41520104005 | demo123 | Flutter, Mobile Development, Firebase, Dart |

### Clubs
| Name | Username | Password | Open Positions |
|------|----------|----------|----------------|
| Coding Club | codingclub | demo123 | Web Developer, Content Writer |
| Robotics Club | roboticsclub | demo123 | Arduino Programmer |
| Design Club | designclub | demo123 | Graphic Designer |

### Faculty
| Name | Register Number | Password | Department |
|------|----------------|----------|------------|
| Dr. Ramesh Kumar | FAC001 | demo123 | Computer Science |

## Quick Demo Guide

### 1. Student Experience
1. Login as **Rahul Kumar** (41520104001 / demo123)
2. Search for students by typing "Python" or "React" in Search page
3. Browse clubs and view their open positions
4. Apply to "Coding Club - Web Developer" position
5. Chat with other students or clubs

### 2. Club Experience
1. Login as **Coding Club** (codingclub / demo123)
2. View received applications in Applications page
3. Accept or reject applications
4. Chat with applicants

### 3. Testing Search
Try these search queries:
- "React" - finds Rahul Kumar
- "Design" - finds Priya Sharma
- "41520104003" - finds Arjun Patel
- "Ananya" - finds Ananya Reddy
- "Flutter" - finds Vikram Singh

## Project Structure

```
sathyabama-connect/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Message.js
│   │   └── Application.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── clubs.js
│   │   ├── messages.js
│   │   └── applications.js
│   ├── server.js
│   ├── seedData.js
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Navbar.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Dashboard.js
    │   │   ├── Profile.js
    │   │   ├── Search.js
    │   │   ├── Clubs.js
    │   │   ├── ClubDetail.js
    │   │   ├── Chat.js
    │   │   └── Applications.js
    │   ├── services/
    │   │   ├── api.js
    │   │   └── socket.js
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## Key Features Walkthrough

### Portfolio Management
- Students can update their bio, skills, email, and phone
- Skills are displayed as tags and searchable
- Easy-to-use interface for adding/removing skills

### Search Functionality
- Search students by:
  - Name (partial matches work)
  - Register number
  - Skills (finds students with matching skills)
- Real-time results
- Direct message button from search results

### Club System
- Clubs can post multiple hiring opportunities
- Students can browse all clubs and their positions
- One-click apply with optional message
- Application tracking for both students and clubs

### Real-time Chat
- Socket.IO powered instant messaging
- Online/offline status indicators
- Conversation history
- Unread message counts
- Works between students, clubs, and faculty

## Troubleshooting

### Backend won't start
- Make sure MongoDB URI in `.env` is correct
- Check if port 5000 is available
- Run `npm install` again

### Frontend won't start
- Make sure backend is running first
- Check if port 3000 is available
- Clear node_modules and run `npm install` again

### Can't login
- Make sure you've run `npm run seed` in the backend
- Check backend console for errors
- Verify MongoDB connection

### Chat not working
- Make sure both frontend and backend are running
- Check browser console for Socket.IO errors
- Verify backend Socket.IO is running on port 5000

## Database Schema

### User Model
- Handles Students, Faculty, and Clubs
- Fields: registerNumber, password, userType, name, skills, bio, etc.
- Club-specific: hirings array
- Online status tracking

### Message Model
- Stores chat messages between users
- References sender and receiver
- Read/unread status
- Timestamp

### Application Model
- Links students to club hiring posts
- Status: pending, accepted, rejected
- Optional application message

## Future Enhancements
- Email notifications for applications
- File upload for portfolios (resume, certificates)
- Advanced filtering and sorting
- User verification system
- Club member management
- Event management for clubs

## Support

For issues or questions:
1. Check the troubleshooting section
2. Verify all dependencies are installed
3. Make sure MongoDB is accessible
4. Check console logs for errors

## License

This is a prototype/demo project for Sathyabama Institute of Science and Technology.
