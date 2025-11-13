import React, { useState, useEffect } from 'react';
import './App.css';
import FileUploader from './components/FileUploader';
import ReportDisplay from './components/ReportDisplay';

const API_URL = 'https://ludium-aivs-server.vercel.app/analyze';
const ALLOWED_EXTENSIONS = ['.js', '.sol', '.json', '.jsx', '.ts', '.txt', '.md'];

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);

  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const handleFilesSelect = (files) => {
    setError(null);
    setReportData(null);
    
    const validFiles = files.filter(file => {
      const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
      return ALLOWED_EXTENSIONS.includes(extension);
    });

    if (validFiles.length !== files.length) {
      setError("잘못된 형식의 파일을 업로드 하였습니다. 파일 형식을 확인해주세요. (.js, .sol, .json 등)");
      setSelectedFiles([]);
    } else {
      setSelectedFiles(validFiles);
    }
  };

  const handleAnalyzeClick = async () => {
    if (selectedFiles.length === 0) { 
        setError("최소 1개 이상의 파일을 업로드해야 합니다.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setReportData(null);

    const fileReadPromises = selectedFiles.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => resolve({
          fileName: file.name,
          content: reader.result
        });
        reader.onerror = (error) => reject(error);
      });
    });

    try {
      const codeFiles = await Promise.all(fileReadPromises);
      const requestBody = {
        programMeta: {
          id: `program-${Date.now()}`,
          title: "User Uploaded Program"
        },
        codeFiles: codeFiles
      };
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const responseJson = await response.json();

      if (!response.ok || responseJson.status !== 'success') {
        const errorSummary = responseJson.analysis ? responseJson.analysis.summary : `API 호출 실패: ${response.statusText}`;
        throw new Error(errorSummary);
      }
  
      setReportData(responseJson.analysis);

    } catch (err) {
      console.error("파일 읽기 또는 분석 중 오류:", err);
      setError(`분석 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setReportData(null);
    setError(null);
  };

  return (
    <div className="App">
      <button 
        className="theme-toggle"
        onClick={() => setIsDarkMode(!isDarkMode)}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>

      <header className="app-header">
        <h1> Ludium Verification System </h1>
        <p>코드를 업로드하여 '스캠' 및 '기본 유효성'을 검사합니다.</p>
      </header>

      <main>
        {!isLoading && !reportData && (
          <FileUploader 
            onFilesSelect={handleFilesSelect}
            disabled={isLoading}
          />
        )}

        {selectedFiles.length > 0 && !isLoading && !reportData && (
          <div className="file-list">
            <strong>선택된 파일:</strong>
            <ul>
              {selectedFiles.map(file => (
                <li key={file.name}>{file.name} ({Math.round(file.size / 1024)} KB)</li>
              ))}
            </ul>
          </div>
        )}

        {!reportData && (
          <button 
            className="analyze-button"
            onClick={handleAnalyzeClick}
            disabled={isLoading || selectedFiles.length === 0}
          >
            {isLoading ? "AI가 분석 중입니다..." : "분석하기"}
          </button>
        )}  

        {error && <div className="error-message">{error}</div>}

        {isLoading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>AI가 코드를 검증하고 있습니다. 잠시만 기다려주세요...</p>
          </div>
        )}
        
        {reportData && !isLoading && (
          <>  
            <ReportDisplay report={reportData} />
            <button 
              className="reset-button"
              onClick={handleReset}
            >
              새로 분석하기
            </button>
          </>
        )}
      </main>
      
      <footer className="app-footer">
        © 2025 Ludium. All rights reserved.
      </footer>
    </div>
  );
}

export default App;