// Mock Data Generator for Testing (Cognito Disabled)
// Generates realistic fake data for organizations, customers, and commessa

/**
 * Generate mock organizations
 */
export const generateMockOrganizations = () => {
  return [
    {
      id: 1,
      idT_ORGANIZZAZIONE: 1,
      deS_ORGANIZZAZIONE: 'Sinergia Headquarters',
      coD_ORGANIZZAZIONE: 'SIN-HQ',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      idT_ORGANIZZAZIONE: 2,
      deS_ORGANIZZAZIONE: 'Milan Office',
      coD_ORGANIZZAZIONE: 'SIN-MI',
      created_at: '2024-02-10T10:00:00Z',
      updated_at: '2024-02-10T10:00:00Z'
    },
    {
      id: 3,
      idT_ORGANIZZAZIONE: 3,
      deS_ORGANIZZAZIONE: 'Rome Branch',
      coD_ORGANIZZAZIONE: 'SIN-RM',
      created_at: '2024-03-05T10:00:00Z',
      updated_at: '2024-03-05T10:00:00Z'
    },
    {
      id: 4,
      idT_ORGANIZZAZIONE: 4,
      deS_ORGANIZZAZIONE: 'Florence Regional',
      coD_ORGANIZZAZIONE: 'SIN-FI',
      created_at: '2024-04-12T10:00:00Z',
      updated_at: '2024-04-12T10:00:00Z'
    },
    {
      id: 5,
      idT_ORGANIZZAZIONE: 5,
      deS_ORGANIZZAZIONE: 'Naples Division',
      coD_ORGANIZZAZIONE: 'SIN-NA',
      created_at: '2024-05-20T10:00:00Z',
      updated_at: '2024-05-20T10:00:00Z'
    }
  ];
};

/**
 * Generate mock external clients/customers
 */
