# Connect the Success Hub enquiry form

The website is prepared for this spreadsheet:

`https://docs.google.com/spreadsheets/d/1oRgx1Zw6TN9d9zp101Kc5PDqYaoE6nA_Pfj2ODNTudI/edit`

## One-time Google setup

1. Sign in to the Google account that can edit the spreadsheet.
2. Open the spreadsheet and select **Extensions > Apps Script**.
3. Replace the editor contents with `google-apps-script.gs` from this website folder.
4. Select **Deploy > New deployment**.
5. Choose **Web app** as the deployment type.
6. Set **Execute as** to **Me**.
7. Set **Who has access** to **Anyone**.
8. Select **Deploy**, approve the requested spreadsheet permission, and copy the `/exec` web app URL.
9. Open `config.js` and paste that URL into `googleSheetsWebAppUrl`.

The first valid submission automatically creates a formatted **Website Enquiries** tab with these columns:

`Submitted At, Student Name, Parent Name, Mobile Number, Email, Class/Course Interested In, Message, Source Page, Status`

## Updating the Apps Script later

After changing `google-apps-script.gs`, select **Deploy > Manage deployments > Edit**, choose **New version**, and deploy again. The existing `/exec` URL remains usable.
