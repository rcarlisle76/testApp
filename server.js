const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize SQLite database
const db = new Database('contacts.db');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Create contacts table if it doesn't exist
const createTable = () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS contacts (
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
        )
    `;
    db.exec(sql);
    console.log('Contacts table ready');
};

createTable();

// API Routes

// Get all contacts (for admin view)
app.get('/api/contacts', (req, res) => {
    try {
        const contacts = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all();
        res.json({ success: true, contacts });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ success: false, message: 'Error fetching contacts' });
    }
});

// Get a single contact by ID
app.get('/api/contacts/:id', (req, res) => {
    try {
        const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
        if (contact) {
            res.json({ success: true, contact });
        } else {
            res.status(404).json({ success: false, message: 'Contact not found' });
        }
    } catch (error) {
        console.error('Error fetching contact:', error);
        res.status(500).json({ success: false, message: 'Error fetching contact' });
    }
});

// Create a new contact (from contact form)
app.post('/api/contacts', (req, res) => {
    try {
        const { name, email, phone, company, service, message, urgency } = req.body;

        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and message are required'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email address'
            });
        }

        const stmt = db.prepare(`
            INSERT INTO contacts (name, email, phone, company, service, message, urgency)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            name,
            email,
            phone || null,
            company || null,
            service || null,
            message,
            urgency ? 1 : 0
        );

        res.json({
            success: true,
            message: 'Contact saved successfully',
            contactId: result.lastInsertRowid
        });
    } catch (error) {
        console.error('Error saving contact:', error);
        res.status(500).json({ success: false, message: 'Error saving contact' });
    }
});

// Update contact status (for admin use)
app.put('/api/contacts/:id/status', (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['new', 'contacted', 'in-progress', 'completed', 'closed'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const stmt = db.prepare('UPDATE contacts SET status = ? WHERE id = ?');
        const result = stmt.run(status, req.params.id);

        if (result.changes > 0) {
            res.json({ success: true, message: 'Status updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Contact not found' });
        }
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ success: false, message: 'Error updating status' });
    }
});

// Add notes to a contact (for admin use)
app.put('/api/contacts/:id/notes', (req, res) => {
    try {
        const { notes } = req.body;
        const stmt = db.prepare('UPDATE contacts SET notes = ? WHERE id = ?');
        const result = stmt.run(notes, req.params.id);

        if (result.changes > 0) {
            res.json({ success: true, message: 'Notes updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Contact not found' });
        }
    } catch (error) {
        console.error('Error updating notes:', error);
        res.status(500).json({ success: false, message: 'Error updating notes' });
    }
});

// Delete a contact (for admin use)
app.delete('/api/contacts/:id', (req, res) => {
    try {
        const stmt = db.prepare('DELETE FROM contacts WHERE id = ?');
        const result = stmt.run(req.params.id);

        if (result.changes > 0) {
            res.json({ success: true, message: 'Contact deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Contact not found' });
        }
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ success: false, message: 'Error deleting contact' });
    }
});

// Get statistics (for dashboard)
app.get('/api/stats', (req, res) => {
    try {
        const totalContacts = db.prepare('SELECT COUNT(*) as count FROM contacts').get();
        const newContacts = db.prepare('SELECT COUNT(*) as count FROM contacts WHERE status = "new"').get();
        const urgentContacts = db.prepare('SELECT COUNT(*) as count FROM contacts WHERE urgency = 1').get();
        const contactsToday = db.prepare('SELECT COUNT(*) as count FROM contacts WHERE DATE(created_at) = DATE("now")').get();

        res.json({
            success: true,
            stats: {
                total: totalContacts.count,
                new: newContacts.count,
                urgent: urgentContacts.count,
                today: contactsToday.count
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, message: 'Error fetching statistics' });
    }
});

// Export contacts to CSV (for marketing)
app.get('/api/contacts/export/csv', (req, res) => {
    try {
        const contacts = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all();

        // Create CSV content
        const headers = ['ID', 'Name', 'Email', 'Phone', 'Company', 'Service', 'Message', 'Urgency', 'Status', 'Created At', 'Notes'];
        const csvRows = [headers.join(',')];

        contacts.forEach(contact => {
            const row = [
                contact.id,
                `"${contact.name}"`,
                contact.email,
                contact.phone || '',
                `"${contact.company || ''}"`,
                contact.service || '',
                `"${contact.message.replace(/"/g, '""')}"`,
                contact.urgency ? 'Yes' : 'No',
                contact.status,
                contact.created_at,
                `"${(contact.notes || '').replace(/"/g, '""')}"`
            ];
            csvRows.push(row.join(','));
        });

        const csv = csvRows.join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
        res.send(csv);
    } catch (error) {
        console.error('Error exporting contacts:', error);
        res.status(500).json({ success: false, message: 'Error exporting contacts' });
    }
});

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Admin dashboard: http://localhost:${PORT}/admin`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
});
