import React, { useState } from 'react';

export default function ForgotPassword(){
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e){
    e.preventDefault();
    setLoading(true);
    try{
      const res = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const j = await res.json();
      setStatus(j.message || 'If the account exists an email has been sent.');
    }catch(err){
      setStatus('Error sending request');
    }finally{ setLoading(false); }
  }

  return (
    <div style={{padding:20}}>
      <h2>Forgot Password</h2>
      {status ? <div style={{marginBottom:12}}>{status}</div> : (
        <form onSubmit={submit}>
          <div style={{marginBottom:8}}>
            <label>Email</label><br/>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={{width:300,padding:8}} />
          </div>
          <button type="submit" disabled={loading}>{loading? 'Sending...' : 'Send reset email'}</button>
        </form>
      )}
    </div>
  )
}
