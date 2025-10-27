# Salesforce Support Website

A professional website for a Salesforce Support company with contact form database integration.

## Features

- **Multi-page Website**: Home, Services, About, and Contact pages
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Contact Form**: Save submissions to SQLite database
- **Admin Dashboard**: View, manage, and export contact submissions
- **Professional UI**: Modern design with Salesforce-themed colors
- **Marketing Ready**: Export contacts to CSV for email marketing campaigns

## Pages

### Public Pages
- **Home** (`index.html`): Hero section, features, and service preview
- **Services** (`services.html`): Detailed service offerings
- **About** (`about.html`): Company information, mission, and values
- **Contact** (`contact.html`): Contact form with database integration

### Admin Page
- **Admin Dashboard** (`admin.html`): Manage all contact form submissions
  - View statistics (total, new, urgent, today)
  - Filter by status, urgency, and search
  - View detailed contact information
  - Update contact status and add notes
  - Delete contacts
  - Export all contacts to CSV

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: SQLite (better-sqlite3)
- **Additional**: CORS, Body-Parser

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

3. **Access the Website**
   - Main website: http://localhost:3000
   - Admin dashboard: http://localhost:3000/admin

## Database

The application uses SQLite for storing contact submissions. The database file (`contacts.db`) will be automatically created when you start the server for the first time.

### Database Schema

```sql
CREATE TABLE contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    service TEXT,
    message TEXT NOT NULL,
    urgency INTEGER DEFAULT 0,
    status TEXT DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);
```

## API Endpoints

### Public Endpoints
- `POST /api/contacts` - Submit a new contact form

### Admin Endpoints
- `GET /api/contacts` - Get all contacts
- `GET /api/contacts/:id` - Get a specific contact
- `PUT /api/contacts/:id/status` - Update contact status
- `PUT /api/contacts/:id/notes` - Update contact notes
- `DELETE /api/contacts/:id` - Delete a contact
- `GET /api/stats` - Get contact statistics
- `GET /api/contacts/export/csv` - Export contacts to CSV

## Contact Form Fields

- **Name** (required)
- **Email** (required)
- **Phone** (optional)
- **Company** (optional)
- **Service Interest** (optional dropdown)
- **Message** (required)
- **Urgency Flag** (optional checkbox)

## Admin Dashboard Features

### Statistics Dashboard
- Total contacts count
- New contacts count
- Urgent contacts count
- Contacts received today

### Filtering
- Filter by status (new, contacted, in-progress, completed, closed)
- Filter by urgency (all, urgent only, non-urgent)
- Search by name or email

### Contact Management
- View full contact details in modal
- Update contact status
- Add internal notes
- Delete contacts

### Export Functionality
Export all contacts to CSV for use in:
- Email marketing platforms (Mailchimp, SendGrid, etc.)
- CRM systems
- Spreadsheet analysis

## File Structure

```
salesforce-support-website/
├── index.html              # Homepage
├── services.html           # Services page
├── about.html             # About page
├── contact.html           # Contact form page
├── admin.html             # Admin dashboard
├── styles.css             # Global styles
├── script.js              # Frontend JavaScript
├── server.js              # Express server & API
├── package.json           # Node.js dependencies
├── contacts.db            # SQLite database (auto-generated)
└── README.md             # This file
```

## Customization

### Branding
- Update company name in all HTML files (search for "SalesforceSupportPro")
- Modify color scheme in `styles.css` (CSS variables in `:root`)
- Update contact information in footer sections

### Services
- Edit service descriptions in `services.html`
- Update service list in contact form dropdown (`contact.html`)

### Port Configuration
Change the port by setting the `PORT` environment variable:
```bash
PORT=8080 npm start
```

## Security Notes

⚠️ **Important for Production Use**

This is a basic implementation. For production deployment, consider:

1. **Authentication**: Add login system for admin dashboard
2. **Input Validation**: Server-side validation for all inputs
3. **Rate Limiting**: Prevent spam submissions
4. **HTTPS**: Use SSL/TLS certificates
5. **Environment Variables**: Store sensitive config in `.env` file
6. **Database Backup**: Regular backups of contacts.db
7. **CSRF Protection**: Add CSRF tokens to forms
8. **SQL Injection**: The current implementation uses parameterized queries, but audit before production

## Marketing Use Cases

### Email Campaign
1. Go to Admin Dashboard
2. Click "Export to CSV"
3. Import CSV to your email marketing platform
4. Create segmented campaigns based on:
   - Service interest
   - Company size
   - Urgency level

### Follow-up Workflow
1. Check dashboard daily for new contacts
2. Update status as you progress:
   - `new` → `contacted` → `in-progress` → `completed`
3. Add notes for team collaboration
4. Mark urgent items for priority handling

## Development

### Running in Development Mode
```bash
npm run dev
```

This uses `nodemon` to automatically restart the server when files change.

### Testing
Test the contact form:
1. Open http://localhost:3000/contact.html
2. Fill out and submit the form
3. Check http://localhost:3000/admin to see the submission

## License

This project is provided as-is for use by your organization.

## Support

For questions or issues, please refer to the project documentation or contact the development team.
