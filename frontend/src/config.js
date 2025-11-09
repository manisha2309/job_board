const config = {
  API_URL: process.env.NODE_ENV === 'production' 
    ? 'https://job-board-0cze.onrender.com/'  // Your actual backend URL
    : 'http://localhost:5000'
};

export default config;