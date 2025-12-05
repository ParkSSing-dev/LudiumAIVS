import React, { useState } from 'react';

const ACCEPTED_EXTENSIONS = ".js,.jsx,.ts,.tsx,.sol,.json,.txt,.md,.py,.java,.c,.cpp";

function FileUploader({ onFilesSelect, disabled }) {
  const [dragOver, setDragOver] = useState(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelect(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelect(Array.from(e.target.files));
    }
    e.target.value = '';
  };

  return (
    <div 
      className={`file-uploader ${dragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        multiple
        onChange={handleChange}
        disabled={disabled}
        id="file-input"
        className="file-input"
        accept={ACCEPTED_EXTENSIONS}
      />
      <label htmlFor="file-input" className="file-label">
        <span role="img" aria-label="upload">📤</span>
        <p>클릭하여 파일을 선택하거나, 이곳으로 드래그 앤 드롭하세요.</p>
        <small>(지원 형식: .js, .sol, .json, .py, .txt 등 코드 파일)</small>
      </label>
    </div>
  );
}

export default FileUploader;