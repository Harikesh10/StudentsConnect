require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    console.log('Cleared existing users');

    const hashedPassword = await bcrypt.hash('demo123', 10);

    // Create Students
    const students = [
      {
        registerNumber: '41520104001',
        password: hashedPassword,
        userType: 'student',
        name: 'Rahul Kumar',
        skills: ['React', 'Python', 'Machine Learning', 'TensorFlow'],
        bio: 'Passionate about AI and web development. Love building intelligent applications.',
        email: 'rahul.kumar@sathyabama.ac.in',
        phone: '9876543210',
        projects: [
          {
            title: 'AI Chatbot',
            description: 'Built a customer service chatbot using Python and NLP',
            link: 'github.com/rahul/chatbot'
          }
        ]
      },
      {
        registerNumber: '41520104002',
        password: hashedPassword,
        userType: 'student',
        name: 'Priya Sharma',
        skills: ['UI/UX Design', 'Figma', 'Web Design', 'Adobe XD'],
        bio: 'UI/UX designer focused on creating beautiful and intuitive user experiences.',
        email: 'priya.sharma@sathyabama.ac.in',
        phone: '9876543211',
        projects: [
          {
            title: 'Mobile App Redesign',
            description: 'Redesigned a food delivery app for better user experience',
            link: 'behance.net/priya/redesign'
          }
        ]
      },
      {
        registerNumber: '41520104003',
        password: hashedPassword,
        userType: 'student',
        name: 'Arjun Patel',
        skills: ['JavaScript', 'Node.js', 'MongoDB', 'Express'],
        bio: 'Full-stack developer specializing in MERN stack applications.',
        email: 'arjun.patel@sathyabama.ac.in',
        phone: '9876543212',
        projects: [
          {
            title: 'E-commerce Platform',
            description: 'Built a complete e-commerce solution with payment integration',
            link: 'github.com/arjun/ecommerce'
          }
        ]
      },
      {
        registerNumber: '41520104004',
        password: hashedPassword,
        userType: 'student',
        name: 'Ananya Reddy',
        skills: ['Java', 'Spring Boot', 'MySQL', 'REST API'],
        bio: 'Backend developer with expertise in Java enterprise applications.',
        email: 'ananya.reddy@sathyabama.ac.in',
        phone: '9876543213',
        projects: [
          {
            title: 'Library Management System',
            description: 'Developed a comprehensive library management system',
            link: 'github.com/ananya/library'
          }
        ]
      },
      {
        registerNumber: '41520104005',
        password: hashedPassword,
        userType: 'student',
        name: 'Vikram Singh',
        skills: ['Flutter', 'Mobile Development', 'Firebase', 'Dart'],
        bio: 'Mobile app developer creating cross-platform applications with Flutter.',
        email: 'vikram.singh@sathyabama.ac.in',
        phone: '9876543214',
        projects: [
          {
            title: 'Fitness Tracker App',
            description: 'Built a fitness tracking app with workout plans',
            link: 'github.com/vikram/fitness'
          }
        ]
      }
    ];

    // Create Clubs
    const clubs = [
      {
        registerNumber: 'codingclub',
        password: hashedPassword,
        userType: 'club',
        name: 'Coding Club',
        clubDescription: 'Learn and practice competitive programming. We conduct weekly coding contests and workshops on algorithms and data structures.',
        clubType: 'Technical',
        email: 'codingclub@sathyabama.ac.in',
        hirings: [
          {
            title: 'Web Developer - Club Website',
            description: 'Looking for 2 web developers to revamp our club website',
            requirements: 'Experience with React, Node.js, and responsive design',
            status: 'open'
          },
          {
            title: 'Content Writer',
            description: 'Need someone to write technical blogs and tutorials',
            requirements: 'Good writing skills and knowledge of programming',
            status: 'open'
          }
        ]
      },
      {
        registerNumber: 'roboticsclub',
        password: hashedPassword,
        userType: 'club',
        name: 'Robotics Club',
        clubDescription: 'Build robots and participate in competitions. We work on Arduino, Raspberry Pi, and various robotics projects.',
        clubType: 'Technical',
        email: 'roboticsclub@sathyabama.ac.in',
        hirings: [
          {
            title: 'Arduino Programmer',
            description: 'Need Arduino programmers for upcoming robotics competition project',
            requirements: 'Experience with Arduino, C++, and basic electronics',
            status: 'open'
          }
        ]
      },
      {
        registerNumber: 'designclub',
        password: hashedPassword,
        userType: 'club',
        name: 'Design Club',
        clubDescription: 'Creative design and UI/UX community. We organize design workshops, hackathons, and collaborate on design projects.',
        clubType: 'Creative',
        email: 'designclub@sathyabama.ac.in',
        hirings: [
          {
            title: 'Graphic Designer',
            description: 'Looking for graphic designers for college fest posters',
            requirements: 'Proficiency in Adobe Photoshop, Illustrator',
            status: 'open'
          }
        ]
      }
    ];

    // Create Faculty
    const faculty = [
      {
        registerNumber: 'FAC001',
        password: hashedPassword,
        userType: 'faculty',
        name: 'Dr. Ramesh Kumar',
        department: 'Computer Science and Engineering',
        email: 'dr.ramesh@sathyabama.ac.in',
        phone: '9876543220',
        bio: 'Professor with 15+ years of experience in Computer Science'
      }
    ];

    // Insert all data
    await User.insertMany([...students, ...clubs, ...faculty]);

    console.log('✅ Seed data created successfully!');
    console.log('\n=== TEST CREDENTIALS ===');
    console.log('\nStudents:');
    students.forEach(s => console.log(`  ${s.name}: ${s.registerNumber} / demo123`));
    console.log('\nClubs:');
    clubs.forEach(c => console.log(`  ${c.name}: ${c.registerNumber} / demo123`));
    console.log('\nFaculty:');
    faculty.forEach(f => console.log(`  ${f.name}: ${f.registerNumber} / demo123`));
    console.log('\n========================\n');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
