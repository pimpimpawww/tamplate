import prisma from './prisma'

export const tools = [
  {
    type: 'function',
    function: {
      name: 'get_total_users',
      description: 'Mendapatkan total jumlah user yang terdaftar di sistem',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_users_by_role',
      description: 'Mendapatkan jumlah user berdasarkan role (ADMIN atau USER)',
      parameters: {
        type: 'object',
        properties: {
          role: {
            type: 'string',
            enum: ['ADMIN', 'USER'],
            description: 'Role user yang ingin dihitung',
          },
        },
        required: ['role'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_user_stats',
      description: 'Mendapatkan statistik lengkap user (total, admin, user biasa, dengan profile)',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
]

export async function executeTool(toolName: string, args: any) {
  switch (toolName) {
    case 'get_total_users': {
      const total = await prisma.user.count()
      return { total }
    }

    case 'get_users_by_role': {
      const count = await prisma.user.count({
        where: { role: args.role },
      })
      return { role: args.role, count }
    }

    case 'get_user_stats': {
      const [total, adminCount, userCount, withProfile] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'ADMIN' } }),
        prisma.user.count({ where: { role: 'USER' } }),
        prisma.profile.count(),
      ])

      return {
        total,
        admin: adminCount,
        user: userCount,
        withProfile,
        withoutProfile: total - withProfile,
      }
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`)
  }
}
