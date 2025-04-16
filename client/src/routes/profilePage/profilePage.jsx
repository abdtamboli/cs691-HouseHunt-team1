import Chat from "../../components/chat/Chat";
import List from "../../components/list/List";
import "./profilePage.scss";
import apiRequest from "../../lib/apiRequest";
import {
  Await,
  useLoaderData,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Suspense, useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

function ProfilePage() {
  const data = useLoaderData();
  const { updateUser, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  // Extract the chatWith data (if the user navigated from SinglePage.jsx)
  const initialChatReceiver = location.state?.chatWith || null;

  // State to control modal popup visibility
  const [showPostPopup, setShowPostPopup] = useState(false);

  const handleLogout = async () => {
    try {
      await apiRequest.post("/auth/logout");
      updateUser(null);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  // Handlers to open and close the modal popup
  const handleOpenPopup = () => {
    setShowPostPopup(true);
  };

  const handleClosePopup = () => {
    setShowPostPopup(false);
  };

  // Handlers for user or agent selection
  const handleUserPost = () => {
    setShowPostPopup(false);
    navigate("/add"); // Navigation route for user posts
  };

  const handleAgentPost = () => {
    setShowPostPopup(false);
    navigate("/add"); // Navigation route for agent posts
  };

  return (
    <div className="profilePage">
      <div className="details">
        <div className="wrapper">
          <div className="title">
            <h1>User Information</h1>
            <button onClick={handleLogout}>Logout</button>
          </div>
          <div className="info">
            <span>
              Avatar:
              <img src={currentUser.avatar || "noavatar.jpg"} alt="" />
            </span>
            <span>
              Username: <b>{currentUser.username}</b>
            </span>
            <span>
              E-mail: <b>{currentUser.email}</b>
            </span>
          </div>
          <div className="title">
            <h1>My List</h1>
            {/* Updated Create New Post button */}
            <button onClick={handleOpenPopup}>Create New Post</button>
          </div>
          <Suspense fallback={<p>Loading...</p>}>
            <Await
              resolve={data.postResponse}
              errorElement={<p>Error loading posts!</p>}
            >
              {(postResponse) => (
                <List posts={postResponse.data.userPosts} editable={true} />
              )}
            </Await>
          </Suspense>
          <div className="title">
            <h1>Saved List</h1>
          </div>
          <Suspense fallback={<p>Loading...</p>}>
            <Await
              resolve={data.postResponse}
              errorElement={<p>Error loading posts!</p>}
            >
              {(postResponse) => <List posts={postResponse.data.savedPosts} />}
            </Await>
          </Suspense>
        </div>
      </div>
      <div className="chatContainer">
        <div className="wrapper">
          <Suspense fallback={<p>Loading...</p>}>
            <Await
              resolve={data.chatResponse}
              errorElement={<p>Error loading chats!</p>}
            >
              {(chatResponse) => (
                <Chat
                  chats={chatResponse.data}
                  initialChatReceiver={initialChatReceiver}
                />
              )}
            </Await>
          </Suspense>
        </div>
      </div>

      {/* Modal Popup */}
      {showPostPopup && (
        <div className="modalOverlay" onClick={handleClosePopup}>
          <div
            className="modalContent"
            onClick={(e) => {
              // Stop propagation to avoid modal closing on click inside modal content.
              e.stopPropagation();
            }}
          >
            <h2>Create New Post</h2>
            <p>Please select if you are posting as a User or an Agent.</p>
            <div className="modalButtons">
              <button className="modalBtn" onClick={handleUserPost}>
                User
              </button>
              <button className="modalBtn" onClick={handleAgentPost}>
                Agent
              </button>
            </div>
            <button className="closeBtn" onClick={handleClosePopup}>
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
