import "./singlePage.scss";
import Slider from "../../components/slider/Slider";
import Map from "../../components/map/Map";
import { useNavigate, useLoaderData } from "react-router-dom";
import DOMPurify from "dompurify";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";

function SinglePage() {
  const post = useLoaderData();
  const [saved, setSaved] = useState(post.isSaved);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // schedule / inquiry / purchase modals
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [visitDateTime, setVisitDateTime] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);

  const isOwner =
    currentUser &&
    (currentUser.id === post.user.id || currentUser.id === post.user._id);

  /** --- ACTION HANDLERS --- **/

  const handleSave = async () => {
    if (!currentUser) return navigate("/login");
    if (isOwner) return;
    setSaved((p) => !p);
    try {
      await apiRequest.post("/users/save", { postId: post.id });
    } catch {
      setSaved((p) => !p);
    }
  };

  const handleSendMessage = async () => {
    if (!currentUser) return navigate("/login");
    if (isOwner) return;
    const receiverId = post.user.id || post.user._id;
    try {
      await apiRequest.post("/chats", { receiverId });
      navigate("/profile", { state: { chatWith: post.user } });
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleSubmit = async () => {
    try {
      await apiRequest.post("/emails/schedule-visit", {
        postId: post.id,
        dateTime: visitDateTime,
      });
      alert("Visit scheduled! Email sent.");
      setShowScheduleModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInquirySubmit = async () => {
    try {
      await apiRequest.post("/emails/property-inquiry", {
        postId: post.id,
        message: inquiryMessage,
        id: currentUser.id,
      });
      alert("Inquiry sent to the owner!");
      setShowInquiryModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePurchase = async () => {
    try {
      await apiRequest.post("/emails/purchase-invoice", {
        postId: post.id,
      });
      alert("Invoice sent to your email!");
      setShowPurchaseModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to send invoice. Please try again later.");
    }
  };

  const currentUrl = window.location.href;

  const shareByEmail = () => {
    window.location.href =
      `mailto:?subject=${encodeURIComponent(post.title)}` +
      `&body=${encodeURIComponent(currentUrl)}`;
  };
  const shareOnWhatsApp = () => {
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(
        post.title + " " + currentUrl
      )}`,
      "_blank"
    );
  };
  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        post.title
      )}&url=${encodeURIComponent(currentUrl)}`,
      "_blank"
    );
  };
  const shareOnInstagram = () => {
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => alert("Link copied! Paste into Instagram."))
      .catch((e) => console.error(e));
  };
  const copyLink = () => {
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => alert("Link copied to clipboard."))
      .catch((e) => console.error(e));
  };

  return (
    <div className="singlePage">
      <div className="details">
        <div className="wrapper">
          <Slider images={post.images} />
          <div className="info">
            <div className="top">
              <div className="post">
                {/* title + share button */}
                <div className="titleContainer">
                  <h1>{post.title}</h1>
                  <img
                    src="/share.png"
                    alt="Share"
                    className="shareBtn"
                    onClick={() => setShowShareModal(true)}
                  />
                  {post.type === "rent" && (
                    <div className="rating">
                      <span className="stars">★★★★☆</span>
                    </div>
                  )}
                </div>

                <div className="address">
                  <img src="/pin.png" alt="" />
                  <span>{post.address}</span>
                </div>

                <div className="priceSection">
                  <div className="price">$ {post.price}</div>
                  <button
                    className="priceButton"
                    onClick={() => setShowScheduleModal(true)}
                    disabled={isOwner}
                  >
                    Schedule Visit
                  </button>
                  <button
                    className="priceButton"
                    onClick={() => setShowInquiryModal(true)}
                    disabled={isOwner}
                  >
                    Property Inquiry
                  </button>
                  <button
                    className="priceButton"
                    onClick={() => setShowPurchaseModal(true)}
                    disabled={isOwner}
                  >
                    Purchase
                  </button>
                </div>
              </div>

              <div className="user">
                <img src={post.user.avatar} alt="" />
                <span>{post.user.username}</span>
              </div>
            </div>

            <div
              className="bottom"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.postDetail.desc),
              }}
            />
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showScheduleModal && (
        <div
          className="modalOverlay"
          onClick={() => setShowScheduleModal(false)}
        >
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h2>Schedule Property Visit</h2>
            <input
              type="datetime-local"
              value={visitDateTime}
              onChange={(e) => setVisitDateTime(e.target.value)}
            />
            <button type="submit" onClick={handleScheduleSubmit}>
              Submit
            </button>
            <button
              className="closeBtn"
              onClick={() => setShowScheduleModal(false)}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {showInquiryModal && (
        <div
          className="modalOverlay"
          onClick={() => setShowInquiryModal(false)}
        >
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h2>Property Inquiry</h2>
            <textarea
              placeholder="Type your message..."
              value={inquiryMessage}
              onChange={(e) => setInquiryMessage(e.target.value)}
              rows="6"
            ></textarea>
            <button type="submit" onClick={handleInquirySubmit}>
              Submit
            </button>
            <button
              className="closeBtn"
              onClick={() => setShowInquiryModal(false)}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {showPurchaseModal && (
        <div
          className="modalOverlay"
          onClick={() => setShowPurchaseModal(false)}
        >
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h2>
              {post.type === "rent" ? "Rent Receipt" : "Purchase Receipt"}
            </h2>

            <div className="invoiceDetails">
              <p>
                <strong>Receipt Date:</strong> {new Date().toLocaleDateString()}
              </p>

              <table className="receiptTable">
                <tbody>
                  <tr>
                    <td>
                      <strong>Property Address:</strong>
                    </td>
                    <td>{post.address}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Tenant Name:</strong>
                    </td>
                    <td>{currentUser.username}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Date of Payment:</strong>
                    </td>
                    <td>{new Date().toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Paid To:</strong>
                    </td>
                    <td>{post.user.username}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Total Amount:</strong>
                    </td>
                    <td>${post.price}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button type="submit" onClick={handlePurchase}>
              Submit
            </button>
            <button
              className="closeBtn"
              onClick={() => setShowPurchaseModal(false)}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {showShareModal && (
        <div className="shareOverlay" onClick={() => setShowShareModal(false)}>
          <div className="shareModal" onClick={(e) => e.stopPropagation()}>
            <h2>Share this listing</h2>
            <div className="shareOptions">
              <button onClick={shareByEmail}>
                <img src="/gmail.png" alt="Gmail" />
                <span>Gmail</span>
              </button>
              <button onClick={shareOnWhatsApp}>
                <img src="/whatsapp.png" alt="WhatsApp" />
                <span>WhatsApp</span>
              </button>
              <button onClick={shareOnTwitter}>
                <img src="/twitter.png" alt="Twitter" />
                <span>Twitter</span>
              </button>
              <button onClick={shareOnInstagram}>
                <img src="/instagram.png" alt="Instagram" />
                <span>Instagram</span>
              </button>
              <button onClick={copyLink}>
                <img src="/link.png" alt="Copy link" />
                <span>Copy Link</span>
              </button>
            </div>
            <button
              className="closeBtn"
              onClick={() => setShowShareModal(false)}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      <div className="features">
        <div className="wrapper">
          <p className="title">General</p>
          <div className="listVertical">
            <div className="feature">
              <img src="/utility.png" alt="" />
              <div className="featureText">
                <span>Utilities</span>
                {post.postDetail.utilities === "owner" ? (
                  <p>Owner is responsible</p>
                ) : (
                  <p>Tenant is responsible</p>
                )}
              </div>
            </div>
            <div className="feature">
              <img src="/pet.png" alt="" />
              <div className="featureText">
                <span>Pet Policy</span>
                {post.postDetail.pet === "allowed" ? (
                  <p>Pets Allowed</p>
                ) : (
                  <p>Pets not Allowed</p>
                )}
              </div>
            </div>
            <div className="feature">
              <img src="/fee.png" alt="" />
              <div className="featureText">
                <span>Income Policy</span>
                <p>{post.postDetail.income}</p>
              </div>
            </div>
          </div>
          <p className="title">Sizes</p>
          <div className="sizes">
            <div className="size">
              <img src="/size.png" alt="" />
              <span>{post.postDetail.size} sqft</span>
            </div>
            <div className="size">
              <img src="/bed.png" alt="" />
              <span>{post.bedroom} beds</span>
            </div>
            <div className="size">
              <img src="/bath.png" alt="" />
              <span>{post.bathroom} bathroom</span>
            </div>
          </div>
          <p className="title">Nearby Places</p>
          <div className="listHorizontal">
            <div className="feature">
              <img src="/school.png" alt="" />
              <div className="featureText">
                <span>School</span>
                <p>
                  {post.postDetail.school > 999
                    ? post.postDetail.school / 1000 + "km"
                    : post.postDetail.school + "m"}{" "}
                  away
                </p>
              </div>
            </div>
            <div className="feature">
              <img src="/pet.png" alt="" />
              <div className="featureText">
                <span>Bus Stop</span>
                <p>{post.postDetail.bus}m away</p>
              </div>
            </div>
            <div className="feature">
              <img src="/fee.png" alt="" />
              <div className="featureText">
                <span>Restaurant</span>
                <p>{post.postDetail.restaurant}m away</p>
              </div>
            </div>
          </div>
          <p className="title">Location</p>
          <div className="mapContainer">
            <Map items={[post]} />
          </div>
          <div className="buttons">
            <button onClick={handleSendMessage} disabled={isOwner}>
              <img src="/chat.png" alt="" />
              {isOwner ? "Messaging Disabled" : "Send a Message"}
            </button>
            <button
              onClick={handleSave}
              disabled={isOwner}
              style={{
                cursor: isOwner ? "not-allowed" : "pointer",
              }}
            >
              <img src="/save.png" alt="" />
              {saved ? "Place Saved" : "Save the Place"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SinglePage;
