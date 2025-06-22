import { useEffect, useState, React } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/auth/authSlice";
import {
  MdOutlineCreate,
  MdOutlineDashboard,
  MdMailOutline,
  MdAttachMoney,
  MdOutlineAccountCircle,
  MdNotifications,
  MdMenu,
} from "react-icons/md";
import {
  IoCloseSharp,
  IoDocumentTextOutline,
  IoLogOutOutline,
  IoChevronDown,
} from "react-icons/io5";
import { RiAuctionLine } from "react-icons/ri";

export const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useSelector((state) => state.auth);  

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 0;
      setScrolled(isScrolled);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // User logout
  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    setIsProfileDropdownOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileDropdownOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileDropdownOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className={`sticky top-0 z-40 backdrop-blur-md transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 shadow-lg border-b border-gray-200/50' 
          : 'bg-white/80 shadow-sm'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            
                <Link 
                    to="/" 
                    className="flex items-center space-x-2 group transition-transform duration-200 hover:scale-105"
                >
                    <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                        <RiAuctionLine className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Auction Nest
                    </span>
                </Link>
             

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navMenu.slice(0, 4).map((item) => (
                <NavLink
                  to={item.link}
                  key={item.link}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg font-medium transition-all duration-200 relative group ${
                      isActive
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                    }`
                  }
                >
                  {item.name}
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                </NavLink>
              ))}
            </nav>

            {/* Desktop Right Section */}
            <div className="hidden lg:flex items-center space-x-4">
              {user ? (
                <>
                  {/* Notifications */}
                  <button className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 relative">
                    <MdNotifications className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                  </button>

                  {/* Profile Dropdown */}
                  <div className="relative profile-dropdown">
                    <button
                      onClick={toggleProfileDropdown}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden ring-2 ring-white shadow-md">
                        {user.user.avatar ? (
                          <span className="text-xs font-medium text-white">
                          {user.user.name?.charAt(0)?.toUpperCase()}
                        </span>
                        ) : (
                          <span className="text-xs font-medium text-white">
                            {user.user.name?.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <IoChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                        isProfileDropdownOpen ? 'rotate-180' : ''
                      }`} />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-medium text-gray-900">{user.user.name}</p>
                          <p className="text-sm text-gray-500 truncate">{user.user.email}</p>
                        </div>
                        
                       
                        <NavLink
                          to="/profile"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-200"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <MdOutlineAccountCircle className="mr-3 h-5 w-5" />
                          Profile
                        </NavLink>
                        
                        <hr className="my-2" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-red-700 hover:bg-red-50 transition-colors duration-200"
                        >
                          <IoLogOutOutline className="mr-3 h-5 w-5" />
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
            >
              <MdMenu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all duration-300 lg:hidden ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out lg:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Mobile Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg shadow-lg">
              <RiAuctionLine className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Auction Nest
            </span>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors duration-200 focus:outline-none"
            aria-label="Close menu"
          >
            <IoCloseSharp className="h-6 w-6" />
          </button>
        </div>

        {/* User Profile Section */}
        {user && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden ring-2 ring-white shadow-lg">
                {user.user.avatar ? (
                   <span className="text-lg font-semibold text-white">
                   {user.user.name?.charAt(0)?.toUpperCase()}
                 </span>
                ) : (
                  <span className="text-lg font-semibold text-white">
                    {user.user.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{user.user.name}</p>
                <p className="text-sm text-gray-600 truncate">{user.user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        <nav className="flex-1 overflow-y-auto p-6">
          <ul className="space-y-2">
            {navMenu.map((item) => (
              <li key={item.link}>
                <NavLink
                  to={item.link}
                  className={({ isActive }) =>
                    `flex items-center py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                      isActive
                        ? "text-indigo-600 bg-indigo-50 border-l-4 border-indigo-600"
                        : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="mr-4 text-xl">{item.icon}</span>
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Additional Options for Logged In Users */}
          {user ? (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Account
              </h3>
              <ul className="space-y-2">
                <li>
                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      `flex items-center py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                        isActive
                          ? "text-indigo-600 bg-indigo-50"
                          : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MdOutlineAccountCircle className="mr-4 h-5 w-5" />
                    Profile
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/myauction"
                    className={({ isActive }) =>
                      `flex items-center py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                        isActive
                          ? "text-indigo-600 bg-indigo-50"
                          : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MdAttachMoney className="mr-4 h-5 w-5" />
                    My Auctions
                  </NavLink>
                </li>
                <li>
                  <button
                    className="flex items-center w-full py-3 px-4 text-red-700 hover:bg-red-50 rounded-xl font-medium transition-all duration-200"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <IoLogOutOutline className="mr-4 h-5 w-5" />
                    Sign out
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
              <Link
                to="/login"
                className="block w-full py-3 px-4 text-center text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="block w-full py-3 px-4 text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </>
  );
};

export const LoginSignup = () => {
  return (
    <>
      <Link
        to="/login"
        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium hidden md:block"
      >
        Log in
      </Link>
      <Link
        to="/signup"
        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hidden md:block"
      >
        Sign up
      </Link>
    </>
  );
};

const navMenu = [
  {
    name: "Dashboard",
    link: "/dashboard",
    icon: <MdOutlineDashboard className="h-5 w-5" />,
  },
  {
    name: "View Auctions",
    link: "/auction",
    icon: <RiAuctionLine className="h-5 w-5" />,
  },
  {
    name: "Create Auction",
    link: "/create",
    icon: <MdOutlineCreate className="h-5 w-5" />,
  },
  {
    name: "My Auctions",
    link: "/myauction",
    icon: <MdAttachMoney className="h-5 w-5" />,
  },
  {
    name: "About",
    link: "/about",
    icon: <MdOutlineAccountCircle className="h-5 w-5" />,
  },
  {
    name: "Contact",
    link: "/contact",
    icon: <MdMailOutline className="h-5 w-5" />,
  },
  {
    name: "Legal",
    link: "/legal",
    icon: <IoDocumentTextOutline className="h-5 w-5" />,
  },
];