import React, { useState } from 'react';
import FileUploader from '../FileUploader'; 

const UploadView = ({ 
  selectedFiles, 
  isLoading, 
  onFilesSelect, 
  onRemoveFile,
  onAnalyze 
}) => {
  const [inputMode, setInputMode] = useState('file');
  const [directCode, setDirectCode] = useState('');

  const handleTabChange = (mode) => {
    setInputMode(mode);
  };

  const handleTextChange = (e) => {
    setDirectCode(e.target.value);
  };

  const handleAnalyzeClick = () => {
    if (inputMode === 'text' && directCode.trim()) {
      const blob = new Blob([directCode], { type: 'text/plain' });
      const virtualFile = new File([blob], "direct_input_code.txt", { type: "text/plain" }); 
      onFilesSelect([virtualFile]);
      setTimeout(onAnalyze, 100); 
    } else {
      onAnalyze();
    }
  };

  return (
    <div className="upload-view">
      <div className="input-mode-tabs">
        <button 
          className={`mode-tab ${inputMode === 'file' ? 'active' : ''}`}
          onClick={() => handleTabChange('file')}
        >
          📂 파일 업로드
        </button>
        <button 
          className={`mode-tab ${inputMode === 'text' ? 'active' : ''}`}
          onClick={() => handleTabChange('text')}
        >
          ✍️ 직접 입력
        </button>
      </div>

      {inputMode === 'file' ? (
        <>
          <FileUploader 
            onFilesSelect={onFilesSelect}
            disabled={isLoading}
          />     
          {selectedFiles.length > 0 && (
            <div className="file-list">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <strong>선택된 파일 ({selectedFiles.length} / 10)</strong>
                <span style={{ fontSize: '0.8rem', color: selectedFiles.length >= 10 ? '#dc3545' : '#888' }}>
                  {selectedFiles.length >= 10 ? '최대 개수 도달 (추가 불가)' : '추가 가능'}
                </span>
              </div>

              <ul>
                {selectedFiles.map((file, index) => (
                  <li key={`${file.name}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                      {file.name} <small>({Math.round(file.size / 1024)} KB)</small>
                    </span>
                  
                    <button 
                      onClick={() => onRemoveFile(index)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        color: '#dc3545', 
                        fontWeight: 'bold', 
                        padding: '5px 10px',
                        fontSize: '1rem'
                      }}
                      title="삭제"
                      disabled={isLoading}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className="direct-input-container">
          <textarea
            className="direct-input-area"
            value={directCode}
            onChange={handleTextChange}
            placeholder="// 분석하고 싶은 코드를 여기에 직접 붙여넣으세요 (Ctrl+V)."
            disabled={isLoading}
            spellCheck="false"
          />
          <p className="direct-input-info">
            * 직접 입력한 코드는 <strong>'direct_input_code.txt'</strong>라는 파일명으로 분석됩니다.
          </p>
        </div>
      )}

      <div className="detail-actions" style={{ marginTop: '20px' }}>
        <button 
          className="analyze-button"
          onClick={handleAnalyzeClick}
          disabled={
            isLoading || 
            (inputMode === 'file' && selectedFiles.length === 0) || 
            (inputMode === 'text' && !directCode.trim())
          }
        >
          {isLoading ? "AI가 분석 중입니다..." : "분석하기"}
        </button>
      </div>
    </div>
  );
};

export default UploadView;