export const generateMockCustomers = (organizationId = null) => {
  const allCustomers = [
    // Organization 1 customers
    {
      id: 1,
      idT_CLIENTE_ESTERNO: 1,
      idT_ORGANIZZAZIONE: 1,
      deS_CLIENTE: 'Tech Solutions SRL',
      coD_CLIENTE: 'TECH-001',
      partitA_IVA: 'IT12345678901',
      email: 'info@techsolutions.it',
      telefono: '+39 02 1234567',
      indirizzo: 'Via Roma 123, Milano',
      created_at: '2024-01-20T10:00:00Z',
      updated_at: '2024-01-20T10:00:00Z'
    },
    {
      id: 2,
      idT_CLIENTE_ESTERNO: 2,
      idT_ORGANIZZAZIONE: 1,
      deS_CLIENTE: 'Digital Consulting Group',
      coD_CLIENTE: 'DIG-002',
      partitA_IVA: 'IT23456789012',
      email: 'contact@digitalconsulting.it',
      telefono: '+39 02 2345678',
      indirizzo: 'Corso Italia 45, Milano',
      created_at: '2024-02-15T10:00:00Z',
      updated_at: '2024-02-15T10:00:00Z'
    },
    // Organization 2 customers
    {
      id: 3,
      idT_CLIENTE_ESTERNO: 3,
      idT_ORGANIZZAZIONE: 2,
      deS_CLIENTE: 'Innovation Labs SpA',
      coD_CLIENTE: 'INN-003',
      partitA_IVA: 'IT34567890123',
      email: 'info@innovationlabs.it',
      telefono: '+39 06 3456789',
      indirizzo: 'Via Nazionale 78, Roma',
      created_at: '2024-03-10T10:00:00Z',
      updated_at: '2024-03-10T10:00:00Z'
    },
    {
      id: 4,
      idT_CLIENTE_ESTERNO: 4,
      idT_ORGANIZZAZIONE: 2,
      deS_CLIENTE: 'Global Services Italia',
      coD_CLIENTE: 'GLO-004',
      partitA_IVA: 'IT45678901234',
      email: 'contact@globalservices.it',
      telefono: '+39 06 4567890',
      indirizzo: 'Piazza Venezia 12, Roma',
      created_at: '2024-04-05T10:00:00Z',
      updated_at: '2024-04-05T10:00:00Z'
    },
    // Organization 3 customers
    {
      id: 5,
      idT_CLIENTE_ESTERNO: 5,
      idT_ORGANIZZAZIONE: 3,
      deS_CLIENTE: 'Enterprise Solutions',
      coD_CLIENTE: 'ENT-005',
      partitA_IVA: 'IT56789012345',
      email: 'info@enterprise.it',
      telefono: '+39 055 5678901',
      indirizzo: 'Via Tornabuoni 34, Firenze',
      created_at: '2024-05-15T10:00:00Z',
      updated_at: '2024-05-15T10:00:00Z'
    },
    {
      id: 6,
      idT_CLIENTE_ESTERNO: 6,
      idT_ORGANIZZAZIONE: 3,
      deS_CLIENTE: 'Smart Tech Partners',
      coD_CLIENTE: 'SMT-006',
      partitA_IVA: 'IT67890123456',
      email: 'contact@smarttech.it',
      telefono: '+39 055 6789012',
      indirizzo: 'Piazza Repubblica 56, Firenze',
      created_at: '2024-06-10T10:00:00Z',
      updated_at: '2024-06-10T10:00:00Z'
    },
    // Organization 4 customers
    {
      id: 7,
      idT_CLIENTE_ESTERNO: 7,
      idT_ORGANIZZAZIONE: 4,
      deS_CLIENTE: 'Web Innovations SRL',
      coD_CLIENTE: 'WEB-007',
      partitA_IVA: 'IT78901234567',
      email: 'info@webinnovations.it',
      telefono: '+39 081 7890123',
      indirizzo: 'Via Toledo 89, Napoli',
      created_at: '2024-07-05T10:00:00Z',
      updated_at: '2024-07-05T10:00:00Z'
    },
    {
      id: 8,
      idT_CLIENTE_ESTERNO: 8,
      idT_ORGANIZZAZIONE: 4,
      deS_CLIENTE: 'Cloud Systems Italia',
      coD_CLIENTE: 'CLD-008',
      partitA_IVA: 'IT89012345678',
      email: 'contact@cloudsystems.it',
      telefono: '+39 081 8901234',
      indirizzo: 'Corso Umberto 67, Napoli',
      created_at: '2024-08-01T10:00:00Z',
      updated_at: '2024-08-01T10:00:00Z'
    },
    // Organization 5 customers
    {
      id: 9,
      idT_CLIENTE_ESTERNO: 9,
      idT_ORGANIZZAZIONE: 5,
      deS_CLIENTE: 'Consulting Experts Group',
      coD_CLIENTE: 'CON-009',
      partitA_IVA: 'IT90123456789',
      email: 'info@consultingexperts.it',
      telefono: '+39 011 9012345',
      indirizzo: 'Via Garibaldi 23, Torino',
      created_at: '2024-09-10T10:00:00Z',
      updated_at: '2024-09-10T10:00:00Z'
    },
    {
      id: 10,
      idT_CLIENTE_ESTERNO: 10,
      idT_ORGANIZZAZIONE: 5,
      deS_CLIENTE: 'Digital Transformation SpA',
      coD_CLIENTE: 'DIG-010',
      partitA_IVA: 'IT01234567890',
      email: 'contact@digitaltransformation.it',
      telefono: '+39 011 0123456',
      indirizzo: 'Piazza Castello 45, Torino',
      created_at: '2024-10-05T10:00:00Z',
      updated_at: '2024-10-05T10:00:00Z'
    }
  ];

  // Filter by organization if specified
  if (organizationId) {
    return allCustomers.filter(c => c.idT_ORGANIZZAZIONE === parseInt(organizationId));
  }

  return allCustomers;
};

