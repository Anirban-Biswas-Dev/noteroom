import React from "react";

interface ThumbnailPopupProps {
  isOpen: boolean;
  stackFiles: File[];
  setStackFiles: React.Dispatch<React.SetStateAction<File[]>>;
  onClose: () => void;
}

const ThumbnailPopup: React.FC<ThumbnailPopupProps> = ({
  isOpen,
  stackFiles,
  setStackFiles,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleDelete = (index: number) => {
    setStackFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="thumbnail-pop-up">
      <div className="popup-header">
        <h2>Image Stack</h2>
        <button className="discard-btn" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 18L18 6M6 6l12 12" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {stackFiles.length === 0 ? (
        <p className="no-notes">No images added yet. Upload some to get started.</p>
      ) : (
        <div className="thumbnail-container">
          {stackFiles.map((file, index) => (
            <div key={index} className="thumbnail-card">
              <img
                className="noteImage"
                src={URL.createObjectURL(file)}
                alt={`Note Image ${index + 1}`}
                onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
              />
              <button className="delete-btn" onClick={() => handleDelete(index)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                    fill="#757575"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThumbnailPopup;