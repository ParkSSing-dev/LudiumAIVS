import React from 'react';

function formatCheckTitle(key) {
  const result = key.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function getCheckEmoji(key) {
  const emojiMap = {
    scamCheck: '🚨',
    validityCheck: '⚙️', 
    sensationalCheck: '🧐',
    dataCollectionCheck: '🕵️'
  };
  return emojiMap[key] || '📊'; 
}

/**
 * finalDecision 값에 따라 Risk Level 텍스트, 색상, 게이지 너비를 반환함
 * @param {string} decision - AI가 반환한 finalDecision (EX: 'SCAM_DETECTED')
 */

const getRiskProps = (decision) => {
  switch (decision) {
    case 'SCAM_DETECTED':
      return { level: '심각 (HIGH)', color: '#FFFFFF', width: '100%' };
    case 'INVALID_FORMAT':
      return { level: '중간 (MEDIUM)', color: '#FFC107', width: '66%' };
    case 'CONTENT_WARNING':
      return { level: '낮음 (LOW)', color: '#FFC107', width: '33%' };
    case 'CLEAN':
      return { level: '안전 (CLEAN)', color: '#FFFFFF', width: '0%' };
    default:
      return { level: '알 수 없음', color: '#AAAAAA', width: '50%' };
  }
}

function ReportDisplay({ report, fileName }) {
  
  const isFail = report.finalDecision !== 'CLEAN';
  const reportDetails = report.reportDetails;
  const checkKeys = Object.keys(reportDetails);
  const risk = getRiskProps(report.finalDecision);

  return (
    <div className={`report-container ${isFail ? 'status-fail' : 'status-pass'}`}>
      <div className="report-header">
        <h3 className="report-filename">파일명 : {fileName}</h3>
        <h2>
          {isFail ? '❌ 검증 실패 (Fail)' : '✅ 검증 통과 (Pass)'}
        </h2>
        <p className="report-summary">{report.summary}</p>
        <div className="risk-meter">
          <strong>Risk Level: <span>{risk.level}</span></strong>
          <div className="risk-bar-container">
            <div 
              className="risk-bar" 
              style={{ 
                width: risk.width, 
                backgroundColor: risk.barColor 
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className="report-body">
        {checkKeys.map((key) => {
          
          const checkData = reportDetails[key];

          if (!checkData || !checkData.issues) return null; 

          const issues = checkData.issues;

          return (
            <div className="check-section" key={key}>
              <h3>
                <span role="img" aria-label={key}>
                  {getCheckEmoji(key)} 
                </span>
                {formatCheckTitle(key)}
              </h3>
              
              <ul className="issue-list">
                {issues.map((issue, index) => {
                  
                  const safeKeywords = ['없음', '유효함', '발견되지 않았습니다', '모든 파일이 유효함', '구문적으로 유효합니다'];
                  const isSafeIssue = safeKeywords.some(keyword => 
                      issue.includes(keyword)
                  );

                  let itemStyleClass = '';
                  
                  if (isSafeIssue) {
                    itemStyleClass = 'issue-item-validity';
                  } else if (key === 'scamCheck') {
                    itemStyleClass = 'issue-item-scam';
                  } else if (key === 'validityCheck') {
                    itemStyleClass = 'issue-item-scam';
                  } else if (key === 'sensationalCheck') { 
                    itemStyleClass = 'issue-item-quality';
                  } else if (key === 'dataCollectionCheck') {
                    itemStyleClass = 'issue-item-quality';
                  } else {
                    itemStyleClass = 'issue-item-scam';
                  }

                  return (
                    <li key={index} className={`issue-item ${itemStyleClass}`}>
                      <p>{issue}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
        
      </div>
    </div>
  );
} 

export default ReportDisplay;