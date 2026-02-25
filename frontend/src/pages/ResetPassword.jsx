import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { passwordStrength } from '../utils/passwordStrength'

export default function ResetPassword(){
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const uid = params.get('uid') || '';
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState({score:0,strength:'Very weak'});

  useEffect(()=>{
    setStrength(passwordStrength(password));
  },[password])

  async function submit(e){
    e.preventDefault();
    setStatus(null);
    if(password !== confirm) return setStatus('Passwords do not match');
    if(strength.score < 3) return setStatus('Password too weak');
    setLoading(true);
    try{
      const res = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid, token, newPassword: password }) });
      const j = await res.json();
      if(res.ok){
        setStatus('Password reset successful — redirecting to login...');
        setTimeout(()=>navigate('/'),1500);
      }else{
        setStatus(j.error || 'Reset failed');
      }
    }catch(err){
      setStatus('Request error');
    }finally{ setLoading(false); }
  }

  if(!token || !uid) return (<div style={{padding:20}}><h3>Invalid reset link</h3></div>);

  return (
    <div style={{padding:20}}>
      <h2>Reset Password</h2>
      {status && <div style={{marginBottom:12}}>{status}</div>}
      <form onSubmit={submit}>
        <div style={{marginBottom:8}}>
          <label>New Password</label><br/>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required style={{width:320,padding:8}} />
          <div style={{fontSize:13,marginTop:6}}>Strength: <strong>{strength.strength}</strong></div>
        </div>
        <div style={{marginBottom:8}}>
          <label>Confirm Password</label><br/>
          <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required style={{width:320,padding:8}} />
        </div>
        <button type="submit" disabled={loading}>{loading? 'Resetting...' : 'Reset Password'}</button>
      </form>
    </div>
  )
}
