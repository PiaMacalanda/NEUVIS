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
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
          
          @media print {
            body {
              margin: 0;
              padding: 0;
              background-color: white;
            }
            .visitor-card {
              margin: 0 auto;
              box-shadow: none;
              border: 1px solid #ddd;
            }
          }
          
          body {
            font-family: 'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: white;
          }
          
          .visitor-card {
            width: 100%;
            max-width: 340px;
            margin: 20px auto;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            background-color: white;
            border: 1px solid #ddd;
          }
          
          .card-header {
            background-color: #003566;
            color: white;
            padding: 10px 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .visitor-label {
            background-color: white;
            color: #003566;
            padding: 3px 10px;
            border-radius: 16px;
            font-weight: 600;
            font-size: 15px;
            letter-spacing: 0.3px;
            border: 1px solid #e0e0e0;
          }
          
          .visitor-id-container {
            text-align: right;
          }
          
          .id-number {
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          
          .valid-until {
            font-size: 10px;
            color: rgba(255,255,255,0.8);
            margin-top: 2px;
          }
          
          .card-body {
            padding: 14px 14px;
            display: flex;
            border-bottom: 1px solid #eaeaea;
          }
          
          .logo-container {
            margin-right: 10px;
            display: flex;
            align-items: center;
          }
          
          .logo-placeholder {
            width: 150px;
            height: 150px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: white;
          }
          
          .logo-placeholder img {
            width: 150px;
            height: 150px;
            object-fit: contain;
          }
          
          .info-container {
            flex: 1;
            padding-left: 4px;
          }
          
          .info-row {
            margin-bottom: 6px;
          }
          
          .info-label {
            font-size: 10px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 0px;
            font-weight: 500;
          }
          
          .info-value {
            font-size: 13px;
            font-weight: 600;
            color: #1f2937;
            line-height: 1.2;
          }
          
          .purpose-value {
            font-size: 12px;
            line-height: 1.3;
          }
          
          .card-footer {
            background-color: #f0f0f0;
            padding: 10px 16px;
            text-align: center;
            font-size: 11px;
            color: #555555;
            font-weight: 500;
            border-top: 1px solid #ddd;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          
          .created-by {
            margin-top: 4px;
            font-size: 9px;
            color: #777777;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="visitor-card">
          <div class="card-header">
            <div class="visitor-label">VISITOR</div>
            <div class="visitor-id-container">
              <div class="id-number">${idData.visitorID}</div>
              <div class="valid-until">Valid until: ${idData.expirationTime}</div>
            </div>
          </div>
          
          <div class="card-body">
            <div class="logo-container">
              <div class="logo-placeholder">
                <img src="https://neu.edu.ph/main/img/neu.png" alt="NEU Logo" />
              </div>
            </div>

            <div class="info-container">
              <div class="info-row">
                <div class="info-label">Name</div>
                <div class="info-value">${idData.name}</div>
              </div>
              
              <div class="info-row">
                <div class="info-label">Contact</div>
                <div class="info-value">+63 ${idData.cellphone}</div>
              </div>
              
              <div class="info-row">
                <div class="info-label">Date</div>
                <div class="info-value">${idData.dateOfVisit}</div>
              </div>
              
              <div class="info-row">
                <div class="info-label">Purpose</div>
                <div class="info-value purpose-value">${idData.purposeOfVisit}</div>
              </div>
            </div>
          </div>
          
          <div class="card-footer">
            This pass must be presented upon entry. Valid for one day only.
            <div class="created-by">created by NEUVIS</div>
          </div>
        </div>
      </body>
    </html>
  `;
};