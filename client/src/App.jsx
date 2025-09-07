import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-900 flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/create" element={<CreatePost />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="/profile/:id?" element={<Profile />} />
              <Route path="/bookmarks" element={
                <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Bookmarks</h1>
                    <p className="text-gray-400">Coming soon...</p>
                  </div>
                </div>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;