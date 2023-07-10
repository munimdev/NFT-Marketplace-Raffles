import React from "react";

const Footer = () => {
  return (
    // <div className="flex flex-col items-center justify-center">
    <div className="mx-auto mt-16 max-w-7xl">
      <hr className="mx-4 border-gray-600" />
      <p className="py-8 text-center text-white">{`Copyright © ${new Date().getFullYear()}, Wild Tigers`}</p>
    </div>
  );
};

export default Footer;
