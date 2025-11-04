# Job Board Application

A full-stack job board web application built with React, Node.js, Express, and MongoDB. This platform allows employers to post job openings and job seekers to search and apply for jobs.

## Features

### For Job Seekers (Candidates)
- User registration and authentication
- Browse and search job listings with filters
- View detailed job information
- Apply for jobs with resume upload
- Track application status
- Manage personal profile with skills and experience

### For Employers
- Post new job openings
- Manage job listings (edit, close, delete)
- View and manage applications
- Update application status
- Company profile management

### General Features
- Secure authentication with JWT
- Responsive design for mobile and desktop
- Real-time notifications for successful applications and updates
- Search functionality with multiple filters (location, type, category)
- Email notifications (can be configured)

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Multer for file uploads

### Frontend
- React.js
- React Router for navigation
- Axios for API calls
- Context API for state management
- CSS3 for styling

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jobboard
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

4. Create an `uploads` folder in the backend directory:
```bash
mkdir uploads
```

5. Start the backend server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The application will open in your browser at `http://localhost:3000`

## Usage

### For Job Seekers

1. **Register**: Create an account by selecting "Job Seeker" as your role
2. **Browse Jobs**: Navigate to the "Find Jobs" page to see all available positions
3. **Search & Filter**: Use the search bar and filters to find relevant jobs
4. **Apply**: Click on a job to view details and submit your application with a resume
5. **Track Applications**: View all your applications and their status in your dashboard
6. **Update Profile**: Add your skills, experience, and education in the profile section

### For Employers

1. **Register**: Create an account by selecting "Employer" as your role
2. **Post Jobs**: Click "Post Job" to create a new job listing
3. **Manage Listings**: View all your posted jobs in the employer dashboard
4. **Review Applications**: Click on any job to see all applications received
5. **Update Status**: Change application status (reviewed, shortlisted, rejected)
6. **Close Jobs**: Mark jobs as closed when no longer accepting applications

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create job (employer only)
- `PUT /api/jobs/:id` - Update job (employer only)
- `DELETE /api/jobs/:id` - Delete job (employer only)
- `GET /api/jobs/employer/my-jobs` - Get employer's jobs

### Applications
- `POST /api/applications` - Submit application (candidate only)
- `GET /api/applications/my-applications` - Get candidate's applications
- `GET /api/applications/job/:jobId` - Get applications for a job (employer only)
- `PUT /api/applications/:id/status` - Update application status (employer only)

## Project Structure
```
job-board/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Job.js
│   │   └── Application.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── jobs.js
│   │   └── applications.js
│   ├── uploads/
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
└── README.md
```

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected routes and API endpoints
- Role-based access control
- Input validation
- File upload restrictions

## Future Enhancements

- Email notifications
- Advanced search with AI matching
- Video interview integration
- Company profiles with ratings
- Saved jobs and favorites
- Application tracking timeline
- Analytics dashboard
- Multi-language support

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@jobboard.com or create an issue in the repository.

## Authors

- Your Name - Initial work

## Acknowledgments

- Thanks to all contributors
- Inspired by leading job boards like Indeed and LinkedIn