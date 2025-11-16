import fs from 'fs'
import path from 'path'

// API endpoint to get all users (for admin purposes)
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Path to users data file
    const usersFile = path.join(process.cwd(), 'data', 'users.json')
    
    if (!fs.existsSync(usersFile)) {
      return res.status(200).json({ 
        success: true, 
        users: [],
        count: 0 
      })
    }

    // Read users
    const fileContent = fs.readFileSync(usersFile, 'utf8')
    const users = JSON.parse(fileContent)

    // Return all users with count
    return res.status(200).json({ 
      success: true, 
      users,
      count: users.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Get users error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

