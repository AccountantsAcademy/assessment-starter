import { useState } from 'react'
import { Link } from 'react-router'

export const Navigation = () => {
  const [email] = useState(localStorage.getItem('email'))

  return (
    <ul className="flex gap-4 p-4 bg-slate-200">
      {!email && (
        <li>
          <Link to="/login">Login</Link>
        </li>
      )}
      {email && (
        <li>
          <a href="/" onClick={() => localStorage.removeItem('email')}>
            Logout
          </a>
        </li>
      )}
      <li>
        <Link to="/">Overview</Link>
      </li>
      {email && (
        <li>
          <Link to="/edit">Create a new article</Link>
        </li>
      )}
    </ul>
  )
}
