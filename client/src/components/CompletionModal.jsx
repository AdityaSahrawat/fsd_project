import { useState } from 'react';
import axios from 'axios';
import './UploadModal.css';

const API_URL = 'http://localhost:5000/api';

const CompletionModal = ({ problemId, onClose, onComplete }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      setError('Maximum 5 files allowed');
      return;
    }
    setFiles([...files, ...selectedFiles]);
    setError('');
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (files.length === 0) {
      setError('Please upload at least one proof image');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('proofImages', file);
      });

      const response = await axios.post(
        `${API_URL}/problems/${problemId}/complete`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        }
      );

      onComplete(response.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark as completed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>Mark Problem as Completed</h2>
          <p>Upload proof of completion (images/videos)</p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Upload Proof Images/Videos (Max 5) *</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                id="proof-file-input"
                className="file-input"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
              />
              <label htmlFor="proof-file-input" className="file-input-label">
                <span>📁</span>
                <span>Click to upload proof files</span>
              </label>
            </div>

            {files.length > 0 && (
              <div className="file-preview">
                {files.map((file, index) => (
                  <div key={index} className="file-item">
                    <span className="file-name">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="file-remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Uploading...' : 'Mark as Completed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompletionModal;
