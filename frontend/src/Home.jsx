import React from 'react'

export default function Home(){
  return (
    <div>
      <p>Frontend scaffold is ready. Connect to backend at <code>/api/</code>.</p>
      <p>Sample endpoints:</p>
      <ul>
        <li><a href="/api/health">/api/health</a></li>
        <li><a href="/api/recommendations/daily?user_id=demo">/api/recommendations/daily</a></li>
      </ul>
    </div>
  )
}
