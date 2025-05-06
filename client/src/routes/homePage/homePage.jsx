import React, { useContext } from "react";
import SearchBar from "../../components/searchBar/SearchBar";
import "./homePage.scss";
import { AuthContext } from "../../context/AuthContext";

function HomePage() {
  const { currentUser } = useContext(AuthContext);

  // 5 copies of your public‐served image, then duplicated
  const banners = [
    { src: "/aws.jpeg", link: "https://aws.amazon.com" },
    { src: "/disney.jpeg", link: "https://www.disney.com/" },
    {
      src: "/house.jpeg",
      link: "http://3.80.67.101/67e41f46f82617d92b0bc569/",
    },
  ];

  const bannerItems = banners.concat(banners); // smoother loop

  return (
    <div className="homePage">
      <div className="mainContent">
        {/* LEFT COLUMN */}
        <div className="textContainer">
          <div className="wrapper">
            <h1 className="title">Find Your Perfect Home with Ease!</h1>
            <p>
              Browse thousands of real estate listings, customize your search,
              and discover a home that fits your lifestyle. Your dream place is
              just a click away with HouseHunt!
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

        {/* RIGHT COLUMN */}
        <div className="imgContainer">
          <img src="/bg.png" alt="Hero background" />
        </div>
      </div>

      {/* PROMO BANNER BELOW BOTH COLUMNS */}
      <div className="promoBanner">
        <div className="promoTrack">
          {bannerItems.map((banner, i) => (
            <a
              href={banner.link}
              target="_blank"
              rel="noopener noreferrer"
              key={i}
            >
              <img src={banner.src} alt={`Promo ${i}`} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
