import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { users } from './data/users';
import { workshops } from './data/workshops';
import { policies } from './data/policies';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // ------------------------------------------------------------
  // Roles
  // ------------------------------------------------------------

  const roles = [
    {
      name: 'ADMIN',
      description: 'System Administrator',
    },
    {
      name: 'CUSTOMER',
      description: 'Insurance Customer',
    },
    {
      name: 'SURVEYOR',
      description: 'Vehicle Surveyor',
    },
    {
      name: 'ADJUSTER',
      description: 'Claims Adjustor',
    },
    {
      name: 'CASE_MANAGER',
      description: 'Case Manager',
    },
    {
      name: 'AUDITOR',
      description: 'Auditor',
    },
    {
      name: 'WORKSHOP',
      description: 'Partner Workshop',
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: {
        name: role.name,
      },
      update: {
        description: role.description,
        isActive: true,
      },
      create: role,
    });
  }

  console.log('Roles seeded successfully');

  // ------------------------------------------------------------
  // Workshops
  // ------------------------------------------------------------

  for (const workshop of workshops) {
    await prisma.workshop.upsert({
      where: {
        name: workshop.name,
      },
      update: {
        address: workshop.address,
        city: workshop.city,
        state: workshop.state,
        phoneNumber: workshop.phoneNumber,
        email: workshop.email,
        isActive: true,
      },
      create: {
        name: workshop.name,
        address: workshop.address,
        city: workshop.city,
        state: workshop.state,
        phoneNumber: workshop.phoneNumber,
        email: workshop.email,
        isActive: true,
      },
    });
  }

  console.log('Workshops seeded successfully');

  // ------------------------------------------------------------
  // Password
  // ------------------------------------------------------------

  const hashedPassword = await bcrypt.hash('Password@123', 10);

  console.log('Password hash generated');

  // ------------------------------------------------------------
  // Workshop user → Workshop mapping
  // ------------------------------------------------------------

  const workshopAssignments: Record<string, string> = {
    'workshop1@insurance.com': 'Bhubaneswar Auto Care',
    'workshop2@insurance.com': 'Cuttack Motor Works',
    'workshop3@insurance.com': 'Bengaluru Auto Solutions',
    'workshop4@insurance.com': 'Hyderabad Car Care',
    'workshop5@insurance.com': 'Pune Collision Centre',
  };

  // ------------------------------------------------------------
  // Users
  // ------------------------------------------------------------

  for (const user of users) {
    const role = await prisma.role.findUnique({
      where: {
        name: user.role,
      },
    });

    if (!role) {
      throw new Error(`Role not found: ${user.role}`);
    }

    let workshopId: string | undefined;

    if (user.role === 'WORKSHOP') {
      const workshopName = workshopAssignments[user.email];

      if (!workshopName) {
        throw new Error(
          `No workshop assignment configured for user: ${user.email}`,
        );
      }

      const workshop = await prisma.workshop.findUnique({
        where: {
          name: workshopName,
        },
      });

      if (!workshop) {
        throw new Error(
          `Workshop "${workshopName}" not found for user: ${user.email}`,
        );
      }

      workshopId = workshop.id;
    }

    await prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: role.id,
        workshopId,
        status: 'ACTIVE',
      },
      create: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: hashedPassword,
        roleId: role.id,
        workshopId,
        status: 'ACTIVE',
      },
    });
  }

  console.log('Users seeded successfully');

  // ------------------------------------------------------------
  // Policies + Coverages
  // ------------------------------------------------------------

  for (const policy of policies) {
    const customer = await prisma.user.findUnique({
      where: {
        email: policy.customerEmail,
      },
    });

    if (!customer) {
      throw new Error(
        `Customer not found for policy ${policy.policyNumber}: ${policy.customerEmail}`,
      );
    }

    if (customer.roleId === undefined) {
      throw new Error(
        `Customer role information missing for: ${policy.customerEmail}`,
      );
    }

    const customerRole = await prisma.role.findUnique({
      where: {
        id: customer.roleId,
      },
    });

    if (!customerRole || customerRole.name !== 'CUSTOMER') {
      throw new Error(
        `Policy customer is not a CUSTOMER: ${policy.customerEmail}`,
      );
    }

    await prisma.policy.upsert({
      where: {
        policyNumber: policy.policyNumber,
      },
      update: {
        customerId: customer.id,
        status: 'ACTIVE',
        startDate: policy.startDate,
        endDate: policy.endDate,
        insurerName: policy.insurerName,
        vehicleMake: policy.vehicleMake,
        vehicleModel: policy.vehicleModel,
        vehicleYear: policy.vehicleYear,
      },
      create: {
        policyNumber: policy.policyNumber,
        customerId: customer.id,
        status: 'ACTIVE',
        startDate: policy.startDate,
        endDate: policy.endDate,
        insurerName: policy.insurerName,
        vehicleMake: policy.vehicleMake,
        vehicleModel: policy.vehicleModel,
        vehicleYear: policy.vehicleYear,
        coverages: {
          create: policy.coverages,
        },
      },
    });
  }

  console.log('Policies and coverages seeded successfully');

  // ------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------

  const userCounts = await prisma.user.groupBy({
    by: ['roleId'],
    _count: {
      id: true,
    },
  });

  const workshopCount = await prisma.workshop.count();
  const policyCount = await prisma.policy.count();
  const coverageCount = await prisma.coverage.count();

  console.log(`Workshops: ${workshopCount}`);
  console.log(`Users by role: ${userCounts.length} role groups`);
  console.log(`Policies: ${policyCount}`);
  console.log(`Coverages: ${coverageCount}`);
  console.log('Seed completed successfully');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
