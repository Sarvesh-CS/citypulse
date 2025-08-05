import React from "react";

const NotFound = ({ slug }: { slug: string }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-gray-600">The page "/{slug}" does not exist.</p>
      </div>
    </div>
  );
};

export default NotFound;
