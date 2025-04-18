import Millis from '@millisai/web-sdk'

const msClient = Millis.createClient({ publicKey: import.meta.env.VITE_APP_MILLIS_API_PUBLIC_KEY })

export default msClient
