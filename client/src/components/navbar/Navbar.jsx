import { useContext, useState } from "react";
import "./navbar.scss";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useNotificationStore } from "../../lib/notificationStore";

function Navbar() {
  const [open, setOpen] = useState(false);
  const [showSignupPopup, setShowSignupPopup] = useState(false);
  const { currentUser } = useContext(AuthContext);

  const fetch = useNotificationStore((state) => state.fetch);
  const number = useNotificationStore((state) => state.number);
  const navigate = useNavigate();

  if (currentUser) fetch();

  const handleOpenSignupPopup = () => {
    setShowSignupPopup(true);
  };

  const handleCloseSignupPopup = () => {
    setShowSignupPopup(false);
  };

  const handleUserSignup = () => {
    setShowSignupPopup(false);
    navigate("/register"); // you can handle this in your register page if needed
  };

  const handleAgentSignup = () => {
    setShowSignupPopup(false);
    navigate("/register"); // you can handle this in your register page if needed
  };

  return (
    <>
      <nav>
        <div className="left">
          <a href="/" className="logo">
            <img src="/hh.webp" alt="" />
            <span>HouseHunt</span>
          </a>
          <a href="/">Home</a>
          <a href="/">About</a>
          <a href="/">Contact</a>
        </div>
        <div className="right">
          {currentUser ? (
            <div className="user">
              <img src={currentUser.avatar || "/noavatar.jpg"} alt="" />
              <span>{currentUser.username}</span>
              <Link to="/profile" className="profile">
                {number > 0 && <div className="notification">{number}</div>}
                <span>Profile</span>
              </Link>
            </div>
          ) : (
            <>
              <a href="/login">Sign in</a>
              {/* Instead of direct link, open popup */}
              <button onClick={handleOpenSignupPopup} className="register">
                Sign up
              </button>
            </>
          )}
          <div className="menuIcon">
            <img
              src="/menu.png"
              alt=""
              onClick={() => setOpen((prev) => !prev)}
            />
          </div>
          <div className={open ? "menu active" : "menu"}>
            <a href="/">Home</a>
            <a href="/">About</a>
            <a href="/">Contact</a>
            <a href="/">Agents</a>
            <a href="/login">Sign in</a>
            {/* Mobile version also opens popup */}
            <button onClick={handleOpenSignupPopup} className="register">
              Sign up
            </button>
          </div>
        </div>
      </nav>

      {/* Signup Modal Popup */}
      {showSignupPopup && (
        <div className="modalOverlay1" onClick={handleCloseSignupPopup}>
          <div className="modalContent1" onClick={(e) => e.stopPropagation()}>
            <h2>Sign up</h2>
            <p>Please select if you are signing up as a User or an Agent.</p>
            <div className="modalButtons1">
              <button className="modalBtn1" onClick={handleUserSignup}>
                User
              </button>
              <button className="modalBtn1" onClick={handleAgentSignup}>
                Agent
              </button>
            </div>
            <button className="closeBtn1" onClick={handleCloseSignupPopup}>
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