/**
 * Generate mock commessa (projects/jobs)
 */
export const generateMockCommessa = (organizationId = null) => {
  const allCommessa = [
    // Organization 1 commessa
    {
      id: 1,
      idT_COMMESSA: 1,
      idT_ORGANIZZAZIONE: 1,
      idT_CLIENTE_ESTERNO: 1,
      coD_COMMESSA: 'PROJ-2024-001',
      deS_COMMESSA: 'Website Redesign Project',
      datA_INIZIO: '2024-01-15',
      datA_FINE: '2024-06-30',
      stato: 'In Progress',
      budget: 50000.00,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      idT_COMMESSA: 2,
      idT_ORGANIZZAZIONE: 1,
      idT_CLIENTE_ESTERNO: 1,
      coD_COMMESSA: 'PROJ-2024-002',
      deS_COMMESSA: 'Mobile App Development',
      datA_INIZIO: '2024-02-01',
      datA_FINE: '2024-08-31',
      stato: 'In Progress',
      budget: 75000.00,
      created_at: '2024-02-01T10:00:00Z',
      updated_at: '2024-02-01T10:00:00Z'
    },
    {
      id: 3,
      idT_COMMESSA: 3,
      idT_ORGANIZZAZIONE: 1,
      idT_CLIENTE_ESTERNO: 2,
      coD_COMMESSA: 'PROJ-2024-003',
      deS_COMMESSA: 'Cloud Migration Strategy',
      datA_INIZIO: '2024-03-01',
      datA_FINE: '2024-12-31',
      stato: 'Planning',
      budget: 120000.00,
      created_at: '2024-03-01T10:00:00Z',
      updated_at: '2024-03-01T10:00:00Z'
    },
    // Organization 2 commessa
    {
      id: 4,
      idT_COMMESSA: 4,
      idT_ORGANIZZAZIONE: 2,
      idT_CLIENTE_ESTERNO: 3,
      coD_COMMESSA: 'PROJ-2024-004',
      deS_COMMESSA: 'ERP System Integration',
      datA_INIZIO: '2024-04-01',
      datA_FINE: '2024-10-31',
      stato: 'In Progress',
      budget: 95000.00,
      created_at: '2024-04-01T10:00:00Z',
      updated_at: '2024-04-01T10:00:00Z'
    },
    {
      id: 5,
      idT_COMMESSA: 5,
      idT_ORGANIZZAZIONE: 2,
      idT_CLIENTE_ESTERNO: 4,
      coD_COMMESSA: 'PROJ-2024-005',
      deS_COMMESSA: 'Data Analytics Platform',
      datA_INIZIO: '2024-05-01',
      datA_FINE: '2024-11-30',
      stato: 'In Progress',
      budget: 85000.00,
      created_at: '2024-05-01T10:00:00Z',
      updated_at: '2024-05-01T10:00:00Z'
    },
    // Organization 3 commessa
    {
      id: 6,
      idT_COMMESSA: 6,
      idT_ORGANIZZAZIONE: 3,
      idT_CLIENTE_ESTERNO: 5,
      coD_COMMESSA: 'PROJ-2024-006',
      deS_COMMESSA: 'E-commerce Platform Build',
      datA_INIZIO: '2024-06-01',
      datA_FINE: '2025-01-31',
      stato: 'In Progress',
      budget: 110000.00,
      created_at: '2024-06-01T10:00:00Z',
      updated_at: '2024-06-01T10:00:00Z'
    },
    {
      id: 7,
      idT_COMMESSA: 7,
      idT_ORGANIZZAZIONE: 3,
      idT_CLIENTE_ESTERNO: 6,
      coD_COMMESSA: 'PROJ-2024-007',
      deS_COMMESSA: 'Security Audit & Compliance',
      datA_INIZIO: '2024-07-01',
      datA_FINE: '2024-09-30',
      stato: 'Completed',
      budget: 35000.00,
      created_at: '2024-07-01T10:00:00Z',
      updated_at: '2024-09-30T10:00:00Z'
    },
    // Organization 4 commessa
    {
      id: 8,
      idT_COMMESSA: 8,
      idT_ORGANIZZAZIONE: 4,
      idT_CLIENTE_ESTERNO: 7,
      coD_COMMESSA: 'PROJ-2024-008',
      deS_COMMESSA: 'Digital Marketing Campaign',
      datA_INIZIO: '2024-08-01',
      datA_FINE: '2024-12-31',
      stato: 'In Progress',
      budget: 45000.00,
      created_at: '2024-08-01T10:00:00Z',
      updated_at: '2024-08-01T10:00:00Z'
    },
    {
      id: 9,
      idT_COMMESSA: 9,
      idT_ORGANIZZAZIONE: 4,
      idT_CLIENTE_ESTERNO: 8,
      coD_COMMESSA: 'PROJ-2024-009',
      deS_COMMESSA: 'API Gateway Implementation',
      datA_INIZIO: '2024-09-01',
      datA_FINE: '2025-02-28',
      stato: 'Planning',
      budget: 68000.00,
      created_at: '2024-09-01T10:00:00Z',
      updated_at: '2024-09-01T10:00:00Z'
    },
    // Organization 5 commessa
    {
      id: 10,
      idT_COMMESSA: 10,
      idT_ORGANIZZAZIONE: 5,
      idT_CLIENTE_ESTERNO: 9,
      coD_COMMESSA: 'PROJ-2024-010',
      deS_COMMESSA: 'Business Intelligence Dashboard',
      datA_INIZIO: '2024-10-01',
      datA_FINE: '2025-03-31',
      stato: 'In Progress',
      budget: 92000.00,
      created_at: '2024-10-01T10:00:00Z',
      updated_at: '2024-10-01T10:00:00Z'
    },
    {
      id: 11,
      idT_COMMESSA: 11,
      idT_ORGANIZZAZIONE: 5,
      idT_CLIENTE_ESTERNO: 10,
      coD_COMMESSA: 'PROJ-2024-011',
      deS_COMMESSA: 'IoT Infrastructure Setup',
      datA_INIZIO: '2024-11-01',
      datA_FINE: '2025-05-31',
      stato: 'Planning',
      budget: 135000.00,
      created_at: '2024-11-01T10:00:00Z',
      updated_at: '2024-11-01T10:00:00Z'
    },
    {
      id: 12,
      idT_COMMESSA: 12,
      idT_ORGANIZZAZIONE: 1,
      idT_CLIENTE_ESTERNO: 2,
      coD_COMMESSA: 'PROJ-2024-012',
      deS_COMMESSA: 'DevOps Pipeline Automation',
      datA_INIZIO: '2024-01-01',
      datA_FINE: '2024-03-31',
      stato: 'Completed',
      budget: 42000.00,
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-03-31T10:00:00Z'
    }
  ];

  // Filter by organization if specified
  if (organizationId) {
    return allCommessa.filter(c => c.idT_ORGANIZZAZIONE === parseInt(organizationId));
  }

  return allCommessa;
};

