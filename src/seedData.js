export const seedData = {
  users: [
    {
      id: '1',
      name: 'John Admin',
      email: 'admin@demo.test',
      password: 'Password123',
      role: 'admin',
      isActive: true,
      lastLogin: '2025-01-15T10:30:00Z',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Sarah Manager',
      email: 'user@demo.test',
      password: 'Password123',
      role: 'user',
      isActive: true,
      lastLogin: '2025-01-15T09:15:00Z',
      createdAt: '2024-02-15T00:00:00Z'
    },
    {
      id: '3',
      name: 'Mike Client',
      email: 'client@demo.test',
      password: 'Password123',
      role: 'client',
      isActive: true,
      lastLogin: '2025-01-14T16:45:00Z',
      createdAt: '2024-03-01T00:00:00Z'
    },
    {
      id: '4',
      name: 'Lisa Reviewer',
      email: 'reviewer@demo.test',
      password: 'Password123',
      role: 'reviewer',
      isActive: true,
      lastLogin: '2025-01-15T08:20:00Z',
      createdAt: '2024-04-10T00:00:00Z'
    },
    {
      id: '5',
      name: 'Tom Wilson',
      email: 'tom@demo.test',
      password: 'Password123',
      role: 'user',
      isActive: false,
      lastLogin: '2025-01-10T14:30:00Z',
      createdAt: '2024-05-20T00:00:00Z'
    },
    {
      id: '6',
      name: 'Emma Davis',
      email: 'emma@demo.test',
      password: 'Password123',
      role: 'client',
      isActive: true,
      lastLogin: '2025-01-13T11:00:00Z',
      createdAt: '2024-06-15T00:00:00Z'
    }
  ],

  customers: [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      mobile: '+1-555-0123',
      ssn: '***-**-1234',
      status: 'Active',
      documentsCount: 5,
      returnsCount: 2,
      ownerId: '3',
      createdAt: '2024-08-15T00:00:00Z',
      updatedAt: '2025-01-14T15:30:00Z'
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      mobile: '+1-555-0124',
      ssn: '***-**-5678',
      status: 'Active',
      documentsCount: 8,
      returnsCount: 3,
      ownerId: '6',
      createdAt: '2024-09-01T00:00:00Z',
      updatedAt: '2025-01-13T10:15:00Z'
    },
    {
      id: '3',
      name: 'Carol Williams',
      email: 'carol@example.com',
      mobile: '+1-555-0125',
      ssn: '***-**-9012',
      status: 'Pending',
      documentsCount: 3,
      returnsCount: 1,
      ownerId: null,
      createdAt: '2024-10-10T00:00:00Z',
      updatedAt: '2025-01-12T14:20:00Z'
    },
    {
      id: '4',
      name: 'David Brown',
      email: 'david@example.com',
      mobile: '+1-555-0126',
      ssn: '***-**-3456',
      status: 'Active',
      documentsCount: 12,
      returnsCount: 4,
      ownerId: null,
      createdAt: '2024-07-20T00:00:00Z',
      updatedAt: '2025-01-15T09:45:00Z'
    },
    {
      id: '5',
      name: 'Emily Davis',
      email: 'emily@example.com',
      mobile: '+1-555-0127',
      ssn: '***-**-7890',
      status: 'Inactive',
      documentsCount: 2,
      returnsCount: 1,
      ownerId: null,
      createdAt: '2024-11-05T00:00:00Z',
      updatedAt: '2025-01-11T16:30:00Z'
    },
    {
      id: '6',
      name: 'Frank Miller',
      email: 'frank@example.com',
      mobile: '+1-555-0128',
      ssn: '***-**-2468',
      status: 'Active',
      documentsCount: 7,
      returnsCount: 2,
      ownerId: null,
      createdAt: '2024-12-01T00:00:00Z',
      updatedAt: '2025-01-14T12:10:00Z'
    },
    {
      id: '7',
      name: 'Grace Wilson',
      email: 'grace@example.com',
      mobile: '+1-555-0129',
      ssn: '***-**-1357',
      status: 'Active',
      documentsCount: 4,
      returnsCount: 1,
      ownerId: null,
      createdAt: '2025-01-05T00:00:00Z',
      updatedAt: '2025-01-15T08:50:00Z'
    },
    {
      id: '8',
      name: 'Henry Taylor',
      email: 'henry@example.com',
      mobile: '+1-555-0130',
      ssn: '***-**-9753',
      status: 'Pending',
      documentsCount: 6,
      returnsCount: 2,
      ownerId: null,
      createdAt: '2025-01-10T00:00:00Z',
      updatedAt: '2025-01-15T11:20:00Z'
    }
  ],

  taxReturns: [
    {
      id: '1',
      name: '2024 Federal Return',
      customerId: '1',
      customerName: 'Alice Johnson',
      type: 'Federal',
      status: 'Filed Return',
      assignedReviewer: 'Lisa Reviewer',
      reviewerId: '4',
      createdAt: '2024-11-01T00:00:00Z',
      updatedAt: '2025-01-10T15:30:00Z'
    },
    {
      id: '2',
      name: '2024 State Return',
      customerId: '1',
      customerName: 'Alice Johnson',
      type: 'State',
      status: 'In Review',
      assignedReviewer: 'Lisa Reviewer',
      reviewerId: '4',
      createdAt: '2024-11-15T00:00:00Z',
      updatedAt: '2025-01-14T10:20:00Z'
    },
    {
      id: '3',
      name: '2024 Federal Return',
      customerId: '2',
      customerName: 'Bob Smith',
      type: 'Federal',
      status: 'Ready to File',
      assignedReviewer: 'Lisa Reviewer',
      reviewerId: '4',
      createdAt: '2024-12-01T00:00:00Z',
      updatedAt: '2025-01-13T14:45:00Z'
    },
    {
      id: '4',
      name: '2024 Federal Return',
      customerId: '3',
      customerName: 'Carol Williams',
      type: 'Federal',
      status: 'Initial Request',
      assignedReviewer: null,
      reviewerId: null,
      createdAt: '2025-01-05T00:00:00Z',
      updatedAt: '2025-01-12T09:15:00Z'
    },
    {
      id: '5',
      name: '2024 Quarterly Return',
      customerId: '4',
      customerName: 'David Brown',
      type: 'Quarterly',
      status: 'Document Verified',
      assignedReviewer: 'Lisa Reviewer',
      reviewerId: '4',
      createdAt: '2024-10-15T00:00:00Z',
      updatedAt: '2025-01-11T16:00:00Z'
    }
  ],

  documents: [
    {
      id: '1',
      name: 'W2_Form_2024.pdf',
      customerId: '1',
      returnId: '1',
      type: 'pdf',
      url: 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggMTM0Cj4+CnN0cmVhbQpCVAovRjEgMTIgVGYKNzIgNzIwIFRkCihXMiBGb3JtIDIwMjQpIFRqCkVUCnEKNzIgNjgwIFRkCihFbXBsb3llZTogQWxpY2UgSm9obnNvbikgVGoKNzIgNjYwIFRkCihHcm9zcyBXYWdlczogJDc1LDAwMCkgVGoKNzIgNjQwIFRkCihGZWRlcmFsIFRheCBXaXRoaGVsZDogJDEyLDAwMCkgVGoKUQplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDI0NSAwMDAwMCBuIAowMDAwMDAwMzIyIDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNTA0CiUlRU9G',
      uploadedAt: '2024-11-01T10:00:00Z'
    },
    {
      id: '2',
      name: 'ID_Copy.jpg',
      customerId: '1',
      returnId: '1',
      type: 'image',
      url: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400',
      uploadedAt: '2024-11-02T11:30:00Z'
    },
    {
      id: '3',
      name: '1099_Form.pdf',
      customerId: '2',
      returnId: '3',
      type: 'pdf',
      url: 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggMTIwCj4+CnN0cmVhbQpCVAovRjEgMTIgVGYKNzIgNzIwIFRkCigxMDk5IE1pc2MgSW5jb21lIDIwMjQpIFRqCkVUCnEKNzIgNjgwIFRkCihQYXllcjogQUJDIENvcnApIFRqCjcyIDY2MCBUZAooUmVjaXBpZW50OiBCb2IgU21pdGgpIFRqCjcyIDY0MCBUZAooQW1vdW50OiAkMjUsNTAwKSBUagpRCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjQ1IDAwMDAwIG4gCjAwMDAwMDAzMjIgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0OTQKJSVFT0Y=',
      uploadedAt: '2024-12-01T14:20:00Z'
    },
    {
      id: '4',
      name: 'Bank_Statement.jpg',
      customerId: '2',
      returnId: '3',
      type: 'image',
      url: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=400',
      uploadedAt: '2024-12-02T09:45:00Z'
    }
  ],

  invoices: [
    {
      id: '1',
      customerId: '1',
      customerName: 'Alice Johnson',
      returnName: '2024 Federal Return',
      returnType: 'Federal',
      documentsCount: 5,
      status: 'Paid',
      amount: 450.00,
      items: [
        { description: 'Federal Tax Return Preparation', quantity: 1, rate: 350.00, amount: 350.00 },
        { description: 'Document Review', quantity: 2, rate: 50.00, amount: 100.00 }
      ],
      subtotal: 450.00,
      tax: 0.00,
      total: 450.00,
      createdAt: '2024-11-15T00:00:00Z',
      updatedAt: '2025-01-10T14:30:00Z'
    },
    {
      id: '2',
      customerId: '2',
      customerName: 'Bob Smith',
      returnName: '2024 Federal Return',
      returnType: 'Federal',
      documentsCount: 8,
      status: 'Pending',
      amount: 650.00,
      items: [
        { description: 'Federal Tax Return Preparation', quantity: 1, rate: 350.00, amount: 350.00 },
        { description: 'Complex Business Schedule', quantity: 1, rate: 200.00, amount: 200.00 },
        { description: 'Document Review', quantity: 2, rate: 50.00, amount: 100.00 }
      ],
      subtotal: 650.00,
      tax: 0.00,
      total: 650.00,
      createdAt: '2024-12-15T00:00:00Z',
      updatedAt: '2025-01-12T10:15:00Z'
    },
    {
      id: '3',
      customerId: '4',
      customerName: 'David Brown',
      returnName: '2024 Quarterly Return',
      returnType: 'Quarterly',
      documentsCount: 12,
      status: 'Overdue',
      amount: 875.00,
      items: [
        { description: 'Quarterly Tax Return', quantity: 1, rate: 500.00, amount: 500.00 },
        { description: 'Business Expense Analysis', quantity: 1, rate: 275.00, amount: 275.00 },
        { description: 'Document Review', quantity: 2, rate: 50.00, amount: 100.00 }
      ],
      subtotal: 875.00,
      tax: 0.00,
      total: 875.00,
      createdAt: '2024-10-20T00:00:00Z',
      updatedAt: '2025-01-08T16:45:00Z'
    }
  ],

  payments: [
    {
      id: '1',
      customerId: '1',
      customerName: 'Alice Johnson',
      invoiceId: '1',
      amount: 450.00,
      method: 'Credit Card',
      status: 'Completed',
      transactionId: 'tx_1234567890',
      createdAt: '2025-01-10T14:30:00Z'
    },
    {
      id: '2',
      customerId: '4',
      customerName: 'David Brown',
      invoiceId: '3',
      amount: 437.50,
      method: 'Bank Transfer',
      status: 'Completed',
      transactionId: 'tx_0987654321',
      createdAt: '2025-01-08T11:20:00Z'
    },
    {
      id: '3',
      customerId: '4',
      customerName: 'David Brown',
      invoiceId: '3',
      amount: 437.50,
      method: 'Check',
      status: 'Pending',
      transactionId: 'check_001',
      createdAt: '2025-01-12T16:00:00Z'
    }
  ],

  activities: [
    {
      id: '1',
      user: 'Lisa Reviewer',
      action: 'Reviewed return for Alice Johnson',
      timestamp: '2025-01-15T10:30:00Z',
      entityType: 'return',
      entityId: '2'
    },
    {
      id: '2',
      user: 'Sarah Manager',
      action: 'Created invoice for Bob Smith',
      timestamp: '2025-01-15T09:45:00Z',
      entityType: 'invoice',
      entityId: '2'
    },
    {
      id: '3',
      user: 'John Admin',
      action: 'Updated permissions for Tom Wilson',
      timestamp: '2025-01-15T09:15:00Z',
      entityType: 'user',
      entityId: '5'
    },
    {
      id: '4',
      user: 'Alice Johnson',
      action: 'Uploaded W2 document',
      timestamp: '2025-01-14T16:20:00Z',
      entityType: 'document',
      entityId: '1'
    },
    {
      id: '5',
      user: 'Lisa Reviewer',
      action: 'Changed status to Ready to File for David Brown',
      timestamp: '2025-01-14T14:10:00Z',
      entityType: 'return',
      entityId: '5'
    },
    {
      id: '6',
      user: 'Sarah Manager',
      action: 'Added comment to Carol Williams account',
      timestamp: '2025-01-14T11:30:00Z',
      entityType: 'customer',
      entityId: '3'
    },
    {
      id: '7',
      user: 'Bob Smith',
      action: 'Submitted additional documents',
      timestamp: '2025-01-13T15:45:00Z',
      entityType: 'customer',
      entityId: '2'
    },
    {
      id: '8',
      user: 'John Admin',
      action: 'Created new user account for Emma Davis',
      timestamp: '2025-01-13T08:20:00Z',
      entityType: 'user',
      entityId: '6'
    },
    {
      id: '9',
      user: 'Lisa Reviewer',
      action: 'Approved return for Alice Johnson',
      timestamp: '2025-01-12T17:00:00Z',
      entityType: 'return',
      entityId: '1'
    },
    {
      id: '10',
      user: 'Sarah Manager',
      action: 'Processed payment for David Brown',
      timestamp: '2025-01-12T13:15:00Z',
      entityType: 'payment',
      entityId: '2'
    }
  ],

  notifications: [
    {
      id: '1',
      title: 'Return Status Updated',
      body: 'Alice Johnson\'s return has been moved to In Review',
      level: 'info',
      read: false,
      createdAt: '2025-01-15T10:30:00Z',
      relatedEntity: { type: 'return', id: '2' }
    },
    {
      id: '2',
      title: 'New Invoice Created',
      body: 'Invoice #2 created for Bob Smith - $650.00',
      level: 'success',
      read: false,
      createdAt: '2025-01-15T09:45:00Z',
      relatedEntity: { type: 'invoice', id: '2' }
    },
    {
      id: '3',
      title: 'Permission Updated',
      body: 'User permissions updated for Tom Wilson',
      level: 'warning',
      read: true,
      createdAt: '2025-01-15T09:15:00Z',
      relatedEntity: { type: 'user', id: '5' }
    },
    {
      id: '4',
      title: 'Document Uploaded',
      body: 'New W2 document uploaded by Alice Johnson',
      level: 'info',
      read: true,
      createdAt: '2025-01-14T16:20:00Z',
      relatedEntity: { type: 'document', id: '1' }
    },
    {
      id: '5',
      title: 'Payment Received',
      body: 'Payment of $437.50 received from David Brown',
      level: 'success',
      read: true,
      createdAt: '2025-01-12T13:15:00Z',
      relatedEntity: { type: 'payment', id: '2' }
    },
    {
      id: '6',
      title: 'Return Ready to File',
      body: 'David Brown\'s quarterly return is ready to file',
      level: 'info',
      read: true,
      createdAt: '2025-01-11T16:00:00Z',
      relatedEntity: { type: 'return', id: '5' }
    },
    {
      id: '7',
      title: 'New User Created',
      body: 'Emma Davis account has been created',
      level: 'info',
      read: true,
      createdAt: '2025-01-10T08:20:00Z',
      relatedEntity: { type: 'user', id: '6' }
    },
    {
      id: '8',
      title: 'Comment Added',
      body: 'New comment added to Carol Williams account',
      level: 'info',
      read: true,
      createdAt: '2025-01-09T11:30:00Z',
      relatedEntity: { type: 'customer', id: '3' }
    }
  ],

  comments: [
    {
      id: '1',
      customerId: '1',
      userId: '2',
      userName: 'Sarah Manager',
      content: 'Reviewed all documents. Everything looks good for filing.',
      createdAt: '2025-01-14T15:20:00Z'
    },
    {
      id: '2',
      customerId: '3',
      userId: '2',
      userName: 'Sarah Manager',
      content: 'Still waiting for additional tax documents. Following up with client.',
      createdAt: '2025-01-12T10:45:00Z'
    },
    {
      id: '3',
      customerId: '2',
      userId: '4',
      userName: 'Lisa Reviewer',
      content: 'Complex business expenses require additional review. Scheduled meeting.',
      createdAt: '2025-01-11T14:30:00Z'
    }
  ]
};

export function initializeData() {
  // Check if data already exists in localStorage
  const existingData = localStorage.getItem('taxPortalData');
  
  if (!existingData) {
    // Initialize with seed data
    localStorage.setItem('taxPortalData', JSON.stringify(seedData));
    console.log('Initialized with seed data');
  }
  
  return JSON.parse(localStorage.getItem('taxPortalData'));
}

export function getData() {
  return JSON.parse(localStorage.getItem('taxPortalData') || '{}');
}

export function saveData(data) {
  localStorage.setItem('taxPortalData', JSON.stringify(data));
}

export function resetData() {
  localStorage.setItem('taxPortalData', JSON.stringify(seedData));
  return seedData;
}