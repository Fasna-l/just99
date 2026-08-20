// src/FloatingButton.js
import React from 'react';
import './FloatingButton.css';
import { MdOutlineSupportAgent } from "react-icons/md";
import { BiSupport } from "react-icons/bi";
const SupportButton = ({ contact_number }) => {
  
  const handleClick = () => {
    window.location.href = 'tel:+91' + contact_number; // Replace with the phone number you want to call
  };

  return (
    <>
      {<button className="btn support-button btn-black  m-1" onClick={handleClick}>

        <BiSupport className='mr-' size={28} />
        {" "}

      </button>}
    </>

  );
};

export default SupportButton;
