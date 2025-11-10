import { useState } from 'react';
import { useProblem } from '../context/ProblemContext';
import './UploadModal.css';

const UploadModal = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { createProblem } = useProblem();

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

      await createProblem(formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload problem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>Report a Problem</h2>
          <p>Help us improve the campus by reporting issues</p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Problem Title *</label>
            <input
              type="text"
              placeholder="e.g., Fan not working in Room 301"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              placeholder="Describe the problem in detail..."
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
                id="file-input"
                className="file-input"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
              />
              <label htmlFor="file-input" className="file-input-label">
                <span>📁</span>
                <span>Click to upload files</span>
              </label>
            </div>

            {files.length > 0 && (
              <div className="file-preview">
                {files.map((file, index) => (
                  <div key={index} className="file-preview-item">
                    {file.type.startsWith('image/') ? (
                      <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} />
                    ) : (
                      <video src={URL.createObjectURL(file)} />
                    )}
                    <button
                      type="button"
                      className="file-remove"
                      onClick={() => removeFile(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-submit" disabled={loading}>
            {loading ? 'Uploading...' : 'Submit Problem'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
