import { useState, useEffect } from 'react';
import { Navbar, Nav, Button, Form, Collapse } from 'react-bootstrap';
import { BsSearch } from 'react-icons/bs';
import { FaUserCircle } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import { MdEventNote } from 'react-icons/md';
import { FiSettings } from 'react-icons/fi';
import { CgProfile } from 'react-icons/cg';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../styles/MyNavbar.css';
import logoLight from '../../assets/reservation-logo-light.png';
import logoDark from '../../assets/reservation-logo-dark.png';
import { login, getToken, logout, getUserName, getUserRole } from '../../services/authService';

const MyNavbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());
  const [scrollDirection, setScrollDirection] = useState('up');
  const [lastScrollY, setLastScrollY] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = getToken();
      setIsLoggedIn(!!token);
    };

    const handleLogoutEvent = (e) => {
      setIsLoggedIn(false);
      resetLoginForm();
      
      if (e.detail?.reason === 'expired') {
        toast.error('Your session has expired. Please log in again.');
      }
    };

    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);
    window.addEventListener('userLoggedOut', handleLogoutEvent);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('userLoggedOut', handleLogoutEvent);
    };
  }, []);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY + 10) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY - 10 || currentScrollY <= 0) {
        setScrollDirection('up');
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]);

  const toggleMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark', !isDarkMode);
    document.body.classList.toggle('light', isDarkMode);
  };

  const toggleLogin = () => {
    const token = getToken();
    setIsLoggedIn(!!token);
    setShowLogin(!showLogin);
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    // Check if fields are empty
    if (!loginData.username.trim() || !loginData.password.trim()) {
      setLoginError('Please fill in both username and password fields');
      return;
    }
    
    try {
      const role = await login(loginData.username, loginData.password);
      setShowLogin(false);
      setIsLoggedIn(true);
      
      if (role === 'SPACE_RENTER') {
        navigate('/space-renter');
      } else if (role === 'EVENT_ORGANIZER') {
        navigate('/event-organizer');
      }
    } catch {
      setLoginError('Invalid username or password');
    }
  };

  const resetLoginForm = () => {
    setLoginData({
      username: '',
      password: ''
    });
    setLoginError('');
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setShowLogin(false);
    resetLoginForm();
    navigate('/');
  };

  const handleSignUpClick = () => {
    setShowLogin(false);
  };

  const navigateToMyReservations = () => {
    navigate('/my-reservations');
    setShowLogin(false);
  };

  const navigateToPreferences = () => {
    navigate('/preferences');
    setShowLogin(false);
  };

  const navigateToProfileSettings = () => {
    navigate('/profile-settings');
    setShowLogin(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/events?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <Navbar 
      id="MyNavbar2" 
      variant="dark" 
      expand="lg" 
      className={`mb-4 w-100 ${scrollDirection === 'up' ? 'navbar-scrolled-up' : 'navbar-scrolled-down'}`}
    >
      <Navbar.Brand as={Link} to="/" className="navbar-brand d-flex align-items-center ms-4">
        <img
          src={isDarkMode ? logoDark : logoLight}
          height="35"
          className="d-inline-block ms-3 align-middle"
          alt="Reservo logo"
        />
        <span className="ps-3 pe-5 align-middle">Reservo</span>
      </Navbar.Brand>

      <Navbar.Toggle aria-controls="basic-navbar-nav" className="navbar-toggler" />
      <Navbar.Collapse id="basic-navbar-nav">
        <div className="d-flex flex-column flex-lg-row w-100 align-items-center">
          <Nav className="flex-grow-1 d-flex justify-content-start flex-column flex-lg-row">
            <Nav.Link as={Link} to="/" className="nav-link">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/events" className="nav-link">
              Events
            </Nav.Link>
            <Nav.Link as={Link} to="/localities" className="nav-link">
              Localities
            </Nav.Link>
            <Nav.Link as={Link} to="/categories" className="nav-link">
              Categories
            </Nav.Link>
            <Nav.Link as={Link} to="/contact" className="nav-link">
              Contact
            </Nav.Link>
            <Nav.Link as={Link} to="/about" className="nav-link">
              About Us
            </Nav.Link>
          </Nav>

          <div className="d-flex align-items-center flex-column flex-lg-row">
            <Form className="d-flex align-items-center search-bar me-3 mb-2 mb-lg-0" onSubmit={handleSearch}>
              <Button variant="outline-light" className="me-1 rounded-pill border-0 search-button" type="submit">
                <BsSearch />
              </Button>
              <Form.Control 
                type="text" 
                placeholder="Search" 
                className="rounded-pill border-0 search-input" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Form>
            <Nav>
              <Button
                className="outline-light me-5 rounded-pill border-0 user-icon-btn"
                onClick={toggleLogin}
              >
                <FaUserCircle size={35} />
              </Button>
            </Nav>
            <Button onClick={toggleMode} className="me-2 rounded-pill btn-light-toggle">
              {isDarkMode ? '☀️' : '🌙'}
            </Button>
          </div>
        </div>
        <Collapse in={showLogin}>
          <div className={`login-form-container ${isDarkMode ? 'dark' : 'light'}`}>
            {isLoggedIn ? (
              <div className={`p-3 rounded shadow-sm ${isDarkMode ? 'form-dark' : 'form-light'}`}>
                <div className="text-center mb-3">
                  <FaUserCircle size={50} />
                  <p className="mt-2 mb-3">Welcome, {getUserName()}</p>
                  <div className="user-menu-buttons">
                    <Button 
                      variant="primary" 
                      onClick={navigateToProfileSettings} 
                      className="w-100 mb-2 user-menu-btn d-flex align-items-center justify-content-center"
                    >
                      <CgProfile size={18} className="me-2" />
                      Profile Settings
                    </Button>
                    {getUserRole() === 'REGISTERED_USER' && (
                      <>
                        <Button 
                          variant="primary" 
                          onClick={navigateToMyReservations} 
                          className="w-100 mb-2 user-menu-btn d-flex align-items-center justify-content-center"
                        >
                          <MdEventNote size={18} className="me-2" />
                          My Reservations
                        </Button>
                        <Button 
                          variant="primary" 
                          onClick={navigateToPreferences} 
                          className="w-100 mb-2 user-menu-btn d-flex align-items-center justify-content-center"
                        >
                          <FiSettings size={18} className="me-2" />
                          Preferences
                        </Button>
                      </>
                    )}
                    <Button 
                      variant="danger" 
                      onClick={handleLogout} 
                      className="w-100 user-menu-btn d-flex align-items-center justify-content-center"
                    >
                      <FiLogOut size={18} className="me-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Form onSubmit={handleLoginSubmit}
                className={`p-3 rounded shadow-sm ${isDarkMode ? 'form-dark' : 'form-light'}`}
              >
                <Form.Group className="mb-3" controlId="formBasicUsername">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder="Enter username"
                    value={loginData.username}
                    onChange={handleLoginChange}
                    className={isDarkMode ? 'dark-input' : 'light-input'}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    className={isDarkMode ? 'dark-input' : 'light-input'}
                  />
                </Form.Group>
                <div className="d-flex justify-content-between">
                  <Button variant="primary" type="submit" className="navbar-btn me-2">
                    Log In
                  </Button>
                  <Link to="/signup">
                    <Button variant="secondary" className="navbar-btn" onClick={handleSignUpClick}>
                      Sign Up
                    </Button>
                  </Link>
                </div>
                {loginError && <div className="alert alert-danger mt-3">{loginError}</div>}
              </Form>
            )}
          </div>
        </Collapse>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default MyNavbar;
