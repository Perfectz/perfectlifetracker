// frontend/cypress/e2e/journals/journal-flow.cy.ts
// End-to-end tests for journal feature

describe('Journal Feature', () => {
  beforeEach(() => {
    // Mock the auth - implementation will depend on how auth is set up in the app
    cy.intercept('GET', '/api/profile', { statusCode: 200, body: { id: 'test-user' } }).as('getProfile');
    
    // Intercept journal API calls for testing
    cy.intercept('GET', '/api/journals*', { 
      statusCode: 200, 
      body: { 
        items: [], 
        count: 0 
      } 
    }).as('getJournals');
    
    // Visit journals page
    cy.visit('/journals');
    cy.wait('@getProfile');
    cy.wait('@getJournals');
  });
  
  it('creates a new journal entry with plain text', () => {
    // Click create new journal button
    cy.contains('button', 'New Journal Entry').click();
    
    // Fill the form
    cy.get('[type="radio"][value="plain"]').should('be.checked');
    cy.get('textarea[name="content"]').type('This is a test journal entry');
    
    // Add a tag
    cy.get('[placeholder="Add a tag"]').type('test-tag');
    cy.get('[aria-label="Add"]').click();
    cy.contains('test-tag').should('be.visible');
    
    // Mock the post request for journal creation
    cy.intercept('POST', '/api/journals', {
      statusCode: 201,
      body: {
        id: 'new-journal-123',
        content: 'This is a test journal entry',
        contentFormat: 'plain',
        date: new Date().toISOString(),
        sentimentScore: 0.75,
        tags: ['test-tag'],
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }).as('createJournal');
    
    // Submit the form
    cy.contains('button', 'Create Journal Entry').click();
    
    // Wait for the request to complete
    cy.wait('@createJournal');
    
    // Verify success message
    cy.contains('Journal entry created successfully').should('be.visible');
  });
  
  it('creates a journal entry with markdown and attachment', () => {
    // Click create new journal button
    cy.contains('button', 'New Journal Entry').click();
    
    // Switch to markdown
    cy.get('[type="radio"][value="markdown"]').click();
    
    // Verify markdown editor is visible
    cy.get('[data-testid="markdown-editor"]').should('be.visible');
    
    // Type markdown content
    cy.get('[data-testid="markdown-editor"]').type('# Test Heading\n\nThis is a **bold** test.');
    
    // Switch to preview tab to check rendering
    cy.contains('Preview').click();
    cy.get('[data-testid="markdown-preview"]').should('contain', '# Test Heading');
    
    // Mock file upload
    cy.intercept('POST', '/api/journals/attachments', {
      statusCode: 201,
      body: {
        id: 'attachment-123',
        fileName: 'test-image.jpg',
        contentType: 'image/jpeg',
        size: 1024,
        url: 'https://example.com/test-image.jpg'
      }
    }).as('uploadAttachment');
    
    // Add an attachment
    cy.get('[data-testid="add-attachment-btn"]').click();
    
    // Wait for mock upload to complete
    cy.wait('@uploadAttachment');
    
    // Verify attachment is added
    cy.contains('test-image.jpg').should('be.visible');
    
    // Mock the post request for journal creation
    cy.intercept('POST', '/api/journals', {
      statusCode: 201,
      body: {
        id: 'new-journal-456',
        content: '# Test Heading\n\nThis is a **bold** test.',
        contentFormat: 'markdown',
        date: new Date().toISOString(),
        sentimentScore: 0.75,
        tags: [],
        attachments: [{
          id: 'attachment-123',
          fileName: 'test-image.jpg',
          contentType: 'image/jpeg',
          size: 1024,
          url: 'https://example.com/test-image.jpg'
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }).as('createJournal');
    
    // Submit the form
    cy.contains('button', 'Create Journal Entry').click();
    
    // Wait for the request to complete
    cy.wait('@createJournal');
    
    // Verify success message
    cy.contains('Journal entry created successfully').should('be.visible');
  });
  
  it('searches journal entries with filters', () => {
    // Mock search results
    cy.intercept('GET', '/api/journals/search*', {
      statusCode: 200,
      body: {
        items: [{
          id: 'journal-123',
          content: 'This contains the search keyword',
          contentFormat: 'plain',
          date: new Date().toISOString(),
          sentimentScore: 0.8,
          tags: ['work', 'important'],
          attachments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }],
        count: 1,
        facets: {
          tags: [
            { value: 'work', count: 5 },
            { value: 'important', count: 3 }
          ]
        }
      }
    }).as('searchJournals');
    
    // Go to search page
    cy.contains('button', 'Search').click();
    
    // Enter search query
    cy.get('[label="Search Journal Entries"]').type('keyword');
    
    // Show filters
    cy.contains('button', 'Show Filters').click();
    
    // Set date range
    cy.get('[label="From Date"]').type('2023-01-01');
    cy.get('[label="To Date"]').type('2023-12-31');
    
    // Show sentiment filter
    cy.contains('button', 'Show').first().click();
    
    // Adjust sentiment slider (implementation may vary based on your slider component)
    cy.get('[role="slider"]').first().type('{rightarrow}{rightarrow}');
    
    // Submit search
    cy.contains('button', 'Search').click();
    
    // Wait for search request
    cy.wait('@searchJournals');
    
    // Verify results display
    cy.contains('1 entry found').should('be.visible');
    cy.contains('This contains the search keyword').should('be.visible');
    
    // Click on result should take to detail view
    cy.intercept('GET', '/api/journals/journal-123', {
      statusCode: 200,
      body: {
        id: 'journal-123',
        content: 'This contains the search keyword',
        contentFormat: 'plain',
        date: new Date().toISOString(),
        sentimentScore: 0.8,
        tags: ['work', 'important'],
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }).as('getJournalDetail');
    
    cy.contains('This contains the search keyword').click();
    cy.wait('@getJournalDetail');
    
    // Verify we're on the detail page
    cy.contains('button', 'Edit').should('be.visible');
    cy.contains('button', 'Delete').should('be.visible');
  });
  
  it('edits a journal entry and removes attachments', () => {
    // Mock an initial journal entry
    cy.intercept('GET', '/api/journals*', {
      statusCode: 200,
      body: {
        items: [{
          id: 'journal-123',
          content: 'Original content',
          contentFormat: 'plain',
          date: new Date().toISOString(),
          sentimentScore: 0.6,
          tags: ['original'],
          attachments: [{
            id: 'attachment-123',
            fileName: 'original.jpg',
            contentType: 'image/jpeg',
            size: 1024,
            url: 'https://example.com/original.jpg'
          }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }],
        count: 1
      }
    }).as('getJournals');
    
    // Reload to get our mocked journal
    cy.visit('/journals');
    cy.wait('@getJournals');
    
    // Mock the detail request
    cy.intercept('GET', '/api/journals/journal-123', {
      statusCode: 200,
      body: {
        id: 'journal-123',
        content: 'Original content',
        contentFormat: 'plain',
        date: new Date().toISOString(),
        sentimentScore: 0.6,
        tags: ['original'],
        attachments: [{
          id: 'attachment-123',
          fileName: 'original.jpg',
          contentType: 'image/jpeg',
          size: 1024,
          url: 'https://example.com/original.jpg'
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }).as('getJournalDetail');
    
    // Click on the journal entry
    cy.contains('Original content').click();
    cy.wait('@getJournalDetail');
    
    // Click edit button
    cy.contains('button', 'Edit').click();
    
    // Modify content
    cy.get('textarea[name="content"]').clear().type('Updated content');
    
    // Remove tag
    cy.get('[aria-label="Close"]').click();
    
    // Add new tag
    cy.get('[placeholder="Add a tag"]').type('updated-tag');
    cy.get('[aria-label="Add"]').click();
    
    // Remove attachment
    cy.get('[data-testid="remove-attachment-attachment-123"]').click();
    
    // Mock update request
    cy.intercept('PUT', '/api/journals/journal-123', {
      statusCode: 200,
      body: {
        id: 'journal-123',
        content: 'Updated content',
        contentFormat: 'plain',
        date: new Date().toISOString(),
        sentimentScore: 0.65,
        tags: ['updated-tag'],
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }).as('updateJournal');
    
    // Submit form
    cy.contains('button', 'Update Journal Entry').click();
    
    // Wait for update
    cy.wait('@updateJournal');
    
    // Verify success message
    cy.contains('Journal entry updated successfully').should('be.visible');
    
    // Verify changes
    cy.contains('Updated content').should('be.visible');
    cy.contains('updated-tag').should('be.visible');
    cy.contains('original').should('not.exist');
  });
}); 