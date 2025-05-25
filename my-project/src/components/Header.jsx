import {
  FaSearch,
  FaUserAlt,
  FaInfoCircle,
  FaHome,
  FaCity,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ✨ استورد خط lobster من Google Fonts لو لسه ما اضفتوش في index.html
// <link href="https://fonts.googleapis.com/css2?family=Lobster&display=swap" rel="stylesheet">

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('searchTerm', searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

  const navItems = (
    <>
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-yellow-300 transition"
        onClick={() => setMenuOpen(false)}
      >
        <FaHome size={16} />
        <li>Home</li>
      </Link>
      <Link
        to="/about"
        className="flex items-center gap-1 hover:text-yellow-300 transition"
        onClick={() => setMenuOpen(false)}
      >
        <FaInfoCircle size={16} />
        <li>About</li>
      </Link>
      <Link to="/profile" onClick={() => setMenuOpen(false)}>
        {currentUser ? (
          <motion.img
            whileHover={{ scale: 1.1 }}
            className="rounded-full h-8 w-8 object-cover border-2 border-white"
            src={currentUser.avatar}
            alt="profile"
          />
        ) : (
          <button className="flex items-center gap-1 bg-yellow-300 text-blue-900 px-3 py-1 rounded-full hover:bg-yellow-400 transition text-sm font-semibold">
            <FaUserAlt size={14} />
            Sign in
          </button>
        )}
      </Link>
    </>
  );

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-r from-white via-blue-300 to-blue-600 shadow-md sticky top-0 z-50 text-white"
    >
      <div className="flex justify-between items-center max-w-6xl mx-auto p-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.08 }} className="flex items-center gap-2">
            <FaCity size={24} className="text-blue-800 drop-shadow" />
            <h1 className="font-[Sacramento] text-2xl sm:text-3xl drop-shadow text-blue-900">
              <span>Reality</span>
              <span className="text-slate-950">Hub</span>
            </h1>
          </motion.div>
        </Link>

        {/* Search */}
        <form
          onSubmit={handleSubmit}
          className="hidden sm:flex bg-white px-4 py-2 rounded-full items-center shadow-inner w-full max-w-md"
        >
          <input
            type="text"
            placeholder="Search properties..."
            className="bg-transparent focus:outline-none w-full text-sm text-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="ml-2 text-blue-700 hover:text-blue-900 transition">
            <FaSearch />
          </button>
        </form>

        {/* Desktop Nav */}
        <ul className="hidden sm:flex items-center gap-6 text-sm sm:text-base font-medium">
          {navItems}
        </ul>

        {/* Mobile menu icon */}
        <button
          className="sm:hidden text-blue-900 text-xl focus:outline-none"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              className="fixed top-0 right-0 w-64 h-full bg-gradient-to-b from-white to-blue-200 text-blue-900 shadow-lg z-50 flex flex-col p-6 gap-6"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <form
                onSubmit={handleSubmit}
                className="flex bg-white px-4 py-2 rounded-full items-center shadow-inner text-black"
              >
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent focus:outline-none w-full text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="ml-2 text-blue-700 hover:text-blue-900 transition">
                  <FaSearch />
                </button>
              </form>

              <ul className="flex flex-col gap-4 text-base font-medium">{navItems}</ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
