import React from "react";
import AboutMeCard from "./aboutMeCard";

const AboutMe = () => {
  const info = {
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspen disse varius enim in eros elementum tristique.",
    position: "Graphic Designer.",
    phone: "+3215689",
    dob: "01.10.1997",
    email: "JohnDoe@gmail.com",
    location: "Prishtina",
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <AboutMeCard info={info} />
    </div>
  );
};

export default AboutMe;
