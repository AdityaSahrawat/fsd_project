import { useState } from 'react';
import { useDiscussion } from '../context/DiscussionContext';
import './UploadModal.css';

const DiscussionModal = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { createDiscussion } = useDiscussion();

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
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      files.forEach((file) => {
        formData.append('images', file);
      });

      await createDiscussion(formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create discussion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>Start a Discussion</h2>
          <p>Share your thoughts and start a conversation</p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Discussion Title *</label>
            <input
              type="text"
              placeholder="e.g., Dogs roaming around campus - Need solutions"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              placeholder="Describe the topic in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Upload Images/Videos (Max 5)</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                id="disc-file-input"
                className="file-input"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
              />
              <label htmlFor="disc-file-input" className="file-input-label">
                <span>📁</span>
                <span>Click to upload files</span>
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
              {loading ? 'Creating...' : 'Create Discussion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiscussionModal;
