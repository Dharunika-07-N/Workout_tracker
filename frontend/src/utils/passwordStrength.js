export function passwordStrength(password){
  const score = [/.{8,}/, /[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].reduce((s, re)=> s + (re.test(password) ? 1 : 0), 0);
  let strength = 'Very weak';
  if(score >= 4) strength = 'Strong';
  else if(score === 3) strength = 'Medium';
  else if(score === 2) strength = 'Weak';
  return { score, strength };
}
