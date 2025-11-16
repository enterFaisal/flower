import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { phone } = req.query

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' })
    }

    // Sanitize phone number
    const sanitizedPhone = phone.trim().replace(/\s+/g, '')

    // Path to users data file
    const usersFile = path.join(process.cwd(), 'data', 'users.json')
    
    if (!fs.existsSync(usersFile)) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Read users
    const fileContent = fs.readFileSync(usersFile, 'utf8')
    const users = JSON.parse(fileContent)

    // Find user by phone
    const user = users.find(u => u.phone === sanitizedPhone)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.status(200).json({ 
      success: true, 
      user 
    })

  } catch (error) {
    console.error('Get user error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

