import { useContext } from "react";
import SearchBar from "../../components/searchBar/SearchBar";
import "./homePage.scss";
import { AuthContext } from "../../context/AuthContext";

function HomePage() {

  const {currentUser} = useContext(AuthContext)

  return (
    <div className="homePage">
      <div className="textContainer">
        <div className="wrapper">
          <h1 className="title">Find Your Perfect Home with Ease!</h1>
          <p>
          Browse thousands of real estate listings, customize your search, and discover a home that fits your lifestyle. Your dream place is just a click away with HouseHunt!
          </p>
          <SearchBar />
          <div className="boxes">
            <div className="box">
              <h1>50+</h1>
              <h2>Registered Users</h2>
            </div>
            <div className="box">
              <h1>10+</h1>
              <h2>Verified Listings</h2>
            </div>
            <div className="box">
              <h1>50+</h1>
              <h2>Cities Covered</h2>
            </div>
          </div>
        </div>
      </div>
      <div className="imgContainer">
        <img src="/bg.png" alt="" />
      </div>
    </div>
  );
}

export default HomePage;
