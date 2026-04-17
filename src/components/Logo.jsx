import React from 'react';

const Logo = ({ size = 120 }) => (
  <div className="logo-wrapper">
    <svg 
      width={size} 
      viewBox="0 0 200 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Book Base (Blue) */}
      <path 
        d="M20 90C20 78.9543 28.9543 70 40 70H160C171.046 70 180 78.9543 180 90V100C180 105.523 175.523 110 170 110H30C24.4772 110 20 105.523 20 100V90Z" 
        fill="#6c63ff" 
      />
      <path 
        d="M20 30C20 18.9543 28.9543 10 40 10H80C91.0457 10 100 18.9543 100 30V90H20V30Z" 
        fill="#4f46e5" 
      />
      <path 
        d="M100 30C100 18.9543 108.954 10 120 10H160C171.046 10 180 18.9543 180 30V90H100V30Z" 
        fill="#6c63ff" 
      />
      
      {/* Speech Bubble Icon */}
      <circle cx="100" cy="35" r="22" fill="#ffce00" />
      <path d="M110 45L105 50V40L110 45Z" fill="#ffce00" />
      <circle cx="92" cy="35" r="3" fill="white" />
      <circle cx="100" cy="35" r="3" fill="white" />
      <circle cx="108" cy="35" r="3" fill="white" />
    </svg>
    <div className="logo-labels">
       <span className="ar-brand">دارجة</span>
       <span className="en-brand">Knowledge AI</span>
    </div>

    <style jsx>{`
      .logo-wrapper { display: flex; flex-direction: column; align-items: center; gap: 8px; }
      .logo-labels { display: flex; flex-direction: column; align-items: center; line-height: 1; }
      .ar-brand { font-size: 32px; font-weight: 800; color: #10b981; font-family: 'Noto Sans Arabic', sans-serif; }
      .en-brand { font-size: 14px; font-weight: 800; color: #6c63ff; text-transform: uppercase; letter-spacing: 1px; }
    `}</style>
  </div>
);

export default Logo;
