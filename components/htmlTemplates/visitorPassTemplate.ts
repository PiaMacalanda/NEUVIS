interface VisitorPassData {
    name: string;
    cellphone: string;
    idType: string;
    idNumber: string;
    purposeOfVisit: string;
    visitorID: string;
    dateOfVisit: string;
    expirationTime: string;
  }
  
  export const generateVisitorPassHTML = (idData: VisitorPassData): string => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 0;
            }
            .visitor-card {
              width: 100%;
              max-width: 400px;
              margin: 20px auto;
              border: 1px solid #ccc;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .card-header {
              background-color: #003566;
              color: white;
              padding: 15px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .visitor-label {
              background-color: white;
              color: black;
              padding: 5px 10px;
              border-radius: 5px;
              font-weight: bold;
              font-size: 20px;
            }
            .card-body {
              padding: 20px;
              display: flex;
            }
            .info-container {
              flex: 1;
              margin-left: 15px;
            }
            .info-label {
              font-size: 12px;
              color: #666;
              margin-top: 8px;
            }
            .info-value {
              font-size: 14px;
              font-weight: 500;
              color: #000;
              margin-bottom: 8px;
            }
            .card-footer {
              background-color: #f5f5f5;
              padding: 15px;
              border-top: 1px solid #eee;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            .id-number {
              font-size: 18px;
              font-weight: bold;
            }
            .valid-until {
              font-size: 12px;
              color: #ccc;
            }
            .logo-placeholder {
              width: 80px;
              height: 80px;
              background-color: #f0f0f0;
              border-radius: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              color: #003566;
            }
          </style>
        </head>
        <body>
          <div class="visitor-card">
            <div class="card-header">
              <div class="visitor-label">VISITOR</div>
              <div>
                <div class="id-number">${idData.visitorID}</div>
                <div class="valid-until">Valid until: ${idData.expirationTime}</div>
              </div>
            </div>
            
            <div class="card-body">
              <div class="logo-placeholder">
                <img src="https://neu.edu.ph/main/img/neu.png" alt="NEU Logo" width="80" height="80" />
              </div>
  
              <div class="info-container">
                <div class="info-label">NAME</div>
                <div class="info-value">${idData.name}</div>
                
                <div class="info-label">CONTACT</div>
                <div class="info-value">+63 ${idData.cellphone}</div>
                
                <div class="info-label">DATE OF VISIT</div>
                <div class="info-value">${idData.dateOfVisit}</div>
                
                <div class="info-label">PURPOSE</div>
                <div class="info-value">${idData.purposeOfVisit}</div>
              </div>
            </div>
            
            <div class="card-footer">
              This pass must be presented upon entry. Valid for one day only.
            </div>
          </div>
        </body>
      </html>
    `;
  };