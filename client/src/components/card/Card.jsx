import { Link, useNavigate } from "react-router-dom";
import "./card.scss";
import apiRequest from "../../lib/apiRequest";

function Card({ item, editable }) {
  const navigate = useNavigate();

  const handleUpdate = () => {
    navigate(`/update/${item.id}`);
  };

  const handleDelete = async () => {
    try {
      const res = await apiRequest.delete(`/posts/${item.id}`);
      console.log("Delete success:", res.data.message);
      window.location.reload();
    } catch (error) {
      if (error.response) {
        console.error("Error deleting post:", error.response.data.message);
        alert("Error deleting post: " + error.response.data.message);
      } else {
        console.error("Error deleting post:", error);
        alert("Error deleting post");
      }
    }
  };

  return (
    <div className="card">
      <Link to={`/${item.id}`} className="imageContainer">
        <img src={item.images[0]} alt="" />
      </Link>
      <div className="textContainer">
        <h2 className="title">
          <Link to={`/${item.id}`}>{item.title}</Link>
        </h2>
        <p className="address">
          <img src="/pin.png" alt="" />
          <span>{item.address}</span>
        </p>
        <p className="price">$ {item.price}</p>
        <div className="bottom">
          <div className="features">
            <div className="feature">
              <img src="/bed.png" alt="" />
              <span>{item.bedroom} bedroom</span>
            </div>
            <div className="feature">
              <img src="/bath.png" alt="" />
              <span>{item.bathroom} bathroom</span>
            </div>
          </div>
          <div className="icons">
            <div className="icon">
              <img src="/save.png" alt="" />
            </div>
            <div className="icon">
              <img src="/chat.png" alt="" />
            </div>
          </div>
        </div>
        {/* Only show these buttons when editable is true */}
        {editable && (
          <div className="postActions">
            <button onClick={handleUpdate}>Update Post</button>
            <button onClick={handleDelete}>Delete Post</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Card;
