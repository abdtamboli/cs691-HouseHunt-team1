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
          <h1 className="title">Find Real Estate & Get Your Dream Place</h1>
          <p>
          Your perfect home is just a search away! Explore thousands of listings, filter by your preferences, and find a place that truly feels like home.
          </p>
          <SearchBar />
          <div className="boxes">
            <div className="box">
              <h1>50K+</h1>
              <h2>Registered Users</h2>
            </div>
            <div className="box">
              <h1>10K+</h1>
              <h2>Verified Listings</h2>
            </div>
            <div className="box">
              <h1>500+</h1>
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
