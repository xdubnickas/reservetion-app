import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

const ImageUpload = ({ onChange }) => {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const validateAndResizeImage = async (file) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return null;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image must be less than 2MB');
      return null;
    }

    return file;
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const validatedFile = await validateAndResizeImage(file);
      if (validatedFile) {
        onChange(validatedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(validatedFile);
      }
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const validatedFile = await validateAndResizeImage(file);
      if (validatedFile) {
        handleFileChange({ target: { files: [validatedFile] } });
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="image-upload-container">
      <div
        className={`image-upload-area ${preview ? 'has-image' : ''}`}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="d-none"
          accept="image/*"
          onChange={handleFileChange}
        />
        
        {preview ? (
          <div className="image-preview-wrapper">
            <img src={preview} alt="Preview" className="image-preview" />
            <div className="image-overlay">
              <span>Click to change image</span>
            </div>
          </div>
        ) : (
          <div className="upload-placeholder">
            <i className="bi bi-cloud-upload"></i>
            <span>Click or drag image here</span>
            <small className="text-muted">Maximum size: 5MB</small>
          </div>
        )}
      </div>
    </div>
  );
};

ImageUpload.propTypes = {
  onChange: PropTypes.func.isRequired,
};

export default ImageUpload;
