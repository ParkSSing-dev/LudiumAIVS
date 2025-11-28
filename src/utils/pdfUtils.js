import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportToPDF = async (elementId, fileName = 'report.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`ID가 ${elementId}인 요소를 찾을 수 없습니다.`);
    return;
  }

  try {
    const canvas = await html2canvas(element, { 
      scale: 3, // 고화질
      useCORS: true, 
      logging: false,
      backgroundColor: '#ffffff',
      
      // [핵심] 여기서 화면을 조작합니다 (사용자 눈에는 안 보임)
      onclone: (documentClone) => {
        const target = documentClone.getElementById(elementId);
        
        // 1. 애니메이션/그림자 제거 (선명도 향상)
        const allElements = target.querySelectorAll('*');
        allElements.forEach((el) => {
          el.style.animation = 'none';
          el.style.transition = 'none';
          el.style.boxShadow = 'none'; 
          el.style.fontSmoothing = 'antialiased';
        });

        // 2. [모바일 잘림 해결] 코드 영역 강제 줄바꿈 처리
        const codePres = target.querySelectorAll('pre');
        codePres.forEach((pre) => {
          // 가로 스크롤을 없애고, 내용이 길면 다음 줄로 넘겨버림
          pre.style.whiteSpace = 'pre-wrap'; 
          pre.style.wordBreak = 'break-all'; 
          pre.style.overflow = 'visible'; // 스크롤바 제거
          pre.style.height = 'auto'; // 높이 자동 조절
        });

        // 3. 코드 뷰어 컨테이너 높이 제한 해제 (내용만큼 길어지게)
        const codeContainers = target.querySelectorAll('.code-viewer-container');
        codeContainers.forEach((div) => {
            div.style.height = 'auto';
            div.style.overflow = 'visible';
        });
        
        const codeContents = target.querySelectorAll('.code-viewer-content');
        codeContents.forEach((div) => {
            div.style.height = 'auto';
            div.style.overflow = 'visible';
        });
      }
    });

    // 이미지 데이터 추출
    const imgData = canvas.toDataURL('image/png');

    // PDF 생성
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; 
    const pageHeight = 297; 
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // 첫 페이지
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // 내용이 길면 다음 페이지로
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(fileName);

  } catch (error) {
    console.error('PDF 생성 중 오류 발생:', error);
    alert('PDF 생성에 실패했습니다.');
  }
};