/**
 * Generate mock processes/activities
 */
export const generateMockProcesses = () => {
  return [
    {
      id: 1,
      idT_PROCESSO: 1,
      deS_PROCESSO: 'Development',
      coD_PROCESSO: 'DEV',
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z'
    },
    {
      id: 2,
      idT_PROCESSO: 2,
      deS_PROCESSO: 'Testing',
      coD_PROCESSO: 'TEST',
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z'
    },
    {
      id: 3,
      idT_PROCESSO: 3,
      deS_PROCESSO: 'Project Management',
      coD_PROCESSO: 'PM',
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z'
    },
    {
      id: 4,
      idT_PROCESSO: 4,
      deS_PROCESSO: 'Design',
      coD_PROCESSO: 'DES',
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z'
    },
    {
      id: 5,
      idT_PROCESSO: 5,
      deS_PROCESSO: 'Consulting',
      coD_PROCESSO: 'CONS',
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z'
    },
    {
      id: 6,
      idT_PROCESSO: 6,
      deS_PROCESSO: 'Documentation',
      coD_PROCESSO: 'DOC',
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z'
    }
  ];
};

/**
 * Generate mock activities
 */
export const generateMockActivities = () => {
  return [
    {
      id: 1,
      idT_ATTIVITA: 1,
      deS_ATTIVITA: 'Frontend Development',
      coD_ATTIVITA: 'FE-DEV',
      idT_PROCESSO: 1,
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z'
    },
    {
      id: 2,
      idT_ATTIVITA: 2,
      deS_ATTIVITA: 'Backend Development',
      coD_ATTIVITA: 'BE-DEV',
      idT_PROCESSO: 1,
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z'
    },
    {
      id: 3,
      idT_ATTIVITA: 3,
      deS_ATTIVITA: 'Database Design',
      coD_ATTIVITA: 'DB-DES',
      idT_PROCESSO: 1,
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z'
    },
    {
      id: 4,
      idT_ATTIVITA: 4,
      deS_ATTIVITA: 'Unit Testing',
      coD_ATTIVITA: 'UNIT-TEST',
      idT_PROCESSO: 2,
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z'
    },
    {
      id: 5,
      idT_ATTIVITA: 5,
      deS_ATTIVITA: 'Integration Testing',
      coD_ATTIVITA: 'INT-TEST',
      idT_PROCESSO: 2,
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z'
    },
    {
      id: 6,
      idT_ATTIVITA: 6,
      deS_ATTIVITA: 'Sprint Planning',
      coD_ATTIVITA: 'SPRINT-PLAN',
      idT_PROCESSO: 3,
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z'
    },
    {
      id: 7,
      idT_ATTIVITA: 7,
      deS_ATTIVITA: 'Team Meetings',
      coD_ATTIVITA: 'MEETING',
      idT_PROCESSO: 3,
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z'
    },
    {
      id: 8,
      idT_ATTIVITA: 8,
      deS_ATTIVITA: 'UI/UX Design',
      coD_ATTIVITA: 'UI-DES',
      idT_PROCESSO: 4,
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z'
    },
    {
      id: 9,
      idT_ATTIVITA: 9,
      deS_ATTIVITA: 'Requirements Analysis',
      coD_ATTIVITA: 'REQ-ANAL',
      idT_PROCESSO: 5,
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z'
    },
    {
      id: 10,
      idT_ATTIVITA: 10,
      deS_ATTIVITA: 'Technical Documentation',
      coD_ATTIVITA: 'TECH-DOC',
      idT_PROCESSO: 6,
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z'
    }
  ];
};

/**
 * Generate mock statistics for organizations
 */
export const generateMockOrganizationStats = (organizationId) => {
  const baseStats = {
    totalCustomers: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalRevenue: 0
  };

  const customers = generateMockCustomers(organizationId);
  const commessa = generateMockCommessa(organizationId);

  return {
    totalCustomers: customers.length,
    activeProjects: commessa.filter(c => c.stato === 'In Progress' || c.stato === 'Planning').length,
    completedProjects: commessa.filter(c => c.stato === 'Completed').length,
    totalRevenue: commessa.reduce((sum, c) => sum + c.budget, 0)
  };
};

/**
 * Generate mock pagination response
 */
export const generateMockPagination = (data, page = 1, itemsPerPage = 10) => {
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      totalItems: totalItems,
      itemsPerPage: itemsPerPage,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  };
};

export default {
  generateMockOrganizations,
  generateMockCustomers,
  generateMockCommessa,
  generateMockProcesses,
  generateMockActivities,
  generateMockOrganizationStats,
  generateMockPagination
};
