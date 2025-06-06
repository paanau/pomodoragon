'use client';

import React from "react";

interface InfoComponentProps {
  top: React.ReactNode;
  bottom: React.ReactNode;
}

const InfoComponent: React.FC<InfoComponentProps> = ({ top, bottom }) => {
  return (
    <div key="info-component">
      <InfoComponentTop top={top} />
      <InfoComponentBottom bottom={bottom} />
    </div>
  );
};

interface InfoComponentTopProps {
  top: React.ReactNode;
}

const InfoComponentTop: React.FC<InfoComponentTopProps> = ({ top }) => {
  return <div key="info-component-top">{top}</div>;
};

interface InfoComponentBottomProps {
  bottom: React.ReactNode;
}

const InfoComponentBottom: React.FC<InfoComponentBottomProps> = ({ bottom }) => {
  return <div key="info-component-bottom">{bottom}</div>;
};

export default InfoComponent;