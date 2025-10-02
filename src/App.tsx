import { useState, useEffect } from 'react'
import './App.css'

interface FormData {
  isim: string;
  eposta: string;
  unvan: string;
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    isim: 'Dilara Erdem',
    eposta: 'dilara.erdem@acerpro.com.tr',
    unvan: 'InsurGateway İş Analisti'
  });
  
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [mailTemplate, setMailTemplate] = useState<string>('');

  // Türkçe karakterleri dönüştürme fonksiyonu
  const turkishToEnglish = (text: string): string => {
    const turkishChars: { [key: string]: string } = {
      'ç': 'c', 'Ç': 'C',
      'ğ': 'g', 'Ğ': 'G',
      'ı': 'i', 'I': 'I',
      'ö': 'o', 'Ö': 'O',
      'ş': 's', 'Ş': 'S',
      'ü': 'u', 'Ü': 'U'
    };
    
    return text
      .split('')
      .map(char => turkishChars[char] || char)
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Mail template'ini yükle
  useEffect(() => {
    fetch('/mail.html')
      .then(response => response.text())
      .then(html => {
        setMailTemplate(html);
        setHtmlContent(html);
      })
      .catch(error => console.error('Template yüklenirken hata:', error));
  }, []);

  // Form verileri değiştiğinde HTML'i güncelle
  useEffect(() => {
    if (mailTemplate) {
      let updatedHtml = mailTemplate;
      
      // İsim değiştir
      updatedHtml = updatedHtml.replace(
        /<span[^>]*>Dilara Erdem<\/span>/,
        `<span style="font-family: Arial, sans-serif;color:#47484A;font-size:19px;font-weight:bold;margin:0 !important;margin-bottom:5px !important;">${formData.isim}</span>`
      );
      
      // Ünvan değiştir
      updatedHtml = updatedHtml.replace(
        /<span[^>]*>InsurGateway İş Analisti<\/span>/,
        `<span style="font-family: Arial, sans-serif;color:#47484A;font-size:12px;font-weight: 400 !important;margin:0 !important;">${formData.unvan}</span>`
      );
      
      // E-posta değiştir
      updatedHtml = updatedHtml.replace(
        /dilara\.erdem@acerpro\.com\.tr/g,
        formData.eposta
      );
      
      // E-posta linkini değiştir
      updatedHtml = updatedHtml.replace(
        /href="mailto:dilara\.erdem@acerpro\.com\.tr"/,
        `href="mailto:${formData.eposta}"`
      );
      
      setHtmlContent(updatedHtml);
    }
  }, [formData, mailTemplate]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const downloadHtml = () => {
    const fileName = `${turkishToEnglish(formData.isim)}.html`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <h1 className="text-center mb-4 text-primary">
            AcerPro Mail Düzenleyici
          </h1>
        </div>
      </div>
      
      <div className="row">
        <div className="col-lg-5">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">
                Bilgileri Düzenle
              </h5>
            </div>
            <div className="card-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="isim" className="form-label fw-bold text-start d-block">
                    İsim
                  </label>      
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="isim"
                    value={formData.isim}
                    onChange={(e) => handleInputChange('isim', e.target.value)}
                    placeholder="Ad Soyad giriniz"
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="eposta" className="form-label fw-bold text-start d-block">
                    E-posta
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    id="eposta"
                    value={formData.eposta}
                    onChange={(e) => handleInputChange('eposta', e.target.value)}
                    placeholder="ornek@acerpro.com.tr"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="unvan" className="form-label fw-bold text-start d-block">
                    Ünvan
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="unvan"
                    value={formData.unvan}
                    onChange={(e) => handleInputChange('unvan', e.target.value)}
                    placeholder="Pozisyon/Ünvan giriniz"
                  />
                </div>
                
                <div className="d-grid">
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={downloadHtml}
                  >
                    HTML İndir
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-lg-7">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <h5 className="card-title mb-0">
                Önizleme
              </h5>
            </div>
            <div className="card-body p-0">
              <div 
                style={{ 
                  width: '550px', 
                  height: '200px', 
                  overflow: 'hidden',
                  border: 'none'
                }}
              >
                <iframe
                  srcDoc={htmlContent}
                  style={{ 
                    width: '550px', 
                    height: '200px', 
                    border: 'none',
                    transformOrigin: 'top left'
                  }}
                  title="Mail Önizleme"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App
