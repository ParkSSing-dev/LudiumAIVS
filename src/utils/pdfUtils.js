import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * HTML 요소를 고화질 PDF로 저장하는 함수 (최종 수정)
 */
export const exportToPDF = async (elementId, fileName = 'report.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`ID가 ${elementId}인 요소를 찾을 수 없습니다.`);
    return;
  }

  try {
    const canvas = await html2canvas(element, { 
      scale: 4,
      useCORS: true, 
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      
      // 캡처 전, 복제된 DOM에서 흐림 유발 요소(애니메이션, 그림자) 제거
      onclone: (documentClone) => {
        const target = documentClone.getElementById(elementId);
        
        // 캡처 대상의 모든 자식 요소에서 애니메이션/트랜지션 제거
        const allElements = target.querySelectorAll('*');
        allElements.forEach((el) => {
          el.style.animation = 'none';
          el.style.transition = 'none';
          el.style.boxShadow = 'none'; // 그림자가 텍스트를 흐리게 할 수 있음
          
          // 폰트 선명하게 강제 설정
          el.style.fontSmoothing = 'antialiased';
          el.style.webkitFontSmoothing = 'antialiased';
        });

        // 리포트 컨테이너 특수 처리 (애니메이션 제거)
        const reportContainers = target.querySelectorAll('.report-container');
        reportContainers.forEach((el) => {
            el.style.animation = 'none';
            el.style.transform = 'none'; // transform이 있으면 흐려짐
        });
      }
    });

    // 이미지 데이터 추출
    const imgData = canvas.toDataURL('image/png');

    // PDF 생성 (A4)
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; 
    const pageHeight = 297; 
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // 첫 페이지
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // 추가 페이지
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